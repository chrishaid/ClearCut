-- Clearcut HSAT Prep App - Initial Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE subject AS ENUM ('math', 'reading');
CREATE TYPE source_style AS ENUM ('iowa_like', 'terranova_like');
CREATE TYPE attempt_result AS ENUM ('correct', 'incorrect');
CREATE TYPE fsrs_state AS ENUM ('new', 'learning', 'review', 'relearning');
CREATE TYPE fsrs_rating AS ENUM ('again', 'hard', 'good', 'easy');
CREATE TYPE session_type AS ENUM ('daily', 'exam');
CREATE TYPE user_role AS ENUM ('student', 'parent');

-- ============================================
-- PASSAGES TABLE
-- ============================================

CREATE TABLE passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  genre TEXT NOT NULL,  -- 'informational' | 'literary'
  title TEXT,
  text TEXT NOT NULL,
  lexile_band TEXT,
  word_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ITEMS TABLE
-- ============================================

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject subject NOT NULL,
  topic TEXT NOT NULL,
  subtopic TEXT,
  difficulty INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  cognitive_level INT NOT NULL CHECK (cognitive_level BETWEEN 1 AND 3),
  source_style source_style NOT NULL,
  stem TEXT NOT NULL,
  choices JSONB,  -- Array: [{"label": "A", "text": "..."}, ...]
  answer_key TEXT NOT NULL,
  rationale TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'retired'
  passage_id UUID REFERENCES passages(id) ON DELETE SET NULL,
  week_phase TEXT NOT NULL DEFAULT 'balanced',  -- 'fundamentals' | 'balanced' | 'applications'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX items_subject_topic_idx ON items(subject, topic);
CREATE INDEX items_passage_idx ON items(passage_id);
CREATE INDEX items_week_phase_idx ON items(week_phase);
CREATE INDEX items_status_idx ON items(status);

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  study_start_date DATE,  -- When student started studying (for week calculation)
  daily_goal INT NOT NULL DEFAULT 25,  -- Target items per session
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- For linking students to parents
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX profiles_parent_idx ON profiles(parent_id);
CREATE INDEX profiles_role_idx ON profiles(role);

-- ============================================
-- USER ITEM STATE (FSRS Scheduling State)
-- ============================================

CREATE TABLE user_item_state (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,

  -- FSRS Core Parameters
  due TIMESTAMPTZ NOT NULL,           -- When card is next due
  stability FLOAT8 NOT NULL DEFAULT 0, -- Memory stability (days until 90% recall)
  difficulty FLOAT8 NOT NULL DEFAULT 0, -- Card difficulty (1-10 scale)
  elapsed_days INT NOT NULL DEFAULT 0,  -- Days since last review
  scheduled_days INT NOT NULL DEFAULT 0, -- Scheduled interval
  reps INT NOT NULL DEFAULT 0,          -- Total review count
  lapses INT NOT NULL DEFAULT 0,        -- Times forgotten (Again rating)
  state fsrs_state NOT NULL DEFAULT 'new',
  last_review TIMESTAMPTZ,

  -- Additional tracking
  first_seen_at TIMESTAMPTZ,

  PRIMARY KEY (user_id, item_id)
);

CREATE INDEX user_item_state_due_idx ON user_item_state(user_id, due);
CREATE INDEX user_item_state_state_idx ON user_item_state(user_id, state);

-- ============================================
-- SESSIONS TABLE
-- ============================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type session_type NOT NULL DEFAULT 'daily',
  session_date DATE NOT NULL,
  week_number INT NOT NULL,

  -- Session composition
  target_new INT NOT NULL,
  target_review INT NOT NULL,
  actual_new INT NOT NULL DEFAULT 0,
  actual_review INT NOT NULL DEFAULT 0,

  -- Session metrics
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_seconds INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  incorrect_count INT NOT NULL DEFAULT 0,

  -- For timed exams
  time_limit_minutes INT,  -- NULL for daily sessions

  completed BOOL NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_date, session_type)
);

CREATE INDEX sessions_user_date_idx ON sessions(user_id, session_date);
CREATE INDEX sessions_completed_idx ON sessions(user_id, completed);

-- ============================================
-- SESSION ITEMS TABLE
-- ============================================

CREATE TABLE session_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  position INT NOT NULL,  -- Order in session (1-based)
  is_review BOOL NOT NULL,  -- Was this a review item or new?
  answered BOOL NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(session_id, item_id)
);

CREATE INDEX session_items_session_idx ON session_items(session_id);

-- ============================================
-- ATTEMPTS TABLE
-- ============================================

CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,

  -- Timing
  presented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  seconds_spent INT NOT NULL DEFAULT 0,

  -- Response
  response TEXT NOT NULL,
  result attempt_result NOT NULL,

  -- FSRS rating (user's confidence assessment)
  rating fsrs_rating NOT NULL,

  -- Snapshot of FSRS state BEFORE this review (for analytics)
  state_before fsrs_state,
  stability_before FLOAT8,
  difficulty_before FLOAT8,

  -- Snapshot AFTER
  state_after fsrs_state,
  stability_after FLOAT8,
  difficulty_after FLOAT8,
  scheduled_days_after INT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX attempts_user_time_idx ON attempts(user_id, presented_at);
CREATE INDEX attempts_item_idx ON attempts(item_id);
CREATE INDEX attempts_session_idx ON attempts(session_id);
CREATE INDEX attempts_result_idx ON attempts(user_id, result);

-- ============================================
-- STREAKS TABLE
-- ============================================

CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,

  -- Weekly tracking (for weekday streaks - Mon-Fri)
  week_days_completed INT NOT NULL DEFAULT 0,  -- 0-5 for current week
  current_week_start DATE,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- DAILY STATS TABLE (for analytics aggregation)
-- ============================================

CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,

  -- Aggregates
  items_studied INT NOT NULL DEFAULT 0,
  items_correct INT NOT NULL DEFAULT 0,
  items_incorrect INT NOT NULL DEFAULT 0,
  new_items_seen INT NOT NULL DEFAULT 0,
  reviews_completed INT NOT NULL DEFAULT 0,
  total_seconds INT NOT NULL DEFAULT 0,
  sessions_completed INT NOT NULL DEFAULT 0,

  -- By subject
  math_correct INT NOT NULL DEFAULT 0,
  math_total INT NOT NULL DEFAULT 0,
  reading_correct INT NOT NULL DEFAULT 0,
  reading_total INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, stat_date)
);

CREATE INDEX daily_stats_user_date_idx ON daily_stats(user_id, stat_date);

-- ============================================
-- TOPIC STATS TABLE (for weak topic tracking)
-- ============================================

CREATE TABLE topic_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject subject NOT NULL,
  topic TEXT NOT NULL,

  -- Rolling stats (updated on each attempt)
  total_attempts INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  recent_attempts INT NOT NULL DEFAULT 0,  -- Last 14 days
  recent_correct INT NOT NULL DEFAULT 0,
  avg_time_seconds FLOAT8,

  -- Derived
  mastery_score FLOAT8,  -- Calculated metric
  last_attempted_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject, topic)
);

CREATE INDEX topic_stats_user_subject_idx ON topic_stats(user_id, subject);
CREATE INDEX topic_stats_mastery_idx ON topic_stats(user_id, mastery_score);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all user-specific tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_item_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE passages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Parents can view their students' profiles
CREATE POLICY "Parents can view student profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = parent_id);

-- User item state: users can manage their own
CREATE POLICY "Users manage own item state"
  ON user_item_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Sessions: users can manage their own
CREATE POLICY "Users manage own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Parents can view their students' sessions
CREATE POLICY "Parents can view student sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = sessions.user_id
      AND profiles.parent_id = auth.uid()
    )
  );

-- Session items: users can manage their own
CREATE POLICY "Users manage own session items"
  ON session_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_items.session_id
      AND sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_items.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Attempts: users can manage their own
CREATE POLICY "Users manage own attempts"
  ON attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Parents can view their students' attempts
CREATE POLICY "Parents can view student attempts"
  ON attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = attempts.user_id
      AND profiles.parent_id = auth.uid()
    )
  );

-- Streaks: users can manage their own
CREATE POLICY "Users manage own streaks"
  ON streaks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Parents can view their students' streaks
CREATE POLICY "Parents can view student streaks"
  ON streaks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = streaks.user_id
      AND profiles.parent_id = auth.uid()
    )
  );

-- Daily stats: users can manage their own
CREATE POLICY "Users manage own daily stats"
  ON daily_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Parents can view their students' daily stats
CREATE POLICY "Parents can view student daily stats"
  ON daily_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = daily_stats.user_id
      AND profiles.parent_id = auth.uid()
    )
  );

-- Topic stats: users can manage their own
CREATE POLICY "Users manage own topic stats"
  ON topic_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Parents can view their students' topic stats
CREATE POLICY "Parents can view student topic stats"
  ON topic_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = topic_stats.user_id
      AND profiles.parent_id = auth.uid()
    )
  );

-- Items and passages: read-only for authenticated users
-- (Write access only via service role key)
CREATE POLICY "Authenticated users can read items"
  ON items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read passages"
  ON passages FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  -- Also create initial streak record
  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger for streaks updated_at
CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger for topic_stats updated_at
CREATE TRIGGER topic_stats_updated_at
  BEFORE UPDATE ON topic_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
