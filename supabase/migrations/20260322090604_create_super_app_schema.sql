/*
  # Super App Schema - Tasks, Habits, User Sessions

  1. New Tables
    - `user_sessions`
      - `id` (uuid, primary key)
      - `session_id` (text, unique) - browser-generated session token
      - `created_at` (timestamptz)
      - `last_activity` (timestamptz)
    - `tasks`
      - `id` (uuid, primary key)
      - `session_id` (text, foreign key to user_sessions.session_id)
      - `title` (text, required)
      - `description` (text)
      - `category` (text) - Personal, After5, ApexAI, Habits, Reading, Other
      - `priority` (text) - high, medium, low
      - `status` (text) - todo, in_progress, done
      - `due_date` (date)
      - `time_estimate` (integer) - minutes
      - `links` (jsonb) - array of URL strings
      - `notes` (text)
      - `recurrence` (text) - none, daily, weekly, monthly
      - `completed` (boolean)
      - `completed_at` (timestamptz)
      - `points_awarded` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `habits`
      - `id` (uuid, primary key)
      - `session_id` (text, foreign key to user_sessions.session_id)
      - `name` (text, required)
      - `icon` (text) - emoji or icon name
      - `color` (text) - hex color
      - `completed_dates` (jsonb) - array of date strings
      - `streak` (integer)
      - `best_streak` (integer)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Policies allow access only to matching session_id via custom header
    - Uses anon key for all operations

  3. Indexes
    - tasks: session_id, category, due_date, completed
    - habits: session_id
*/

-- User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions accessible by matching session_id"
  ON user_sessions FOR SELECT
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Sessions insertable by anon"
  ON user_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Sessions updatable by matching session_id"
  ON user_sessions FOR UPDATE
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id')
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'Personal',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'todo',
  due_date date,
  time_estimate integer DEFAULT 30,
  links jsonb DEFAULT '[]'::jsonb,
  notes text DEFAULT '',
  recurrence text DEFAULT 'none',
  completed boolean DEFAULT false,
  completed_at timestamptz,
  points_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks readable by session owner"
  ON tasks FOR SELECT
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Tasks insertable by session owner"
  ON tasks FOR INSERT
  TO anon
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Tasks updatable by session owner"
  ON tasks FOR UPDATE
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id')
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Tasks deletable by session owner"
  ON tasks FOR DELETE
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_session_id ON tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  name text NOT NULL,
  icon text DEFAULT 'activity',
  color text DEFAULT '#00ff88',
  completed_dates jsonb DEFAULT '[]'::jsonb,
  streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_habit_session FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Habits readable by session owner"
  ON habits FOR SELECT
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Habits insertable by session owner"
  ON habits FOR INSERT
  TO anon
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Habits updatable by session owner"
  ON habits FOR UPDATE
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id')
  WITH CHECK (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Habits deletable by session owner"
  ON habits FOR DELETE
  TO anon
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE INDEX IF NOT EXISTS idx_habits_session_id ON habits(session_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
