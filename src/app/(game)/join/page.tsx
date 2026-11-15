"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GAME_CHARACTERS } from "@/types";

export default function JoinGamePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [step, setStep] = useState<"code" | "team">("code");
  const [error, setError] = useState("");

  const handleJoinRoom = () => {
    if (roomCode.length < 4) {
      setError("Please enter a valid room code");
      return;
    }
    setError("");
    setStep("team");
  };

  const handleJoinTeam = () => {
    if (!teamName.trim()) {
      setError("Please enter a team name");
      return;
    }
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!selectedCharacter) {
      setError("Please select a character");
      return;
    }

    // In production, this would connect via Supabase Realtime
    router.push(
      `/play?room=${roomCode}&team=${encodeURIComponent(teamName)}&player=${encodeURIComponent(playerName)}&character=${selectedCharacter}`
    );
  };

  return (
    <div className="volcano-bg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🌋</span>
            <span className="text-2xl font-bold text-white">Volcano Race</span>
          </Link>
        </div>

        {step === "code" && (
          <div className="card text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Join Game</h1>
            <p className="text-slate-400 text-sm mb-6">
              Enter the room code from your teacher
            </p>

            {error && (
              <div className="bg-lava-900/50 border border-lava-700 text-lava-200 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}

            <input
              type="text"
              value={roomCode}
              onChange={(e) =>
                setRoomCode(e.target.value.toUpperCase().slice(0, 6))
              }
              className="input-field text-center text-3xl font-mono tracking-[0.3em] mb-4"
              placeholder="ROOM CODE"
              maxLength={6}
            />

            <button
              onClick={handleJoinRoom}
              className="btn-primary w-full py-3 text-lg"
            >
              Join Room 🚀
            </button>
          </div>
        )}

        {step === "team" && (
          <div className="card">
            <button
              onClick={() => setStep("code")}
              className="text-slate-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold text-white mb-1">
              Set Up Your Team
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              Room: <span className="text-volcano-400 font-mono">{roomCode}</span>
            </p>

            {error && (
              <div className="bg-lava-900/50 border border-lava-700 text-lava-200 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input-field"
                  placeholder="Choose a team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Choose Character
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {GAME_CHARACTERS.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharacter(char.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        selectedCharacter === char.id
                          ? "border-volcano-500 bg-volcano-500/10"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{char.emoji}</span>
                      <span className="text-xs text-slate-300">
                        {char.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleJoinTeam}
                className="btn-primary w-full py-3 text-lg"
              >
                Enter the Volcano! 🌋
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
