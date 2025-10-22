import React from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';

interface TypewriterSceneProps {
  text: string;
  speed?: number;
  onComplete: () => void;
  finalBlinkOnce?: boolean;
}

export const TypewriterScene: React.FC<TypewriterSceneProps> = ({ text, speed = 70, onComplete, finalBlinkOnce = false }) => {
  const { displayText, isComplete } = useTypewriter(text, speed);

  React.useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(onComplete, 500); // Dramatic pause after typing
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  return (
    <div className="flex items-center justify-center h-full text-center p-4">
      <p className="text-2xl sm:text-3xl md:text-5xl" aria-live="polite" aria-atomic="true">
        {displayText}
        {!isComplete && <span className="animate-blink">_</span>}
        {isComplete && finalBlinkOnce && <span className="animate-blink-1">_</span>}
      </p>
    </div>
  );
};