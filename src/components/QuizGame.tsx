"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { QuizChapter, QuizOption, QuizQuestion } from "@/types/quiz";
import { pickRandom, shuffle } from "@/lib/shuffle";
import {
  BATTLE_CONFIG,
  HEROES,
  MONSTERS,
  getHeroById,
  getMonsterById,
  pickMonsterForChapter,
} from "@/features/gamification/battle.config";
import { battleReducer, createInitialBattleState } from "@/features/gamification/battle.reducer";
import {
  generateHeroDamagePattern,
  generateMonsterDamageSchedule,
} from "@/features/gamification/battle.utils";
import BattleStage from "./gamification/BattleStage";
import QuestionCard from "./QuestionCard";
import ResultScreen from "./ResultScreen";

interface PreparedQuestion extends QuizQuestion {
  shuffledOptions: QuizOption[];
}

type Phase = "settings" | "playing" | "result";
type QuestionStatus = "active" | "correct" | "failed";
type CountChoice = number | "all";

const MAX_LIVES = 3;
const COUNT_STEPS = [5, 10, 20, 30, 50, 75, 100];

/** Picks up to 3 round-number steps smaller than the bank size, plus "all". Scales with however many questions the chapter has. */
function getCountChoices(maxCount: number): CountChoice[] {
  const steps = COUNT_STEPS.filter((n) => n < maxCount).slice(-3);
  return [...steps, "all"];
}

function resolveChoice(choice: CountChoice, maxCount: number): number {
  return choice === "all" ? maxCount : Math.min(choice, maxCount);
}

function prepareRound(chapter: QuizChapter, count: number): PreparedQuestion[] {
  const picked = pickRandom(chapter.questions, count);
  return picked.map((q) => ({ ...q, shuffledOptions: shuffle(q.options) }));
}

export default function QuizGame({ chapter }: { chapter: QuizChapter }) {
  const maxCount = chapter.questions.length;
  const countChoices = useMemo(() => getCountChoices(maxCount), [maxCount]);

  const [phase, setPhase] = useState<Phase>("settings");
  const [questionCount, setQuestionCount] = useState<number>(() =>
    resolveChoice(countChoices[0], maxCount)
  );
  const [round, setRound] = useState<PreparedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [triedOptionIds, setTriedOptionIds] = useState<string[]>([]);
  const [status, setStatus] = useState<QuestionStatus>("active");
  const [livesLeft, setLivesLeft] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  // Adventure Battle character/opponent choices (settings screen).
  const [selectedHeroId, setSelectedHeroId] = useState(HEROES[0].id);
  const [monsterChoice, setMonsterChoice] = useState<string>("auto");

  // Adventure Battle state: cumulative for the whole session. It is separate
  // from the per-question `livesLeft` above (which still resets per question,
  // exactly as before) — battle HP never resets on question navigation.
  const [battle, dispatchBattle] = useReducer(battleReducer, createInitialBattleState(0));
  const animationTimer = useRef<number | null>(null);

  // Always let animations recover to idle, even if the component unmounts mid-animation.
  useEffect(() => {
    return () => {
      if (animationTimer.current !== null) window.clearTimeout(animationTimer.current);
    };
  }, []);

  function scheduleAnimationDone() {
    if (animationTimer.current !== null) window.clearTimeout(animationTimer.current);
    animationTimer.current = window.setTimeout(() => {
      dispatchBattle({ type: "ANIMATION_DONE" });
    }, BATTLE_CONFIG.animationDurationMs);
  }

  const currentQuestion = round[currentIndex];
  const isLastQuestion = currentIndex === round.length - 1;

  function startRound(count: number) {
    const prepared = prepareRound(chapter, count);
    setRound(prepared);
    setCurrentIndex(0);
    setTriedOptionIds([]);
    setStatus("active");
    setLivesLeft(MAX_LIVES);
    setScore(0);
    // A new quiz session is the only moment battle state (and HP) resets.
    // Each session also gets fresh randomised damage: the monster schedule
    // always totals exactly 100, the hero pattern averages exactly 5 per miss.
    const monster = monsterChoice === "auto" ? pickMonsterForChapter(chapter.id) : getMonsterById(monsterChoice);
    dispatchBattle({
      type: "START",
      totalQuestions: prepared.length,
      heroId: selectedHeroId,
      monsterId: monster.id,
      monsterDamageSchedule: generateMonsterDamageSchedule(prepared.length),
      heroDamagePattern: generateHeroDamagePattern(prepared.length * MAX_LIVES),
    });
    setPhase("playing");
  }

  function handleSelect(optionId: string) {
    if (status !== "active" || triedOptionIds.includes(optionId)) return;

    if (optionId === currentQuestion.correctOptionId) {
      setScore((s) => s + 1);
      setStatus("correct");
      // Correct at last: the monster takes damage exactly once for this question
      // (the reducer also guards with `currentQuestionDamaged`).
      dispatchBattle({ type: "CORRECT_ANSWER" });
      scheduleAnimationDone();
      return;
    }

    // Every incorrect attempt — including repeated tries on the same question —
    // costs the hero HP in the battle layer (existing lives behaviour unchanged).
    dispatchBattle({ type: "WRONG_ANSWER" });
    scheduleAnimationDone();

    const remaining = livesLeft - 1;
    setLivesLeft(remaining);
    setTriedOptionIds((prev) => [...prev, optionId]);
    if (remaining <= 0) {
      setStatus("failed");
    }
  }

  function handleNext() {
    setTriedOptionIds([]);
    setStatus("active");
    setLivesLeft(MAX_LIVES);
    if (isLastQuestion) {
      dispatchBattle({ type: "COMPLETE" });
      setPhase("result");
      return;
    }
    dispatchBattle({ type: "NEXT_QUESTION" });
    setCurrentIndex((i) => i + 1);
  }

  const progressPct = useMemo(() => {
    if (round.length === 0) return 0;
    return Math.round(((currentIndex + (status !== "active" ? 1 : 0)) / round.length) * 100);
  }, [currentIndex, round.length, status]);

  if (phase === "settings") {
    return (
      <div className="w-full max-w-xl rounded-3xl bg-white/95 shadow-xl p-8 border-4 border-white text-center">
        <div className="text-5xl mb-2">{chapter.emoji}</div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-1">{chapter.title}</h2>
        <p className="text-slate-500 mb-6">{chapter.subtitle}</p>

        <p className="font-bold text-slate-600 mb-3">Mau main berapa soal?</p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {countChoices.map((choice) => {
            const value = resolveChoice(choice, maxCount);
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

        <p className="font-bold text-slate-600 mb-3">Pilih petualangmu 🦸</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {HEROES.map((hero) => {
            const active = selectedHeroId === hero.id;
            return (
              <button
                key={hero.id}
                onClick={() => setSelectedHeroId(hero.id)}
                aria-pressed={active}
                className={`rounded-3xl border-2 p-2 transition-all ${
                  active
                    ? "border-violet-600 bg-violet-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-violet-300"
                }`}
              >
                <Image src={hero.assets.idle} alt={hero.name} width={480} height={480} unoptimized className="mx-auto h-16 w-16 object-contain sm:h-20 sm:w-20" />
                <span className="block font-extrabold text-slate-700">{hero.name}</span>
                <span className="block text-xs font-semibold text-slate-400">{hero.tagline}</span>
              </button>
            );
          })}
        </div>

        <p className="font-bold text-slate-600 mb-3">Pilih lawan & arena ⚔️</p>
        <div className="grid grid-cols-4 gap-2 mb-8">
          <button
            onClick={() => setMonsterChoice("auto")}
            aria-pressed={monsterChoice === "auto"}
            className={`rounded-3xl border-2 p-2 transition-all ${
              monsterChoice === "auto"
                ? "border-violet-600 bg-violet-50 shadow-md"
                : "border-slate-200 bg-white hover:border-violet-300"
            }`}
          >
            <span className="flex h-16 items-center justify-center text-4xl sm:h-20">🎲</span>
            <span className="block font-extrabold text-slate-700">Acak</span>
            <span className="block text-xs font-semibold text-slate-400">Ikuti bab ini</span>
          </button>
          {MONSTERS.map((monster) => {
            const active = monsterChoice === monster.id;
            return (
              <button
                key={monster.id}
                onClick={() => setMonsterChoice(monster.id)}
                aria-pressed={active}
                className={`rounded-3xl border-2 p-2 transition-all ${
                  active
                    ? "border-violet-600 bg-violet-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-violet-300"
                }`}
              >
                <Image src={monster.assets.idle} alt={monster.name} width={480} height={480} unoptimized className="mx-auto h-16 w-16 object-contain sm:h-20 sm:w-20" />
                <span className="block font-extrabold text-slate-700">{monster.name}</span>
                <span className="block text-xs font-semibold text-slate-400">{monster.tagline}</span>
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
        battle={{
          heroHp: battle.heroHp,
          monsterHp: battle.monsterHp,
          correctAnswers: battle.correctAnswers,
          totalQuestions: battle.totalQuestions,
          battleStatus: battle.battleStatus,
          heroId: battle.heroId,
          monsterId: battle.monsterId,
        }}
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

      <BattleStage battle={battle} hero={getHeroById(battle.heroId)} monster={getMonsterById(battle.monsterId)} />

      <QuestionCard
        questionNumber={currentIndex + 1}
        totalQuestions={round.length}
        question={currentQuestion.question}
        image={currentQuestion.image}
        imageAlt={currentQuestion.imageAlt}
        options={currentQuestion.shuffledOptions}
        correctOptionId={currentQuestion.correctOptionId}
        triedOptionIds={triedOptionIds}
        status={status}
        livesLeft={livesLeft}
        maxLives={MAX_LIVES}
        explanation={currentQuestion.explanation}
        onSelect={handleSelect}
      />

      {status !== "active" && (
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
