// types.ts

export enum AppPhase {
  CORPORATE_SHELL = 'CORPORATE_SHELL',
  INITIALIZATION = 'INITIALIZATION',
  IMAGINE_IF = 'IMAGINE_IF',
  GLITCH_1 = 'GLITCH_1',
  MEMORY_PROMPT_1 = 'MEMORY_PROMPT_1',
  MEMORY_PROMPT_2 = 'MEMORY_PROMPT_2',
  BRAND_REVEAL = 'BRAND_REVEAL',
  INVITATION_BOX = 'INVITATION_BOX',
  MEMORY_EXCHANGE = 'MEMORY_EXCHANGE',
  COMPLETION = 'COMPLETION',
  INVESTOR_PAGE = 'INVESTOR_PAGE',
  EXIT = 'EXIT',
}

export type UserRole = 
  // Creator Sub-roles
  | 'musician'
  | 'technician'
  | 'performer'
  | 'visual_artist'
  // Organizer Sub-roles
  | 'venue_owner'
  | 'event_planner'
  | 'talent_hunter'
  // Explorer
  | 'explorer';


export interface UserRoleInfo {
    id: UserRole;
    label: string;
}

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface MemoryCardData {
  role: UserRole | null;
  name: string;
  email: string;
  age: number | null;
  consentGiven: boolean;
  gameAnswers: { [key: string]: string };
}