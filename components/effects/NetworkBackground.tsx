import React, { useRef, useEffect, useCallback } from 'react';

const WARM_HIGHLIGHT = 'rgba(255, 200, 120, 1)';
const NODE_COLOR = 'rgba(230, 230, 240, 1)';
const ACCENT_BLUE = 'rgba(120, 170, 255, 1)';
const ACCENT_TEAL = 'rgba(100, 220, 220, 1)';

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

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const NetworkBackgroundComponent: React.FC<NetworkBackgroundProps> = ({
  offset,
  isTransitioning,
  animationTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesArrayRef = useRef<Particle[]>([]);
  const isMountedRef = useRef(true);
  const burstState = useRef({ active: false, duration: 0, started: 0 });
  const mousePosition = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Add mouse interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      };
    };

    const handleMouseEnter = () => isHovering.current = true;
    const handleMouseLeave = () => isHovering.current = false;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  // Performance optimization: throttle animation frames
  const fps = 30; // Reduced from 60fps to 30fps for better performance
  const interval = 1000 / fps;
  let then = Date.now();
  
  // Device performance monitoring
  const devicePerformanceRef = useRef({
    frameTimes: [] as number[],
    averageFrameTime: 0,
    isLowEndDevice: false
  });
  
  // Check if we should disable effects based on performance
  const shouldDisableEffects = useCallback(() => {
    const perf = devicePerformanceRef.current;
    // Disable effects if consistently dropping frames
    return perf.isLowEndDevice || perf.averageFrameTime > 50; // 20fps threshold
  }, []);

  // Memoize expensive calculations
  const calculateParticlePositions = useCallback((particles: Particle[], canvas: HTMLCanvasElement, burstProgress: number, time: number) => {
    particles.forEach(p => {
      const speedMultiplier = 1 + burstProgress * 4;
      const wobble = Math.sin(time * 0.001 + p.pulseOffset) * 0.1;
      p.x += (p.directionX + wobble) * speedMultiplier;
      p.y += (p.directionY + wobble) * speedMultiplier;

      // Boundary checking with buffer
      if (p.x > canvas.width + p.size) p.x = -p.size;
      else if (p.x < -p.size) p.x = canvas.width + p.size;
      if (p.y > canvas.height + p.size) p.y = -p.size;
      else if (p.y < -p.size) p.y = canvas.height + p.size;
    });
  }, []);

  // Spatial partitioning grid for optimized connections
  const GRID_SIZE = 50;
  const gridMap = new Map<string, Particle[]>();

  // Optimized connection drawing with spatial partitioning
  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[], burstProgress: number, time: number) => {
    const baseDistance = Math.min(ctx.canvas.width, ctx.canvas.height) / 9;
    const connectDistance = baseDistance * (1 + burstProgress * 0.8);
    
    // Clear and rebuild spatial partitioning grid
    gridMap.clear();
    particles.forEach(p => {
      const gridX = Math.floor(p.x / GRID_SIZE);
      const gridY = Math.floor(p.y / GRID_SIZE);
      const key = `${gridX},${gridY}`;
      
      if (!gridMap.has(key)) {
        gridMap.set(key, []);
      }
      gridMap.get(key)!.push(p);
    });
    
    // Check connections using spatial partitioning
    particles.forEach(p1 => {
      const gridX = Math.floor(p1.x / GRID_SIZE);
      const gridY = Math.floor(p1.y / GRID_SIZE);
      
      // Check neighboring grids (3x3 area)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const neighborKey = `${gridX + dx},${gridY + dy}`;
          const neighborParticles = gridMap.get(neighborKey);
          
          if (neighborParticles) {
            neighborParticles.forEach(p2 => {
              // Skip same particle
              if (p1 === p2) return;
              
              const dxDist = p1.x - p2.x;
              const dyDist = p1.y - p2.y;
              const distanceSquared = dxDist * dxDist + dyDist * dyDist;
              
              // Use squared distance to avoid expensive Math.sqrt
              if (distanceSquared < connectDistance * connectDistance) {
                const distance = Math.sqrt(distanceSquared);
                const opacityValue = 1 - (distance / connectDistance);
                
                const fromParticle = p1;
                const toParticle = p2;

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
            });
          }
        }
      }
    });
  }, []);

  // Add particle trail effect
  const drawParticleTrails = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(particle => {
      if (particle.isHighlight) {
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 8
        );
        gradient.addColorStop(0, particle.color.replace(/, (\d|\.)+\)/, ', 0.5)'));
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 8, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  const animate = useCallback(() => {
    if (!isMountedRef.current) return;

    const now = Date.now();
    const delta = now - then;

    // Performance monitoring
    const frameStart = performance.now();
    
    if (delta > interval) {
      then = now - (delta % interval);

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
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Check if effects should be disabled
      if (shouldDisableEffects()) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesArrayRef.current;

      // Add mouse influence to particles
      particles.forEach(particle => {
        const dx = particle.x - (mousePosition.current.x * canvas.width / 2 + canvas.width / 2);
        const dy = particle.y - (mousePosition.current.y * canvas.height / 2 + canvas.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200 && isHovering.current) {
          // Repel particles from mouse
          const force = (200 - distance) / 200;
          particle.x += (dx / distance) * force * 2;
          particle.y += (dy / distance) * force * 2;
        }
      });

      // Update and draw particles
      calculateParticlePositions(particles, canvas, burstProgress, time);
      
      // Draw particle trails
      drawParticleTrails(ctx, particles);

      // Draw connections
      drawConnections(ctx, particles, burstProgress, time);
      
      // Performance monitoring
      const frameEnd = performance.now();
      const frameTime = frameEnd - frameStart;
      
      // Update performance metrics
      const perf = devicePerformanceRef.current;
      perf.frameTimes.push(frameTime);
      
      // Keep only last 30 frames
      if (perf.frameTimes.length > 30) {
        perf.frameTimes.shift();
      }
      
      // Calculate average frame time
      perf.averageFrameTime = perf.frameTimes.reduce((a, b) => a + b, 0) / perf.frameTimes.length;
      
      // Detect low-end device on initialization
      if (perf.frameTimes.length === 30 && perf.averageFrameTime > 30) {
        perf.isLowEndDevice = true;
      }
    }

    animationFrameId.current = requestAnimationFrame(animate);
  }, [calculateParticlePositions, drawConnections, interval, shouldDisableEffects]);

  const calculateOptimalParticleCount = useCallback((width: number, height: number) => {
    const area = width * height;
    const isMobile = width < 768;
    
    if (isMobile) {
      return Math.min(80, Math.max(40, area / 10000)); // Reduced particle count for mobile
    }
    
    // For desktop, reduce density and max particles to improve performance on large screens
    return Math.min(150, Math.max(80, area / 20000)); // Reduced particle count for desktop
  }, []);

  const init = useCallback((particleCount: number) => {
    if (!isMountedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    particlesArrayRef.current = [];
    const isMobile = window.innerWidth < 768;

    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * (isMobile ? 3 : 4) + 2; // Slightly smaller particles
      
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const angle = i * goldenAngle;
      const radius = Math.sqrt(i / particleCount) * (Math.min(canvas.width, canvas.height) / 2) * 0.9;

      const x = canvas.width / 2 + Math.cos(angle) * radius;
      const y = canvas.height / 2 + Math.sin(angle) * radius;

      const directionX = ((Math.random() * 1.2) - 0.6) * 0.8;
      const directionY = ((Math.random() * 1.2) - 0.6) * 0.8;
      const pulseOffset = Math.random() * Math.PI * 2;
      const accentType = Math.random();
      const isHighlight = Math.random() < 0.2; // Reduced highlight frequency
      let color = NODE_COLOR;
      if (isHighlight) {
        if (accentType < 0.4) color = WARM_HIGHLIGHT;
        else if (accentType < 0.7) color = ACCENT_BLUE;
        else color = ACCENT_TEAL;
      }

      particlesArrayRef.current.push({ x, y, directionX, directionY, size, color, isHighlight, speedMultiplier: 1, pulseOffset, accentType });
    }
  }, []);

  // Optimized resize handler with debouncing
  const resizeTimeout = useRef<NodeJS.Timeout>();
  const handleResize = useCallback(() => {
    if (!isMountedRef.current) return;
    
    if (resizeTimeout.current) {
      clearTimeout(resizeTimeout.current);
    }
    
    resizeTimeout.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const maxWidth = 1920 * 2;
      const maxHeight = 1080 * 2;
      canvas.width = Math.min(window.innerWidth * 2, maxWidth);
      canvas.height = Math.min(window.innerHeight * 2, maxHeight);
      
      // Reinitialize with optimal particle count
      const optimalCount = calculateOptimalParticleCount(canvas.width, canvas.height);
      init(optimalCount);
    }, 250);
  }, [calculateOptimalParticleCount, init]);

  useEffect(() => {
    // Defer initialization to improve initial page load performance
    const initTimer = setTimeout(() => {
      if (prefersReducedMotion) return;
      isMountedRef.current = true;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
      if (!ctx) return;

      const maxWidth = 1920 * 2;
      const maxHeight = 1080 * 2;
      canvas.width = Math.min(window.innerWidth * 2, maxWidth);
      canvas.height = Math.min(window.innerHeight * 2, maxHeight);

      // Initialize with optimal particle count
      const optimalCount = calculateOptimalParticleCount(canvas.width, canvas.height);
      init(optimalCount);
      animate();

      // Use passive event listener for better scrolling performance
      window.addEventListener('resize', handleResize, { passive: true });

      return () => {
        isMountedRef.current = false;
        window.removeEventListener('resize', handleResize);
        if (resizeTimeout.current) {
          clearTimeout(resizeTimeout.current);
        }
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }, 50); // Defer initialization by 50ms

    return () => {
      clearTimeout(initTimer);
    };
  }, [animate, handleResize, calculateOptimalParticleCount, init, prefersReducedMotion]);

  useEffect(() => {
    if (animationTrigger > 0) {
      burstState.current = { active: true, duration: 500, started: Date.now() };
    }
  }, [animationTrigger]);

  return <canvas
    ref={canvasRef}
    className={`network-canvas ${isTransitioning ? 'is-moving' : ''}`}
    style={{
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      position: 'fixed',
      left: '-50%',
      top: '-50%',
      width: '200%',
      height: '200%',
    }}
  />;
};

export const NetworkBackground = React.memo(NetworkBackgroundComponent);