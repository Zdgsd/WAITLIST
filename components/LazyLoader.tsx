import React, { lazy, Suspense } from 'react';

// Enhanced error boundary for lazy loaded components
class LazyComponentErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component loading error:', error, errorInfo);
    // Log error to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `LazyLoadError: ${error.message}`,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500">Failed to load component. Please refresh the page.</div>;
    }

    return this.props.children;
  }
}

// Lazy loaded components with error boundaries
const NetworkBackground = lazy(() => import('./effects/NetworkBackground').then(module => ({ default: module.NetworkBackground })));
const ChatInterface = lazy(() => import('./scenes/Chat').then(module => ({ default: module.Chat })));

export const LazyNetworkBackground = (props: { 
  offset: { x: number; y: number };
  isTransitioning: boolean;
  animationTrigger: number;
}) => (
  <LazyComponentErrorBoundary>
    <Suspense fallback={<div className="w-full h-full bg-black" />}>
      <NetworkBackground {...props} />
    </Suspense>
  </LazyComponentErrorBoundary>
);

export const LazyChatInterface = (props: { onClose: () => void }) => (
  <LazyComponentErrorBoundary>
    <Suspense fallback={<div className="text-terminal-green">Loading chat...</div>}>
      <ChatInterface {...props} />
    </Suspense>
  </LazyComponentErrorBoundary>
);

// Performance monitoring for lazy loading
if (typeof window !== 'undefined' && typeof PerformanceObserver !== 'undefined') {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.startsWith('lazy-')) {
        console.log(`Lazy loaded component "${entry.name}" took ${entry.duration.toFixed(2)}ms to load`);
        
        // Send to analytics if available
        if ((window as any).gtag) {
          (window as any).gtag('event', 'timing_complete', {
            name: 'lazy_load_component',
            value: Math.round(entry.duration),
            event_label: entry.name
          });
        }
      }
    }
  });
  
  observer.observe({ entryTypes: ['navigation', 'resource'] });
}