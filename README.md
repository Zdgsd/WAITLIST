# Bookeeni Cinematic Waitlist

An immersive, interactive waitlist experience for Bookeeni, built with React, TypeScript, and Vite. This application provides a unique, cinematic user journey through various scenes and transitions, creating an engaging signup process.

## Features

- Interactive Cinematic Experience
- Networking Game
- Network Background Effects
- CRT and Glitch Effects
- Built-in Analytics
- Role-based User Journey
- Supabase Integration

## Tech Stack

- React 19
- TypeScript
- Vite
- Supabase
- Custom Animation Effects

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tunisstarter-stack/WAITLISTBOOKEENI.git
cd WAITLISTBOOKEENI
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

The project uses Supabase for its backend. The API is secured behind an API gateway which requires an API Key for every request.

### API Configuration

The Supabase client is already configured in `supabaseClient.ts`. It uses the environment variables above to create a connection to your Supabase project:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
```

> **Note**: The provided API key is safe to use in a browser if you have enabled Row Level Security (RLS) for your tables and configured policies.

4. Start the development server:
```bash
npm run dev
```

## Usage

The application guides users through a cinematic experience while collecting waitlist information. The journey includes:

1. Corporate Shell Interface
2. Initialization Sequence
3. Interactive Networking Game
4. Brand Reveal
5. User Role Selection
6. Final Registration

## Scene Flow

The application progresses through a series of scenes to create a narrative experience:

`CORPORATE_SHELL` → `INITIALIZATION` → `IMAGINE_IF` → `GLITCH_1` → `MEMORY_PROMPT` → `BRAND_REVEAL` → `INVITATION_BOX` → `MEMORY_EXCHANGE` → `COMPLETION`

## Mechanisms and Processes

The application is a state machine that transitions through different "phases" (scenes). The `App` component manages the current phase and user data.

- **`AppPhase` Enum:** Defines the different scenes in the application.
- **`App` component:** The main component that manages the application's state, including the current phase, user data, and transitions between phases.
- **Scene Components:** Each scene is a React component responsible for its own UI and logic.
- **`handlePhaseChange`:** A function that transitions the application to a new phase, triggers background animations, and tracks analytics.
- **Data Submission:** User data is collected throughout the experience and submitted to a Supabase backend in the `CompletionScene`.
- **Networking Game:** The `MemoryExchangeScene` has been repurposed into a networking game where users answer a series of questions to build their profile.
- **Chat:** A real-time chat feature is available for users to connect with each other.

## Change Log

### Version 2.0.0

- **Concept Change:** The "memory exchange" concept has been replaced with a "networking" concept. The application now focuses on building a professional network for creators and organizers.
- **UI/UX Updates:** The UI has been updated to reflect the new networking concept.
- **New Scenes:** New scenes have been added to support the networking game and chat features.
- **Code Refactoring:** The codebase has been refactored to improve readability and maintainability.

### Version 1.0.0

- Initial release of the cinematic waitlist experience.
- Focused on the "memory exchange" concept.

## Analytics

The application includes built-in analytics tracking for:
- Page views and duration
- User interactions
- Completion rates
- Role selection

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)

## Links

- [Bookeeni Website](https://bookeeni.com)
- [Documentation](#)
- [Support](#)