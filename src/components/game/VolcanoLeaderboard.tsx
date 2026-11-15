"use client";

import type { Team } from "@/types";

interface VolcanoLeaderboardProps {
  teams: Team[];
  currentMission: number;
  totalMissions: number;
}

export default function VolcanoLeaderboard({
  teams,
  currentMission,
  totalMissions,
}: VolcanoLeaderboardProps) {
  const sortedTeams = [...teams].sort(
    (a, b) => b.total_score - a.total_score
  );

  const maxScore = Math.max(...teams.map((t) => t.total_score), 1);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Volcano SVG */}
      <svg viewBox="0 0 400 500" className="w-full" xmlns="http://www.w3.org/2000/svg">
        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="volcanoGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c2d12" />
            <stop offset="30%" stopColor="#9a3412" />
            <stop offset="70%" stopColor="#6b4226" />
            <stop offset="100%" stopColor="#44403c" />
          </linearGradient>
          <linearGradient id="lavaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="400" height="500" fill="url(#skyGrad)" />

        {/* Stars */}
        {[...Array(15)].map((_, i) => (
          <circle
            key={i}
            cx={Math.random() * 400}
            cy={Math.random() * 150}
            r={Math.random() * 1.5 + 0.5}
            fill="white"
            opacity={Math.random() * 0.5 + 0.3}
          />
        ))}

        {/* Volcano body */}
        <polygon
          points="200,60 50,480 350,480"
          fill="url(#volcanoGrad)"
          stroke="#5c3a1e"
          strokeWidth="2"
        />

        {/* Volcano crater */}
        <ellipse cx="200" cy="65" rx="35" ry="12" fill="#4a1c00" />

        {/* Lava in crater */}
        <ellipse cx="200" cy="67" rx="25" ry="8" fill="url(#lavaGrad)" opacity="0.8">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </ellipse>

        {/* Lava glow */}
        <circle cx="200" cy="60" r="40" fill="#f97316" opacity="0.1">
          <animate attributeName="r" values="35;45;35" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Mission checkpoints */}
        {[...Array(totalMissions)].map((_, i) => {
          const y = 400 - i * 70;
          const xOffset = i % 2 === 0 ? -30 : 30;
          const x = 200 + xOffset;
          const isCompleted = i + 1 <= currentMission;

          return (
            <g key={i}>
              {/* Path line */}
              <circle
                cx={x}
                cy={y}
                r="12"
                fill={isCompleted ? "#f97316" : "#475569"}
                stroke={isCompleted ? "#fb923c" : "#64748b"}
                strokeWidth="2"
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                {i + 1}
              </text>
              {/* Label */}
              <text
                x={x + (i % 2 === 0 ? -25 : 25)}
                y={y + 4}
                textAnchor={i % 2 === 0 ? "end" : "start"}
                fill={isCompleted ? "#fdba74" : "#94a3b8"}
                fontSize="9"
              >
                Mission {i + 1}
              </text>
            </g>
          );
        })}

        {/* Team positions */}
        {sortedTeams.map((team, idx) => {
          const progress = team.total_score / maxScore;
          const y = 430 - progress * 350;
          const x = 140 + idx * 40;

          return (
            <g key={team.id}>
              {/* Team marker */}
              <circle
                cx={x}
                cy={y}
                r="14"
                fill={
                  idx === 0
                    ? "#f97316"
                    : idx === 1
                    ? "#3b82f6"
                    : idx === 2
                    ? "#22c55e"
                    : "#8b5cf6"
                }
                stroke="white"
                strokeWidth="2"
                opacity="0.9"
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="bold"
              >
                {team.team_name.substring(0, 2).toUpperCase()}
              </text>
              {/* Score */}
              <text
                x={x}
                y={y - 20}
                textAnchor="middle"
                fill="white"
                fontSize="8"
              >
                {team.total_score}pts
              </text>
            </g>
          );
        })}

        {/* Trophy at top */}
        <text x="200" y="40" textAnchor="middle" fontSize="24">
          🏆
        </text>
      </svg>

      {/* Leaderboard Table */}
      <div className="mt-4 space-y-2">
        {sortedTeams.map((team, idx) => (
          <div
            key={team.id}
            className={`flex items-center justify-between px-4 py-3 rounded-xl ${
              idx === 0
                ? "bg-volcano-900/30 border border-volcano-700/50"
                : "bg-slate-800/50 border border-slate-700/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-400 w-6">
                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
              </span>
              <span className="text-white font-medium">{team.team_name}</span>
            </div>
            <span className="text-volcano-400 font-bold">
              {team.total_score} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
