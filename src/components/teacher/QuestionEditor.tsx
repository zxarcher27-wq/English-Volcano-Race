"use client";

import { useState } from "react";
import type { Question, Mission } from "@/types";

interface QuestionEditorProps {
  mission: Mission;
  onUpdateQuestion: (questionIndex: number, question: Question) => void;
  onDeleteQuestion: (questionIndex: number) => void;
  onRegenerateQuestion: (questionIndex: number) => void;
  onRegenerateMission: () => void;
  onApproveMission: () => void;
}

export default function QuestionEditor({
  mission,
  onUpdateQuestion,
  onDeleteQuestion,
  onRegenerateQuestion,
  onRegenerateMission,
  onApproveMission,
}: QuestionEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Question | null>(null);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...mission.questions[index] });
  };

  const saveEdit = () => {
    if (editingIndex !== null && editForm) {
      onUpdateQuestion(editingIndex, editForm);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-4">
      {/* Mission Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Mission {mission.mission_number}: {mission.title}
          </h3>
          <p className="text-slate-400 text-sm">{mission.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRegenerateMission}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            🔄 Regenerate
          </button>
          <button
            onClick={onApproveMission}
            className={`text-xs py-1.5 px-3 font-semibold rounded-xl transition-all ${
              mission.status === "approved"
                ? "bg-forest-600 text-white"
                : "btn-success"
            }`}
          >
            {mission.status === "approved" ? "✓ Approved" : "✓ Approve"}
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {mission.questions.map((question, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl border border-slate-700/50">
            {editingIndex === idx && editForm ? (
              // Edit Mode
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Question
                  </label>
                  <textarea
                    value={editForm.question_text}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        question_text: e.target.value,
                      })
                    }
                    className="input-field text-sm"
                    rows={2}
                  />
                </div>

                {editForm.options && (
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Options</label>
                    {editForm.options.map((opt, oidx) => (
                      <div key={oidx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={opt.is_correct}
                          onChange={() =>
                            setEditForm({
                              ...editForm,
                              options: editForm.options?.map((o, i) => ({
                                ...o,
                                is_correct: i === oidx,
                              })),
                              correct_answer: opt.id,
                            })
                          }
                          className="accent-volcano-500"
                        />
                        <input
                          value={opt.text}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              options: editForm.options?.map((o, i) =>
                                i === oidx
                                  ? { ...o, text: e.target.value }
                                  : o
                              ),
                            })
                          }
                          className="input-field text-sm flex-1"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Explanation
                  </label>
                  <textarea
                    value={editForm.explanation}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        explanation: e.target.value,
                      })
                    }
                    className="input-field text-sm"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <button onClick={saveEdit} className="btn-primary text-xs py-1.5 px-3">
                    Save
                  </button>
                  <button onClick={cancelEdit} className="btn-secondary text-xs py-1.5 px-3">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                        Q{idx + 1}
                      </span>
                      <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                        {question.question_type.replace("_", " ")}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          question.difficulty === "easy"
                            ? "bg-forest-900/50 text-forest-300"
                            : question.difficulty === "hard"
                            ? "bg-lava-900/50 text-lava-300"
                            : "bg-volcano-900/50 text-volcano-300"
                        }`}
                      >
                        {question.difficulty}
                      </span>
                    </div>
                    <p className="text-white text-sm mb-2">
                      {question.question_text}
                    </p>

                    {question.options && (
                      <div className="space-y-1 mb-2">
                        {question.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`text-xs px-3 py-1.5 rounded-lg ${
                              opt.is_correct
                                ? "bg-forest-900/30 text-forest-300 border border-forest-700/50"
                                : "bg-slate-700/50 text-slate-400"
                            }`}
                          >
                            {opt.id.toUpperCase()}. {opt.text}{" "}
                            {opt.is_correct && "✓"}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-slate-500 text-xs">
                      💡 {question.explanation}
                    </p>
                    {question.source_reference && (
                      <p className="text-slate-600 text-xs mt-1">
                        📍 {question.source_reference}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => startEdit(idx)}
                      className="text-slate-400 hover:text-white p-1 transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onRegenerateQuestion(idx)}
                      className="text-slate-400 hover:text-white p-1 transition-colors"
                      title="Regenerate"
                    >
                      🔄
                    </button>
                    <button
                      onClick={() => onDeleteQuestion(idx)}
                      className="text-slate-400 hover:text-lava-400 p-1 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
