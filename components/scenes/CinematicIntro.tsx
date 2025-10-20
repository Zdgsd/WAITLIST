import React from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface CinematicIntroProps {
  onComplete: () => void;
}

const TimelineText: React.FC<{ children: React.ReactNode; show: boolean, className?: string }> = ({ children, show, className }) => (
    <div className={`transition-opacity duration-1000 ${show ? 'opacity-100' : 'opacity-0'} ${className}`}>{children}</div>
);

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [step, setStep] = React.useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (prefersReducedMotion) {
      // Skip to end for reduced motion
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }

    const timeouts = [
      // 0.0s -> 0.8s: Start Corporate Shell (in App.tsx)
      setTimeout(() => setStep(1), 800),    // 0.8s: CRT Blink
      setTimeout(() => setStep(2), 1000),   // 1.0s: "Imagine if..."
      setTimeout(() => setStep(3), 2200),   // 2.2s: Glitch Transition
      setTimeout(() => setStep(4), 2500),   // 2.5s: "Your best memory..."
      setTimeout(() => setStep(5), 6400),   // 6.4s: "A click away"
      setTimeout(() => setStep(6), 7200),   // 7.2s: Beat Drop Montage
      setTimeout(() => setStep(7), 9800),   // 9.8s: Brand Reveal
      setTimeout(() => setStep(8), 11200),  // 11.2s: Invitation Whisper
      setTimeout(() => setStep(9), 13500),  // 13.5s: Decision UI
      setTimeout(onComplete, 14200),      // 14.2s: Memory Exchange
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [prefersReducedMotion, onComplete]);
  
  if (prefersReducedMotion) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in font-mono text-sm text-[var(--terminal-green)]">
              <p>Loading...</p>
          </div>
      );
  }

  // ... rest of the cinematic intro logic for non-reduced motion
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Your cinematic intro content here */}
      <TimelineText show={step >= 1}>Cinematic content...</TimelineText>
    </div>
  );
};