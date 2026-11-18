"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuizChapter, QuizOption, QuizQuestion } from "@/types/quiz";
import { pickRandom, shuffle } from "@/lib/shuffle";
import {
  BATTLE_CONFIG,
  HEROES,
  getHeroById,
  getMonsterById,
  pickMonsterForChapter,
} from "@/features/gamification/battle.config";
import {
  battleReducer,
  createInitialBattleState,
} from "@/features/gamification/battle.reducer";
import {
  generateHeroDamagePattern,
  generateMonsterDamageSchedule,
} from "@/features/gamification/battle.utils";
import type { PowerUpKind } from "@/features/gamification/battle.types";
import { playSound } from "@/features/gamification/sound";
import {
  DIFFICULTIES,
  DEFAULT_DIFFICULTY,
  type Difficulty,
} from "@/features/adventure/difficulty";
import BattleStage from "./gamification/BattleStage";
import QuestionCard from "./QuestionCard";
import ResultScreen from "./ResultScreen";

interface PreparedQuestion extends QuizQuestion {
  shuffledOptions: QuizOption[];
}

type Phase = "settings" | "playing" | "result";
type SettingsStep = "hero" | "count" | "difficulty" | "confirm";
type QuestionStatus = "active" | "correct";
type CountChoice = number | "all";

const SETTINGS_STEPS: SettingsStep[] = [
  "hero",
  "count",
  "difficulty",
  "confirm",
];

/** Best-effort: most browsers block this without a direct user gesture. */
async function enterImmersiveMode() {
  try {
    if (
      !document.fullscreenElement &&
      document.documentElement.requestFullscreen
    ) {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Fullscreen may be unavailable in an ordinary browser tab.
  }
  try {
    const orientation = window.screen.orientation as ScreenOrientation & {
      lock?: (orientation: "landscape") => Promise<void>;
    };
    await orientation.lock?.("landscape");
  } catch {
    // The user can still rotate manually.
  }
}

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
  const router = useRouter();
  const maxCount = chapter.questions.length;
  const countChoices = useMemo(() => getCountChoices(maxCount), [maxCount]);

  const [phase, setPhase] = useState<Phase>("settings");
  const [settingsStep, setSettingsStep] = useState<SettingsStep>("hero");
  const [questionCount, setQuestionCount] = useState<number>(() =>
    resolveChoice(countChoices[0], maxCount),
  );
  const [round, setRound] = useState<PreparedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [triedOptionIds, setTriedOptionIds] = useState<string[]>([]);
  const [status, setStatus] = useState<QuestionStatus>("active");
  const [score, setScore] = useState(0);
  // Adventure Battle character/opponent choices (settings screen).
  const [selectedHeroId, setSelectedHeroId] = useState(HEROES[0].id);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>(DEFAULT_DIFFICULTY);
  // Answer options removed by the hint power-up on the current question.
  const [hintedOptionIds, setHintedOptionIds] = useState<string[]>([]);
  // Keep the latest wrong-answer feedback stable after the battle animation ends.
  const [lastWrongWasBlocked, setLastWrongWasBlocked] = useState(false);

  // Adventure Battle HP is cumulative for the whole session and never resets
  // when moving to the next question.
  const [battle, dispatchBattle] = useReducer(
    battleReducer,
    createInitialBattleState(0),
  );
  const animationTimer = useRef<number | null>(null);

  // Always let animations recover to idle, even if the component unmounts mid-animation.
  useEffect(() => {
    return () => {
      if (animationTimer.current !== null)
        window.clearTimeout(animationTimer.current);
    };
  }, []);

  function scheduleAnimationDone() {
    if (animationTimer.current !== null)
      window.clearTimeout(animationTimer.current);
    animationTimer.current = window.setTimeout(() => {
      dispatchBattle({ type: "ANIMATION_DONE" });
    }, BATTLE_CONFIG.animationDurationMs);
  }

  // Sound when a combo reward is granted, and a fanfare on the result screen.
  const prevPowerUpChoices = useRef(0);
  useEffect(() => {
    if (battle.powerUpChoices > prevPowerUpChoices.current) playSound("combo");
    prevPowerUpChoices.current = battle.powerUpChoices;
  }, [battle.powerUpChoices]);

  useEffect(() => {
    if (phase === "result")
      playSound(battle.monsterHp <= 0 ? "victory" : "finish");
    // Only fire on entering the result phase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const currentQuestion = round[currentIndex];
  const isLastQuestion = currentIndex === round.length - 1;

  function startRound(count: number) {
    const prepared = prepareRound(chapter, count);
    setRound(prepared);
    setCurrentIndex(0);
    setTriedOptionIds([]);
    setHintedOptionIds([]);
    setLastWrongWasBlocked(false);
    setStatus("active");
    setScore(0);
    // A new quiz session is the only moment battle state (and HP) resets.
    // The monster damage schedule totals exactly 100. The hero damage pattern
    // covers every distinct wrong option that can be attempted in this round.
    const maxWrongAttempts = prepared.reduce(
      (total, question) =>
        total + Math.max(0, question.shuffledOptions.length - 1),
      0,
    );
    const monster = pickMonsterForChapter(chapter.id);
    dispatchBattle({
      type: "START",
      totalQuestions: prepared.length,
      heroId: selectedHeroId,
      monsterId: monster.id,
      monsterDamageSchedule: generateMonsterDamageSchedule(prepared.length),
      heroDamagePattern: generateHeroDamagePattern(maxWrongAttempts),
    });
    setPhase("playing");
  }

  function handleSelect(optionId: string) {
    if (status !== "active" || triedOptionIds.includes(optionId)) return;

    if (optionId === currentQuestion.correctOptionId) {
      setLastWrongWasBlocked(false);
      setScore((s) => s + 1);
      setStatus("correct");
      playSound("correct");
      playSound("hit");
      // Correct at last: the monster takes damage exactly once for this question
      // (the reducer also guards with `currentQuestionDamaged`).
      dispatchBattle({ type: "CORRECT_ANSWER" });
      scheduleAnimationDone();
      return;
    }

    // Every distinct incorrect option costs hero HP unless an active shield
    // blocks the attack. The player can keep trying until the answer is correct.
    const blockedByShield = battle.shieldActive;
    setLastWrongWasBlocked(blockedByShield);
    if (blockedByShield) playSound("blocked");
    else {
      playSound("wrong");
      playSound("hurt");
    }
    dispatchBattle({ type: "WRONG_ANSWER" });
    scheduleAnimationDone();

    setTriedOptionIds((prev) => [...prev, optionId]);
  }

  /** Wrong options on the current question that a hint could still eliminate. */
  function hintCandidates(): string[] {
    if (!currentQuestion || status !== "active") return [];
    return currentQuestion.shuffledOptions
      .map((o) => o.id)
      .filter(
        (id) =>
          id !== currentQuestion.correctOptionId &&
          !triedOptionIds.includes(id) &&
          !hintedOptionIds.includes(id),
      );
  }

  function handleUseItem(item: PowerUpKind) {
    if (item === "potion") {
      if (
        battle.items.potion <= 0 ||
        battle.heroHp >= BATTLE_CONFIG.initialHeroHp
      )
        return;
      dispatchBattle({ type: "USE_POTION" });
      playSound("heal");
      scheduleAnimationDone();
      return;
    }
    if (item === "shield") {
      if (battle.items.shield <= 0 || battle.shieldActive) return;
      dispatchBattle({ type: "USE_SHIELD" });
      playSound("shield");
      return;
    }
    // Hint: the battle layer consumes the item, the quiz layer eliminates one
    // wrong option (no lives lost, no damage — it is a reward, not a guess).
    const candidates = hintCandidates();
    if (battle.items.hint <= 0 || candidates.length === 0) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    setHintedOptionIds((prev) => [...prev, pick]);
    dispatchBattle({ type: "USE_HINT" });
    playSound("powerup");
  }

  function handleChooseReward(item: PowerUpKind) {
    dispatchBattle({ type: "CHOOSE_REWARD", item });
    playSound("powerup");
  }

  function handleNext() {
    setTriedOptionIds([]);
    setHintedOptionIds([]);
    setLastWrongWasBlocked(false);
    setStatus("active");
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
    return Math.round(
      ((currentIndex + (status !== "active" ? 1 : 0)) / round.length) * 100,
    );
  }, [currentIndex, round.length, status]);

  if (phase === "settings") {
    const selectedHero = getHeroById(selectedHeroId);
    const stepIndex = SETTINGS_STEPS.indexOf(settingsStep);

    function goBackStep() {
      if (stepIndex === 0) {
        router.back();
        return;
      }
      setSettingsStep(SETTINGS_STEPS[Math.max(0, stepIndex - 1)]);
    }

    async function goNextStep() {
      await enterImmersiveMode();
      setSettingsStep(
        SETTINGS_STEPS[Math.min(SETTINGS_STEPS.length - 1, stepIndex + 1)],
      );
    }

    return (
      <main className="quiz-wizard fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-violet-200 via-indigo-100 to-sky-200 px-3 py-3">
        <div className="quiz-wizard-card flex h-full w-full max-w-5xl flex-col rounded-3xl border-4 border-white bg-white/95 p-4 shadow-xl sm:p-6">
          <div className="shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-left">
              <span className="text-2xl" aria-hidden>
                {chapter.emoji}
              </span>
              <div>
                <h2 className="text-lg font-extrabold leading-tight text-slate-800 sm:text-xl">
                  {chapter.title}
                </h2>
                <p className="text-xs font-semibold text-slate-500 sm:text-sm">
                  {chapter.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5" aria-hidden>
              {SETTINGS_STEPS.map((step, i) => (
                <span
                  key={step}
                  className={`h-2.5 w-2.5 rounded-full ${
                    i <= stepIndex ? "bg-violet-600" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
            {settingsStep === "hero" && (
              <div className="flex w-full max-w-3xl flex-col items-center">
                <p className="mb-3 font-bold text-slate-600">
                  Pilih petualangmu 🦸
                </p>
                <div className="grid w-full grid-cols-3 gap-4 sm:gap-6">
                  {HEROES.map((hero) => {
                    const active = selectedHeroId === hero.id;
                    return (
                      <button
                        key={hero.id}
                        type="button"
                        onClick={() => {
                          setSelectedHeroId(hero.id);
                          void goNextStep();
                        }}
                        aria-pressed={active}
                        className={`rounded-3xl border-2 p-3 sm:p-4 transition-all ${
                          active
                            ? "border-violet-600 bg-violet-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-violet-300"
                        }`}
                      >
                        <Image
                          src={hero.assets.idle}
                          alt={hero.name}
                          width={480}
                          height={480}
                          unoptimized
                          className="mx-auto h-20 w-20 object-contain sm:h-28 sm:w-28"
                        />
                        <span className="block font-extrabold text-slate-700">
                          {hero.name}
                        </span>
                        <span className="block text-xs font-semibold text-slate-400">
                          {hero.tagline}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {settingsStep === "count" && (
              <div className="flex w-full max-w-3xl flex-col items-center">
                <p className="mb-3 font-bold text-slate-600">
                  Mau main berapa soal?
                </p>
                <div className="flex w-full flex-wrap justify-center gap-4">
                  {countChoices.map((choice) => {
                    const value = resolveChoice(choice, maxCount);
                    const label =
                      choice === "all"
                        ? `Semua (${maxCount})`
                        : `${value} soal`;
                    const active = questionCount === value;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => {
                          setQuestionCount(value);
                          void goNextStep();
                        }}
                        className={`rounded-full border-2 px-7 py-3.5 text-lg font-bold transition-colors ${
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
              </div>
            )}

            {settingsStep === "difficulty" && (
              <div className="flex w-full max-w-3xl flex-col items-center">
                <p className="mb-3 font-bold text-slate-600">
                  Pilih tingkat kesulitan 🎯
                </p>
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                  {DIFFICULTIES.map((d) => {
                    const active = selectedDifficulty === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setSelectedDifficulty(d.id);
                          void goNextStep();
                        }}
                        aria-pressed={active}
                        className={`rounded-3xl border-2 p-4 text-center transition-all ${
                          active
                            ? "border-violet-600 bg-violet-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-violet-300"
                        }`}
                      >
                        <span className="block text-3xl" aria-hidden>
                          {d.emoji}
                        </span>
                        <span className="block font-extrabold text-slate-700">
                          {d.label}
                        </span>
                        <span className="block text-xs font-semibold text-slate-400">
                          {d.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {settingsStep === "confirm" && (
              <div className="flex w-full max-w-3xl flex-col items-center text-center">
                <Image
                  src={selectedHero.assets.idle}
                  alt={selectedHero.name}
                  width={480}
                  height={480}
                  unoptimized
                  className="h-20 w-20 object-contain sm:h-24 sm:w-24"
                />
                <p className="mt-1 text-lg font-extrabold text-slate-700">
                  {selectedHero.name}
                </p>
                <p className="mb-3 font-semibold text-slate-500">
                  {questionCount} soal ·{" "}
                  {DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.emoji}{" "}
                  {DIFFICULTIES.find((d) => d.id === selectedDifficulty)?.label}
                </p>
                <p className="mb-6 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                  ⚔️ Monster dan arena akan dipilih otomatis sesuai
                  petualanganmu!
                </p>
                <div className="flex w-full flex-wrap justify-center gap-3">
                  <Link
                    href={`/adventure/${chapter.id}?count=${questionCount}&hero=${selectedHeroId}&difficulty=${selectedDifficulty}`}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3 text-lg shadow-md transition-colors"
                  >
                    🌲 Ayo Berpetualang!
                  </Link>
                  <Link
                    href={`/materi/${chapter.id}`}
                    className="rounded-full bg-white border-2 border-violet-600 hover:bg-violet-50 text-violet-700 font-bold px-6 py-3 text-lg shadow-sm transition-colors"
                  >
                    📖 Baca Materi Dulu
                  </Link>
                  {/* <Link
                    href="/"
                    className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 text-lg shadow-sm transition-colors"
                  >
                    🏠 Kembali
                  </Link> */}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={goBackStep}
              className="rounded-full bg-slate-100 px-6 py-3 text-lg font-bold text-slate-600 hover:bg-slate-200"
            >
              ⬅️ Kembali
            </button>
          </div>
        </div>
      </main>
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

      <BattleStage
        battle={battle}
        hero={getHeroById(battle.heroId)}
        monster={getMonsterById(battle.monsterId)}
        canUseHint={hintCandidates().length > 0}
        onUseItem={handleUseItem}
        onChooseReward={handleChooseReward}
      />

      <QuestionCard
        questionNumber={currentIndex + 1}
        totalQuestions={round.length}
        question={currentQuestion.question}
        image={currentQuestion.image}
        imageAlt={currentQuestion.imageAlt}
        options={currentQuestion.shuffledOptions}
        correctOptionId={currentQuestion.correctOptionId}
        triedOptionIds={triedOptionIds}
        eliminatedOptionIds={hintedOptionIds}
        lastWrongWasBlocked={lastWrongWasBlocked}
        status={status}
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
