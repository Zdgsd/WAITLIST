import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Button } from '../ui/Button';
import { useAnalytics } from '../../analytics/AnalyticsProvider';

const ANIMATION_DELAYS = {
  BOOT_LINE: 600,
  BOOT_START: 500,
  PRE_TYPING: 2000,
  TYPING_SPEED: 150,
  SHOW_BUTTON: 5000,
} as const;

const bootLines = [
  'Initializing Connection',
  'Take a Deep Breath',
  'Here You Go !',
] as const;

const BootSequenceText = memo(() => {
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    const timers = bootLines.map((_, i) =>
      setTimeout(() => {
        if (mountedRef.current) {
          setVisibleLineCount(i + 1);
        }
      }, i * ANIMATION_DELAYS.BOOT_LINE + ANIMATION_DELAYS.BOOT_START)
    );

    return () => {
      mountedRef.current = false;
      timers.forEach(clearTimeout);
    };
  }, []);

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

interface CorporateShellProps {
  onComplete: () => void;
  triggerBackgroundAnimation: () => void;
}

export const CorporateShell: React.FC<CorporateShellProps> = ({ onComplete, triggerBackgroundAnimation }) => {
  const [prefix, setPrefix] = useState('');
  const [oos, setOos] = useState('');
  const [suffix, setSuffix] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSmiley, setShowSmiley] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showPreTypingCursor, setShowPreTypingCursor] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  const { trackEvent, trackInteraction, trackPageView, trackPerformance } = useAnalytics();
  
  const fullTitle = "BOOKEENI";

  const handleComplete = useCallback(() => {
    if (isCompleting) return;
    triggerBackgroundAnimation();
    trackInteraction('initialize_connection_button', 'click', {
      isTyping,
      showSmiley,
      titleComplete: prefix + oos + suffix === fullTitle
    });
    setIsCompleting(true);
    onComplete();
  }, [isCompleting, triggerBackgroundAnimation, trackInteraction, onComplete, isTyping, showSmiley, prefix, oos, suffix, fullTitle]);

  useEffect(() => {
    trackPageView('corporate-shell', {
      screen: 'CorporateShell',
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    });

    // Track performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        trackPerformance({
          duration: entry.duration,
          startTime: entry.startTime
        });
      });
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

    return () => observer.disconnect();
  }, [trackPageView, trackPerformance]);

  useEffect(() => {
    const preTypingCursorTimer = setTimeout(() => {
        setShowPreTypingCursor(true);
    }, 2000); // Show cursor after boot sequence

    const startTypingTimer = setTimeout(() => {
      setShowPreTypingCursor(false);
      setIsTyping(true);
      let index = 0;
      typingIntervalRef.current = window.setInterval(() => {
        if (index >= fullTitle.length) {
          clearInterval(typingIntervalRef.current!);
          setIsTyping(false);
          setTimeout(() => setShowSmiley(true), 200);
        } else {
          const char = fullTitle[index];
          if (index < 1) {
            setPrefix(prev => prev + char);
          } else if (index < 3) {
            setOos(prev => prev + char);
          } else {
            setSuffix(prev => prev + char);
          }
          index++;
        }
      }, 150); // Typing speed
    }, 3600); // Start after pre-typing cursor finishes blinking (1.2s * 3 blinks = 3.6s, but we start it earlier)

    const buttonTimer = setTimeout(() => setShowButton(true), 5000);

    return () => {
      clearTimeout(preTypingCursorTimer);
      clearTimeout(startTypingTimer);
      clearTimeout(buttonTimer);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative flex flex-col items-center justify-center h-full text-center p-8 overflow-hidden"
    >
      <BootSequenceText />
      
      <div className="relative z-10 flex items-center justify-center mb-12" style={{ height: 'auto', minHeight: '128px' }}>
        <div className="w-full max-w-[85vw] flex items-center justify-center py-8">
          <h1 className={`text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-[0.1em] xs:tracking-[0.12em] sm:tracking-[0.15em] font-bold whitespace-nowrap ${isTyping ? 'glitch-effect-intense' : ''}`}>
              <span>{prefix}</span>
              <span className="inline-block relative">
                  {oos}
                  {showSmiley && (
                      <svg className="absolute bottom-[-10%] left-0 w-full h-[40%]" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
                          <path
                              d="M 15 30 C 35 50, 65 50, 85 30"
                              stroke="currentColor"
                              strokeWidth="5"
                              strokeLinecap="round"
                              fill="none"
                              className="animate-draw-smiley"
                          />
                      </svg>
                  )}
              </span>
              <span>{suffix}</span>
              {isTyping && <span className="animate-blink">_</span>}
              {showPreTypingCursor && <span className="animate-blink-3">_</span>}
          </h1>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center" style={{ height: '80px' }}>
        {showButton && (
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button variant="primary" onClick={handleComplete} disabled={isCompleting} className="animate-pulse-glow text-lg px-6 py-3 md:text-2xl md:px-8 md:py-4">
              Initialize Connection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};