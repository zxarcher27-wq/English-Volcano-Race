"use client";

import { useState } from "react";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  timeRemaining: number;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  timeRemaining,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [fillBlankAnswer, setFillBlankAnswer] = useState("");

  const handleSelect = (answerId: string) => {
    if (showResult) return;
    setSelectedAnswer(answerId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer && question.question_type !== "fill_blank") return;

    const answer =
      question.question_type === "fill_blank"
        ? fillBlankAnswer
        : selectedAnswer!;

    setShowResult(true);

    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setShowResult(false);
      setFillBlankAnswer("");
    }, 2000);
  };

  const isCorrect = (answerId: string) => {
    if (question.question_type === "fill_blank") {
      return (
        fillBlankAnswer.toLowerCase().trim() ===
        question.correct_answer.toLowerCase().trim()
      );
    }
    return answerId === question.correct_answer;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress & Timer */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm">
          Question {questionNumber}/{totalQuestions}
        </span>
        <span
          className={`font-mono text-lg font-bold ${
            timeRemaining < 10 ? "text-lava-400 animate-pulse" : "text-white"
          }`}
        >
          ⏱ {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-volcano-500 h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${(questionNumber / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              question.question_type === "multiple_choice"
                ? "bg-blue-900/50 text-blue-300"
                : question.question_type === "true_false"
                ? "bg-purple-900/50 text-purple-300"
                : question.question_type === "fill_blank"
                ? "bg-forest-900/50 text-forest-300"
                : "bg-volcano-900/50 text-volcano-300"
            }`}
          >
            {question.question_type.replace("_", " ")}
          </span>
          <span className="text-slate-500 text-xs">
            {question.points} points
          </span>
        </div>

        <h2 className="text-lg font-bold text-white mb-4">
          {question.question_text}
        </h2>

        {/* Multiple Choice / True False */}
        {(question.question_type === "multiple_choice" ||
          question.question_type === "true_false") &&
          question.options && (
            <div className="space-y-2">
              {question.options.map((option) => {
                let optionStyle =
                  "border-slate-700 hover:border-slate-500 text-slate-300";

                if (selectedAnswer === option.id) {
                  if (showResult) {
                    optionStyle = option.is_correct
                      ? "border-forest-500 bg-forest-500/10 text-forest-300"
                      : "border-lava-500 bg-lava-500/10 text-lava-300";
                  } else {
                    optionStyle =
                      "border-volcano-500 bg-volcano-500/10 text-white";
                  }
                } else if (showResult && option.is_correct) {
                  optionStyle =
                    "border-forest-500 bg-forest-500/10 text-forest-300";
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    disabled={showResult}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${optionStyle}`}
                  >
                    <span className="font-medium mr-2">
                      {option.id.toUpperCase()}.
                    </span>
                    {option.text}
                    {showResult && option.is_correct && (
                      <span className="float-right">✓</span>
                    )}
                    {showResult &&
                      selectedAnswer === option.id &&
                      !option.is_correct && (
                        <span className="float-right">✗</span>
                      )}
                  </button>
                );
              })}
            </div>
          )}

        {/* Fill in the Blank */}
        {question.question_type === "fill_blank" && (
          <div>
            <input
              type="text"
              value={fillBlankAnswer}
              onChange={(e) => setFillBlankAnswer(e.target.value)}
              className={`input-field text-lg ${
                showResult
                  ? isCorrect(fillBlankAnswer)
                    ? "border-forest-500 bg-forest-500/10"
                    : "border-lava-500 bg-lava-500/10"
                  : ""
              }`}
              placeholder="Type your answer..."
              disabled={showResult}
            />
            {showResult && !isCorrect(fillBlankAnswer) && (
              <p className="text-forest-400 text-sm mt-2">
                Correct answer: {question.correct_answer}
              </p>
            )}
          </div>
        )}

        {/* Explanation (after answer) */}
        {showResult && (
          <div className="mt-4 p-3 bg-slate-700/50 rounded-xl">
            <p className="text-slate-300 text-sm">
              💡 {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      {!showResult && (
        <button
          onClick={handleSubmit}
          disabled={
            !selectedAnswer &&
            question.question_type !== "fill_blank"
          }
          className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
      )}

      {showResult && (
        <div
          className={`text-center py-3 rounded-xl font-bold text-lg animate-score-pop ${
            isCorrect(selectedAnswer || fillBlankAnswer)
              ? "text-forest-400"
              : "text-lava-400"
          }`}
        >
          {isCorrect(selectedAnswer || fillBlankAnswer)
            ? `✓ Correct! +${question.points} points`
            : "✗ Not quite. Keep going!"}
        </div>
      )}
    </div>
  );
}
