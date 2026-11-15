// ============ USER & AUTH ============
export type UserRole = "teacher" | "student";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

// ============ MATERIALS ============
export interface Material {
  id: string;
  teacher_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  status: "uploading" | "uploaded" | "analyzing" | "analyzed" | "error";
  extracted_text?: string;
  analysis?: MaterialAnalysis;
  created_at: string;
  updated_at: string;
}

export interface MaterialAnalysis {
  main_topic: string;
  learning_objectives: string[];
  key_concepts: string[];
  reading_passages: ReadingPassage[];
  characters: Character[];
  vocabulary: VocabularyItem[];
  grammar_structures: GrammarStructure[];
  important_examples: string[];
  moral_values: string[];
  summary: string;
}

export interface ReadingPassage {
  title: string;
  content: string;
  source_page?: number;
}

export interface Character {
  name: string;
  description: string;
  role: string;
  relationships: string[];
}

export interface VocabularyItem {
  word: string;
  definition: string;
  part_of_speech: string;
  context_sentence: string;
  source_page?: number;
}

export interface GrammarStructure {
  pattern: string;
  explanation: string;
  examples: string[];
}

// ============ GAME CONFIG ============
export interface GameConfig {
  id: string;
  teacher_id: string;
  material_id: string;
  material_version: number;
  title: string;
  status: "draft" | "approved" | "active" | "completed";
  student_level: "beginner" | "intermediate" | "advanced";
  missions: Mission[];
  scoring_rules: ScoringRules;
  created_at: string;
  updated_at: string;
}

export interface ScoringRules {
  correct_answer: number;
  wrong_answer: number;
  time_bonus: boolean;
  max_time_bonus: number;
}

// ============ MISSIONS ============
export type MissionType =
  | "story_structure"
  | "character_detective"
  | "vocabulary_treasure"
  | "grammar_challenge"
  | "story_master";

export interface Mission {
  id: string;
  game_config_id: string;
  mission_number: 1 | 2 | 3 | 4 | 5;
  mission_type: MissionType;
  title: string;
  description: string;
  questions: Question[];
  status: "generated" | "edited" | "approved";
}

// ============ QUESTIONS ============
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "matching"
  | "drag_drop";

export interface Question {
  id: string;
  mission_id: string;
  question_type: QuestionType;
  question_text: string;
  options?: QuestionOption[];
  correct_answer: string;
  explanation: string;
  source_reference?: string;
  source_page?: number;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  matching_pairs?: MatchingPair[];
  drag_drop_items?: DragDropItem[];
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface DragDropItem {
  id: string;
  content: string;
  target_zone: string;
}

// ============ ROOMS ============
export interface Room {
  id: string;
  teacher_id: string;
  game_config_id: string;
  room_code: string;
  status: "waiting" | "playing" | "paused" | "completed";
  current_mission: number;
  max_teams: number;
  teams: Team[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface Team {
  id: string;
  room_id: string;
  team_name: string;
  character: string;
  members: TeamMember[];
  scores: TeamScore[];
  total_score: number;
  position: number; // position on the volcano
}

export interface TeamMember {
  id: string;
  team_id: string;
  student_name: string;
  student_id?: string;
}

export interface TeamScore {
  mission_number: number;
  score: number;
  time_taken: number;
  correct_answers: number;
  total_questions: number;
}

// ============ GAME STATE ============
export interface GameState {
  room: Room;
  current_mission: Mission;
  current_question_index: number;
  team_answers: Record<string, string>;
  time_remaining: number;
  is_paused: boolean;
}

// ============ CHARACTERS ============
export interface GameCharacter {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const GAME_CHARACTERS: GameCharacter[] = [
  { id: "explorer", name: "Explorer", emoji: "🧑‍🚀", color: "#f97316" },
  { id: "scientist", name: "Scientist", emoji: "🧑‍🔬", color: "#3b82f6" },
  { id: "warrior", name: "Warrior", emoji: "⚔️", color: "#ef4444" },
  { id: "wizard", name: "Wizard", emoji: "🧙", color: "#8b5cf6" },
  { id: "ranger", name: "Ranger", emoji: "🏹", color: "#22c55e" },
  { id: "healer", name: "Healer", emoji: "💚", color: "#14b8a6" },
];

export const MISSION_INFO: Record<
  MissionType,
  { title: string; icon: string; description: string; color: string }
> = {
  story_structure: {
    title: "Story Structure",
    icon: "📖",
    description: "Explore the narrative structure",
    color: "#f97316",
  },
  character_detective: {
    title: "Character Detective",
    icon: "🔍",
    description: "Investigate the characters",
    color: "#3b82f6",
  },
  vocabulary_treasure: {
    title: "Vocabulary Treasure",
    icon: "💎",
    description: "Discover word treasures",
    color: "#22c55e",
  },
  grammar_challenge: {
    title: "Grammar Challenge",
    icon: "⚡",
    description: "Master the grammar patterns",
    color: "#8b5cf6",
  },
  story_master: {
    title: "Story Master",
    icon: "👑",
    description: "Prove your comprehension",
    color: "#eab308",
  },
};
