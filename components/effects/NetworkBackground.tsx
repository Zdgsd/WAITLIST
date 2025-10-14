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
  speedMultiplier: number;
}

interface NetworkBackgroundProps {
  offset: { x: number; y: number };
  isTransitioning: boolean;
  animationTrigger: number;
}

const NetworkBackgroundComponent: React.FC<NetworkBackgroundProps> = ({ offset, isTransitioning, animationTrigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesArrayRef = useRef<Particle[]>([]);
  const isMountedRef = useRef(true);
  const burstState = useRef({ active: false, duration: 0, started: 0 });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (animationTrigger > 0) {
      burstState.current = { active: true, duration: 500, started: Date.now() };
    }
  }, [animationTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      if (!isMountedRef.current) return;
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
    };

    const init = () => {
      if (!isMountedRef.current) return;
      particlesArrayRef.current = [];
      const isMobile = window.innerWidth < 768;
      const density = isMobile ? 7000 : 4000;
      const numberOfParticles = Math.min(
        isMobile ? 100 : 150,
        Math.max(60, (canvas.height * canvas.width) / density)
      );
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * (isMobile ? 1.8 : 2.2) + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const directionX = (Math.random() * 0.6) - 0.3;
        const directionY = (Math.random() * 0.6) - 0.3;
        const isHighlight = Math.random() < 0.08;
        const color = isHighlight ? WARM_HIGHLIGHT : NODE_COLOR;

        particlesArrayRef.current.push({ x, y, directionX, directionY, size, color, isHighlight, speedMultiplier: 1 });
      }
    };

    const connect = (burstProgress: number) => {
      if (!isMountedRef.current) return;
      const connectDistance = (Math.min(canvas.width, canvas.height) / 10) * (1 + burstProgress * 0.5);

      for (let a = 0; a < particlesArrayRef.current.length; a++) {
        for (let b = a + 1; b < particlesArrayRef.current.length; b++) {
          const dx = particlesArrayRef.current[a].x - particlesArrayRef.current[b].x;
          const dy = particlesArrayRef.current[a].y - particlesArrayRef.current[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectDistance) {
            const opacityValue = 1 - (distance / connectDistance);
            const fromParticle = particlesArrayRef.current[a];
            const toParticle = particlesArrayRef.current[b];

            let strokeStyle = `rgba(200, 200, 200, ${opacityValue * 0.5 * (1 + burstProgress * 0.5)})`;
            if (fromParticle.isHighlight || toParticle.isHighlight) {
              strokeStyle = `rgba(255, 180, 90, ${opacityValue * 0.7 * (1 + burstProgress * 0.5)})`;
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
      if (!isMountedRef.current) return;

      let burstProgress = 0;
      if (burstState.current.active) {
        const elapsed = Date.now() - burstState.current.started;
        if (elapsed < burstState.current.duration) {
          burstProgress = Math.sin((elapsed / burstState.current.duration) * Math.PI);
        } else {
          burstState.current.active = false;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesArrayRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const speedMultiplier = 1 + burstProgress * 4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);

        ctx.shadowColor = p.isHighlight ? WARM_HIGHLIGHT : 'rgba(200, 200, 200, 0.5)';
        ctx.shadowBlur = p.isHighlight ? 15 : 5;
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.directionX * speedMultiplier;
        p.y += p.directionY * speedMultiplier;

        if (p.x > canvas.width + p.size) p.x = -p.size;
        else if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.y > canvas.height + p.size) p.y = -p.size;
        else if (p.y < -p.size) p.y = canvas.height + p.size;
      }

      ctx.shadowBlur = 0;
      connect(burstProgress);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!isMountedRef.current) return;
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
        animationFrameId.current = null;
      }
    };
  }, []);

  return <canvas ref={canvasRef} className={`network-canvas ${isTransitioning ? 'is-moving' : ''}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} />;
};

export const NetworkBackground = React.memo(NetworkBackgroundComponent);
