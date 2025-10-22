import { memo } from 'react';

export const ANIMATION_DELAYS = {
  BOOT_LINE: 600,
  BOOT_START: 500,
  PRE_TYPING: 2000,
  TYPING_SPEED: 150,
  SHOW_BUTTON: 5000,
} as const;

export const bootLines = [
  'Initializing Connection',
  'Take a Deep Breath',
  'Here You Go !',
] as const;
