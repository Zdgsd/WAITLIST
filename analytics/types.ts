export interface UserSession {
  session_id: string;
  start_time: string;
  user_agent: string;
  screen_size: string;
  language: string;
  referrer: string;
  platform: string;
}

export interface EventData extends Record<string, any> {
  sessionId: string;
  timestamp: string;
  path: string;
  viewportSize?: string;
  performance?: {
    loadTime?: number;
    renderTime?: number;
  };
}

export type AnalyticsEvent = {
  event_type: string;
  event_data: EventData;
  session_id: string;
  client_timestamp: string;
}