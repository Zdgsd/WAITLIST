import React, { createContext, useContext } from 'react';

type AnalyticsEventProps = Record<string, any> | undefined;

type AnalyticsContextValue = {
  trackEvent: (name: string, props?: AnalyticsEventProps) => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue>({
  trackEvent: () => {},
});

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trackEvent = (name: string, props?: AnalyticsEventProps) => {
    // Minimal no-op provider for environments without a real analytics implementation.
    // You can integrate Google Analytics, Segment, Plausible, etc. here.
    if (typeof window !== 'undefined') {
      // Optionally expose for debugging
      // eslint-disable-next-line no-console
      console.debug('[Analytics] trackEvent', name, props);
    }
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);

export default AnalyticsProvider;
