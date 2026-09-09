"use client";

import Image from "next/image";
import type { QuizOption } from "@/types/quiz";

interface Props {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  image?: string;
  imageAlt?: string;
  options: QuizOption[];
  correctOptionId: string;
  triedOptionIds: string[];
  status: "active" | "correct" | "failed";
  livesLeft: number;
  maxLives: number;
  explanation?: string;
  onSelect: (optionId: string) => void;
}

const LETTER = ["A", "B", "C", "D", "E", "F"];

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  image,
  imageAlt,
  options,
  correctOptionId,
  triedOptionIds,
  status,
  livesLeft,
  maxLives,
  explanation,
  onSelect,
}: Props) {
  const resolved = status !== "active";

  return (
    <div className="w-full max-w-2xl rounded-3xl bg-white/95 shadow-xl p-6 sm:p-8 border-4 border-white">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 text-violet-700 font-bold px-4 py-1 text-sm">
          Soal {questionNumber} / {totalQuestions}
        </span>
        <span className="inline-flex items-center gap-1 text-lg" aria-label={`${livesLeft} kesempatan tersisa`}>
          {Array.from({ length: maxLives }, (_, i) => (
            <span key={i}>{i < livesLeft ? "❤️" : "🤍"}</span>
          ))}
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-snug mb-4">
        {question}
      </h2>

      {image && (
        <div className="mb-5 overflow-hidden rounded-2xl border-4 border-violet-100 bg-slate-50">
          <Image
            src={image}
            alt={imageAlt ?? ""}
            width={640}
            height={360}
            unoptimized
            className="w-full h-48 sm:h-56 object-contain bg-white"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt, idx) => {
          const isCorrect = opt.id === correctOptionId;
          const isTried = triedOptionIds.includes(opt.id);
          const isDisabled = resolved || isTried;

          let styles =
            "border-slate-200 bg-slate-50 hover:bg-violet-50 hover:border-violet-300";
          if (isTried) {
            styles = "border-red-400 bg-red-50 text-red-800 opacity-70";
          }
          if (resolved) {
            if (isCorrect) {
              styles = "border-green-400 bg-green-50 text-green-800";
            } else if (!isTried) {
              styles = "border-slate-200 bg-slate-50 opacity-60";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(opt.id)}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-semibold text-slate-700 transition-all duration-150 disabled:cursor-not-allowed ${styles}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border-2 border-current font-black text-sm">
                {LETTER[idx] ?? idx + 1}
              </span>
              <span>{opt.text}</span>
              {resolved && isCorrect && <span className="ml-auto text-xl">✅</span>}
              {isTried && <span className="ml-auto text-xl">❌</span>}
            </button>
          );
        })}
      </div>

      {!resolved && triedOptionIds.length > 0 && (
        <div className="mt-5 rounded-2xl bg-red-50 border-2 border-red-200 px-4 py-3 text-sm sm:text-base text-red-800 font-semibold">
          ❌ Belum tepat, coba lagi! Kesempatan tersisa: {livesLeft}
        </div>
      )}

      {resolved && explanation && (
        <div className="mt-5 rounded-2xl bg-yellow-50 border-2 border-yellow-200 px-4 py-3 text-sm sm:text-base text-yellow-900">
          <span className="font-bold">💡 Tahukah kamu? </span>
          {explanation}
        </div>
      )}
    </div>
  );
}
