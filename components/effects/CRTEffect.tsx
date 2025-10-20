
import React, { memo } from 'react';

// Constants for CRT effect
const CRT_STYLES = {
  scanline: {
    backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
    backgroundSize: '100% 2px, 3px 100%',
    zIndex: 100,
  },
  vignette: {
    boxShadow: 'inset 0 0 150px rgba(0,0,0,0.75)',
    zIndex: 99,
  }
};

interface CRTEffectProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export const CRTEffect = memo<CRTEffectProps>(({ children, disabled = false }) => {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full font-mono bg-black overflow-hidden">
      {children}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={CRT_STYLES.scanline}
      />
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={CRT_STYLES.vignette}
      />
    </div>
  );
});
