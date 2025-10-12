import React, { createContext, useContext, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import * as uuid from 'uuid';
import { UserSession, EventData, AnalyticsEvent } from './types';

type AnalyticsContextValue = {
  trackEvent: (name: string, props?: Record<string, any>) => Promise<void>;
  trackPageView: (path: string, props?: Record<string, any>) => Promise<void>;
  trackInteraction: (elementId: string, action: string, props?: Record<string, any>) => Promise<void>;
  trackError: (error: Error, context?: Record<string, any>) => Promise<void>;
  trackPerformance: (metrics: Record<string, number>) => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextValue>({
  trackEvent: async () => {},
  trackPageView: async () => {},
  trackInteraction: async () => {},
  trackError: async () => {},
  trackPerformance: async () => {},
});

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 5000; // 5 seconds

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sessionId = useRef<string>(uuid.v4());
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimeout = useRef<NodeJS.Timeout>();

  const getUserSession = (): UserSession => ({
    sessionId: sessionId.current,
    startTime: new Date().toISOString(),
    userAgent: navigator.userAgent,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    referrer: document.referrer,
    platform: navigator.platform
  });

  const createEventData = (props?: Record<string, any>): EventData => ({
    sessionId: sessionId.current,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    performance: {
      loadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
      renderTime: window.performance.timing.domComplete - window.performance.timing.domLoading,
    },
    ...props
  });

  const flushEvents = async () => {
    if (eventQueue.current.length === 0) return;

    const events = eventQueue.current.splice(0, BATCH_SIZE);
    try {
      const { error } = await supabase.from('user_analytics').insert(events);
      if (error) {
        console.error('[Analytics] Failed to flush events:', error.message);
        // Put events back in queue if they failed to send
        eventQueue.current = [...events, ...eventQueue.current];
      }
    } catch (err) {
      console.error('[Analytics] Unexpected error while flushing:', err);
      eventQueue.current = [...events, ...eventQueue.current];
    }
  };

  const queueEvent = (event: AnalyticsEvent) => {
    eventQueue.current.push(event);
    
    if (eventQueue.current.length >= BATCH_SIZE) {
      flushEvents();
    } else if (!flushTimeout.current) {
      flushTimeout.current = setTimeout(() => {
        flushEvents();
        flushTimeout.current = undefined;
      }, FLUSH_INTERVAL);
    }
  };

  const trackEvent = async (name: string, props?: Record<string, any>) => {
    queueEvent({
      event_type: name,
      event_data: createEventData(props),
      session_id: sessionId.current,
      timestamp: new Date().toISOString(),
      client_timestamp: new Date().toISOString(),
    });
  };

  const trackPageView = async (path: string, props?: Record<string, any>) => {
    queueEvent({
      event_type: 'page_view',
      event_data: createEventData({
        path,
        title: document.title,
        ...props
      }),
      session_id: sessionId.current,
      timestamp: new Date().toISOString(),
      client_timestamp: new Date().toISOString(),
    });
  };

  const trackInteraction = async (elementId: string, action: string, props?: Record<string, any>) => {
    queueEvent({
      event_type: 'interaction',
      event_data: createEventData({
        elementId,
        action,
        ...props
      }),
      session_id: sessionId.current,
      timestamp: new Date().toISOString(),
      client_timestamp: new Date().toISOString(),
    });
  };

  const trackError = async (error: Error, context?: Record<string, any>) => {
    queueEvent({
      event_type: 'error',
      event_data: createEventData({
        error: {
          message: error.message,
          stack: error.stack,
          ...context
        }
      }),
      session_id: sessionId.current,
      timestamp: new Date().toISOString(),
      client_timestamp: new Date().toISOString(),
    });
  };

  const trackPerformance = async (metrics: Record<string, number>) => {
    queueEvent({
      event_type: 'performance',
      event_data: createEventData({
        metrics
      }),
      session_id: sessionId.current,
      timestamp: new Date().toISOString(),
      client_timestamp: new Date().toISOString(),
    });
  };

  // Initialize session
  useEffect(() => {
    const session = getUserSession();
    supabase.from('user_sessions').insert([session]).then(({ error }) => {
      if (error) {
        console.error('[Analytics] Failed to create session:', error.message);
      }
    });

    // Track initial page load
    trackPageView(window.location.pathname, { isInitialLoad: true });

    // Cleanup: flush any remaining events
    return () => {
      if (flushTimeout.current) {
        clearTimeout(flushTimeout.current);
      }
      flushEvents();
    };
  }, []);

  return (
    <AnalyticsContext.Provider value={{
      trackEvent,
      trackPageView,
      trackInteraction,
      trackError,
      trackPerformance
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);

export default AnalyticsProvider;
