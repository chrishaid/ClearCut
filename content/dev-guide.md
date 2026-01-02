Absolutely. Below is a **clear PRD** plus an **updated implementation guide** for **Next.js (App Router) + React + Supabase (DB + Auth) + Vercel**, tailored to your HSAT spaced-repetition item-bank app.

---

# PRD: HSAT Prep App with Spaced Repetition (30 weeks)

## 1. Purpose

Build a web app that helps a student prepare for CPS Selective Enrollment HSAT using:

* HSAT-aligned **Math + Reading** practice
* A large **item bank (~1,000 items)**
* **Spaced repetition** scheduling over **30 weeks**, **5 days/week**
* Adaptive review frequency based on performance and confidence

## 2. Goals and success metrics

### Primary goals

* Student completes **daily sessions** reliably
* Student improves mastery by topic (Math + Reading)
* Student develops HSAT pacing and accuracy

### Success metrics (MVP)

* **≥ 80%** of weekdays include a completed session after week 3
* **≥ 70%** overall accuracy by week 10 (with growth thereafter)
* Topic mastery dashboard shows decreasing weakness concentration over time
* Average daily time-on-task: **15–35 minutes** (configurable)

## 3. Users and roles

### Roles

* **Student** (primary): does daily practice, sees explanations, confidence prompts
* **Parent/Coach** (optional role): views progress analytics, weak topics, time-on-task

MVP can be student-only with a single login.

## 4. Core user stories

### Student

1. “I log in and hit **Start Today’s Session**.”
2. “I answer questions one at a time.”
3. “After each question, I see:

   * correct/incorrect
   * explanation
   * quick confidence selection”
4. “At the end, I see session summary and a streak update.”
5. “I can review mistakes by topic.”

### Parent/Coach (Phase 2)

6. “I see progress by topic, accuracy trend, time-on-task, and most missed misconceptions.”

## 5. Scope

### In-scope (MVP)

* Supabase Auth (email magic link or password)
* Item bank (math + reading with passages)
* SRS algorithm + due dates
* Daily session generator (review-first + new items)
* Session completion tracking
* Basic dashboard (accuracy, streak, topic breakdown)
* Admin import pipeline for items (seed script)

### Out of scope (later)

* Multiplayer / cohorts
* Gamified store / rewards
* AI-generated passages on the fly
* Teacher rostering / classroom features

## 6. Content requirements

### Item bank size (target)

* **Math: 500 items**
* **Reading: 500 items**
* Reading includes **passages** with 3–6 linked questions.

### Required item fields

* subject, topic, subtopic (optional)
* difficulty (1–5)
* cognitive level (1–3)
* stem, choices, answer, explanation/rationale
* tags (misconception / skill tags)
* reading passage linkage when applicable

## 7. Scheduling requirements (SRS)

* Use SM-2 style spacing with confidence-based grading
* Clamp max interval to **21 days** so skills stay warm during the 30-week window
* Incorrect answers trigger quick relearning (due next day)
* System prioritizes overdue reviews before introducing new items

## 8. Session requirements

* 5 days/week cadence (Mon–Fri)
* Default session size: **25 items**

  * **15 review** (due items)
  * **10 new** (weighted by week phase)
* Week-based topic weighting:

  * Weeks 1–4: fundamentals heavier
  * Weeks 5–20: balanced
  * Weeks 21–30: strategic/applications heavier

## 9. UX requirements

* “One-question-at-a-time” flow
* Large readable text + mobile friendly
* Clear progress bar
* Immediate feedback + short explanation
* Confidence prompt with 2 taps max
* End-of-session summary with:

  * accuracy
  * time
  * topics to focus

## 10. Analytics requirements (MVP)

* Accuracy by topic
* Count due tomorrow
* Streak (consecutive weekday completions)
* Time per item and per session
* “Weakest topics” list (by accuracy + recentness)

## 11. Admin requirements (MVP)

* Scripted import of items (JSON → Supabase)
* Ability to mark items retired
* Ability to adjust session size and new/review split (config constants)

## 12. Risks / constraints

* No access to real HSAT items; content must be original but style-aligned.
* Building 1,000 high-quality items is the heavy lift: mitigate with templates + QA checks.

---

# Updated Implementation Guide: Next.js + Supabase + Vercel

## 1. Architecture overview

* **Next.js App Router** (UI + API routes)
* **Supabase Postgres** (items, passages, attempts, user scheduling state)
* **Supabase Auth** (session + RLS policies)
* **Vercel** deployment (Next.js)
* Optional: Supabase Edge Functions (not required for MVP)

Recommended: Use **Next.js server actions or route handlers** to:

* generate today’s session
* record attempts
* update SRS state

## 2. Supabase schema (SQL)

Run in Supabase SQL Editor.

### Enum types

```sql
create type subject as enum ('math', 'reading');
create type source_style as enum ('iowa_like', 'terranova_like');
create type attempt_result as enum ('correct', 'incorrect');
```

### Passages

```sql
create table passages (
  id uuid primary key default gen_random_uuid(),
  genre text not null, -- informational | literary
  title text,
  text text not null,
  lexile_band text,
  created_at timestamptz not null default now()
);
```

### Items

```sql
create table items (
  id uuid primary key default gen_random_uuid(),
  subject subject not null,
  topic text not null,
  subtopic text,
  difficulty int not null check (difficulty between 1 and 5),
  cognitive_level int not null check (cognitive_level between 1 and 3),
  source_style source_style not null,
  stem text not null,
  choices jsonb, -- null allowed for numeric later
  answer_key text not null,
  rationale text not null,
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'active', -- active|retired
  passage_id uuid references passages(id) on delete set null,
  created_at timestamptz not null default now()
);

create index items_subject_topic_idx on items(subject, topic);
create index items_passage_idx on items(passage_id);
```

### User item state (SRS state)

```sql
create table user_item_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  due_date date not null,
  interval_days int not null default 0,
  ease float8 not null default 2.5,
  reps int not null default 0,
  lapses int not null default 0,
  last_result attempt_result,
  last_seen_at timestamptz,
  streak int not null default 0,
  primary key (user_id, item_id)
);

create index user_item_state_due_idx on user_item_state(user_id, due_date);
```

### Sessions

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null,
  week_number int not null,
  target_new int not null,
  target_review int not null,
  completed bool not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, session_date)
);

create index sessions_user_date_idx on sessions(user_id, session_date);
```

### Attempts

```sql
create table attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  presented_at timestamptz not null default now(),
  response text not null,
  result attempt_result not null,
  seconds_spent int not null default 0,
  confidence int not null, -- 1,2,4,5
  created_at timestamptz not null default now()
);

create index attempts_user_time_idx on attempts(user_id, presented_at);
create index attempts_item_idx on attempts(item_id);
```

## 3. Row Level Security (RLS)

Enable RLS and allow users to access only their records.

### Sessions / Attempts / user_item_state

```sql
alter table user_item_state enable row level security;
alter table sessions enable row level security;
alter table attempts enable row level security;

create policy "user_item_state owner"
on user_item_state for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "sessions owner"
on sessions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "attempts owner"
on attempts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### Items and passages

For MVP, you can make them **read-only for authenticated users**:

```sql
alter table items enable row level security;
alter table passages enable row level security;

create policy "items readable"
on items for select
using (auth.role() = 'authenticated');

create policy "passages readable"
on passages for select
using (auth.role() = 'authenticated');
```

And lock down writes (import only via service role key in server environment):

* Don’t create insert/update policies for items/passages.

## 4. Next.js setup

### Env vars (Vercel + local)

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` *(server-only — never expose to client)*

### Recommended Supabase clients

* Client-side (anon key) for reading items + user session
* Server-side (service role) for:

  * importing items
  * creating sessions
  * updating SRS state (if you want to bypass RLS safely)

**Alternative:** Do everything with anon key + RLS (recommended for simplicity), as long as server routes pass the user’s auth cookie and supabase server client is set up correctly.

## 5. API routes you need (updated for Supabase)

### A) `POST /api/session/today`

Responsibilities:

* Determine week number
* Upsert session record for the day
* Fetch due review items from `user_item_state`
* Pick new items not yet in `user_item_state`
* Insert initial states for newly introduced items (due tomorrow)
* Return ordered items + passages

### B) `POST /api/attempt`

Responsibilities:

* Insert attempt
* Update `user_item_state` using SM-2 variant + clamp to 21 days

### C) `GET /api/dashboard`

Responsibilities:

* Aggregate attempts by topic (recent 14 / 30 days)
* “weak topics” derived metric
* streak and due tomorrow count

## 6. Scheduling algorithm (same as before, but Supabase-friendly)

Use the SM-2 variant you already agreed to:

* confidence values: 1/2/4/5
* incorrect ⇒ relearn quickly (interval=1, reps=0, ease–)
* correct ⇒ interval grows by ease
* clamp interval to 21 days

Store `due_date` as **date**, not timestamp. Makes querying due items easier.

## 7. Item import pipeline

Use JSON files in `/content/banks/*.json` and a **server-only import script**.

Recommended:

* A Node script (`scripts/importItems.ts`) that uses **service role key**.
* Import passages first, then items referencing passage IDs.

## 8. UI flow (React)

Pages:

* `/` dashboard
* `/practice` session player
* `/review` mistake review (optional MVP)

Session player components:

* `QuestionCard`
* `Choices`
* `FeedbackPanel` (correct + explanation)
* `ConfidenceButtons`
* `ProgressBar`

## 9. Vercel deployment checklist

* Add env vars in Vercel project settings
* Configure Supabase allowed redirect URLs for auth:

  * local: `http://localhost:3000`
  * prod: `https://yourapp.vercel.app`
* Ensure `NEXT_PUBLIC_...` keys are correct
* If using service role key, confirm it is **not** exposed to client


Absolutely. Below is a **clear PRD** plus an **updated implementation guide** for **Next.js (App Router) + React + Supabase (DB + Auth) + Vercel**, tailored to your HSAT spaced-repetition item-bank app.

---

# PRD: HSAT Prep App with Spaced Repetition (30 weeks)

## 1. Purpose

Build a web app that helps a student prepare for CPS Selective Enrollment HSAT using:

* HSAT-aligned **Math + Reading** practice
* A large **item bank (~1,000 items)**
* **Spaced repetition** scheduling over **30 weeks**, **5 days/week**
* Adaptive review frequency based on performance and confidence

## 2. Goals and success metrics

### Primary goals

* Student completes **daily sessions** reliably
* Student improves mastery by topic (Math + Reading)
* Student develops HSAT pacing and accuracy

### Success metrics (MVP)

* **≥ 80%** of weekdays include a completed session after week 3
* **≥ 70%** overall accuracy by week 10 (with growth thereafter)
* Topic mastery dashboard shows decreasing weakness concentration over time
* Average daily time-on-task: **15–35 minutes** (configurable)

## 3. Users and roles

### Roles

* **Student** (primary): does daily practice, sees explanations, confidence prompts
* **Parent/Coach** (optional role): views progress analytics, weak topics, time-on-task

MVP can be student-only with a single login.

## 4. Core user stories

### Student

1. “I log in and hit **Start Today’s Session**.”
2. “I answer questions one at a time.”
3. “After each question, I see:

   * correct/incorrect
   * explanation
   * quick confidence selection”
4. “At the end, I see session summary and a streak update.”
5. “I can review mistakes by topic.”

### Parent/Coach (Phase 2)

6. “I see progress by topic, accuracy trend, time-on-task, and most missed misconceptions.”

## 5. Scope

### In-scope (MVP)

* Supabase Auth (email magic link or password)
* Item bank (math + reading with passages)
* SRS algorithm + due dates
* Daily session generator (review-first + new items)
* Session completion tracking
* Basic dashboard (accuracy, streak, topic breakdown)
* Admin import pipeline for items (seed script)

### Out of scope (later)

* Multiplayer / cohorts
* Gamified store / rewards
* AI-generated passages on the fly
* Teacher rostering / classroom features

## 6. Content requirements

### Item bank size (target)

* **Math: 500 items**
* **Reading: 500 items**
* Reading includes **passages** with 3–6 linked questions.

### Required item fields

* subject, topic, subtopic (optional)
* difficulty (1–5)
* cognitive level (1–3)
* stem, choices, answer, explanation/rationale
* tags (misconception / skill tags)
* reading passage linkage when applicable

## 7. Scheduling requirements (SRS)

* Use SM-2 style spacing with confidence-based grading
* Clamp max interval to **21 days** so skills stay warm during the 30-week window
* Incorrect answers trigger quick relearning (due next day)
* System prioritizes overdue reviews before introducing new items

## 8. Session requirements

* 5 days/week cadence (Mon–Fri)
* Default session size: **25 items**

  * **15 review** (due items)
  * **10 new** (weighted by week phase)
* Week-based topic weighting:

  * Weeks 1–4: fundamentals heavier
  * Weeks 5–20: balanced
  * Weeks 21–30: strategic/applications heavier

## 9. UX requirements

* “One-question-at-a-time” flow
* Large readable text + mobile friendly
* Clear progress bar
* Immediate feedback + short explanation
* Confidence prompt with 2 taps max
* End-of-session summary with:

  * accuracy
  * time
  * topics to focus

## 10. Analytics requirements (MVP)

* Accuracy by topic
* Count due tomorrow
* Streak (consecutive weekday completions)
* Time per item and per session
* “Weakest topics” list (by accuracy + recentness)

## 11. Admin requirements (MVP)

* Scripted import of items (JSON → Supabase)
* Ability to mark items retired
* Ability to adjust session size and new/review split (config constants)

## 12. Risks / constraints

* No access to real HSAT items; content must be original but style-aligned.
* Building 1,000 high-quality items is the heavy lift: mitigate with templates + QA checks.

---

# Updated Implementation Guide: Next.js + Supabase + Vercel

## 1. Architecture overview

* **Next.js App Router** (UI + API routes)
* **Supabase Postgres** (items, passages, attempts, user scheduling state)
* **Supabase Auth** (session + RLS policies)
* **Vercel** deployment (Next.js)
* Optional: Supabase Edge Functions (not required for MVP)

Recommended: Use **Next.js server actions or route handlers** to:

* generate today’s session
* record attempts
* update SRS state

## 2. Supabase schema (SQL)

Run in Supabase SQL Editor.

### Enum types

```sql
create type subject as enum ('math', 'reading');
create type source_style as enum ('iowa_like', 'terranova_like');
create type attempt_result as enum ('correct', 'incorrect');
```

### Passages

```sql
create table passages (
  id uuid primary key default gen_random_uuid(),
  genre text not null, -- informational | literary
  title text,
  text text not null,
  lexile_band text,
  created_at timestamptz not null default now()
);
```

### Items

```sql
create table items (
  id uuid primary key default gen_random_uuid(),
  subject subject not null,
  topic text not null,
  subtopic text,
  difficulty int not null check (difficulty between 1 and 5),
  cognitive_level int not null check (cognitive_level between 1 and 3),
  source_style source_style not null,
  stem text not null,
  choices jsonb, -- null allowed for numeric later
  answer_key text not null,
  rationale text not null,
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'active', -- active|retired
  passage_id uuid references passages(id) on delete set null,
  created_at timestamptz not null default now()
);

create index items_subject_topic_idx on items(subject, topic);
create index items_passage_idx on items(passage_id);
```

### User item state (SRS state)

```sql
create table user_item_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  due_date date not null,
  interval_days int not null default 0,
  ease float8 not null default 2.5,
  reps int not null default 0,
  lapses int not null default 0,
  last_result attempt_result,
  last_seen_at timestamptz,
  streak int not null default 0,
  primary key (user_id, item_id)
);

create index user_item_state_due_idx on user_item_state(user_id, due_date);
```

### Sessions

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null,
  week_number int not null,
  target_new int not null,
  target_review int not null,
  completed bool not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, session_date)
);

create index sessions_user_date_idx on sessions(user_id, session_date);
```

### Attempts

```sql
create table attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  presented_at timestamptz not null default now(),
  response text not null,
  result attempt_result not null,
  seconds_spent int not null default 0,
  confidence int not null, -- 1,2,4,5
  created_at timestamptz not null default now()
);

create index attempts_user_time_idx on attempts(user_id, presented_at);
create index attempts_item_idx on attempts(item_id);
```

## 3. Row Level Security (RLS)

Enable RLS and allow users to access only their records.

### Sessions / Attempts / user_item_state

```sql
alter table user_item_state enable row level security;
alter table sessions enable row level security;
alter table attempts enable row level security;

create policy "user_item_state owner"
on user_item_state for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "sessions owner"
on sessions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "attempts owner"
on attempts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

### Items and passages

For MVP, you can make them **read-only for authenticated users**:

```sql
alter table items enable row level security;
alter table passages enable row level security;

create policy "items readable"
on items for select
using (auth.role() = 'authenticated');

create policy "passages readable"
on passages for select
using (auth.role() = 'authenticated');
```

And lock down writes (import only via service role key in server environment):

* Don’t create insert/update policies for items/passages.

## 4. Next.js setup

### Env vars (Vercel + local)

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY` *(server-only — never expose to client)*

### Recommended Supabase clients

* Client-side (anon key) for reading items + user session
* Server-side (service role) for:

  * importing items
  * creating sessions
  * updating SRS state (if you want to bypass RLS safely)

**Alternative:** Do everything with anon key + RLS (recommended for simplicity), as long as server routes pass the user’s auth cookie and supabase server client is set up correctly.

## 5. API routes you need (updated for Supabase)

### A) `POST /api/session/today`

Responsibilities:

* Determine week number
* Upsert session record for the day
* Fetch due review items from `user_item_state`
* Pick new items not yet in `user_item_state`
* Insert initial states for newly introduced items (due tomorrow)
* Return ordered items + passages

### B) `POST /api/attempt`

Responsibilities:

* Insert attempt
* Update `user_item_state` using SM-2 variant + clamp to 21 days

### C) `GET /api/dashboard`

Responsibilities:

* Aggregate attempts by topic (recent 14 / 30 days)
* “weak topics” derived metric
* streak and due tomorrow count

## 6. Scheduling algorithm (same as before, but Supabase-friendly)

Use the SM-2 variant you already agreed to:

* confidence values: 1/2/4/5
* incorrect ⇒ relearn quickly (interval=1, reps=0, ease–)
* correct ⇒ interval grows by ease
* clamp interval to 21 days

Store `due_date` as **date**, not timestamp. Makes querying due items easier.

## 7. Item import pipeline

Use JSON files in `/content/banks/*.json` and a **server-only import script**.

Recommended:

* A Node script (`scripts/importItems.ts`) that uses **service role key**.
* Import passages first, then items referencing passage IDs.

## 8. UI flow (React)

Pages:

* `/` dashboard
* `/practice` session player
* `/review` mistake review (optional MVP)

Session player components:

* `QuestionCard`
* `Choices`
* `FeedbackPanel` (correct + explanation)
* `ConfidenceButtons`
* `ProgressBar`

## 9. Vercel deployment checklist

* Add env vars in Vercel project settings
* Configure Supabase allowed redirect URLs for auth:

  * local: `http://localhost:3000`
  * prod: `https://yourapp.vercel.app`
* Ensure `NEXT_PUBLIC_...` keys are correct
* If using service role key, confirm it is **not** exposed to client
