import React, { createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';

type AnalyticsEventProps = Record<string, any> | undefined;

type AnalyticsContextValue = {
  trackEvent: (name: string, props?: AnalyticsEventProps) => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue>({
  trackEvent: () => {},
});

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trackEvent = async (name: string, props?: AnalyticsEventProps) => {
    try {
      const { error } = await supabase.from('user_analytics').insert([
        {
          event_type: name,
          event_data: props || {},
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('[Analytics] Failed to track event:', error.message);
      }
    } catch (err) {
      console.error('[Analytics] Unexpected error:', err);
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
