import { useEffect, useState } from 'react';

interface SocialMediaContext {
  isSocialMedia: boolean;
  isInstagram: boolean;
  isFacebook: boolean;
  isTwitter: boolean;
  isEmbedded: boolean;
  platform: 'instagram' | 'facebook' | 'twitter' | 'other' | 'direct';
}

export const useSocialMediaDetection = (): SocialMediaContext => {
  const [context, setContext] = useState<SocialMediaContext>({
    isSocialMedia: false,
    isInstagram: false,
    isFacebook: false,
    isTwitter: false,
    isEmbedded: false,
    platform: 'direct'
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isEmbedded = window.self !== window.top;
    
    const isInstagram = userAgent.includes('instagram');
    const isFacebook = userAgent.includes('fbios') || userAgent.includes('fban');
    const isTwitter = userAgent.includes('twitter');
    const isSocialMedia = isInstagram || isFacebook || isTwitter;
    
    let platform: SocialMediaContext['platform'] = 'direct';
    if (isInstagram) platform = 'instagram';
    else if (isFacebook) platform = 'facebook';
    else if (isTwitter) platform = 'twitter';
    else if (isSocialMedia) platform = 'other';
    
    setContext({
      isSocialMedia,
      isInstagram,
      isFacebook,
      isTwitter,
      isEmbedded,
      platform
    });
  }, []);

  return context;
};