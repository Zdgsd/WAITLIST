import React, { useRef, useEffect } from 'react';

const WARM_HIGHLIGHT = 'rgba(255, 180, 90, 0.9)';
const NODE_COLOR = 'rgba(200, 200, 200, 0.5)';

interface Particle {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;
  isHighlight: boolean;
}

interface NetworkBackgroundProps {
  offset: { x: number; y: number };
  isTransitioning: boolean;
}

const NetworkBackgroundComponent: React.FC<NetworkBackgroundProps> = ({ offset, isTransitioning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesArrayRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth * 2; // Make canvas wider for panning
      canvas.height = window.innerHeight * 2; // Make canvas taller for panning
    };

    const init = () => {
      particlesArrayRef.current = [];
      // Adjust particle density based on screen size and device performance
      const isMobile = window.innerWidth < 768;
      const density = isMobile ? 8000 : 5000; // Higher density (lower number = more particles)
      const numberOfParticles = Math.min(
        isMobile ? 80 : 120, // Increased particle count
        Math.max(50, (canvas.height * canvas.width) / density)
      );
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * (isMobile ? 1.5 : 2) + 1; // Slightly smaller particles on mobile
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const directionX = (Math.random() * 0.8) - 0.4; // Increased movement speed
        const directionY = (Math.random() * 0.8) - 0.4;
        const isHighlight = Math.random() < 0.05;
        const color = isHighlight ? WARM_HIGHLIGHT : NODE_COLOR;

        particlesArrayRef.current.push({ x, y, directionX, directionY, size, color, isHighlight });
      }
    };

    const connect = () => {
      let opacityValue = 1;
      const connectDistance = Math.min(canvas.width, canvas.height) / 9;

      for (let a = 0; a < particlesArrayRef.current.length; a++) {
        for (let b = a + 1; b < particlesArrayRef.current.length; b++) {
          const dx = particlesArrayRef.current[a].x - particlesArrayRef.current[b].x;
          const dy = particlesArrayRef.current[a].y - particlesArrayRef.current[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectDistance) {
            opacityValue = 1 - (distance / connectDistance);
            
            const fromParticle = particlesArrayRef.current[a];
            const toParticle = particlesArrayRef.current[b];
            
            let strokeStyle = `rgba(200, 200, 200, ${opacityValue * 0.4})`; // Increased opacity
            if (fromParticle.isHighlight || toParticle.isHighlight) {
              strokeStyle = `rgba(255, 180, 90, ${opacityValue * 0.6})`; // Increased highlight opacity
            }

            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(fromParticle.x, fromParticle.y);
            ctx.lineTo(toParticle.x, toParticle.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesArrayRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
        
        ctx.shadowColor = p.isHighlight ? WARM_HIGHLIGHT : 'rgba(200, 200, 200, 0.5)';
        ctx.shadowBlur = p.isHighlight ? 15 : 5;
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.directionX;
        p.y += p.directionY;

        // Wraparound logic to create an infinite field
        if (p.x > canvas.width + p.size) p.x = -p.size;
        else if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.y > canvas.height + p.size) p.y = -p.size;
        else if (p.y < -p.size) p.y = canvas.height + p.size;
      }
      
      ctx.shadowBlur = 0;
      connect();
      animationFrameId.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      setCanvasSize();
      init();
    };

    setCanvasSize();
    init();
    animate();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className={`network-canvas ${isTransitioning ? 'is-moving' : ''}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} />;
};

export const NetworkBackground = React.memo(NetworkBackgroundComponent);
