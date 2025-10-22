import React from 'react';

interface SceneProps {
  onComplete: () => void;
}

export const MemoryPromptScene: React.FC<SceneProps> = ({ onComplete }) => {
  const [text, setText] = React.useState('');
  const [dots, setDots] = React.useState(0);
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    const fullText = "Your best memory";
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index >= fullText.length) {
        clearInterval(typeInterval);
        const dot1 = setTimeout(() => setDots(1), 400);
        const dot2 = setTimeout(() => setDots(2), 800);
        const dot3 = setTimeout(() => setDots(3), 1200);
        const complete = setTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
        }, 1700);
        timeoutsRef.current.push(dot1, dot2, dot3, complete);
      } else {
        index++;
        setText(fullText.substring(0, index));
      }
    }, 80);

    const skip = (e: MouseEvent | KeyboardEvent) => {
      e.stopImmediatePropagation();
      if (!completedRef.current) {
        completedRef.current = true;
        clearInterval(typeInterval);
        timeoutsRef.current.forEach(clearTimeout);
        onComplete();
      }
    };

    const eventListener = skip as EventListener;
    window.addEventListener('click', eventListener, { capture: true });
    window.addEventListener('keydown', eventListener, { capture: true });

    return () => {
      clearInterval(typeInterval);
      timeoutsRef.current.forEach(clearTimeout);
      window.removeEventListener('click', eventListener, { capture: true });
      window.removeEventListener('keydown', eventListener, { capture: true });
    };
  }, [onComplete]);

  return (
    <div className="flex items-center justify-center h-full text-center p-4">
      <p className="text-3xl md:text-5xl">
        {text}{'.'.repeat(dots)}
        {dots < 3 && <span className="animate-blink">_</span>}
      </p>
    </div>
  );
};