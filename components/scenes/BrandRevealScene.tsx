import React from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';

interface SceneProps {
  onComplete: () => void;
}

export const BrandRevealScene: React.FC<SceneProps> = ({ onComplete }) => {
  const { displayText: brandText, isComplete: brandComplete } = useTypewriter("BOOKEENI", 120);
  const [startTagline, setStartTagline] = React.useState(false);
  const { displayText: taglineText, isComplete: taglineComplete } = useTypewriter("Connecting You", 140, { enabled: startTagline });
  const [isGlitching, setIsGlitching] = React.useState(true);
  const [brandSelected, setBrandSelected] = React.useState(false);
  const skipRef = React.useRef(false);
  const [showSmiley, setShowSmiley] = React.useState(false);

  const prefix = brandText.substring(0, 1);
  const oos = brandText.substring(1, 3);
  const suffix = brandText.substring(3);


  const handleSkip = React.useCallback((e: MouseEvent | KeyboardEvent) => {
    e.stopImmediatePropagation();
    if (!skipRef.current) {
        skipRef.current = true;
        onComplete();
    }
  }, [onComplete]);

  React.useEffect(() => {
    const eventListener = handleSkip as EventListener;
    window.addEventListener('click', eventListener, { capture: true });
    window.addEventListener('keydown', eventListener, { capture: true });

    return () => {
      window.removeEventListener('click', eventListener, { capture: true });
      window.removeEventListener('keydown', eventListener, { capture: true });
    };
  }, [handleSkip]);

  React.useEffect(() => {
    if (brandComplete) {
      setIsGlitching(false);
      setBrandSelected(true);
      const smileyTimer = setTimeout(() => setShowSmiley(true), 200);
      return () => {
        clearTimeout(smileyTimer);
      };
    }

    const glitchInterval = setInterval(() => {
      setIsGlitching(prev => !prev);
    }, 50);

    return () => clearInterval(glitchInterval);
  }, [brandComplete]);


  React.useEffect(() => {
    if (brandComplete) {
      const timer = setTimeout(() => setStartTagline(true), 300);
      return () => clearTimeout(timer);
    }
  }, [brandComplete]);

  React.useEffect(() => {
    if (taglineComplete) {
      const timer = setTimeout(() => {
          if(!skipRef.current) onComplete();
      }, 1000); // Shortened delay after removing eye animation
      return () => clearTimeout(timer);
    }
  }, [taglineComplete, onComplete]);


  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-4">
      <h1 className={`text-6xl md:text-8xl lg:text-9xl tracking-widest font-normal transition-all duration-300 ${isGlitching ? 'glitch-effect-intense' : ''} ${brandSelected ? 'bg-[var(--terminal-green)] text-black px-2' : ''}`}>
        <span>{prefix}</span>
        <span className="inline-block relative">
            {oos}
            {showSmiley && (
                <svg className="absolute bottom-[-15%] left-0 w-full h-[60%]" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
                    <path
                        d="M 15 30 C 35 50, 65 50, 85 30"
                        stroke="var(--terminal-green)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        className="animate-draw-smiley"
                    />
                </svg>
            )}
        </span>
        <span>{suffix}</span>
        {!brandComplete && !brandSelected && <span className="animate-blink">_</span>}
      </h1>
      {startTagline && (
        <p className="text-3xl md:text-5xl text-center">
            {taglineText}
            {!taglineComplete && <span className="animate-blink">_</span>}
        </p>
      )}
    </div>
  );
};