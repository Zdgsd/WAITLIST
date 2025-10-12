import React, { createContext, useContext, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
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

const BATCH_SIZE = 10; // Increased batch size for better performance
const FLUSH_INTERVAL = 10000; // 10 seconds for reduced network requests
const DEBUG = process.env.NODE_ENV === 'development'; // Only debug in development

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sessionId = useRef<string>(uuidv4());
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimeout = useRef<NodeJS.Timeout>();
  const isFlushingRef = useRef(false);

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
    if (eventQueue.current.length === 0 || isFlushingRef.current) return;

    isFlushingRef.current = true;
    const events = eventQueue.current.splice(0, BATCH_SIZE);

    try {
      if (DEBUG) {
        console.log('[Analytics] Flushing events:', events);
        console.log('[Analytics] Supabase client:', supabase);
      }

      // Map events to match the database schema
      const mappedEvents = events.map(event => ({
        event_type: event.event_type,
        event_data: event.event_data,
        session_id: event.session_id,
        client_timestamp: new Date(event.client_timestamp).toISOString()
      }));

      if (DEBUG) {
        console.log('[Analytics] Mapped events for insertion:', mappedEvents);
      }

      const { data, error } = await supabase
        .from('user_analytics')
        .insert(mappedEvents)
        .select();

      if (error) {
        console.error('[Analytics] Failed to flush events:', error.message, error.details, error.hint);
        // Put events back in queue if they failed to send
        eventQueue.current = [...events, ...eventQueue.current];
      } else if (DEBUG) {
        console.log('[Analytics] Successfully flushed events, inserted data:', data);
      }
    } catch (err) {
      console.error('[Analytics] Unexpected error while flushing:', err);
      eventQueue.current = [...events, ...eventQueue.current];
    } finally {
      isFlushingRef.current = false;
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

    // Force immediate flush for important events
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

  // Initialize session
  useEffect(() => {
    const session = getUserSession();
    if (DEBUG) {
      console.log('[Analytics] Creating session:', session);
    }
    supabase.from('user_sessions').insert([session]).then(({ data, error }) => {
      if (error) {
        console.error('[Analytics] Failed to create session:', error.message, error.details, error.hint);
      } else if (DEBUG) {
        console.log('[Analytics] Session created successfully:', data);
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
