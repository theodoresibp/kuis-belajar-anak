"use client";

import { useReducer, useState } from "react";
import Link from "next/link";
import type { QuizChapter } from "@/types/quiz";
import QuestionCard from "@/components/QuestionCard";
import AdventureGameCanvas from "./AdventureGameCanvas";
import type { AdventureEncounter } from "@/game/adventure/AdventureScene";
import {
  adventureReducer,
  createInitialAdventureRunState,
} from "@/features/adventure/adventure.reducer";

interface Props {
  chapter: QuizChapter;
}

const ENCOUNTER_NAMES = ["Slime Hutan", "Rubah Penjaga", "Penjaga Hutan"];

export default function AdventureMode({ chapter }: Props) {
  // Keep the first server/client render deterministic to avoid hydration mismatch.
  const questions = chapter.questions;

  const encounterCount = Math.min(ENCOUNTER_NAMES.length, questions.length);
  const baseQuestionCount = Math.floor(questions.length / Math.max(1, encounterCount));
  const extraQuestions = questions.length % Math.max(1, encounterCount);
  const encounterQuestionCounts = Array.from(
    { length: encounterCount },
    (_, index) => baseQuestionCount + (index < extraQuestions ? 1 : 0),
  );

  const [run, dispatch] = useReducer(
    adventureReducer,
    undefined,
    createInitialAdventureRunState,
  );
  const [activeEncounter, setActiveEncounter] = useState<AdventureEncounter | null>(null);
  const [resolveActiveEncounter, setResolveActiveEncounter] = useState<(() => void) | null>(null);
  const [triedOptionIds, setTriedOptionIds] = useState<string[]>([]);
  const [questionStatus, setQuestionStatus] = useState<"active" | "correct">("active");

  const questionStart = encounterQuestionCounts
    .slice(0, run.encounterIndex)
    .reduce((total, count) => total + count, 0);
  const currentEncounterQuestionCount =
    encounterQuestionCounts[run.encounterIndex] ?? 0;
  const localQuestionIndex = run.currentQuestionIndex - questionStart;
  const currentQuestion = questions[run.currentQuestionIndex];
  const isLastQuestionOfEncounter =
    localQuestionIndex === currentEncounterQuestionCount - 1;
  const isFinalEncounter = run.encounterIndex === encounterCount - 1;

  function handleEncounter(
    encounter: AdventureEncounter,
    resolve: () => void,
  ) {
    setActiveEncounter(encounter);
    setResolveActiveEncounter(() => resolve);
    setTriedOptionIds([]);
    setQuestionStatus("active");
    dispatch({ type: "START_ENCOUNTER" });
  }

  function handleAnswer(optionId: string) {
    if (
      questionStatus !== "active" ||
      triedOptionIds.includes(optionId) ||
      !currentQuestion ||
      run.status !== "encounter"
    ) {
      return;
    }

    if (optionId === currentQuestion.correctOptionId) {
      const damage = isLastQuestionOfEncounter
        ? run.monsterHp
        : Math.round((100 / currentEncounterQuestionCount) * 100) / 100;

      dispatch({ type: "CORRECT_ANSWER", damage });
      setQuestionStatus("correct");
      return;
    }

    setTriedOptionIds((previous) => [...previous, optionId]);
    dispatch({ type: "WRONG_ANSWER" });
  }

  function handleContinue() {
    if (run.monsterHp > 0 || !resolveActiveEncounter) return;

    resolveActiveEncounter();
    setActiveEncounter(null);
    setResolveActiveEncounter(null);
    setTriedOptionIds([]);
    setQuestionStatus("active");

    if (isFinalEncounter) {
      dispatch({ type: "VICTORY" });
      return;
    }

    dispatch({ type: "NEXT_QUESTION" });
    dispatch({ type: "NEXT_ENCOUNTER" });
  }

  function handleNextQuestion() {
    dispatch({ type: "NEXT_QUESTION" });
    setTriedOptionIds([]);
    setQuestionStatus("active");
  }

  const heroHpPercent = Math.max(0, run.heroHp);
  const monsterHpPercent = Math.max(0, run.monsterHp);

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-b from-emerald-100 via-lime-50 to-amber-100 px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                Adventure Mode
              </span>
              <span className="rounded-full border border-emerald-300 bg-white/70 px-3 py-1 text-xs font-bold text-emerald-800">
                Sprint 3 • Obstacles & Power-ups
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
              Enchanted Forest
            </h1>
            <p className="mt-1 max-w-xl text-sm font-medium text-emerald-800 sm:text-base">
              Jelajahi hutan, temui monster, dan jawab soal untuk mengalahkan mereka.
            </p>
          </div>

          <Link
            href="/"
            className="shrink-0 rounded-full border-2 border-emerald-700 bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            ← Kembali
          </Link>
        </header>

        <section className="overflow-hidden rounded-3xl border-4 border-white bg-emerald-900/10 p-2 shadow-xl sm:p-3">
          <div className="overflow-hidden rounded-2xl">
            <AdventureGameCanvas
              encounterCount={encounterCount}
              isDefeated={run.status === "defeat"}
              onEncounter={handleEncounter}
              onAdventureComplete={() => dispatch({ type: "VICTORY" })}
              onHazard={() => dispatch({ type: "HAZARD" })}
              onPickup={(kind) =>
                dispatch({ type: kind === "heart" ? "COLLECT_HEART" : "COLLECT_SHIELD" })
              }
            />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">❤️</span>
              <strong className="text-sm font-extrabold text-emerald-950">HP Petualang</strong>
              <span className="ml-auto text-sm font-black text-emerald-800">{heroHpPercent}/100</span>
            </div>
            <p className="mb-2 text-xs font-bold text-sky-700">🛡️ Perisai: {run.shieldCharges} · 💗 Kristal hati memulihkan 15 HP</p>
            <div className="h-3 overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${heroHpPercent}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">⭐</span>
              <strong className="text-sm font-extrabold text-emerald-950">Jawaban Benar</strong>
              <span className="ml-auto text-sm font-black text-emerald-800">{run.score}/{questions.length}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Setiap jawaban benar mengurangi HP monster.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">👾</span>
              <strong className="text-sm font-extrabold text-emerald-950">Monster</strong>
              <span className="ml-auto text-sm font-black text-emerald-800">
                {Math.min(run.encounterIndex + (run.status === "victory" ? 1 : 0), encounterCount)}/{encounterCount}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              {activeEncounter ? activeEncounter.name : "Terus berjalan untuk menemukan lawan."}
            </p>
          </div>
        </section>

        {activeEncounter && run.status === "encounter" && (
          <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-3xl border-4 border-amber-200 bg-white/95 p-5 shadow-xl sm:p-7">
            <div className="w-full">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-slate-800">
                  {activeEncounter.emoji} {activeEncounter.name}
                </h2>
                <span className="text-sm font-extrabold text-red-700">HP {monsterHpPercent}/100</span>
              </div>
              <div className="mt-2 h-4 overflow-hidden rounded-full bg-red-100">
                <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${monsterHpPercent}%` }} />
              </div>
            </div>

            {currentQuestion && (
              <QuestionCard
                questionNumber={run.currentQuestionIndex + 1}
                totalQuestions={questions.length}
                question={currentQuestion.question}
                image={currentQuestion.image}
                imageAlt={currentQuestion.imageAlt}
                options={currentQuestion.options}
                correctOptionId={currentQuestion.correctOptionId}
                triedOptionIds={triedOptionIds}
                status={questionStatus}
                explanation={currentQuestion.explanation}
                onSelect={handleAnswer}
              />
            )}

            {questionStatus === "correct" && run.monsterHp > 0 && (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="rounded-full bg-violet-600 px-8 py-3 font-bold text-white shadow-md transition hover:bg-violet-700"
              >
                Soal Berikutnya →
              </button>
            )}

            {run.monsterHp <= 0 && (
              <div className="w-full text-center">
                <p className="mb-3 text-lg font-black text-emerald-700">
                  🎉 {activeEncounter.name} berhasil dikalahkan!
                </p>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-md transition hover:bg-emerald-700"
                >
                  {isFinalEncounter ? "Selesaikan Petualangan 🏆" : "Lanjutkan Perjalanan →"}
                </button>
              </div>
            )}
          </section>
        )}

        {run.status === "defeat" && (
          <section className="rounded-3xl border-4 border-red-200 bg-white p-8 text-center shadow-xl">
            <div className="text-5xl">💔</div>
            <h2 className="mt-3 text-2xl font-black text-red-700">Petualangan Terhenti</h2>
            <p className="mt-2 text-slate-600">HP petualang habis. Coba lagi dan pilih jawaban dengan lebih teliti, ya!</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-violet-600 px-8 py-3 font-bold text-white shadow-md hover:bg-violet-700"
            >
              Ulangi Petualangan
            </button>
          </section>
        )}

        {run.status === "victory" && (
          <section className="rounded-3xl border-4 border-amber-200 bg-white p-8 text-center shadow-xl">
            <div className="text-6xl">🏆</div>
            <h2 className="mt-3 text-3xl font-black text-emerald-800">Petualangan Berhasil!</h2>
            <p className="mt-2 text-slate-600">
              Kamu berhasil melewati {encounterCount} monster dan menjawab {run.score} soal dengan benar.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-md hover:bg-emerald-700"
            >
              Kembali ke Beranda
            </Link>
          </section>
        )}

        {!activeEncounter && run.status === "exploring" && (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
            Hindari duri merah dengan melompat. Ambil kristal hati untuk memulihkan 15 HP dan perisai biru untuk memblokir satu rintangan. Dekati monster untuk memulai kuis!
          </p>
        )}

        <footer className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-center">
          <p className="text-xs font-semibold text-emerald-800">
            Sprint 3 — hindari rintangan, kumpulkan power-up, dan kalahkan monster dengan menjawab soal bab {chapter.title}.
          </p>
        </footer>
      </div>
    </main>
  );
}
