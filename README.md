# 🎬 Bookeeni Cinematic Waitlist

An immersive, interactive waitlist experience for Bookeeni, built with React, TypeScript, and Vite. This application provides a unique, cinematic user journey through various scenes and transitions, creating an engaging signup process.

## ✨ Features

- 🎭 Interactive Cinematic Experience
- 🎮 Memory Exchange Game
- 🌐 Network Background Effects
- 📺 CRT and Glitch Effects
- 📊 Built-in Analytics
- 🎨 Role-based User Journey
- 🔒 Supabase Integration

## 🚀 Tech Stack

- React 19
- TypeScript
- Vite
- Supabase
- Custom Animation Effects

## 🛠️ Installation

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
VITE_SUPABASE_URL=https://qsahuopwwttratthqwbg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzYWh1b3B3d3R0cmF0dGhxd2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxODg3NDgsImV4cCI6MjA3NTc2NDc0OH0.tOF5d6Ld-CIS_Vp4YmsP061bMF2gj22MIrvavmRnCw0
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

## 🎯 Usage

The application guides users through a cinematic experience while collecting waitlist information. The journey includes:

1. Corporate Shell Interface
2. Initialization Sequence
3. Interactive Memory Exchange
4. Brand Reveal
5. User Role Selection
6. Final Registration

## 🎮 Scene Flow

```
CORPORATE_SHELL → INITIALIZATION → IMAGINE_IF → GLITCH_1 → 
MEMORY_PROMPT → BRAND_REVEAL → INVITATION_BOX → 
MEMORY_EXCHANGE → COMPLETION
```

## 📈 Analytics

The application includes built-in analytics tracking for:
- Page views and duration
- User interactions
- Completion rates
- Role selection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

[MIT](LICENSE)

## 🔗 Links

- [Bookeeni Website](https://bookeeni.com)
- [Documentation](#)
- [Support](#)
