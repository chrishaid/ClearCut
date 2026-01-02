# CLAUDE.md - Clearcut Project Guide

## Overview
Clearcut is a spaced repetition web application for 7th-8th graders preparing for Chicago's HSAT (High School Admissions Test). It uses the FSRS algorithm to help students gain admission to selective enrollment high schools (Whitney Young, Walter Payton, Lane Tech, Northside College Prep, Jones College Prep).

## Tech Stack
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth)
- **Algorithm**: FSRS (Free Spaced Repetition Scheduler) via ts-fsrs library
- **Deployment**: Vercel

## Project Structure
```
clearcut/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, callback)
│   │   ├── (app)/             # Main app pages (dashboard, practice, exam, progress, settings)
│   │   └── parent/            # Parent portal pages
│   ├── actions/               # Server actions (session.ts, attempt.ts, auth.ts)
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── practice/         # Practice session components
│   │   └── exam/             # Exam mode components
│   ├── lib/
│   │   ├── supabase/         # Supabase client setup (client.ts, server.ts, admin.ts, middleware.ts)
│   │   └── fsrs/             # FSRS configuration and scheduling (index.ts, scheduler.ts, mappers.ts, types.ts)
│   └── types/                # TypeScript types (database.ts)
├── supabase/
│   └── migrations/           # Database schema migrations
├── content/
│   └── hsat_full_item_bank/  # Item bank (passages.json, items.json)
├── scripts/
│   └── importBank.ts         # Script to import items into Supabase
└── public/                   # Static assets
```

## Key Commands
```bash
# Development
npm run dev                    # Start dev server on localhost:3000

# Build
npm run build                  # Production build
npm run start                  # Start production server

# Database
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

# Import item bank
npx tsx scripts/importBank.ts  # Requires SUPABASE_SERVICE_ROLE_KEY
```

## Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # For admin operations only
```

## Core Concepts

### FSRS Algorithm
The app uses FSRS (Free Spaced Repetition Scheduler) with these settings:
- 90% target retention rate
- 21-day maximum interval (optimized for test prep)
- Fuzz enabled for natural spacing

Rating system (user-facing):
- After correct: "Too Easy", "Just Right", "Tricky"
- After incorrect: "Total Guess", "Almost Had It"

### Session Types
1. **Daily Practice**: Mix of review items (due today) + new items (weighted by week phase)
2. **Timed Exam**: Countdown timer, no immediate feedback, results at end

### Week Phases
- Weeks 1-4: Fundamentals (basic topics emphasized)
- Weeks 5-20: Balanced (even mix)
- Weeks 21-30: Applications (complex topics emphasized)

### User Roles
- **Student**: Can practice, take exams, view personal progress
- **Parent**: Can view linked students' progress (read-only)

## Database Tables
- `passages`: Reading passages
- `items`: Questions with answer choices and rationale
- `profiles`: User settings and parent-child linking
- `user_item_state`: FSRS scheduling state per user/item
- `sessions`: Practice and exam sessions
- `session_items`: Items in a session
- `attempts`: Individual question responses with FSRS snapshots
- `streaks`: User streak tracking
- `daily_stats`: Daily aggregated statistics
- `topic_stats`: Topic-level mastery tracking

## Important Files
- `src/lib/fsrs/scheduler.ts`: Core FSRS scheduling logic
- `src/actions/session.ts`: Session creation and completion
- `src/actions/attempt.ts`: Recording answers and updating FSRS state
- `src/app/(app)/practice/[sessionId]/page.tsx`: Main practice UI
- `src/app/(app)/exam/[examId]/page.tsx`: Timed exam UI
- `supabase/migrations/001_initial_schema.sql`: Database schema

## Code Patterns
- Server Components for data fetching (async functions in page.tsx)
- Server Actions for mutations (actions/*.ts with 'use server')
- Client Components for interactivity ('use client' directive)
- Supabase RLS policies for row-level security

## Testing
Run type checking:
```bash
npm run build
```

## Common Tasks

### Adding a new topic
1. Add topic to item bank (items.json)
2. Update getWeekPhase in `src/lib/fsrs/scheduler.ts` if needed
3. Re-import items: `npx tsx scripts/importBank.ts`

### Modifying FSRS parameters
Edit `src/lib/fsrs/index.ts`:
- `request_retention`: Target recall probability (0.9 = 90%)
- `maximum_interval`: Max days between reviews
- `enable_fuzz`: Randomness in scheduling
