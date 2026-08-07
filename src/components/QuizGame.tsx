"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QuizChapter, QuizOption, QuizQuestion } from "@/types/quiz";
import { pickRandom, shuffle } from "@/lib/shuffle";
import QuestionCard from "./QuestionCard";
import ResultScreen from "./ResultScreen";

interface PreparedQuestion extends QuizQuestion {
  shuffledOptions: QuizOption[];
}

type Phase = "settings" | "playing" | "result";

const COUNT_CHOICES = [5, 10, "all"] as const;

function prepareRound(chapter: QuizChapter, count: number): PreparedQuestion[] {
  const picked = pickRandom(chapter.questions, count);
  return picked.map((q) => ({ ...q, shuffledOptions: shuffle(q.options) }));
}

export default function QuizGame({ chapter }: { chapter: QuizChapter }) {
  const [phase, setPhase] = useState<Phase>("settings");
  const [questionCount, setQuestionCount] = useState<number>(
    Math.min(10, chapter.questions.length)
  );
  const [round, setRound] = useState<PreparedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const currentQuestion = round[currentIndex];
  const isLastQuestion = currentIndex === round.length - 1;

  const maxCount = chapter.questions.length;

  function startRound(count: number) {
    setRound(prepareRound(chapter, count));
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setScore(0);
    setPhase("playing");
  }

  function handleSelect(optionId: string) {
    if (selectedOptionId !== null) return;
    setSelectedOptionId(optionId);
    if (optionId === currentQuestion.correctOptionId) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (isLastQuestion) {
      setPhase("result");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedOptionId(null);
  }

  const progressPct = useMemo(() => {
    if (round.length === 0) return 0;
    return Math.round(((currentIndex + (selectedOptionId ? 1 : 0)) / round.length) * 100);
  }, [currentIndex, round.length, selectedOptionId]);

  if (phase === "settings") {
    return (
      <div className="w-full max-w-xl rounded-3xl bg-white/95 shadow-xl p-8 border-4 border-white text-center">
        <div className="text-5xl mb-2">{chapter.emoji}</div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-1">{chapter.title}</h2>
        <p className="text-slate-500 mb-6">{chapter.subtitle}</p>

        <p className="font-bold text-slate-600 mb-3">Mau main berapa soal?</p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {COUNT_CHOICES.map((choice) => {
            const value = choice === "all" ? maxCount : Math.min(choice, maxCount);
            const label = choice === "all" ? `Semua (${maxCount})` : `${value} soal`;
            const active = questionCount === value;
            return (
              <button
                key={choice}
                onClick={() => setQuestionCount(value)}
                className={`rounded-full px-5 py-2 font-bold border-2 transition-colors ${
                  active
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-violet-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => startRound(questionCount)}
            className="rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3 shadow-md transition-colors"
          >
            ▶️ Mulai Kuis
          </button>
          <Link
            href={`/materi/${chapter.id}`}
            className="rounded-full bg-white border-2 border-violet-600 hover:bg-violet-50 text-violet-700 font-bold px-6 py-3 shadow-sm transition-colors"
          >
            📖 Baca Materi Dulu
          </Link>
          <Link
            href="/"
            className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 shadow-sm transition-colors"
          >
            🏠 Kembali
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <ResultScreen
        score={score}
        total={round.length}
        onPlayAgain={() => startRound(questionCount)}
        onBackToMenu={() => setPhase("settings")}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-1 text-white font-bold text-sm">
          <span>
            🏅 Skor: {score} / {round.length}
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/40 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <QuestionCard
        questionNumber={currentIndex + 1}
        totalQuestions={round.length}
        question={currentQuestion.question}
        image={currentQuestion.image}
        imageAlt={currentQuestion.imageAlt}
        options={currentQuestion.shuffledOptions}
        correctOptionId={currentQuestion.correctOptionId}
        selectedOptionId={selectedOptionId}
        explanation={currentQuestion.explanation}
        onSelect={handleSelect}
      />

      {selectedOptionId !== null && (
        <button
          onClick={handleNext}
          className="rounded-full bg-white hover:bg-slate-50 text-violet-700 font-bold px-8 py-3 shadow-md transition-colors"
        >
          {isLastQuestion ? "Lihat Hasil 🎉" : "Soal Berikutnya ➡️"}
        </button>
      )}
    </div>
  );
}
