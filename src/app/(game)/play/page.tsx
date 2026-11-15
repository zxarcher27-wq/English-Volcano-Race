"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import QuestionCard from "@/components/game/QuestionCard";
import VolcanoLeaderboard from "@/components/game/VolcanoLeaderboard";
import { MISSION_INFO, GAME_CHARACTERS } from "@/types";
import type { Mission, Question, Team, MissionType } from "@/types";

// Demo data for testing without backend
const DEMO_MISSIONS: Mission[] = [
  {
    id: "m1",
    game_config_id: "demo",
    mission_number: 1,
    mission_type: "story_structure",
    title: "Story Structure",
    description: "Explore the narrative structure",
    status: "approved",
    questions: [
      {
        id: "q1",
        mission_id: "m1",
        question_type: "multiple_choice",
        question_text:
          "What is the main element that starts a story's conflict?",
        options: [
          { id: "a", text: "The resolution", is_correct: false },
          { id: "b", text: "The rising action", is_correct: true },
          { id: "c", text: "The epilogue", is_correct: false },
          { id: "d", text: "The setting description", is_correct: false },
        ],
        correct_answer: "b",
        explanation:
          "The rising action introduces and develops the conflict in a story.",
        difficulty: "medium",
        points: 10,
      },
      {
        id: "q2",
        mission_id: "m1",
        question_type: "true_false",
        question_text: "The climax is the most exciting part of a story.",
        options: [
          { id: "true", text: "True", is_correct: true },
          { id: "false", text: "False", is_correct: false },
        ],
        correct_answer: "true",
        explanation:
          "The climax is indeed the turning point and most intense moment in a story.",
        difficulty: "easy",
        points: 10,
      },
      {
        id: "q3",
        mission_id: "m1",
        question_type: "multiple_choice",
        question_text: "Which part of the story comes after the climax?",
        options: [
          { id: "a", text: "Exposition", is_correct: false },
          { id: "b", text: "Rising action", is_correct: false },
          { id: "c", text: "Falling action", is_correct: true },
          { id: "d", text: "Introduction", is_correct: false },
        ],
        correct_answer: "c",
        explanation:
          "The falling action follows the climax and leads toward the resolution.",
        difficulty: "medium",
        points: 10,
      },
    ],
  },
];

type GamePhase =
  | "waiting"
  | "mission_intro"
  | "playing"
  | "mission_complete"
  | "leaderboard"
  | "final_results";

export default function PlayGamePage() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("room") || "DEMO";
  const teamName = searchParams.get("team") || "Team Alpha";
  const playerName = searchParams.get("player") || "Player";
  const characterId = searchParams.get("character") || "explorer";

  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [missionScore, setMissionScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [correctCount, setCorrectCount] = useState(0);
  const [missions] = useState<Mission[]>(DEMO_MISSIONS);

  const character = GAME_CHARACTERS.find((c) => c.id === characterId);
  const currentMission = missions[currentMissionIdx];
  const currentQuestion = currentMission?.questions[currentQuestionIdx];
  const missionInfo =
    currentMission &&
    MISSION_INFO[currentMission.mission_type as MissionType];

  // Demo teams
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "t1",
      room_id: "demo",
      team_name: teamName,
      character: characterId,
      members: [{ id: "m1", team_id: "t1", student_name: playerName }],
      scores: [],
      total_score: 0,
      position: 0,
    },
    {
      id: "t2",
      room_id: "demo",
      team_name: "Team Beta",
      character: "scientist",
      members: [{ id: "m2", team_id: "t2", student_name: "Bot" }],
      scores: [],
      total_score: 0,
      position: 0,
    },
  ]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up — auto submit
          handleAnswer("");
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentQuestionIdx]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion) return;

      const isCorrect = answer === currentQuestion.correct_answer;
      const timeBonus = Math.max(0, Math.floor(timeRemaining / 6));
      const points = isCorrect ? currentQuestion.points + timeBonus : 0;

      if (isCorrect) setCorrectCount((c) => c + 1);
      setMissionScore((s) => s + points);
      setScore((s) => s + points);

      // Update team score
      setTeams((prev) =>
        prev.map((t) =>
          t.id === "t1"
            ? { ...t, total_score: t.total_score + points }
            : {
                ...t,
                total_score:
                  t.total_score +
                  (Math.random() > 0.4
                    ? Math.floor(Math.random() * 15) + 5
                    : 0),
              }
        )
      );

      // Next question or end mission
      if (currentQuestionIdx < currentMission.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIdx((i) => i + 1);
          setTimeRemaining(60);
        }, 2200);
      } else {
        setTimeout(() => {
          setPhase("mission_complete");
        }, 2200);
      }
    },
    [currentQuestion, currentQuestionIdx, currentMission, timeRemaining]
  );

  const startMission = () => {
    setPhase("mission_intro");
    setTimeout(() => {
      setPhase("playing");
      setTimeRemaining(60);
      setCurrentQuestionIdx(0);
      setMissionScore(0);
      setCorrectCount(0);
    }, 3000);
  };

  const nextMission = () => {
    if (currentMissionIdx < missions.length - 1) {
      setCurrentMissionIdx((i) => i + 1);
      setPhase("leaderboard");
      setTimeout(() => {
        startMission();
      }, 5000);
    } else {
      setPhase("final_results");
    }
  };

  return (
    <div className="volcano-bg min-h-screen">
      {/* Game Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌋</span>
            <span className="font-bold text-white text-sm">
              Room: {roomCode}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              {character?.emoji} {teamName}
            </span>
            <span className="text-volcano-400 font-bold text-sm">
              {score} pts
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* ===== WAITING ===== */}
        {phase === "waiting" && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-float">🌋</div>
            <h1 className="text-3xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-volcano-400 to-lava-400 bg-clip-text text-transparent">
                Volcano Race
              </span>
            </h1>
            <p className="text-slate-400 mb-2">
              Room: <span className="text-volcano-400 font-mono">{roomCode}</span>
            </p>
            <p className="text-slate-300 mb-8">
              {character?.emoji} {teamName} — {playerName}
            </p>

            <div className="card max-w-md mx-auto mb-6">
              <h3 className="font-bold text-white mb-3">🗺 5 Missions Ahead</h3>
              <div className="space-y-2">
                {Object.entries(MISSION_INFO).map(([type, info], idx) => (
                  <div
                    key={type}
                    className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-3 py-2"
                  >
                    <span>{info.icon}</span>
                    <span className="text-white text-sm">{info.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startMission}
              className="btn-primary text-lg py-3 px-8"
            >
              ▶ Start Race!
            </button>
          </div>
        )}

        {/* ===== MISSION INTRO ===== */}
        {phase === "mission_intro" && missionInfo && (
          <div className="text-center py-20 animate-scale-in">
            <div className="text-6xl mb-4">{missionInfo.icon}</div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Mission {currentMission.mission_number}
            </h1>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: missionInfo.color }}
            >
              {missionInfo.title}
            </h2>
            <p className="text-slate-400">{missionInfo.description}</p>
            <p className="text-slate-500 text-sm mt-4">
              {currentMission.questions.length} questions • Starting in...
            </p>
            <div className="mt-4 text-4xl font-bold text-volcano-400 animate-pulse">
              Get Ready!
            </div>
          </div>
        )}

        {/* ===== PLAYING ===== */}
        {phase === "playing" && currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIdx + 1}
            totalQuestions={currentMission.questions.length}
            onAnswer={handleAnswer}
            timeRemaining={timeRemaining}
          />
        )}

        {/* ===== MISSION COMPLETE ===== */}
        {phase === "mission_complete" && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-score-pop">🎉</div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Mission {currentMission.mission_number} Complete!
            </h1>
            <div className="card max-w-sm mx-auto mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mission Score</span>
                  <span className="text-volcano-400 font-bold">
                    {missionScore} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Correct Answers</span>
                  <span className="text-forest-400 font-bold">
                    {correctCount}/{currentMission.questions.length}
                  </span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between">
                  <span className="text-white font-bold">Total Score</span>
                  <span className="text-volcano-400 font-bold text-xl">
                    {score} pts
                  </span>
                </div>
              </div>
            </div>

            <button onClick={nextMission} className="btn-primary text-lg py-3 px-8">
              {currentMissionIdx < missions.length - 1
                ? "Next Mission →"
                : "See Final Results 🏆"}
            </button>
          </div>
        )}

        {/* ===== LEADERBOARD ===== */}
        {phase === "leaderboard" && (
          <div className="py-8">
            <h1 className="text-2xl font-extrabold text-white text-center mb-6">
              🌋 Volcano Leaderboard
            </h1>
            <VolcanoLeaderboard
              teams={teams}
              currentMission={currentMissionIdx}
              totalMissions={missions.length}
            />
          </div>
        )}

        {/* ===== FINAL RESULTS ===== */}
        {phase === "final_results" && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-3xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-yellow-400 via-volcano-400 to-lava-400 bg-clip-text text-transparent">
                Race Complete!
              </span>
            </h1>

            {/* Winner */}
            {(() => {
              const winner = [...teams].sort(
                (a, b) => b.total_score - a.total_score
              )[0];
              const isWinner = winner.id === "t1";
              return (
                <div className="card max-w-md mx-auto mb-6">
                  <div className="text-4xl mb-2">
                    {isWinner ? "🥇" : "👏"}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    {isWinner ? "You Won!" : `${winner.team_name} Wins!`}
                  </h2>
                  <p className="text-volcano-400 font-bold text-2xl">
                    {winner.total_score} points
                  </p>
                </div>
              );
            })()}

            {/* All Teams */}
            <div className="space-y-2 max-w-md mx-auto">
              {[...teams]
                .sort((a, b) => b.total_score - a.total_score)
                .map((team, idx) => (
                  <div
                    key={team.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                      idx === 0
                        ? "bg-yellow-900/20 border border-yellow-700/50"
                        : "bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {idx === 0
                          ? "🥇"
                          : idx === 1
                          ? "🥈"
                          : idx === 2
                          ? "🥉"
                          : `#${idx + 1}`}
                      </span>
                      <span className="text-white font-medium">
                        {team.team_name}
                      </span>
                    </div>
                    <span className="text-volcano-400 font-bold">
                      {team.total_score} pts
                    </span>
                  </div>
                ))}
            </div>

            <button
              onClick={() => (window.location.href = "/")}
              className="btn-primary mt-8"
            >
              🏠 Back to Home
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
