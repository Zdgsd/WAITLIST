import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
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
const FLUSH_INTERVAL = 10000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const DEBUG = process.env.NODE_ENV === 'development';

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(false);
  const sessionId = useRef<string>(crypto.randomUUID());
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimeout = useRef<NodeJS.Timeout>();
  const isFlushingRef = useRef(false);
  const retryCount = useRef(0);

  useEffect(() => {
    if (supabase) {
      setIsSupabaseAvailable(true);
    } else {
      console.warn('[Analytics] Supabase client not available. Analytics disabled.');
    }
  }, []);

  const getUserSession = (): UserSession => ({
    session_id: sessionId.current,
    start_time: new Date().toISOString(),
    user_agent: navigator.userAgent,
    screen_size: `${window.screen.width}x${window.screen.height}`,
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
    if (!isSupabaseAvailable || eventQueue.current.length === 0 || isFlushingRef.current) return;

    if (flushTimeout.current) {
      clearTimeout(flushTimeout.current);
      flushTimeout.current = undefined;
    }

    isFlushingRef.current = true;
    const events = eventQueue.current.splice(0, BATCH_SIZE);

    try {
      if (DEBUG) {
        console.log('[Analytics] Flushing events:', events);
      }

      const mappedEvents = events.map(event => ({
        event_type: event.event_type,
        event_data: event.event_data,
        session_id: event.session_id,
        client_timestamp: new Date(event.client_timestamp).toISOString()
      }));

      const { data, error } = await supabase
        .from('user_analytics')
        .insert(mappedEvents)
        .select();

      if (error) {
        console.error('[Analytics] Failed to flush events:', error.message);
        eventQueue.current = [...events, ...eventQueue.current];

        if (retryCount.current < MAX_RETRIES) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount.current);
          retryCount.current++;
          setTimeout(flushEvents, delay);
        }
      } else {
        retryCount.current = 0;
        if (DEBUG) {
          console.log('[Analytics] Successfully flushed events, inserted data:', data);
        }
      }
    } catch (err) {
      console.error('[Analytics] Unexpected error while flushing:', err);
      eventQueue.current = [...events, ...eventQueue.current];
    } finally {
      isFlushingRef.current = false;
    }
  };

  const queueEvent = (event: AnalyticsEvent) => {
    if (!isSupabaseAvailable) return;

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
    const event = {
      event_type: name,
      event_data: createEventData(props),
      session_id: sessionId.current,
      client_timestamp: new Date().toISOString(),
    };

    if (DEBUG) {
      console.log('[Analytics] Tracking event:', event);
    }

    queueEvent(event);

    if (name.includes('form_submission') || name === 'page_view') {
      flushEvents();
    }
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
      client_timestamp: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (!isSupabaseAvailable) return;

    const session = getUserSession();
    if (DEBUG) {
      console.log('[Analytics] Creating session:', session);
    }
    supabase.from('user_sessions').insert([session]).then((result: { data: any; error: any }) => {
      const { data, error } = result;
      if (error) {
        console.error('[Analytics] Failed to create session:', error.message);
      } else if (DEBUG) {
        console.log('[Analytics] Session created successfully:', data);
      }
    });

    trackPageView(window.location.pathname, { isInitialLoad: true });

    return () => {
      if (flushTimeout.current) {
        clearTimeout(flushTimeout.current);
      }
      flushEvents();
    };
  }, [isSupabaseAvailable]);

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
