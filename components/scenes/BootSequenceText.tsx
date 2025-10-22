import React, { useState, useEffect, useRef, memo } from 'react';
import { ANIMATION_DELAYS, bootLines } from '../../constants/animations';

interface BootSequenceTextProps {
  onComplete?: () => void;
}

export const BootSequenceText = memo<BootSequenceTextProps>(({ onComplete }) => {
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    const timers = bootLines.map((_, i) => {
      const delay = i * ANIMATION_DELAYS.BOOT_LINE + ANIMATION_DELAYS.BOOT_START;
      return setTimeout(() => {
        if (mountedRef.current) {
          setVisibleLineCount(i + 1);
          if (i === bootLines.length - 1 && onComplete) {
            onComplete();
          }
        }
      }, delay);
    });

    return () => {
      mountedRef.current = false;
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div className="absolute top-4 left-4 md:top-8 md:left-8 text-left text-base md:text-lg opacity-60 z-20">
      {bootLines.slice(0, visibleLineCount).map((line, i) => (
        <p key={i} className="animate-fade-in transform-gpu">
          {`> ${line}`}
          {i === visibleLineCount - 1 && visibleLineCount < bootLines.length && (
            <span className="animate-blink">_</span>
          )}
        </p>
      ))}
    </div>
  );
});
