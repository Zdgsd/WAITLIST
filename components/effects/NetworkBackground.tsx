import React, { useRef, useEffect } from 'react';

const WARM_HIGHLIGHT = 'rgba(255, 180, 90, 1)';
const NODE_COLOR = 'rgba(220, 220, 230, 0.95)';
const ACCENT_BLUE = 'rgba(100, 150, 255, 0.9)';
const ACCENT_TEAL = 'rgba(80, 200, 200, 0.9)';

interface Particle {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;
  isHighlight: boolean;
  speedMultiplier: number;
  pulseOffset: number;
  accentType: number;
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
      const density = isMobile ? 2000 : 1000;
      const numberOfParticles = Math.min(
        isMobile ? 180 : 250,
        Math.max(120, (canvas.height * canvas.width) / density)
      );
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * (isMobile ? 2.5 : 3.5) + 2;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const directionX = ((Math.random() * 1.2) - 0.6) * 0.8;
        const directionY = ((Math.random() * 1.2) - 0.6) * 0.8;
        const pulseOffset = Math.random() * Math.PI * 2;
        const accentType = Math.random();
        const isHighlight = Math.random() < 0.15;
        let color = NODE_COLOR;
        if (isHighlight) {
          if (accentType < 0.4) color = WARM_HIGHLIGHT;
          else if (accentType < 0.7) color = ACCENT_BLUE;
          else color = ACCENT_TEAL;
        }

        particlesArrayRef.current.push({ x, y, directionX, directionY, size, color, isHighlight, speedMultiplier: 1, pulseOffset, accentType });
      }
    };

    const connect = (burstProgress: number, time: number) => {
      if (!isMountedRef.current) return;
      const baseDistance = Math.min(canvas.width, canvas.height) / 7;
      const connectDistance = baseDistance * (1 + burstProgress * 0.8);

      for (let a = 0; a < particlesArrayRef.current.length; a++) {
        for (let b = a + 1; b < particlesArrayRef.current.length; b++) {
          const dx = particlesArrayRef.current[a].x - particlesArrayRef.current[b].x;
          const dy = particlesArrayRef.current[a].y - particlesArrayRef.current[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectDistance) {
            const opacityValue = 1 - (distance / connectDistance);
            const fromParticle = particlesArrayRef.current[a];
            const toParticle = particlesArrayRef.current[b];

            const shimmer = Math.sin(time * 0.003 + distance * 0.01) * 0.15 + 0.85;
            let strokeStyle = `rgba(180, 180, 200, ${opacityValue * 0.6 * shimmer * (1 + burstProgress * 0.6)})`;
            let lineWidth = 1.2;

            if (fromParticle.isHighlight || toParticle.isHighlight) {
              if (fromParticle.accentType < 0.4 || toParticle.accentType < 0.4) {
                strokeStyle = `rgba(255, 180, 90, ${opacityValue * 0.85 * shimmer * (1 + burstProgress * 0.7)})`;
              } else if (fromParticle.accentType < 0.7 || toParticle.accentType < 0.7) {
                strokeStyle = `rgba(100, 150, 255, ${opacityValue * 0.8 * shimmer * (1 + burstProgress * 0.7)})`;
              } else {
                strokeStyle = `rgba(80, 200, 200, ${opacityValue * 0.8 * shimmer * (1 + burstProgress * 0.7)})`;
              }
              lineWidth = 1.5;
            }

            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
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

      const time = Date.now();
      let burstProgress = 0;
      if (burstState.current.active) {
        const elapsed = time - burstState.current.started;
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

        const pulse = Math.sin(time * 0.002 + p.pulseOffset) * 0.3 + 1;
        const animatedSize = p.size * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, animatedSize, 0, Math.PI * 2, false);

        if (p.isHighlight) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 20 + Math.sin(time * 0.003 + p.pulseOffset) * 8;
        } else {
          ctx.shadowColor = 'rgba(220, 220, 230, 0.6)';
          ctx.shadowBlur = 8;
        }
        ctx.fillStyle = p.color;
        ctx.fill();

        const wobble = Math.sin(time * 0.001 + p.pulseOffset) * 0.1;
        p.x += (p.directionX + wobble) * speedMultiplier;
        p.y += (p.directionY + wobble) * speedMultiplier;

        if (p.x > canvas.width + p.size) p.x = -p.size;
        else if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.y > canvas.height + p.size) p.y = -p.size;
        else if (p.y < -p.size) p.y = canvas.height + p.size;
      }

      ctx.shadowBlur = 0;
      connect(burstProgress, time);
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
