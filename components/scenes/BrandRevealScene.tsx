import React from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';

interface SceneProps {
  onComplete: () => void;
  skipToEnd?: boolean;
}

export const BrandRevealScene: React.FC<SceneProps> = ({ onComplete, skipToEnd = false }) => {
  const { displayText: brandText, isComplete: brandComplete } = useTypewriter("BOOKEENI", 120, { enabled: !skipToEnd });
  const [startTagline, setStartTagline] = React.useState(skipToEnd);
  const { displayText: taglineText, isComplete: taglineComplete } = useTypewriter("Connecting You", 140, { enabled: startTagline && !skipToEnd });
  const [isGlitching, setIsGlitching] = React.useState(!skipToEnd);
  const [brandSelected, setBrandSelected] = React.useState(skipToEnd);
  const skipRef = React.useRef(false);
  const [showSmiley, setShowSmiley] = React.useState(skipToEnd);

  const finalBrandComplete = brandComplete || skipToEnd;
  const finalTaglineComplete = taglineComplete || skipToEnd;

  const prefix = skipToEnd ? 'B' : brandText.substring(0, 1);
  const oos = skipToEnd ? 'OO' : brandText.substring(1, 3);
  const suffix = skipToEnd ? 'KEENI' : brandText.substring(3);


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
    if (finalBrandComplete) {
      setBrandSelected(true);
      setIsGlitching(false); // Stop glitching when complete
      const smileyTimer = setTimeout(() => setShowSmiley(true), 200);
      return () => clearTimeout(smileyTimer);
    }

    const glitchInterval = setInterval(() => {
      setIsGlitching(prev => !prev);
    }, 50);

    return () => clearInterval(glitchInterval);
  }, [finalBrandComplete]);


  React.useEffect(() => {
    if (brandComplete) {
      const timer = setTimeout(() => setStartTagline(true), 300);
      return () => clearTimeout(timer);
    }
  }, [brandComplete]);

  React.useEffect(() => {
    if (finalTaglineComplete) {
      const timer = setTimeout(() => {
          if(!skipRef.current) onComplete();
      }, skipToEnd ? 50 : 1000); // Shortened delay after removing eye animation
      return () => clearTimeout(timer);
    }
  }, [finalTaglineComplete, onComplete, skipToEnd]);


  return (
    <div className="flex flex-col items-center justify-start h-full space-y-6 md:space-y-10 p-4 pt-48">
      <div className="w-full max-w-[85vw] flex justify-center">
        <h1 className={`text-5xl xs:text-6xl sm:text-7xl md:text-9xl lg:text-[10rem] tracking-[0.12em] sm:tracking-[0.15em] font-normal transition-all duration-300 whitespace-nowrap ${isGlitching ? 'glitch-effect-intense' : ''} ${brandSelected ? 'px-2' : ''}`}>
          <span>{prefix}</span>
          <span className="inline-block relative">
              {oos}
              {showSmiley && (
                  <svg className="absolute bottom-[-10%] left-0 w-full h-[40%]" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
                      <path
                          d="M 15 30 C 35 50, 65 50, 85 30"
                          stroke="white"
                          strokeWidth="8"
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
      </div>
      {startTagline && (
        <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center whitespace-nowrap px-4">
            {skipToEnd ? 'Connecting You' : taglineText}
            {!taglineComplete && !skipToEnd && <span className="animate-blink">_</span>}
        </p>
      )}
    </div>
  );
};