// components/effects/LensFlares.tsx
import React, { useRef, useEffect } from 'react';

interface LensFlaresProps {
  intensity?: number;
  color?: string;
}

export const LensFlares: React.FC<LensFlaresProps> = ({ 
  intensity = 0.3, 
  color = 'rgba(47, 221, 108, 0.1)' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    const drawLensFlares = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create multiple lens flare elements
      const flares = [
        { x: canvas.width * 0.8, y: canvas.height * 0.2, size: 100, opacity: 0.1 },
        { x: canvas.width * 0.3, y: canvas.height * 0.7, size: 150, opacity: 0.05 },
        { x: canvas.width * 0.6, y: canvas.height * 0.4, size: 80, opacity: 0.08 },
      ];

      flares.forEach(flare => {
        const gradient = ctx.createRadialGradient(
          flare.x, flare.y, 0,
          flare.x, flare.y, flare.size
        );
        gradient.addColorStop(0, color.replace('0.1', flare.opacity.toString()));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(flare.x, flare.y, flare.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    drawLensFlares();
    window.addEventListener('resize', setCanvasSize);

    return () => window.removeEventListener('resize', setCanvasSize);
  }, [color, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5] mix-blend-screen"
      style={{ opacity: intensity }}
    />
  );
};