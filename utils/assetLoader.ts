export const preloadCriticalAssets = () => {
  const criticalAssets = [
    '/fonts/roboto-mono.woff2',
    '/favicon.ico'
  ];

  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = asset;
    link.as = asset.endsWith('.woff2') ? 'font' : 'image';
    document.head.appendChild(link);
  });
};