import { useEffect } from 'react';

export const useSocialMediaOptimization = () => {
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isSocialMedia = 
      userAgent.includes('instagram') || 
      userAgent.includes('fbios') || 
      userAgent.includes('fban') ||
      userAgent.includes('twitter');

    if (isSocialMedia) {
      document.documentElement.style.setProperty('--animation-scale', '0.5');
      
      const style = document.createElement('style');
      style.textContent = `
        .network-canvas { display: none !important; }
        .white-noise-overlay { opacity: 0.1 !important; }
        .glitch-effect-intense { animation: none !important; }
      `;
      document.head.appendChild(style);
    }
  }, []);
};