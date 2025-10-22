import { memo } from 'react';
import { usePlatformOptimization } from '../../hooks/usePlatformOptimization';
import { OptimizedNetworkBackground } from '../OptimizedNetworkBackground';

interface AdaptiveNetworkBackgroundProps {
  offset: { x: number; y: number };
  isTransitioning: boolean;
  animationTrigger: number;
}

export const AdaptiveNetworkBackground = memo((
  props: AdaptiveNetworkBackgroundProps
) => {
  const platformProfile = usePlatformOptimization();
  
  // For low-performance contexts, use simplified version
  if (platformProfile.animationQuality === 'low' || !platformProfile.enableEffects) {
    return (
      <div
        className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black opacity-30"
        style={{
          transform: `translate(${props.offset.x * 0.5}px, ${props.offset.y * 0.5}px)`,
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    );
  }
  
  // For medium/high performance contexts, use optimized network background
  return <OptimizedNetworkBackground />;
});