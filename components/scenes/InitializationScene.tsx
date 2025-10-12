import React from 'react';

interface SceneProps {
  onComplete: () => void;
}

export const InitializationScene: React.FC<SceneProps> = ({ onComplete }) => {
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 1500); 
    
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
    <div className="flex items-center justify-center h-full">
      {/* This scene is now a timed delay with no visual content */}
    </div>
  );
};