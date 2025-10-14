import React from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';
import { Button } from '../ui/Button';

interface SceneProps {
  onComplete: (email: string) => void;
  triggerBackgroundAnimation: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const InvitationScene: React.FC<SceneProps> = ({ onComplete, triggerBackgroundAnimation }) => {
  const { displayText: inviteText, isComplete: inviteComplete } = useTypewriter("You Have Been Invited.", 100);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const { displayText: promptText, isComplete: promptComplete } = useTypewriter("Will You Join The Movement?", 100);
  const [showInput, setShowInput] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [isValidEmail, setIsValidEmail] = React.useState(false);

  React.useEffect(() => {
    if (inviteComplete) {
      const timer = setTimeout(() => setShowPrompt(true), 300);
      return () => clearTimeout(timer);
    }
  }, [inviteComplete]);

  React.useEffect(() => {
    if (promptComplete) {
        const timer = setTimeout(() => setShowInput(true), 250);
        return () => clearTimeout(timer);
    }
  }, [promptComplete]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(EMAIL_REGEX.test(newEmail));
  }

  const handleJoin = () => {
    if (isValidEmail) {
      triggerBackgroundAnimation();
      onComplete(email);
    }
  }

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="crt-terminal-box p-4 sm:p-6 md:p-8 w-full max-w-2xl text-base sm:text-lg md:text-xl">
        <p>
          {inviteText}
          {!inviteComplete && <span className="animate-blink">_</span>}
        </p>
        
        {showPrompt && (
          <div className="mt-4">
            <p>
                {promptText}
                {inviteComplete && !promptComplete && <span className="animate-blink">_</span>}
            </p>
          </div>
        )}

        {showInput && (
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-lg md:text-xl">
              <label htmlFor="email-input" className="whitespace-nowrap">Email:</label>
              <input 
                id="email-input"
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full bg-transparent focus:outline-none border-b-2 border-[var(--terminal-green)]/50 focus:border-[var(--terminal-green)] transition-colors"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
              />
              <Button variant="terminal" onClick={handleJoin} disabled={!isValidEmail}>
                &gt; Join
              </Button>
            </div>
        )}
      </div>
    </div>
  );
};