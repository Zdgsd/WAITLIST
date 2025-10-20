import React from 'react';

interface SceneProps {
  onComplete: () => void;
}

export const GlitchScene: React.FC<SceneProps> = ({ onComplete }) => {
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
       if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 300);
    
     const skip = (e: MouseEvent | KeyboardEvent) => {
      e.stopImmediatePropagation();
      if (!completedRef.current) {
        completedRef.current = true;
        clearTimeout(timer);
        onComplete();
      }
    };

    const eventListener = skip as EventListener;
    window.addEventListener('click', eventListener, { capture: true });
    window.addEventListener('keydown', eventListener, { capture: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', eventListener, { capture: true });
      window.removeEventListener('keydown', eventListener, { capture: true });
    };
  }, [onComplete]);

  return (
    <div className="h-full w-full glitch-effect" />
  );
};