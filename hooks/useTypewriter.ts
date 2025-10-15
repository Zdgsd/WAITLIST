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
      // ONLY skip if clicking on non-interactive background
      if (e.target instanceof HTMLElement) {
        const interactiveElements = e.target.closest('button, a, input, select, textarea, [role="button"], [onClick]');
        if (interactiveElements) {
          return; // Don't skip when clicking interactive elements
        }
      }
      
      if (!isComplete) {
        skipRef.current = true;
      }
    };
    
    const eventListener = handleSkip as EventListener;
    window.addEventListener('click', eventListener);
    window.addEventListener('keydown', eventListener);
    return () => {
      window.removeEventListener('click', eventListener);
      window.removeEventListener('keydown', eventListener);
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