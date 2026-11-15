"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useGameStore } from "@/stores/game-store";
import MaterialUpload from "@/components/teacher/MaterialUpload";
import QuestionEditor from "@/components/teacher/QuestionEditor";
import type {
  MaterialAnalysis,
  Mission,
  Question,
  GameConfig,
  MissionType,
  MISSION_INFO,
} from "@/types";
import { generateId, generateRoomCode } from "@/lib/utils";

type Tab = "upload" | "review" | "rooms";

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, checkSession, signOut } = useAuthStore();
  const { analysis, setAnalysis } = useGameStore();

  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studentLevel, setStudentLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState<
    { code: string; status: string; teams: number }[]
  >([]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Handle file upload
  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    setError("");
  };

  // Analyze materials with AI
  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one learning material first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeProgress(0);
    setError("");

    try {
      // Send files as FormData for server-side parsing
      const formData = new FormData();
      for (const file of uploadedFiles) {
        formData.append("files", file);
      }

      setAnalyzeProgress(20);

      // Call AI analysis API with FormData
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        body: formData,
      });

      setAnalyzeProgress(60);

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const result = await response.json();
      setAnalysis(result.analysis);
      setAnalyzeProgress(100);

      // Auto switch to review tab
      setTimeout(() => {
        setActiveTab("review");
      }, 500);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate missions
  const handleGenerateMissions = async () => {
    if (!analysis) {
      setError("Please analyze materials first.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, studentLevel }),
      });

      if (!response.ok) {
        throw new Error("Mission generation failed. Please try again.");
      }

      const result = await response.json();
      setMissions(
        result.missions.map((m: any, idx: number) => ({
          ...m,
          id: generateId(),
          game_config_id: "",
        }))
      );
    } catch (err: any) {
      setError(err.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // Update question
  const handleUpdateQuestion = (
    missionIdx: number,
    questionIdx: number,
    question: Question
  ) => {
    setMissions((prev) =>
      prev.map((m, i) =>
        i === missionIdx
          ? {
              ...m,
              questions: m.questions.map((q, qi) =>
                qi === questionIdx ? question : q
              ),
              status: "edited",
            }
          : m
      )
    );
  };

  // Delete question
  const handleDeleteQuestion = (missionIdx: number, questionIdx: number) => {
    setMissions((prev) =>
      prev.map((m, i) =>
        i === missionIdx
          ? {
              ...m,
              questions: m.questions.filter((_, qi) => qi !== questionIdx),
            }
          : m
      )
    );
  };

  // Regenerate question
  const handleRegenerateQuestion = async (
    missionIdx: number,
    questionIdx: number
  ) => {
    // In production, this would call the API
    // For now, mark as regenerating
    setError("Regenerating question... (connect Gemini API for this feature)");
  };

  // Approve mission
  const handleApproveMission = (missionIdx: number) => {
    setMissions((prev) =>
      prev.map((m, i) =>
        i === missionIdx ? { ...m, status: "approved" as const } : m
      )
    );
  };

  // Approve all
  const handleApproveAll = () => {
    setMissions((prev) => prev.map((m) => ({ ...m, status: "approved" as const })));
  };

  // Create room
  const handleCreateRoom = () => {
    const allApproved = missions.every((m) => m.status === "approved");
    if (!allApproved) {
      setError("Please approve all missions before creating a room.");
      return;
    }

    const code = generateRoomCode();
    setRooms((prev) => [
      ...prev,
      { code, status: "waiting", teams: 0 },
    ]);
    setActiveTab("rooms");
  };

  const tabs = [
    { id: "upload" as Tab, label: "📚 Materials", icon: "📚" },
    { id: "review" as Tab, label: "🔍 Review", icon: "🔍" },
    { id: "rooms" as Tab, label: "🎮 Rooms", icon: "🎮" },
  ];

  return (
    <div className="volcano-bg min-h-screen">
      {/* Top Bar */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌋</span>
            <span className="font-bold text-white">Teacher Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">
              {user?.full_name || "Teacher"}
            </span>
            <button
              onClick={() => {
                signOut();
                router.push("/");
              }}
              className="text-slate-400 hover:text-white text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-slate-800/50 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? "text-volcano-400 border-volcano-400"
                  : "text-slate-400 border-transparent hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="bg-lava-900/50 border border-lava-700 text-lava-200 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
            <button
              onClick={() => setError("")}
              className="float-right text-lava-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* ===== UPLOAD TAB ===== */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">
                📚 Upload Learning Materials
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                Upload your teaching materials (PDF, DOCX, PPTX, TXT). The AI
                will analyze them and generate quiz questions for 5 missions.
              </p>

              <MaterialUpload
                onFilesUploaded={handleFilesUploaded}
                existingFiles={uploadedFiles.map((f) => ({
                  name: f.name,
                  size: f.size,
                  url: "",
                }))}
                onRemoveExisting={(idx) =>
                  setUploadedFiles((prev) =>
                    prev.filter((_, i) => i !== idx)
                  )
                }
              />
            </div>

            {/* Student Level */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-3">
                🎯 Student Level
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {(
                  ["beginner", "intermediate", "advanced"] as const
                ).map((level) => (
                  <button
                    key={level}
                    onClick={() => setStudentLevel(level)}
                    className={`p-3 rounded-xl border-2 text-center transition-all capitalize ${
                      studentLevel === level
                        ? "border-volcano-500 bg-volcano-500/10 text-white"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <span className="text-xl block mb-1">
                      {level === "beginner"
                        ? "🌱"
                        : level === "intermediate"
                        ? "🌿"
                        : "🌳"}
                    </span>
                    <span className="text-sm">{level}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || uploadedFiles.length === 0}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Analyzing... {Math.round(analyzeProgress)}%
                </span>
              ) : (
                "🤖 Analyze Materials with AI"
              )}
            </button>

            {isAnalyzing && (
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-volcano-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analyzeProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* ===== REVIEW TAB ===== */}
        {activeTab === "review" && (
          <div className="space-y-6">
            {/* Analysis Summary */}
            {analysis && (
              <div className="card">
                <h2 className="text-xl font-bold text-white mb-4">
                  📊 Material Analysis Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">
                      Main Topic
                    </h4>
                    <p className="text-white">{analysis.main_topic}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">
                      Summary
                    </h4>
                    <p className="text-white text-sm">{analysis.summary}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">
                      Learning Objectives
                    </h4>
                    <ul className="text-white text-sm space-y-1">
                      {analysis.learning_objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-volcano-400">•</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">
                      Key Concepts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.key_concepts.map((concept, i) => (
                        <span
                          key={i}
                          className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">
                      Vocabulary ({analysis.vocabulary.length} words)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.vocabulary.slice(0, 10).map((v, i) => (
                        <span
                          key={i}
                          className="bg-forest-900/30 text-forest-300 text-xs px-2 py-1 rounded-full"
                        >
                          {v.word}
                        </span>
                      ))}
                      {analysis.vocabulary.length > 10 && (
                        <span className="text-slate-500 text-xs">
                          +{analysis.vocabulary.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">
                      Characters ({analysis.characters.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.characters.map((c, i) => (
                        <span
                          key={i}
                          className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded-full"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Missions Button */}
                {missions.length === 0 && (
                  <button
                    onClick={handleGenerateMissions}
                    disabled={isGenerating}
                    className="btn-primary w-full mt-6 py-3 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Generating 5 Missions...
                      </span>
                    ) : (
                      "🚀 Generate 5 Missions"
                    )}
                  </button>
                )}
              </div>
            )}

            {!analysis && (
              <div className="card text-center py-12">
                <span className="text-4xl mb-4 block">📚</span>
                <p className="text-slate-400">
                  Upload and analyze materials first to see the review
                  dashboard.
                </p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="btn-primary mt-4"
                >
                  Go to Upload
                </button>
              </div>
            )}

            {/* Missions */}
            {missions.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    📝 Generated Missions
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleApproveAll}
                      className="btn-success text-sm"
                    >
                      ✓ Approve All
                    </button>
                    <button
                      onClick={handleCreateRoom}
                      className="btn-primary text-sm"
                    >
                      🎮 Create Room
                    </button>
                  </div>
                </div>

                {missions.map((mission, idx) => (
                  <div key={mission.id || idx} className="card">
                    <QuestionEditor
                      mission={mission}
                      onUpdateQuestion={(qIdx, q) =>
                        handleUpdateQuestion(idx, qIdx, q)
                      }
                      onDeleteQuestion={(qIdx) =>
                        handleDeleteQuestion(idx, qIdx)
                      }
                      onRegenerateQuestion={(qIdx) =>
                        handleRegenerateQuestion(idx, qIdx)
                      }
                      onRegenerateMission={() =>
                        handleGenerateMissions()
                      }
                      onApproveMission={() => handleApproveMission(idx)}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ===== ROOMS TAB ===== */}
        {activeTab === "rooms" && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">
                🎮 Game Rooms
              </h2>

              {rooms.length === 0 && missions.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🎮</span>
                  <p className="text-slate-400">
                    Generate and approve quizzes first, then create a game
                    room.
                  </p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="btn-primary mt-4"
                  >
                    Start Here
                  </button>
                </div>
              )}

              {rooms.length === 0 && missions.length > 0 && (
                <div className="text-center py-8">
                  <button
                    onClick={handleCreateRoom}
                    className="btn-primary text-lg py-3 px-8"
                  >
                    🎮 Create Game Room
                  </button>
                </div>
              )}

              {/* Room List */}
              {rooms.map((room, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-3xl font-mono font-bold text-volcano-400 tracking-wider">
                          {room.code}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            room.status === "waiting"
                              ? "bg-yellow-900/50 text-yellow-300"
                              : room.status === "playing"
                              ? "bg-forest-900/50 text-forest-300"
                              : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          {room.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        Share this code with your students to join
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(room.code);
                        }}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        📋 Copy Code
                      </button>
                      <button className="btn-primary text-xs py-1.5 px-3">
                        ▶ Start Game
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
