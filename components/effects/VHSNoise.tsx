import React, { useRef, useEffect, useCallback } from 'react';

interface VHSNoiseProps {
  intensity?: number;
  isTransitioning?: boolean;
  animationTrigger?: number;
}

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export const VHSNoise: React.FC<VHSNoiseProps> = ({
  intensity = 0.0336,
  isTransitioning = false,
  animationTrigger = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const currentIntensityRef = useRef(intensity);
  const targetIntensityRef = useRef(intensity);
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Performance optimization: reduce noise update frequency
  const noiseUpdateInterval = useRef(2); // Update every 2 frames
  let frameCount = 0;

  // Optimized noise generation using ImageData
  const generateNoise = useCallback(() => {
    if (!isMountedRef.current) return;

    frameCount++;
    if (frameCount % noiseUpdateInterval.current !== 0) {
      animationFrameRef.current = requestAnimationFrame(generateNoise);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Only update intensity when needed
    currentIntensityRef.current += (targetIntensityRef.current - currentIntensityRef.current) * 0.1;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    const noiseIntensity = currentIntensityRef.current;

    // Optimized noise generation loop
    const length = data.length;
    for (let i = 0; i < length; i += 4) {
      if (Math.random() > (1 - noiseIntensity)) {
        const value = Math.random() * 255;
        data[i] = data[i + 1] = data[i + 2] = value;
        data[i + 3] = Math.random() * 100 + 50;
      } else {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    animationFrameRef.current = requestAnimationFrame(generateNoise);
  }, []);

  // Debounced resize handler
  const resizeTimeout = useRef<NodeJS.Timeout>();
  const handleResize = useCallback(() => {
    if (!isMountedRef.current) return;
    
    if (resizeTimeout.current) {
      clearTimeout(resizeTimeout.current);
    }
    
    resizeTimeout.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const maxWidth = 1920;
      const maxHeight = 1080;
      canvas.width = Math.min(window.innerWidth, maxWidth);
      canvas.height = Math.min(window.innerHeight, maxHeight);
    }, 100);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    isMountedRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    const maxWidth = 1920;
    const maxHeight = 1080;
    canvas.width = Math.min(window.innerWidth, maxWidth);
    canvas.height = Math.min(window.innerHeight, maxHeight);

    generateNoise();

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [generateNoise, handleResize, prefersReducedMotion]);

  useEffect(() => {
    if (isTransitioning) {
      targetIntensityRef.current = intensity * 2.5;
    } else {
      targetIntensityRef.current = intensity;
    }
  }, [isTransitioning, intensity]);

  useEffect(() => {
    if (animationTrigger > 0) {
      targetIntensityRef.current = intensity * 3;
      setTimeout(() => {
        if (isMountedRef.current && !isTransitioning) {
          targetIntensityRef.current = intensity;
        }
      }, 400);
    }
  }, [animationTrigger, intensity, isTransitioning]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[98] mix-blend-screen"
      style={{
        opacity: 0.144,
        filter: 'contrast(1.2)'
      }}
    />
  );
};
