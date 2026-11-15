import { create } from "zustand";
import type {
  Room,
  Team,
  Mission,
  Question,
  GameConfig,
  Material,
  MaterialAnalysis,
} from "@/types";

interface GameStore {
  // Material & Config
  currentMaterial: Material | null;
  currentConfig: GameConfig | null;
  analysis: MaterialAnalysis | null;

  // Room & Game
  currentRoom: Room | null;
  currentTeam: Team | null;
  currentMission: Mission | null;
  currentQuestionIndex: number;
  timeRemaining: number;
  answers: Record<string, string>;
  missionScores: Record<number, number>;

  // Actions - Material
  setMaterial: (material: Material | null) => void;
  setAnalysis: (analysis: MaterialAnalysis | null) => void;
  setConfig: (config: GameConfig | null) => void;

  // Actions - Game
  setRoom: (room: Room | null) => void;
  setTeam: (team: Team | null) => void;
  setMission: (mission: Mission | null) => void;
  setQuestionIndex: (index: number) => void;
  setTimeRemaining: (time: number) => void;
  submitAnswer: (questionId: string, answer: string) => void;
  setMissionScore: (missionNumber: number, score: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentMaterial: null,
  currentConfig: null,
  analysis: null,
  currentRoom: null,
  currentTeam: null,
  currentMission: null,
  currentQuestionIndex: 0,
  timeRemaining: 0,
  answers: {},
  missionScores: {},

  setMaterial: (material) => set({ currentMaterial: material }),
  setAnalysis: (analysis) => set({ analysis }),
  setConfig: (config) => set({ currentConfig: config }),

  setRoom: (room) => set({ currentRoom: room }),
  setTeam: (team) => set({ currentTeam: team }),
  setMission: (mission) =>
    set({ currentMission: mission, currentQuestionIndex: 0, answers: {} }),
  setQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),

  submitAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),

  setMissionScore: (missionNumber, score) =>
    set((state) => ({
      missionScores: { ...state.missionScores, [missionNumber]: score },
    })),

  resetGame: () =>
    set({
      currentRoom: null,
      currentTeam: null,
      currentMission: null,
      currentQuestionIndex: 0,
      timeRemaining: 0,
      answers: {},
      missionScores: {},
    }),
}));
