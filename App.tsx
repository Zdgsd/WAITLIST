import React, { Suspense } from 'react';
import { AppPhase, MemoryCardData, SubmissionStatus } from './types';
import { CRTWrapper } from './components/effects/CRTWrapper';
import { VHSNoise } from './components/effects/VHSNoise';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkipButton } from './components/ui/SkipButton';
import { AnalyticsProvider, useAnalytics } from './analytics/AnalyticsProvider';
import { supabase } from './supabaseClient';
import { LensFlares } from './components/effects/LensFlares';
import { DynamicGradient } from './components/effects/DynamicGradient';
import { SceneTransition } from './components/effects/SceneTransition';
import { Chat } from './components/scenes/Chat';

// Lazy load scene components
const CorporateShell = React.lazy(() => import('./components/scenes/CorporateShell').then(module => ({ default: module.CorporateShell })));
const InitializationScene = React.lazy(() => import('./components/scenes/InitializationScene').then(module => ({ default: module.InitializationScene })));
const TypewriterScene = React.lazy(() => import('./components/scenes/TypewriterScene').then(module => ({ default: module.TypewriterScene })));
const GlitchScene = React.lazy(() => import('./components/scenes/GlitchScene').then(module => ({ default: module.GlitchScene })));
const BrandRevealScene = React.lazy(() => import('./components/scenes/BrandRevealScene').then(module => ({ default: module.BrandRevealScene })));
const InvitationScene = React.lazy(() => import('./components/scenes/InvitationScene').then(module => ({ default: module.InvitationScene })));
const MemoryExchangeScene = React.lazy(() => import('./components/scenes/MemoryExchangeScene').then(module => ({ default: module.MemoryExchangeScene })));
const CompletionScene = React.lazy(() => import('./components/scenes/CompletionScene').then(module => ({ default: module.CompletionScene })));
const ExitScene = React.lazy(() => import('./components/scenes/ExitScene').then(module => ({ default: module.ExitScene })));
const InvestorPage = React.lazy(() => import('./components/scenes/InvestorPage').then(module => ({ default: module.InvestorPage })));


// Add a loading fallback component
const SceneLoader: React.FC = () => null;

import { useSocialMediaOptimization } from './hooks/useSocialMediaOptimization';
import { LazyNetworkBackground } from './components/LazyLoader';

const AppContent: React.FC = () => {
    useSocialMediaOptimization();
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
    const [isSkipping, setIsSkipping] = React.useState(false);
    const [showChatModal, setShowChatModal] = React.useState(false);
    const mainContentRef = React.useRef<HTMLDivElement>(null);

    const { trackEvent } = useAnalytics();
    const phaseStartTimeRef = React.useRef(Date.now());
    const previousPhaseRef = React.useRef<AppPhase>(AppPhase.CORPORATE_SHELL);

    const triggerBackgroundAnimation = React.useCallback(() => {
        setAnimationTrigger(count => count + 1);
    }, []);

    const [animationClass, setAnimationClass] = React.useState('animate-fade-in-zoom');

    const handlePhaseChange = React.useCallback((newPhase: AppPhase) => {
        const animations = ['animate-fade-in-zoom', 'animate-slide-in-left'];
        setAnimationClass(animations[Math.floor(Math.random() * animations.length)]);

        const now = Date.now();
        const durationMs = now - phaseStartTimeRef.current;
        
        trackEvent('page_view', {
            page: previousPhaseRef.current,
            duration_ms: durationMs
        });

        phaseStartTimeRef.current = now;
        previousPhaseRef.current = newPhase;
        setPhase(newPhase);
        triggerBackgroundAnimation();

    }, [trackEvent, triggerBackgroundAnimation]);

    React.useEffect(() => {
        if (phase === AppPhase.CORPORATE_SHELL && animationTrigger === 0) {
            setBackgroundOffset({ x: 0, y: 0 }); // Ensure it starts at center
            return;
        }

        const phaseKeys = Object.values(AppPhase);
        const phaseIndex = phaseKeys.indexOf(phase);
        
        const triggerFactor = animationTrigger * 1.618; 
        const combinedIndex = phaseIndex + triggerFactor;

        const angle = combinedIndex * (Math.PI * (3 - Math.sqrt(5)));
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
        setSubmissionStatus('idle');
        handlePhaseChange(AppPhase.COMPLETION);
    };

    const handleInvitationComplete = (email: string) => {
        setMemoryData(prev => ({ ...prev, email }));
        handlePhaseChange(AppPhase.MEMORY_EXCHANGE);
    };

    const handleAgeSubmitted = () => {
    };
  
    React.useEffect(() => {
      if (phase === AppPhase.MEMORY_EXCHANGE && !memoryNumber) {
        setMemoryNumber(Math.floor(10000 + Math.random() * 90000));
      }
    }, [phase, memoryNumber]);
  
    // Focus management for keyboard navigation
    React.useEffect(() => {
      if (mainContentRef.current && !showChatModal) {
        // Focus the main content area when phase changes or chat closes
        mainContentRef.current.focus();
      }
    }, [phase, showChatModal]);

    const renderPhase = () => {
        switch (phase) {
            case AppPhase.CORPORATE_SHELL:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <CorporateShell onComplete={() => {
                            handlePhaseChange(AppPhase.INITIALIZATION);
                            setVideoActive(true);
                        }} triggerBackgroundAnimation={triggerBackgroundAnimation} />
                    </Suspense>
                );
            case AppPhase.INITIALIZATION:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <InitializationScene onComplete={() => handlePhaseChange(AppPhase.IMAGINE_IF)} />
                    </Suspense>
                );
            case AppPhase.IMAGINE_IF:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <TypewriterScene text="Imagine If..." onComplete={() => handlePhaseChange(AppPhase.GLITCH_1)} finalBlinkOnce />
                    </Suspense>
                );
            case AppPhase.GLITCH_1:
                 return (
                    <Suspense fallback={<SceneLoader />}>
                        <GlitchScene onComplete={() => handlePhaseChange(AppPhase.MEMORY_PROMPT_1)} />
                    </Suspense>
                );
            case AppPhase.MEMORY_PROMPT_1:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <TypewriterScene text="Your Best Memory..." onComplete={() => handlePhaseChange(AppPhase.MEMORY_PROMPT_2)} />
                    </Suspense>
                );
            case AppPhase.MEMORY_PROMPT_2:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <TypewriterScene text="Is A Click Away." onComplete={() => handlePhaseChange(AppPhase.BRAND_REVEAL)} />
                    </Suspense>
                );
            case AppPhase.BRAND_REVEAL:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <BrandRevealScene onComplete={() => handlePhaseChange(AppPhase.INVITATION_BOX)} skipToEnd={isSkipping} />
                    </Suspense>
                );
            case AppPhase.INVITATION_BOX:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <InvitationScene onComplete={handleInvitationComplete} triggerBackgroundAnimation={triggerBackgroundAnimation} />
                    </Suspense>
                );
            case AppPhase.MEMORY_EXCHANGE:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <MemoryExchangeScene email={memoryData.email} memoryNumber={memoryNumber} onSubmit={handleMemorySubmit} onExit={() => handlePhaseChange(AppPhase.EXIT)} triggerBackgroundAnimation={triggerBackgroundAnimation} onAgeSubmitted={handleAgeSubmitted} />
                    </Suspense>
                );
            case AppPhase.COMPLETION:
                return memoryData && memoryNumber ? (
                    <Suspense fallback={<SceneLoader />}>
                        <CompletionScene 
                          data={memoryData} 
                          memoryNumber={memoryNumber} 
                          onNavigateToInvestors={() => handlePhaseChange(AppPhase.INVESTOR_PAGE)} 
                          onOpenChatModal={() => setShowChatModal(true)}
                          status={submissionStatus}
                          setStatus={setSubmissionStatus}
                          triggerBackgroundAnimation={triggerBackgroundAnimation}
                        />
                    </Suspense>
                ) : null;
            case AppPhase.INVESTOR_PAGE:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <InvestorPage onBack={() => handlePhaseChange(AppPhase.COMPLETION)} />
                    </Suspense>
                );
            case AppPhase.EXIT:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <ExitScene />
                    </Suspense>
                );
            default:
                return (
                    <Suspense fallback={<SceneLoader />}>
                        <CorporateShell onComplete={() => {
                            handlePhaseChange(AppPhase.INITIALIZATION);
                            setVideoActive(true);
                        }} triggerBackgroundAnimation={triggerBackgroundAnimation} />
                    </Suspense>
                );
        }
    };
    
    const corporatePhases = [AppPhase.INVESTOR_PAGE];
    const isCorporate = corporatePhases.includes(phase);

    const introPhases = [
        AppPhase.INITIALIZATION,
        AppPhase.IMAGINE_IF,
        AppPhase.GLITCH_1,
        AppPhase.MEMORY_PROMPT_1,
        AppPhase.MEMORY_PROMPT_2,
        AppPhase.BRAND_REVEAL,
    ];
    const showSkipButton = introPhases.includes(phase) && !isSkipping;

    return (
      <main className="h-screen w-screen overflow-hidden p-2 md:p-4 relative">
        <LensFlares intensity={0.2} />
        <DynamicGradient phase={phase.toString()} />
        <SceneTransition isTransitioning={isTransitioning} />
  
        {showSkipButton && <SkipButton onClick={() => { setIsSkipping(true); handlePhaseChange(AppPhase.BRAND_REVEAL); }} />}
        <ErrorBoundary>
          <div
            ref={mainContentRef}
            className={`relative w-full h-full ${isCorporate ? '' : 'floating-element-slow'}`}
            role="region"
            aria-label="Bookeeni waitlist application"
            tabIndex={-1} // Make focusable for keyboard navigation
          >
            {showChatModal && <Chat onClose={() => setShowChatModal(false)} />}
            {!showChatModal && (
              <nav aria-label="Quick actions">
                <button
                  onClick={() => setShowChatModal(true)}
                  className="fixed top-4 right-4 z-[1002] p-2 transition-opacity hover:opacity-80"
                  aria-label="Open Chat"
                  aria-keyshortcuts="C"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--terminal-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </nav>
            )}
            {isCorporate ? (
              <section key={phase} className={`w-full h-full ${animationClass}`} aria-live="polite">
                {renderPhase()}
              </section>
            ) : (
              <CRTWrapper videoActive={videoActive}>
                <LazyNetworkBackground offset={backgroundOffset} isTransitioning={isTransitioning} animationTrigger={animationTrigger} />
                <VHSNoise
                  intensity={0.056}
                  isTransitioning={isTransitioning}
                  animationTrigger={animationTrigger}
                />
                <div className="depth-noise-overlay" aria-hidden="true" />
                <section key={phase} className="w-full h-full animate-fade-in-zoom" aria-live="polite">
                  {renderPhase()}
                </section>
              </CRTWrapper>
            )}
          </div>
        </ErrorBoundary>
        <footer
          className={`fixed bottom-2 left-2 md:bottom-4 md:left-4 text-xs text-left text-gray-400 z-[1001] pointer-events-none font-mono opacity-50 ${showChatModal ? 'hidden' : ''}`}
          style={{ textShadow: 'none' }}
          aria-label="Application information"
        >
          <p>A Platform By: SADOK BOUZAYEN.</p>
          <p>Bookeeni.contact@gmail.com</p>
        </footer>
        <div className="crt-scanlines" aria-hidden="true" />
        <div className="screen-curvature" aria-hidden="true" />
        <div className="screen-border" aria-hidden="true" />
      </main>
    );
};


const App: React.FC = () => (
    <AnalyticsProvider>
        <AppContent />
    </AnalyticsProvider>
);


export default App;