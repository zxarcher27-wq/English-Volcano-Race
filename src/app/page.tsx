"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="volcano-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🌋</span>
          <span className="text-xl font-bold text-white">Volcano Race</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="btn-secondary text-sm py-2 px-4">
            Login
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2 px-4">
            Register
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div
          className={`transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-8xl mb-6 animate-float">🌋</div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-volcano-400 via-lava-400 to-volcano-300 bg-clip-text text-transparent">
              Volcano Race
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-2 max-w-2xl">
            AI-Powered Educational Adventure Game
          </p>
          <p className="text-slate-400 mb-8 max-w-xl">
            Upload your teaching materials, let AI generate adaptive quizzes,
            and watch your students race to the top of the volcano!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/register"
              className="btn-primary text-lg py-3 px-8 flex items-center gap-2"
            >
              🚀 Get Started
            </Link>
            <Link
              href="/join"
              className="btn-secondary text-lg py-3 px-8 flex items-center gap-2"
            >
              🎮 Join Game
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card text-left">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold text-lg text-white mb-2">
                Upload Materials
              </h3>
              <p className="text-slate-400 text-sm">
                Upload PDF, DOCX, PPTX, or TXT files. AI analyzes your content
                automatically.
              </p>
            </div>
            <div className="card text-left">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-bold text-lg text-white mb-2">
                AI Quiz Generation
              </h3>
              <p className="text-slate-400 text-sm">
                5 adaptive missions generated from your materials. Review and
                edit before playing.
              </p>
            </div>
            <div className="card text-left">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-bold text-lg text-white mb-2">
                Multiplayer Race
              </h3>
              <p className="text-slate-400 text-sm">
                Students join teams, compete in missions, and race up the
                volcano leaderboard!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-slate-500 text-sm">
        © 2024 Volcano Race - Educational Game Platform
      </footer>
    </div>
  );
}
