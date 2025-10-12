export interface UserSession {
  sessionId: string;
  startTime: string;
  userAgent: string;
  screenSize: string;
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
  user_id?: string | null;
  timestamp: string;
  client_timestamp: string;
}