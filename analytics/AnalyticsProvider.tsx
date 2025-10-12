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

const BATCH_SIZE = 5; // Reduced batch size for more frequent updates
const FLUSH_INTERVAL = 2000; // 2 seconds for more real-time updates
const DEBUG = true; // Enable debug logging

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sessionId = useRef<string>(uuidv4());
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimeout = useRef<NodeJS.Timeout>();
  const isFlushingRef = useRef(false);

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
    if (eventQueue.current.length === 0 || isFlushingRef.current) return;

    isFlushingRef.current = true;
    const events = eventQueue.current.splice(0, BATCH_SIZE);

    try {
      if (DEBUG) {
        console.log('[Analytics] Flushing events:', events);
      }

      // Map events to match database structure
      const mappedEvents = events.map(event => ({
        ...event,
        event_timestamp: event.timestamp, // Use the new column name
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('user_analytics')
        .insert(mappedEvents)
        .select(); // Add select to verify insertion

      if (error) {
        console.error('[Analytics] Failed to flush events:', error.message);
        // Put events back in queue if they failed to send
        eventQueue.current = [...events, ...eventQueue.current];
      } else if (DEBUG) {
        console.log('[Analytics] Successfully flushed events');
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
      timestamp: new Date().toISOString(),
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
