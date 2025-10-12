import React from 'react';

interface TypewriterOptions {
  enabled?: boolean;
}

export const useTypewriter = (text: string, speed: number = 100, options: TypewriterOptions = {}) => {
  const { enabled = true } = options;
  const [displayText, setDisplayText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);
  const skipRef = React.useRef(false);

  React.useEffect(() => {
    const handleSkip = (e: MouseEvent | KeyboardEvent) => {
      // FIX: Do not intercept clicks on interactive elements. This was blocking buttons.
      if (e.target instanceof HTMLElement && e.target.closest('button, a, input, [role="button"]')) {
        return;
      }
      
      if (!isComplete) {
        e.stopImmediatePropagation();
        skipRef.current = true;
      }
    };
    
    const eventListener = handleSkip as EventListener;
    window.addEventListener('click', eventListener, { capture: true }); // Use capture to catch event early
    window.addEventListener('keydown', eventListener, { capture: true });
    return () => {
      window.removeEventListener('click', eventListener, { capture: true });
      window.removeEventListener('keydown', eventListener, { capture: true });
    };
  }, [isComplete]);

  React.useEffect(() => {
    if (!enabled) {
      setDisplayText('');
      setIsComplete(false);
      return;
    }

    let currentIndex = 0;
    setDisplayText('');
    setIsComplete(false);
    skipRef.current = false;

    const typeInterval = setInterval(() => {
      if (skipRef.current) {
        setDisplayText(text);
        setIsComplete(true);
        clearInterval(typeInterval);
        return;
      }

      if (currentIndex >= text.length) {
        setIsComplete(true);
        clearInterval(typeInterval);
        return;
      }

      currentIndex++;
      setDisplayText(text.substring(0, currentIndex));
    }, speed);

    return () => clearInterval(typeInterval);
  }, [text, speed, enabled]);

  return { displayText, isComplete };
};