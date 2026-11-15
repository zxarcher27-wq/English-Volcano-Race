-- =============================================
-- VOLCANO RACE - DATABASE SCHEMA (FIXED ORDER)
-- Run this in Supabase SQL Editor
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CREATE ALL TABLES FIRST
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploading', 'uploaded', 'analyzing', 'analyzed', 'error')),
  extracted_text TEXT,
  analysis JSONB,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE game_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  material_version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'completed')),
  student_level TEXT DEFAULT 'beginner' CHECK (student_level IN ('beginner', 'intermediate', 'advanced')),
  scoring_rules JSONB DEFAULT '{"correct_answer": 10, "wrong_answer": 0, "time_bonus": true, "max_time_bonus": 5}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_config_id UUID NOT NULL REFERENCES game_configs(id) ON DELETE CASCADE,
  mission_number INTEGER NOT NULL CHECK (mission_number BETWEEN 1 AND 5),
  mission_type TEXT NOT NULL CHECK (mission_type IN ('story_structure', 'character_detective', 'vocabulary_treasure', 'grammar_challenge', 'story_master')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'edited', 'approved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_config_id, mission_number)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'matching', 'drag_drop')),
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  source_reference TEXT,
  source_page INTEGER,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 10,
  matching_pairs JSONB,
  drag_drop_items JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_config_id UUID NOT NULL REFERENCES game_configs(id) ON DELETE CASCADE,
  room_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'paused', 'completed')),
  current_mission INTEGER DEFAULT 0,
  max_teams INTEGER DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  character TEXT NOT NULL,
  total_score INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  mission_number INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, mission_number)
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_scores ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ALL RLS POLICIES
-- =============================================

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Materials
CREATE POLICY "Teachers can manage own materials" ON materials FOR ALL USING (auth.uid() = teacher_id);

-- Game configs
CREATE POLICY "Teachers can manage own configs" ON game_configs FOR ALL USING (auth.uid() = teacher_id);

-- Missions
CREATE POLICY "Teachers can manage missions via config" ON missions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_configs gc
      WHERE gc.id = missions.game_config_id
      AND gc.teacher_id = auth.uid()
    )
  );

-- Questions (teacher)
CREATE POLICY "Teachers can manage questions via mission" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN game_configs gc ON gc.id = m.game_config_id
      WHERE m.id = questions.mission_id
      AND gc.teacher_id = auth.uid()
    )
  );

-- Questions (student - can now reference rooms/teams)
CREATE POLICY "Students can read questions in active rooms" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m
      JOIN game_configs gc ON gc.id = m.game_config_id
      JOIN rooms r ON r.game_config_id = gc.id
      JOIN teams t ON t.room_id = r.id
      JOIN team_members tm ON tm.team_id = t.id
      WHERE m.id = questions.mission_id
      AND r.status IN ('playing', 'paused')
      AND tm.student_id = auth.uid()
    )
  );

-- Rooms
CREATE POLICY "Teachers can manage own rooms" ON rooms FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Anyone can view room by code" ON rooms FOR SELECT USING (true);

-- Teams
CREATE POLICY "Anyone in room can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Students can create teams" ON teams FOR INSERT WITH CHECK (true);

-- Team members
CREATE POLICY "Anyone can view team members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Students can join teams" ON team_members FOR INSERT WITH CHECK (true);

-- Team scores
CREATE POLICY "Anyone can view scores" ON team_scores FOR SELECT USING (true);
CREATE POLICY "Students can submit scores" ON team_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Students can update own scores" ON team_scores FOR UPDATE USING (true);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_materials_updated_at
  BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_game_configs_updated_at
  BEFORE UPDATE ON game_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
