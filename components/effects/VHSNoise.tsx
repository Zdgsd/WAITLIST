import React, { useRef, useEffect } from 'react';

interface VHSNoiseProps {
  intensity?: number;
  isTransitioning?: boolean;
  animationTrigger?: number;
}

export const VHSNoise: React.FC<VHSNoiseProps> = ({
  intensity = 0.08,
  isTransitioning = false,
  animationTrigger = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const currentIntensityRef = useRef(intensity);
  const targetIntensityRef = useRef(intensity);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    const setCanvasSize = () => {
      if (!isMountedRef.current) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    const generateNoise = () => {
      if (!isMountedRef.current || !ctx) return;

      currentIntensityRef.current += (targetIntensityRef.current - currentIntensityRef.current) * 0.1;

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      const noiseIntensity = currentIntensityRef.current;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random();

        if (noise > (1 - noiseIntensity)) {
          const value = Math.random() * 255;
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
          data[i + 3] = Math.random() * 100 + 50;
        } else {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      animationFrameRef.current = requestAnimationFrame(generateNoise);
    };

    generateNoise();

    const handleResize = () => {
      if (!isMountedRef.current) return;
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[98] mix-blend-screen"
      style={{
        opacity: 0.4,
        filter: 'contrast(1.2)'
      }}
    />
  );
};
