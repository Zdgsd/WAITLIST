import { useCallback, useEffect, useRef } from 'react';

declare function drawMobileOptimizedNetwork(ctx: CanvasRenderingContext2D, width: number, height: number): void;
declare function drawDesktopNetwork(ctx: CanvasRenderingContext2D, width: number, height: number): void;

export const OptimizedNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastRenderTime = useRef<number>(0);

  const render = useCallback((timestamp: number) => {
    if (timestamp - lastRenderTime.current < 1000 / 30) {
      animationRef.current = requestAnimationFrame(render);
      return;
    }
    
    lastRenderTime.current = timestamp;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (window.innerWidth < 768) {
      drawMobileOptimizedNetwork(ctx, canvas.width, canvas.height);
    } else {
      drawDesktopNetwork(ctx, canvas.width, canvas.height);
    }

    animationRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(render);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className="network-canvas"
      style={{ 
        opacity: 0.6,
        transform: 'scale(1.5)'
      }}
    />
  );
};