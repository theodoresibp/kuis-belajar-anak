"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import type { QuizChapter, QuizQuestion } from "@/types/quiz";
import QuestionCard from "@/components/QuestionCard";
import BattleStage from "@/components/gamification/BattleStage";
import { BATTLE_CONFIG, getHeroById, getMonsterById } from "@/features/gamification/battle.config";
import type { BattleState, DamageEvent, HeroAnimation, MonsterAnimation } from "@/features/gamification/battle.types";
import AdventureGameCanvas from "./AdventureGameCanvas";
import type { AdventureEncounter } from "@/game/adventure/AdventureScene";
import {
  adventureReducer,
  createInitialAdventureRunState,
} from "@/features/adventure/adventure.reducer";
import { generateEncounterPlan } from "@/features/adventure/encounter-generator";
import { getAdventureMonsterById } from "@/features/adventure/monsters.config";
import { setMusicTrack, startMusic, stopMusic, trackForTier } from "@/features/adventure/music";
import { playSound } from "@/features/gamification/sound";
import { shuffle } from "@/lib/shuffle";

interface Props {
  chapter: QuizChapter;
  questionCount?: number;
  heroId?: string;
}

/** Battle popup artwork lives in the gamification monster set; until
 *  Sprint D, adventure monsters borrow the closest battle counterpart
 *  (their display name still comes from the plan). */
function battleMonsterIdFor(encounter: AdventureEncounter): string {
  if (encounter.monsterId === "forest-slime") return "slime";
  if (encounter.monsterId === "forest-fox") return "fox";
  if (encounter.monsterId === "purple-dragon") return "purple-dragon";
  return encounter.tier === "normal"
    ? "slime"
    : encounter.tier === "elite"
      ? "fox"
      : "purple-dragon";
}

export default function AdventureMode({ chapter, questionCount, heroId = "bimo" }: Props) {
  // Keep question selection deterministic so server and client render identically.
  const selectedCount = Math.max(
    1,
    Math.min(questionCount ?? chapter.questions.length, chapter.questions.length),
  );
  const questions = chapter.questions.slice(0, selectedCount);

  // Answer options are shuffled once, when the first encounter starts.
  // The chapter data authors the correct option first (every question's
  // correctOptionId is "a"), so without shuffling the correct answer
  // would always sit at position A — Quiz Mode shuffles in its round
  // setup. Doing it at encounter time (an event, not an effect/render)
  // keeps the server-rendered HTML identical to the first client render:
  // options only ever appear inside the battle dialog.
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[] | null>(null);
  const activeQuestions = shuffledQuestions ?? questions;

  // The whole run — monsters, order, question split, HP — comes from the
  // encounter generator (Sprint C), seeded by the chapter so a chapter
  // always plays the same. Since Sprint D every monster has artwork, so
  // the generator fields the full pool.
  const plan = useMemo(
    () => generateEncounterPlan(questions.length, { seed: chapter.id }),
    [chapter.id, questions.length],
  );
  const encounterCount = plan.length;
  const encounterQuestionCounts = plan.map((encounter) => encounter.questionCount);

  const [run, dispatch] = useReducer(
    adventureReducer,
    plan[0]?.monsterMaxHp ?? BATTLE_CONFIG.initialMonsterHp,
    createInitialAdventureRunState,
  );
  const [activeEncounter, setActiveEncounter] = useState<AdventureEncounter | null>(null);
  const [resolveActiveEncounter, setResolveActiveEncounter] = useState<(() => void) | null>(null);
  const [triedOptionIds, setTriedOptionIds] = useState<string[]>([]);
  const [questionStatus, setQuestionStatus] = useState<"active" | "correct">("active");
  const [bossWarning, setBossWarning] = useState(false);
  const [battleVisual, setBattleVisual] = useState<{ hero: HeroAnimation; monster: MonsterAnimation; lastDamage: DamageEvent | null }>({ hero: "idle", monster: "idle", lastDamage: null });
  const damageEventId = useRef(0);

  useEffect(() => {
    if (battleVisual.hero === "idle" && battleVisual.monster === "idle" && !battleVisual.lastDamage) return;
    const timer = window.setTimeout(() => {
      setBattleVisual({ hero: "idle", monster: "idle", lastDamage: null });
    }, BATTLE_CONFIG.animationDurationMs);
    return () => window.clearTimeout(timer);
  }, [battleVisual]);

  // Background music: browsers only allow audio after a user gesture,
  // so start on the first pointer/key interaction (startMusic also
  // tries immediately — the context simply stays suspended until then).
  useEffect(() => {
    startMusic();
    const kick = () => startMusic();
    window.addEventListener("pointerdown", kick);
    window.addEventListener("keydown", kick);
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      stopMusic();
    };
  }, []);

  // The music follows the fight: exploring is calm, and each battle
  // tier gets its own intensity (see features/adventure/music.ts).
  useEffect(() => {
    setMusicTrack(
      activeEncounter && run.status === "encounter"
        ? trackForTier(activeEncounter.tier)
        : "explore",
    );
  }, [activeEncounter, run.status]);

  // Run-end stingers.
  const prevRunStatus = useRef(run.status);
  useEffect(() => {
    if (prevRunStatus.current === run.status) return;
    prevRunStatus.current = run.status;
    if (run.status === "victory") playSound("victory");
    if (run.status === "defeat") playSound("finish");
  }, [run.status]);

  const questionStart = encounterQuestionCounts
    .slice(0, run.encounterIndex)
    .reduce((total, count) => total + count, 0);
  const currentEncounterQuestionCount =
    encounterQuestionCounts[run.encounterIndex] ?? 0;
  const localQuestionIndex = run.currentQuestionIndex - questionStart;
  const currentQuestion = activeQuestions[run.currentQuestionIndex];
  const isLastQuestionOfEncounter =
    localQuestionIndex === currentEncounterQuestionCount - 1;
  const isFinalEncounter = run.encounterIndex === encounterCount - 1;

  function handleEncounter(
    encounter: AdventureEncounter,
    resolve: () => void,
  ) {
    if (!shuffledQuestions) {
      setShuffledQuestions(
        questions.map((question) => ({
          ...question,
          options: shuffle(question.options),
        })),
      );
    }
    setActiveEncounter(encounter);
    setResolveActiveEncounter(() => resolve);
    setTriedOptionIds([]);
    setQuestionStatus("active");
    setBattleVisual({ hero: "idle", monster: "idle", lastDamage: null });
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
      // Per-question damage scales with this monster's HP; the encounter's
      // last question always deals exactly the remaining HP.
      const damage = isLastQuestionOfEncounter
        ? run.monsterHp
        : Math.round((run.monsterMaxHp / currentEncounterQuestionCount) * 100) / 100;

      dispatch({ type: "CORRECT_ANSWER", damage });
      damageEventId.current += 1;
      playSound("correct");
      playSound("heroAttack");
      setBattleVisual({
        hero: "attack",
        monster: damage >= run.monsterHp ? "defeat" : "hurt",
        lastDamage: { id: damageEventId.current, target: "monster", amount: damage, kind: "damage" },
      });
      setQuestionStatus("correct");
      return;
    }

    setTriedOptionIds((previous) => [...previous, optionId]);
    dispatch({ type: "WRONG_ANSWER" });
    playSound("wrong");
    playSound(
      activeEncounter && (activeEncounter.tier === "mini-boss" || activeEncounter.tier === "final-boss")
        ? "bossAttack"
        : "monsterAttack",
    );
    damageEventId.current += 1;
    setBattleVisual({
      hero: run.heroHp <= BATTLE_CONFIG.heroDamagePerWrongAnswer ? "exhausted" : "hurt",
      monster: "attack",
      lastDamage: { id: damageEventId.current, target: "hero", amount: BATTLE_CONFIG.heroDamagePerWrongAnswer, kind: "damage" },
    });
  }

  function handleBossAttack() {
    const damage = activeEncounter?.attackDamage ?? 15;
    const blocked = run.shieldCharges > 0;
    playSound(blocked ? "blocked" : "bossAttack");
    dispatch({ type: "BOSS_ATTACK", damage });
    damageEventId.current += 1;
    setBattleVisual({
      hero: "hurt",
      monster: "attack",
      lastDamage: {
        id: damageEventId.current,
        target: "hero",
        amount: blocked ? 0 : damage,
        kind: blocked ? "blocked" : "damage",
      },
    });
  }

  function handleContinue() {
    if (run.monsterHp > 0 || !resolveActiveEncounter) return;

    resolveActiveEncounter();
    setActiveEncounter(null);
    setResolveActiveEncounter(null);
    setTriedOptionIds([]);
    setQuestionStatus("active");
    setBattleVisual({ hero: "idle", monster: "idle", lastDamage: null });

    if (isFinalEncounter) {
      dispatch({ type: "VICTORY" });
      return;
    }

    playSound("finish");

    dispatch({
      type: "NEXT_ENCOUNTER",
      monsterMaxHp: plan[run.encounterIndex + 1]?.monsterMaxHp,
    });
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
                Sprint 7 • Character & Monster Artwork
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">
              Enchanted Forest
            </h1>
            <p className="mt-1 max-w-xl text-sm font-medium text-emerald-800 sm:text-base">
              Jelajahi hutan, hindari rintangan, dan kalahkan monster dengan menjawab soal.
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
              plan={plan}
              heroId={heroId}
              heroHp={heroHpPercent}
              score={run.score}
              totalQuestions={questions.length}
              monsterProgress={Math.min(run.encounterIndex + (run.status === "victory" ? 1 : 0), encounterCount)}
              shieldCharges={run.shieldCharges}
              isDefeated={run.status === "defeat"}
              onEncounter={handleEncounter}
              onAdventureComplete={() => dispatch({ type: "VICTORY" })}
              onHazard={() => dispatch({ type: "HAZARD" })}
              onPickup={(kind) => {
                playSound(kind === "heart" ? "heal" : "shield");
                dispatch({ type: kind === "heart" ? "COLLECT_HEART" : "COLLECT_SHIELD" });
              }}
              onBossWarning={setBossWarning}
              onBossAttack={handleBossAttack}
            />
          </div>
        </section>



        {activeEncounter && run.status === "encounter" && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-label={"Pertarungan melawan " + activeEncounter.name}
          >
            <section className="max-h-[96vh] w-full max-w-3xl overflow-y-auto rounded-3xl border-4 border-amber-200 bg-gradient-to-b from-amber-50 to-white p-3 shadow-2xl sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-amber-700">Monster Encounter</p>
                  <h2 className="text-xl font-black text-slate-900 sm:text-2xl">⚔️ {activeEncounter.name}</h2>
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-700">HP {monsterHpPercent}/{run.monsterMaxHp}</span>
              </div>

              {activeEncounter.attackDamage > 0 && (
                <div className={"mb-3 rounded-2xl border-2 px-4 py-3 text-center transition-colors " + (bossWarning ? "animate-pulse border-red-500 bg-red-100 text-red-800" : "border-violet-200 bg-violet-50 text-violet-800")}>
                  <p className="font-black">
                    {bossWarning
                      ? `⚠️ ${activeEncounter.name.toUpperCase()} SEDANG MENYIAPKAN SERANGAN!`
                      : activeEncounter.tier === "final-boss"
                        ? `👑 BOSS FINAL — ${activeEncounter.name.toUpperCase()}`
                        : `🔥 MINI-BOSS — ${activeEncounter.name.toUpperCase()}`}
                  </p>
                  <p className="mt-1 text-xs font-semibold">
                    {bossWarning ? "Bersiap! Serangan datang sebentar lagi." : `Jawab soal secepat mungkin. Boss menyerang secara berkala dengan ${activeEncounter.attackDamage} damage!`}
                  </p>
                </div>
              )}

              <BattleStage
                battle={{
                  totalQuestions: questions.length,
                  currentQuestionIndex: run.currentQuestionIndex,
                  correctAnswers: run.score,
                  wrongAttempts: 0,
                  correctStreak: 0,
                  heroHp: run.heroHp,
                  monsterHp: run.monsterHp,
                  monsterMaxHp: run.monsterMaxHp,
                  currentQuestionDamaged: questionStatus === "correct",
                  heroAnimation: battleVisual.hero,
                  monsterAnimation: run.monsterHp <= 0 ? "defeat" : battleVisual.monster,
                  battleStatus: run.heroHp <= 0 ? "hero_exhausted" : run.monsterHp <= 0 ? "monster_defeated" : "playing",
                  lastDamage: battleVisual.lastDamage,
                  items: { potion: 0, shield: 0, hint: 0 },
                  powerUpChoices: 0,
                  shieldActive: false,
                  heroId,
                  monsterId: battleMonsterIdFor(activeEncounter),
                  monsterDamageSchedule: [],
                  heroDamagePattern: [],
                } satisfies BattleState}
                hero={getHeroById(heroId)}
                monster={{
                  // Arena background + dialogue identity come from the
                  // gamification counterpart; the artwork, name and emoji
                  // are the adventure monster the player actually met
                  // (Sprint D — all eleven have their own poses now).
                  ...getMonsterById(battleMonsterIdFor(activeEncounter)),
                  name: activeEncounter.name,
                  fallbackEmoji: activeEncounter.emoji,
                  assets: getAdventureMonsterById(activeEncounter.monsterId).assets,
                }}
              />

              {currentQuestion && (
                <div className="mt-3 rounded-3xl border-2 border-violet-200 bg-white p-3 shadow-lg sm:p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-violet-800">🧠 Jawab untuk menyerang!</p>
                    <span className="text-xs font-bold text-slate-500">Soal {run.currentQuestionIndex + 1}/{questions.length}</span>
                  </div>
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
                    hideExplanation
                    onSelect={handleAnswer}
                  />
                </div>
              )}

            </section>
          </div>
        )}

        {/* Popup hasil jawaban: penjelasan + tombol lanjut jadi satu,
            supaya pemain tidak perlu scroll di dalam popup pertarungan. */}
        {activeEncounter && run.status === "encounter" && questionStatus === "correct" && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-label="Hasil jawaban"
          >
            <section className="w-full max-w-md rounded-3xl border-4 border-amber-200 bg-white p-6 text-center shadow-2xl">
              <div className="text-5xl">{run.monsterHp <= 0 ? "🏆" : "🎉"}</div>
              <h2 className="mt-2 text-2xl font-black text-emerald-700">
                {run.monsterHp <= 0
                  ? `${activeEncounter.name} berhasil dikalahkan!`
                  : "Jawaban Benar!"}
              </h2>

              {currentQuestion?.explanation && (
                <div className="mt-4 rounded-2xl border-2 border-yellow-200 bg-yellow-50 px-4 py-3 text-left text-sm text-yellow-900 sm:text-base">
                  <span className="font-bold">💡 Tahukah kamu? </span>
                  {currentQuestion.explanation}
                </div>
              )}

              {run.monsterHp > 0 ? (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="mt-5 w-full rounded-full bg-violet-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-violet-700"
                >
                  Soal Berikutnya →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-5 w-full rounded-full bg-emerald-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-emerald-700"
                >
                  {isFinalEncounter ? "Selesaikan Petualangan 🏆" : "Lanjutkan Perjalanan →"}
                </button>
              )}
            </section>
          </div>
        )}

        {(run.status === "defeat" || run.status === "victory") && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="adventure-result-title"
          >
            {run.status === "victory" ? (
              <section className="w-full max-w-lg rounded-3xl border-4 border-amber-200 bg-gradient-to-b from-amber-50 to-white p-7 text-center shadow-2xl sm:p-9">
                <div className="text-6xl">🏆</div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-amber-700">Adventure Completed</p>
                <h2 id="adventure-result-title" className="mt-2 text-3xl font-black text-emerald-800">
                  Game Selesai!
                </h2>
                <p className="mt-3 text-slate-600">
                  Hebat! Kamu berhasil melewati {encounterCount} monster dan menjawab {run.score} soal dengan benar.
                </p>
                <Link
                  href="/"
                  className="mt-6 inline-flex w-full justify-center rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-md transition hover:bg-emerald-700"
                >
                  Kembali ke Beranda
                </Link>
              </section>
            ) : (
              <section className="w-full max-w-lg rounded-3xl border-4 border-red-200 bg-gradient-to-b from-red-50 to-white p-7 text-center shadow-2xl sm:p-9">
                <div className="text-6xl">💔</div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-red-700">Adventure Over</p>
                <h2 id="adventure-result-title" className="mt-2 text-3xl font-black text-red-700">
                  Petualangan Terhenti
                </h2>
                <p className="mt-3 text-slate-600">
                  HP petualang habis. Tidak apa-apa, coba lagi dan pilih jawaban dengan lebih teliti, ya!
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-6 w-full rounded-full bg-violet-600 px-8 py-3 font-bold text-white shadow-md transition hover:bg-violet-700"
                >
                  Ulangi Petualangan
                </button>
                <Link
                  href="/"
                  className="mt-3 inline-flex w-full justify-center rounded-full border-2 border-slate-200 bg-white px-8 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Kembali ke Beranda
                </Link>
              </section>
            )}
          </div>
        )}

        {!activeEncounter && run.status === "exploring" && (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
            Hindari duri merah dengan melompat. Ambil kristal hati untuk memulihkan 15 HP dan perisai biru untuk memblokir satu serangan. Dekati monster untuk memulai kuis. Efek suara aktif setelah kamu menyentuh layar atau menekan keyboard.
          </p>
        )}

        <footer className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-center">
          <p className="text-xs font-semibold text-emerald-800">
            Sprint 7 — gunakan karakter pilihanmu dan hadapi monster hutan pada bab {chapter.title}.
          </p>
        </footer>
      </div>
    </main>
  );
}
