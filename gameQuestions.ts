// gameQuestions.ts

export interface GameQuestion {
  id: string;
  category: string;
  title: string;
  type: 'text' | 'single-choice';
  options?: string[];
}

export const gameQuestions: GameQuestion[] = [
  {
    id: 'home_base',
    category: 'Vitals',
    title: 'What city do you call “home base” these days?',
    type: 'single-choice',
    options: ['Tunisia', 'Global'],
  },
  {
    id: 'live_events_freq',
    category: 'Vitals',
    title: 'How often do you find yourself at live events — be honest, not your Instagram version.',
    type: 'single-choice',
    options: ['Every weekend', 'Once a month', 'A few times a year', 'Rarely, but when I do — it’s worth it'],
  },
  {
    id: 'event_motivation',
    category: 'Vitals',
    title: 'Do you go for the music, the people, or the story you’ll tell later?',
    type: 'single-choice',
    options: ['Music', 'People', 'Stories', 'All three, in the right order'],
  },
  {
    id: 'new_discovery',
    category: 'How do you experience art?',
    title: 'When was the last time you discovered someone new and thought, “Damn, where have they been hiding?”',
    type: 'single-choice',
    options: ['This week', 'This month', 'It’s been a while', 'Still looking…'],
  },
  {
    id: 'great_night_starts',
    category: 'How do you experience art?',
    title: 'Do you believe a great night starts on stage or in the crowd?',
    type: 'single-choice',
    options: ['On stage', 'In the crowd', 'Between the two — in the energy field'],
  },
  {
    id: 'lineup_or_legend',
    category: 'How do you experience art?',
    title: 'Would you rather be part of the lineup or the legend retelling it later?',
    type: 'single-choice',
    options: ['Lineup', 'Legend', 'Both, but undercover'],
  },
  {
    id: 'event_discovery_method',
    category: 'How do you experience art?',
    title: 'How do you usually find new events: scrolling, word of mouth, or cosmic coincidence?',
    type: 'single-choice',
    options: ['Scrolling', 'Word of mouth', 'Coincidence', 'Organized chaos'],
  },
  {
    id: 'platform_use',
    category: 'Future signals',
    title: 'If there was a platform that made finding and booking live creators effortless, would you use it... or test it?',
    type: 'single-choice',
    options: ['Use it', 'Test it', 'Break it'],
  },
  {
    id: 'missing_from_events',
    category: 'Future signals',
    title: 'What’s missing from live events today — magic, money, or meaning?',
    type: 'single-choice',
    options: ['Magic', 'Money', 'Meaning', 'All three in balance'],
  },
  {
    id: 'shaping_connection',
    category: 'Future signals',
    title: 'If joining early meant shaping how artists and fans connect, would you take that shot?',
    type: 'single-choice',
    options: ['Definitely', 'Maybe — tell me more', 'I’d rather watch first'],
  },
  {
    id: 'pay_for_memory',
    category: 'Future signals',
    title: 'How much would you pay for a front-row seat to your next favorite memory?',
    type: 'single-choice',
    options: ['$0 (magic should be free)', '$10-20', '$30-50', 'I’d trade something cooler than money'],
  },
  {
    id: 'finally_moment',
    category: 'Future signals',
    title: 'What would make you say “finally” after trying a platform like this?',
    type: 'single-choice',
    options: ['Real opportunities', 'Fair pay', 'True discovery', 'Connection that lasts past the event'],
  },
  {
    id: 'go_or_plan',
    category: 'Quick pulse',
    title: 'Are you more of a “let’s go” or “let’s plan” type?',
    type: 'single-choice',
    options: ['Let’s go', 'Let’s plan', 'Let’s improvise'],
  },
  {
    id: 'connection_picture',
    category: 'Quick pulse',
    title: 'When you think of connection — do you picture people, places, or energy?',
    type: 'single-choice',
    options: ['People', 'Places', 'Energy', 'All of it, intertwined'],
  },
  {
    id: 'invited_or_discover',
    category: 'Quick pulse',
    title: 'Would you rather be invited or discover it first?',
    type: 'single-choice',
    options: ['Invited', 'Discover first', 'Both — depends who’s asking'],
  },
  {
    id: 'platform_stay',
    category: 'Quick pulse',
    title: 'What would make you stay on a platform like this?',
    type: 'single-choice',
    options: ['Authenticity', 'Community', 'Surprise factor', 'Opportunity'],
  },
  {
    id: 'how_found',
    category: 'Closing',
    title: '“Last one — just curiosity.” How did you end up here?',
    type: 'single-choice',
    options: ['Someone shared it', 'Saw it online', 'Destiny?', 'Don’t even know, just vibes'],
  },
];