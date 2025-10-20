// components/effects/SceneTransition.tsx
import React from 'react';

interface SceneTransitionProps {
  isTransitioning: boolean;
  direction?: 'in' | 'out';
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({ 
  isTransitioning, 
  direction = 'out' 
}) => {
  return (
    <>
      {/* Film burn transition */}
      <div 
        className={`fixed inset-0 z-[1000] pointer-events-none bg-gradient-to-br from-orange-500/0 via-orange-400/10 to-yellow-300/0 transition-opacity duration-500 ${isTransitioning && direction === 'out' ? 'opacity-100' : 'opacity-0'}`}
        style={{
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* Vignette pulse during transitions */}
      <div 
        className={`fixed inset-0 z-[999] pointer-events-none transition-all duration-700 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
        style={{
          boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)',
        }}
      />
    </>
  );
};