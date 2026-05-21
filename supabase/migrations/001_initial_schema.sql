-- ============================================================
-- FORMIQ — Initial Database Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USER PROFILES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age                 INT NOT NULL CHECK (age >= 16 AND age <= 100),
  gender              TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  height_cm           FLOAT CHECK (height_cm > 0),
  weight_kg           FLOAT CHECK (weight_kg > 0),
  primary_goal        TEXT NOT NULL,
  secondary_goals     TEXT[] DEFAULT '{}',
  fitness_level       TEXT NOT NULL CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  recent_activity     TEXT DEFAULT 'none',
  workouts_per_week   INT NOT NULL DEFAULT 3 CHECK (workouts_per_week BETWEEN 1 AND 7),
  session_duration_min INT NOT NULL DEFAULT 45,
  preferred_time      TEXT DEFAULT 'flexible',
  location            TEXT NOT NULL DEFAULT 'gym',
  equipment           TEXT[] DEFAULT '{}',
  health_restrictions JSONB DEFAULT '[]',
  forbidden_exercises TEXT[] DEFAULT '{}',
  injury_areas        TEXT[] DEFAULT '{}',
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_sub_id         TEXT UNIQUE,
  stripe_cust_id        TEXT,
  plan_id               TEXT NOT NULL DEFAULT 'trial',
  status                TEXT NOT NULL DEFAULT 'trialing',
  trial_end             TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ─── PROGRAMS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  generated_at    TIMESTAMPTZ DEFAULT now(),
  week_start      DATE NOT NULL,
  week_count      INT DEFAULT 4,
  ai_rationale    TEXT,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  raw_ai_output   JSONB
);

-- ─── WORKOUTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id      UUID REFERENCES programs(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  scheduled_date  DATE NOT NULL,
  week_number     INT NOT NULL DEFAULT 1,
  day_type        TEXT NOT NULL,
  estimated_min   INT,
  difficulty      INT CHECK (difficulty BETWEEN 1 AND 5),
  status          TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped')),
  ai_note         TEXT,
  content         JSONB NOT NULL
);

-- ─── WORKOUT LOGS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id      UUID REFERENCES workouts(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  duration_min    INT,
  completion_pct  INT DEFAULT 0 CHECK (completion_pct BETWEEN 0 AND 100),
  perceived_effort INT CHECK (perceived_effort BETWEEN 1 AND 10),
  notes           TEXT,
  exercises_data  JSONB
);

-- ─── STRENGTH RECORDS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS strength_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id     TEXT NOT NULL,
  date            DATE NOT NULL,
  weight_kg       FLOAT,
  reps            INT,
  estimated_1rm   FLOAT,
  UNIQUE(user_id, exercise_id, date)
);

-- ─── USER SETTINGS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications   JSONB DEFAULT '{"workout_reminder": true, "ai_updates": true, "milestones": true}',
  reminder_time   TIME DEFAULT '09:00',
  units           TEXT DEFAULT 'metric',
  language        TEXT DEFAULT 'ru',
  timezone        TEXT DEFAULT 'Europe/Moscow',
  push_token      TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── REFERRALS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID REFERENCES auth.users(id),
  referred_id     UUID REFERENCES auth.users(id),
  code            TEXT UNIQUE NOT NULL,
  status          TEXT DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_workouts_user_date     ON workouts(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_status   ON workouts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user      ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_completed ON workout_logs(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_strength_user_exercise ON strength_records(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_programs_user          ON programs(user_id, status);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE strength_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals        ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own data
CREATE POLICY "Users access own profile"      ON user_profiles    FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own subscription" ON subscriptions    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own programs"     ON programs         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own workouts"     ON workouts         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own logs"         ON workout_logs     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own strength"     ON strength_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own settings"     ON user_settings    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own referrals"    ON referrals        FOR ALL USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ─── TRIGGERS ─────────────────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user_settings on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
