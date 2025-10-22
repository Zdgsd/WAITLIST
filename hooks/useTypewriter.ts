import React from 'react';

interface TypewriterOptions {
  enabled?: boolean;
}

// Enhanced useTypewriter hook
export const useTypewriter = (text: string, speed: number = 100, options: TypewriterOptions = {}) => {
  const { enabled = true } = options;
  const [displayText, setDisplayText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);
  const [glitchEffect, setGlitchEffect] = React.useState(false);

  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (!enabled) {
      setDisplayText('');
      setIsComplete(false);
      return;
    }

    let currentIndex = 0;
    setDisplayText('');
    setIsComplete(false);

    const type = () => {
      if (currentIndex >= text.length) {
        setIsComplete(true);
        return;
      }

      // Random glitch effects during typing
      if (Math.random() < 0.02 && currentIndex > 3) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 100);
      }

      // Occasionally "backspace" for dramatic effect
      if (Math.random() < 0.01 && currentIndex > 5) {
        currentIndex = Math.max(0, currentIndex - 2);
      }

      currentIndex++;
      setDisplayText(text.substring(0, currentIndex));
      timeoutRef.current = setTimeout(type, speed + Math.random() * 50 - 25);
    };

    timeoutRef.current = setTimeout(type, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, enabled]);

  return { displayText, isComplete, glitchEffect };
};