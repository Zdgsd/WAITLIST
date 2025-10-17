// components/effects/DynamicGradient.tsx
import React, { useEffect, useState } from 'react';

interface DynamicGradientProps {
  phase: string;
}

export const DynamicGradient: React.FC<DynamicGradientProps> = ({ phase }) => {
  const [gradient, setGradient] = useState('');

  useEffect(() => {
    const gradients = {
      corporate: 'radial-gradient(circle at 20% 80%, rgba(47, 221, 108, 0.1) 0%, transparent 50%)',
      initialization: 'radial-gradient(circle at 50% 50%, rgba(100, 150, 255, 0.15) 0%, transparent 70%)',
      brand: 'radial-gradient(circle at 80% 20%, rgba(255, 180, 90, 0.2) 0%, transparent 50%)',
      memory: 'radial-gradient(circle at 30% 40%, rgba(80, 200, 200, 0.15) 0%, transparent 60%)',
      default: 'radial-gradient(circle at 50% 50%, rgba(47, 221, 108, 0.1) 0%, transparent 50%)'
    };

    setGradient(gradients[phase as keyof typeof gradients] || gradients.default);
  }, [phase]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[2] transition-all duration-1000"
      style={{ background: gradient }}
    />
  );
};