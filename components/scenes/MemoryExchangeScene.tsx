// components/scenes/MemoryExchangeScene.tsx
import React, { useMemo, useCallback } from 'react';
import { MemoryCardData, UserRole } from '../../types';
import { HIERARCHICAL_ROLES, ALL_ROLES } from '../../constants';
import { Button } from '../ui/Button';
import { useTypewriter } from '../../hooks/useTypewriter';
import { gameQuestions } from '../../gameQuestions';
import { useAnalytics } from '../../analytics/AnalyticsProvider';
import { SceneHeader } from '../ui/SceneHeader';

interface MemoryExchangeSceneProps {
  email: string;
  memoryNumber: number | null;
  onSubmit: (data: MemoryCardData) => void;
  onExit: () => void;
  triggerBackgroundAnimation: () => void;
  onAgeSubmitted: () => void;
}

type RoleView = 'main' | 'creator' | 'organizer';
type ConversationStep = 'name' | 'age' | 'post_age_transition' | 'game_prompt' | 'game_prompt_insist';

const getWittyComment = (age: number): string => {
  if (age < 18) return "Just getting started, I see. The best memories are ahead.";
  if (age <= 25) return "Prime time for making memories you'll barely remember. Cherish it.";
  if (age <= 35) return "Ah, the decade of 'what am I doing?' and great concerts. You're in good company.";
  if (age <= 50) return "You've seen some things. We respect the wisdom in those eyes.";
  return "A true archivist. We're honored to have your experience.";
};

const MemoryExchangeSceneComponent: React.FC<MemoryExchangeSceneProps> = ({ email, memoryNumber, onSubmit, onExit, triggerBackgroundAnimation, onAgeSubmitted }) => {
  const [step, setStep] = React.useState(1);
  const [memoryCard, setMemoryCard] = React.useState<MemoryCardData>({
    role: null,
    name: '',
    email: email,
    age: null,
    consentGiven: false,
    gameAnswers: {},
  });
  
  const [roleView, setRoleView] = React.useState<RoleView>('main');
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [conversationStep, setConversationStep] = React.useState<ConversationStep>('name');
  const [noCount, setNoCount] = React.useState(0);
  const [gameQuestionIndex, setGameQuestionIndex] = React.useState(0);
  const [currentAnswer, setCurrentAnswer] = React.useState('');
  const [isClearing, setIsClearing] = React.useState(false);
  const { trackEvent } = useAnalytics();

  const { displayText: titleText } = useTypewriter("Who Are You In This Story?", 80, { enabled: step === 1 });
  const { displayText: namePrompt } = useTypewriter("What's Your Name?", 80, { enabled: step === 2 && conversationStep === 'name' });
  const { displayText: agePrompt } = useTypewriter(`Nice To Meet You, ${memoryCard.name}. How Old Are You?`, 80, { enabled: step === 2 && conversationStep === 'age' });
  
  const userDossierString = useMemo(() => {
    const parts = [`#${memoryNumber}`];
    if (memoryCard.role) {
        const roleLabel = ALL_ROLES.find(r => r.id === memoryCard.role)?.label;
        if (roleLabel) parts.push(roleLabel.toUpperCase());
    }
    if (memoryCard.name) parts.push(memoryCard.name.toUpperCase());
    return parts.join(' / ');
  }, [memoryNumber, memoryCard.role, memoryCard.name]);

  React.useEffect(() => {
    if (conversationStep === 'post_age_transition') {
        const timer = setTimeout(() => {
            setIsClearing(true);
            const clearTimer = setTimeout(() => {
                setConversationStep('game_prompt');
                setIsClearing(false);
                triggerBackgroundAnimation();
            }, 300); // Matches opacity transition duration
            return () => clearTimeout(clearTimer);
        }, 1500); // Pause after text
        return () => clearTimeout(timer);
    }
  }, [conversationStep, triggerBackgroundAnimation]);

  const handleRoleSelect = useCallback((role: UserRole) => {
    triggerBackgroundAnimation();
    trackEvent('click', { element_id: 'role_selection', role_id: role });
    setMemoryCard(prev => ({ ...prev, role }));
    setStep(2);
  }, [triggerBackgroundAnimation, trackEvent]);
  
  const changeRoleView = useCallback((view: RoleView) => {
    triggerBackgroundAnimation();
    trackEvent('click', { element_id: 'change_role_view', view: view });
    setIsAnimating(true);
    setTimeout(() => {
        setRoleView(view);
        setIsAnimating(false);
    }, 300);
  }, [triggerBackgroundAnimation, trackEvent]);

  const handleRoleClick = useCallback((role: { id: UserRole | string; label: string }) => {
    if (roleView === 'main') {
      const selectedTopLevelRole = HIERARCHICAL_ROLES.find(r => r.id === role.id);
      
      if (selectedTopLevelRole && selectedTopLevelRole.subRoles.length > 0) {
        changeRoleView(role.id as RoleView);
      } else {
        handleRoleSelect(role.id as UserRole);
      }
    } else {
      handleRoleSelect(role.id as UserRole);
    }
  }, [roleView, changeRoleView, handleRoleSelect]);

  const handleNoClick = useCallback(() => {
    triggerBackgroundAnimation();
    trackEvent('click', { element_id: 'game_prompt_no', attempt: noCount + 1 });
    if (noCount === 0) {
      setNoCount(1);
      setConversationStep('game_prompt_insist');
    } else {
      // Submit partial data to waitlist even if user declines game
      trackEvent('form_submission', { form_id: 'waitlist_partial_submission' });
      onSubmit({ ...memoryCard, consentGiven: true });
    }
  }, [triggerBackgroundAnimation, trackEvent, noCount, memoryCard, onSubmit]);

  const handleGameAnswer = useCallback((answer: string) => {
    triggerBackgroundAnimation();
    const currentQuestion = gameQuestions[gameQuestionIndex];
    trackEvent('click', { element_id: 'game_answer', question_id: currentQuestion.id, answer });

    setMemoryCard(prev => ({
        ...prev,
        gameAnswers: {
            ...prev.gameAnswers,
            [currentQuestion.id]: answer
        }
    }));

    setCurrentAnswer('');

    if (gameQuestionIndex < gameQuestions.length - 1) {
        setGameQuestionIndex(prev => prev + 1);
    } else {
        setStep(4); // Move to consent step
    }
  }, [triggerBackgroundAnimation, trackEvent, gameQuestionIndex]);

  const handleConversationSubmit = useCallback((nextStep: ConversationStep, details: Record<string, any> = {}) => {
    triggerBackgroundAnimation();
    trackEvent('form_submission', { form_id: `conversation_${conversationStep}`, ...details });
    setConversationStep(nextStep);
  }, [triggerBackgroundAnimation, trackEvent, conversationStep]);
  
  const handleStartGame = useCallback(() => {
    triggerBackgroundAnimation();
    trackEvent('click', { element_id: 'game_prompt_yes' });
    setStep(3);
  }, [triggerBackgroundAnimation, trackEvent]);

  const renderRoleSelection = () => {
    const renderButtons = (roles: ({id: UserRole | string; label: string})[]) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Available roles to choose from">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => handleRoleClick(role)}
            className="role-button p-6 text-xl text-left font-bold border-2 border-[var(--terminal-green)]/30 rounded-lg hover:border-[var(--terminal-green)] hover:bg-[var(--terminal-green)]/10 transition-all duration-200"
            aria-label={`Select role: ${role.label}`}
            role="listitem"
          >
            <span className="corner-bracket top-left" aria-hidden="true"></span>
            <span className="corner-bracket top-right" aria-hidden="true"></span>
            <span className="corner-bracket bottom-left" aria-hidden="true"></span>
            <span className="corner-bracket bottom-right" aria-hidden="true"></span>
            <span className="relative z-10">{role.label}</span>
          </button>
        ))}
      </div>
    );
  
    let currentRoles;
    if (roleView === 'creator') {
      currentRoles = HIERARCHICAL_ROLES.find(r => r.id === 'creator')?.subRoles;
    } else if (roleView === 'organizer') {
      currentRoles = HIERARCHICAL_ROLES.find(r => r.id === 'organizer')?.subRoles;
    } else {
      currentRoles = HIERARCHICAL_ROLES;
    }
  
    const isSub = roleView === 'creator' || roleView === 'organizer';
  
    return (
      <div>
        <SceneHeader 
          title={<>
            {titleText}
            {step === 1 && !titleText.includes('Story?') && <span className="animate-blink">_</span>}
          </>}
          subtitle={titleText.length > 0 && "Choose the role that feels right."}
        />
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          {renderButtons(currentRoles || [])}
          {isSub && (
            <div className="mt-6">
              <Button variant="secondary" onClick={() => changeRoleView('main')}>{'<'} Back</Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderConversation = () => {
    return (
      <div className={`animate-fade-in text-xl md:text-2xl lg:text-3xl space-y-6 transition-opacity duration-300 ${isClearing ? 'opacity-0' : 'opacity-100'}`} aria-live="polite">
        {conversationStep === 'name' && (
          <form onSubmit={(e) => { e.preventDefault(); if(memoryCard.name) handleConversationSubmit('age'); }} role="form" aria-label="Enter your name">
            <label htmlFor="name-input" className="block mb-4">{namePrompt}{!namePrompt.includes('?') && <span className="animate-blink">_</span>}</label>
            <input id="name-input" type="text" value={memoryCard.name} onChange={e => setMemoryCard(p => ({...p, name: e.target.value}))} autoFocus className="w-full bg-transparent focus:outline-none border-b-2 border-[var(--terminal-green)]/50 focus:border-[var(--terminal-green)] transition-colors text-2xl md:text-3xl" aria-required="true" aria-describedby="name-input-description"/>
            <span id="name-input-description" className="sr-only">Enter your name to continue</span>
            <Button type="submit" className="mt-6" disabled={!memoryCard.name} aria-label="Submit name and continue">Next</Button>
          </form>
        )}
        {conversationStep === 'age' && (
          <form onSubmit={(e) => { e.preventDefault(); if(memoryCard.age) { onAgeSubmitted(); handleConversationSubmit('post_age_transition'); } }} role="form" aria-label="Enter your age">
             <label htmlFor="age-input" className="block mb-4">{agePrompt}{!agePrompt.includes('?') &&<span className="animate-blink">_</span>}</label>
            <input id="age-input" type="number" value={memoryCard.age || ''} onChange={e => setMemoryCard(p => ({...p, age: parseInt(e.target.value) || null}))} autoFocus className="w-full bg-transparent focus:outline-none border-b-2 border-[var(--terminal-green)]/50 focus:border-[var(--terminal-green)] transition-colors text-2xl md:text-3xl" aria-required="true" aria-describedby="age-input-description" min="1" max="120"/>
            <span id="age-input-description" className="sr-only">Enter your age in years</span>
            <Button type="submit" className="mt-6" disabled={!memoryCard.age} aria-label="Submit age and continue">Next</Button>
          </form>
        )}
        {conversationStep === 'post_age_transition' && (
            <div className="min-h-[200px]">
                {memoryCard.age && <p className="italic text-gray-400 mb-6">"{getWittyComment(memoryCard.age)}"</p>}
                <p>Thank You For Your Interest.</p>
            </div>
        )}
        {(conversationStep === 'game_prompt' || conversationStep === 'game_prompt_insist') && (
          <div className="animate-fade-in min-h-[200px]">
            <p className="mb-8 h-28 md:h-24">
              {conversationStep === 'game_prompt' && "Would You Like To Answer And Have A Chance To Win Free Concert Tickets And Our Special FOUNDER BADGE ?"}
              {conversationStep === 'game_prompt_insist' && "I Promise There Will Be A Reward."}
            </p>
            <div className="flex items-center space-x-6 animate-fade-in">
                <Button onClick={handleStartGame} className={conversationStep === 'game_prompt_insist' ? 'animate-pulse-glow' : ''}>Yes</Button>
                <Button onClick={handleNoClick} variant="secondary">No</Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGame = () => {
    const currentQuestion = gameQuestions[gameQuestionIndex];
    const previousQuestion = gameQuestionIndex > 0 ? gameQuestions[gameQuestionIndex - 1] : null;
    const showCategory = currentQuestion.category !== previousQuestion?.category;

    return (
        <div className="animate-fade-in text-xl md:text-2xl" aria-live="polite">
            {showCategory && <h3 className="text-2xl md:text-3xl text-gray-400 mb-6 font-bold" id="question-category">{currentQuestion.category}</h3>}
            <p className="mb-6 min-h-[4rem] flex items-center" id="question-text">{currentQuestion.title}</p>
            {currentQuestion.type === 'text' ? (
                <form onSubmit={e => { e.preventDefault(); handleGameAnswer(currentAnswer); }} role="form" aria-labelledby="question-text">
                    <input type="text" value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)} autoFocus className="w-full bg-transparent focus:outline-none border-b-2 border-[var(--terminal-green)]/50 focus:border-[var(--terminal-green)] transition-colors text-2xl" aria-labelledby="question-text" aria-describedby="text-input-description"/>
                    <span id="text-input-description" className="sr-only">Type your answer and press enter to submit</span>
                    <Button type="submit" className="mt-6" disabled={!currentAnswer} aria-label="Submit answer and continue">Next</Button>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="group" aria-labelledby="question-text">
                    {currentQuestion.options?.map(option => (
                        <button key={option} onClick={() => handleGameAnswer(option)} className="p-4 text-lg text-left border-2 border-[var(--terminal-green)]/30 rounded-lg hover:border-[var(--terminal-green)] hover:bg-[var(--terminal-green)]/10 transition-all duration-200" aria-label={`Select option: ${option}`}>
                            {option}
                        </button>
                    ))}
                </div>
            )}
            <div className="mt-8" aria-label="Progress indicator">
                <div className="relative h-2 bg-[var(--terminal-green)]/20 rounded-full" role="progressbar" aria-valuenow={gameQuestionIndex + 1} aria-valuemin={1} aria-valuemax={gameQuestions.length}>
                    <div className="absolute top-0 left-0 h-2 bg-[var(--terminal-green)] rounded-full transition-all duration-500" style={{ width: `${((gameQuestionIndex + 1) / gameQuestions.length) * 100}%` }}></div>
                </div>
                <p className="text-sm text-gray-500 text-right mt-2" aria-hidden="true">{gameQuestionIndex + 1} / {gameQuestions.length}</p>
            </div>
        </div>
    );
  }

  const renderConsent = () => {
    return (
        <div className="animate-fade-in">
            <SceneHeader
              title="One last thing."
              subtitle="Your participation helps build our community."
            />
            <div className="space-y-6">
                <div className="flex items-center space-x-3 cursor-pointer p-4 bg-gray-900/50 rounded-lg" onClick={() => setMemoryCard(prev => ({...prev, consentGiven: !prev.consentGiven}))} role="checkbox" aria-checked={memoryCard.consentGiven} tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && setMemoryCard(prev => ({...prev, consentGiven: !prev.consentGiven}))}>
                    <input type="checkbox" checked={memoryCard.consentGiven} onChange={e => setMemoryCard(prev => ({ ...prev, consentGiven: e.target.checked }))} className="h-6 w-6 rounded bg-gray-800 border-gray-600 text-[var(--terminal-green)] focus:ring-[var(--terminal-green)]" aria-labelledby="consent-label"/>
                    <label id="consent-label" className="text-gray-300 cursor-pointer">I consent to my data being part of the Bookeeni experience.</label>
                </div>
            </div>
             <div className="mt-8 flex items-center justify-between">
                <Button onClick={() => { triggerBackgroundAnimation(); setStep(3); }} variant="secondary" aria-label="Go back to previous step">Back</Button>
                <Button onClick={() => {
                    triggerBackgroundAnimation();
                    trackEvent('form_submission', { form_id: 'waitlist_full_submission' });
                    onSubmit(memoryCard);
                }} disabled={!memoryCard.consentGiven} aria-label="Join the Bookeeni community">Join the community</Button>
            </div>
        </div>
    );
  };
  
  const currentStepTotal = 4;
  
  return (
    <div className="flex flex-col h-full p-4 md:p-8 text-[var(--terminal-green)]">
      <header className="w-full max-w-4xl mx-auto mb-4">
        <h1 className="text-4xl md:text-5xl">BOOKEENI</h1>
        <p className="text-lg text-gray-400 break-all">{userDossierString}</p>
      </header>
      <div className="flex-grow overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto">
          <div className="relative mb-8 h-2 bg-[var(--terminal-green)]/20 rounded-full">
            <div className="absolute top-0 left-0 h-2 bg-[var(--terminal-green)] rounded-full transition-all duration-500" style={{ width: `${(step / currentStepTotal) * 100}%` }}></div>
          </div>
          <div className="min-h-[400px]">
            {step === 1 && renderRoleSelection()}
            {step === 2 && renderConversation()}
            {step === 3 && renderGame()}
            {step === 4 && renderConsent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MemoryExchangeScene = React.memo(MemoryExchangeSceneComponent);