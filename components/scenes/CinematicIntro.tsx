
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
      const timer = setTimeout(onComplete, 2000);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion, onComplete]);
  
  if (prefersReducedMotion) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in font-vt323 text-3xl text-green-400">
            <p className="animate-typewriter">You have been invited.</p>
          </div>
      )
  }

  const showGlitch = step === 3;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center text-green-400 font-vt323 text-4xl md:text-5xl lg:text-6xl ${showGlitch ? 'animate-glitch' : ''}`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
        {step < 7 &&
          <div className="space-y-4">
              <TimelineText show={step === 1 || step === 2}>
                  <p>
                      {step >= 2 && <span className="inline-block animate-typewriter">Imagine if...</span>}
                      {step === 1 && <span className="animate-blink">_</span>}
                  </p>
              </TimelineText>
              <TimelineText show={step >= 4 && step < 5}>
                  <p>...your best memory...</p>
              </TimelineText>
              <TimelineText show={step >= 5 && step < 6}>
                  <p>was just a click away.</p>
              </TimelineText>
          </div>
        }
        
        {step >= 6 && step < 7 &&
            <div className="text-2xl md:text-4xl animate-pulse">
                <p>RELIVE THE MOMENT</p>
                <p>FIND YOUR TRIBE</p>
                <p>NEVER MISS OUT</p>
            </div>
        }

        {step >= 7 && step < 8 &&
            <h1 className="text-7xl md:text-9xl font-bold text-white animate-pixel-assemble tracking-widest">
                BOOKEENI
            </h1>
        }

        {step >= 8 &&
            <div className="space-y-8">
                <TimelineText show={step >= 8}>
                    <p>You have been invited.</p>
                </TimelineText>
                <TimelineText show={step >= 9} className="flex justify-center items-center space-x-8">
                    <button className="text-5xl hover:scale-110 transition-transform">Yes</button>
                    <button className="text-5xl text-gray-600 hover:text-gray-400 transition-colors">No</button>
                </TimelineText>
            </div>
        }
      </div>
    </div>
  );
};
