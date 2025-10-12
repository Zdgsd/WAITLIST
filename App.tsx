import React from 'react';
import { AppPhase, MemoryCardData, SubmissionStatus } from './types';
import { CRTWrapper } from './components/effects/CRTWrapper';
import { CorporateShell } from './components/scenes/CorporateShell';
import { InitializationScene } from './components/scenes/InitializationScene';
import { TypewriterScene } from './components/scenes/TypewriterScene';
import { GlitchScene } from './components/scenes/GlitchScene';
import { BrandRevealScene } from './components/scenes/BrandRevealScene';
import { InvitationScene } from './components/scenes/InvitationScene';
import { MemoryExchangeScene } from './components/scenes/MemoryExchangeScene';
import { CompletionScene } from './components/scenes/CompletionScene';
import { ExitScene } from './components/scenes/ExitScene';
import { NetworkBackground } from './components/effects/NetworkBackground';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InvestorPage } from './components/scenes/InvestorPage';

import { AnalyticsProvider, useAnalytics } from './analytics/AnalyticsProvider';

const AppContent: React.FC = () => {
    const [phase, setPhase] = React.useState<AppPhase>(AppPhase.CORPORATE_SHELL);
    const [videoActive, setVideoActive] = React.useState(false);
    const [memoryData, setMemoryData] = React.useState<MemoryCardData>({
        role: null,
        name: '',
        email: '',
        age: null,
        consentGiven: false,
        gameAnswers: {},
    });
    const [memoryNumber, setMemoryNumber] = React.useState<number | null>(null);
    const [backgroundOffset, setBackgroundOffset] = React.useState({ x: 0, y: 0 });
    const [isTransitioning, setIsTransitioning] = React.useState(false);
    const [animationTrigger, setAnimationTrigger] = React.useState(0);
    const [submissionStatus, setSubmissionStatus] = React.useState<SubmissionStatus>('idle');
    
    const { trackEvent } = useAnalytics();
    const phaseStartTimeRef = React.useRef(Date.now());
    const previousPhaseRef = React.useRef<AppPhase>(AppPhase.CORPORATE_SHELL);

    const handlePhaseChange = React.useCallback((newPhase: AppPhase) => {
        const now = Date.now();
        const durationMs = now - phaseStartTimeRef.current;
        
        trackEvent('page_view', {
            page: previousPhaseRef.current,
            duration_ms: durationMs
        });

        phaseStartTimeRef.current = now;
        previousPhaseRef.current = newPhase;
        setPhase(newPhase);
    }, [trackEvent]);
    
    const triggerBackgroundAnimation = React.useCallback(() => {
        setAnimationTrigger(count => count + 1);
    }, []);

    React.useEffect(() => {
        if (phase === AppPhase.CORPORATE_SHELL && animationTrigger === 0) {
            setBackgroundOffset({ x: 0, y: 0 }); // Ensure it starts at center
            return;
        }

        const phaseKeys = Object.values(AppPhase);
        const phaseIndex = phaseKeys.indexOf(phase);
        
        // A simple hash function to incorporate the trigger count
        const triggerFactor = animationTrigger * 1.618; // Use golden ratio for variety
        const combinedIndex = phaseIndex + triggerFactor;

        // Use golden angle for pseudo-random, non-colliding distribution
        const angle = combinedIndex * (Math.PI * (3 - Math.sqrt(5)));
        // Move up to 35% of the shortest screen dimension away from the center
        const distance = Math.min(window.innerWidth, window.innerHeight) * 0.35;
        
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;

        setBackgroundOffset({ x: moveX, y: moveY });
        setIsTransitioning(true);
        const timer = setTimeout(() => setIsTransitioning(false), 800); // Match CSS transition

        return () => clearTimeout(timer);
    }, [phase, animationTrigger]);


    const handleMemorySubmit = (data: MemoryCardData) => {
        setMemoryData(data);
        setSubmissionStatus('idle'); // Reset status for this new submission
        handlePhaseChange(AppPhase.COMPLETION);
    };

    const handleInvitationComplete = (email: string) => {
        setMemoryData(prev => ({ ...prev, email }));
        handlePhaseChange(AppPhase.MEMORY_EXCHANGE);
    };
    
    React.useEffect(() => {
        if (phase === AppPhase.MEMORY_EXCHANGE && !memoryNumber) {
          setMemoryNumber(Math.floor(10000 + Math.random() * 90000));
        }
      }, [phase, memoryNumber]);

    const renderPhase = () => {
        switch (phase) {
            case AppPhase.CORPORATE_SHELL:
                return <CorporateShell onComplete={() => {
                    handlePhaseChange(AppPhase.INITIALIZATION);
                    setVideoActive(true);
                }} />;
            case AppPhase.INITIALIZATION:
                return <InitializationScene onComplete={() => handlePhaseChange(AppPhase.IMAGINE_IF)} />;
            case AppPhase.IMAGINE_IF:
                return <TypewriterScene text="Imagine If..." onComplete={() => handlePhaseChange(AppPhase.GLITCH_1)} finalBlinkOnce />;
            case AppPhase.GLITCH_1:
                 return <GlitchScene onComplete={() => handlePhaseChange(AppPhase.MEMORY_PROMPT_1)} />;
            case AppPhase.MEMORY_PROMPT_1:
                return <TypewriterScene text="Your Best Memory..." onComplete={() => handlePhaseChange(AppPhase.MEMORY_PROMPT_2)} />;
            case AppPhase.MEMORY_PROMPT_2:
                return <TypewriterScene text="Is A Click Away." onComplete={() => handlePhaseChange(AppPhase.BRAND_REVEAL)} />;
            case AppPhase.BRAND_REVEAL:
                return <BrandRevealScene onComplete={() => handlePhaseChange(AppPhase.INVITATION_BOX)} />;
            case AppPhase.INVITATION_BOX:
                return <InvitationScene onComplete={handleInvitationComplete} />;
            case AppPhase.MEMORY_EXCHANGE:
                return <MemoryExchangeScene email={memoryData.email} memoryNumber={memoryNumber} onSubmit={handleMemorySubmit} onExit={() => handlePhaseChange(AppPhase.EXIT)} triggerBackgroundAnimation={triggerBackgroundAnimation} />;
            case AppPhase.COMPLETION:
                return memoryData && memoryNumber ? <CompletionScene 
                  data={memoryData} 
                  memoryNumber={memoryNumber} 
                  onNavigateToInvestors={() => handlePhaseChange(AppPhase.INVESTOR_PAGE)} 
                  status={submissionStatus}
                  setStatus={setSubmissionStatus}
                /> : null;
            case AppPhase.INVESTOR_PAGE:
                return <InvestorPage onBack={() => handlePhaseChange(AppPhase.COMPLETION)} />;
            case AppPhase.EXIT:
                return <ExitScene />;
            default:
                return <CorporateShell onComplete={() => {
                    handlePhaseChange(AppPhase.INITIALIZATION);
                    setVideoActive(true);
                }} />;
        }
    };
    
    const corporatePhases = [AppPhase.INVESTOR_PAGE];
    const isCorporate = corporatePhases.includes(phase);
    
    return (
        <main className="h-screen w-screen overflow-hidden">
            <ErrorBoundary>
                <div className="relative w-full h-full">
                    {isCorporate ? (
                        <div key={phase} className="w-full h-full animate-fade-in-zoom">
                            {renderPhase()}
                        </div>
                    ) : (
                        <CRTWrapper videoActive={videoActive}>
                            <NetworkBackground offset={backgroundOffset} isTransitioning={isTransitioning} />
                            <div key={phase} className="w-full h-full animate-fade-in-zoom">
                                {renderPhase()}
                            </div>
                        </CRTWrapper>
                    )}
                </div>
            </ErrorBoundary>
            <div 
              className="fixed bottom-2 right-2 md:bottom-6 md:right-6 text-xs text-right text-gray-400 z-[1001] pointer-events-none font-mono" 
              style={{ textShadow: 'none' }}
            >
              <p>A Platform By: SADOK BOUZAYEN.</p>
              <p>Bookeeni.contact@gmail.com</p>
            </div>
        </main>
    );
};


const App: React.FC = () => (
    <AnalyticsProvider>
        <AppContent />
    </AnalyticsProvider>
);


export default App;