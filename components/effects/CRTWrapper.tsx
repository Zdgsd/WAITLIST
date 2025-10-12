import React from 'react';

export const CRTWrapper: React.FC<{ children: React.ReactNode; videoActive: boolean }> = ({ children, videoActive }) => {
  return (
    <div className="relative w-full h-full overflow-hidden animate-flicker">
      {videoActive && (
        <video
          autoPlay
          loop
          muted
          playsInline
          src="/glitch-background.mp4"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-30 pointer-events-none z-0"
        />
      )}
      <div className="screen-border" />
      <div className="white-noise-overlay" />
      <div className="scanline-overlay" />
      
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
      
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 10vw 3vw var(--terminal-black)',
          zIndex: 98,
        }}
      />
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.75)',
          zIndex: 99,
        }}
      />
    </div>
  );
};