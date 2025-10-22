import { useEffect, useState } from 'react';

interface PlatformProfile {
  animationQuality: 'high' | 'medium' | 'low';
  particleDensity: number;
  frameRate: number;
  enableEffects: boolean;
}

export const usePlatformOptimization = () => {
  const [platformProfile, setPlatformProfile] = useState<PlatformProfile>({
    animationQuality: 'high',
    particleDensity: 100,
    frameRate: 60,
    enableEffects: true
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isSocialMedia = 
      userAgent.includes('instagram') || 
      userAgent.includes('fbios') || 
      userAgent.includes('fban') ||
      userAgent.includes('twitter');
    
    const isHighEndDevice = navigator.hardwareConcurrency > 4;
    const isLargeScreen = window.innerWidth > 1024;
    
    if (isSocialMedia || !isHighEndDevice) {
      setPlatformProfile({
        animationQuality: 'low',
        particleDensity: 30,
        frameRate: 30,
        enableEffects: false
      });
    } else if (!isLargeScreen) {
      setPlatformProfile({
        animationQuality: 'medium',
        particleDensity: 60,
        frameRate: 45,
        enableEffects: true
      });
    }
  }, []);

  return platformProfile;
};