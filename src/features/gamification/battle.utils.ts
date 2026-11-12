import { BATTLE_CONFIG } from "./battle.config";
import type { BattleStatus } from "./battle.types";

/** Clamp HP into [0, max] and round to 2 decimals so float drift never shows up in the UI. */
export function clampHp(value: number, max: number = BATTLE_CONFIG.initialMonsterHp): number {
  const clamped = Math.min(max, Math.max(0, value));
  const rounded = Math.round(clamped * 100) / 100;
  // Anything within one display cent of an edge snaps exactly onto it
  // (e.g. repeated subtraction of 100 / 3 leaves 0.01, never a real HP value).
  if (rounded <= 0.01) return 0;
  if (max - rounded <= 0.01) return max;
  return rounded;
}

/** Fair-share damage dealt to the monster by one correctly answered question. */
export function calculateMonsterDamage(totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return BATTLE_CONFIG.initialMonsterHp / totalQuestions;
}

/**
 * Monster HP derived from a count of correct answers under the fair split.
 * Kept for the no-schedule fallback path; the randomised schedule path in the
 * reducer subtracts per-question slots instead.
 */
export function monsterHpAfterCorrectAnswers(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return BATTLE_CONFIG.initialMonsterHp;
  if (correctAnswers >= totalQuestions) return 0;
  return clampHp(
    BATTLE_CONFIG.initialMonsterHp - correctAnswers * calculateMonsterDamage(totalQuestions)
  );
}

/** Hero HP after `wrongAttempts` incorrect answers at the flat average rate. */
export function heroHpAfterWrongAnswers(wrongAttempts: number): number {
  return clampHp(
    BATTLE_CONFIG.initialHeroHp - wrongAttempts * BATTLE_CONFIG.heroDamagePerWrongAnswer,
    BATTLE_CONFIG.initialHeroHp
  );
}

export function getBattleStatus(
  heroHp: number,
  monsterHp: number,
  completed: boolean
): BattleStatus {
  if (completed) return "completed";
  if (monsterHp <= 0) return "monster_defeated";
  if (heroHp <= 0) return "hero_exhausted";
  return "playing";
}

/** HP shown to children: whole numbers (the bar width still uses the precise value). */
export function displayHp(hp: number): number {
  return Math.round(hp);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Randomised monster damage, one slot per question.
 *
 * Each slot is the fair share (100 / totalQuestions) scaled by a random
 * factor in [1 - variance, 1 + variance]; the slots are then normalised so
 * they sum to EXACTLY 100 (the last slot absorbs the rounding remainder).
 * Answering every question correctly therefore always defeats the monster,
 * while individual hits feel varied — some questions hit harder than others.
 */
export function generateMonsterDamageSchedule(
  totalQuestions: number,
  rng: () => number = Math.random
): number[] {
  if (totalQuestions <= 0) return [];
  if (totalQuestions === 1) return [BATTLE_CONFIG.initialMonsterHp];
  const variance = BATTLE_CONFIG.monsterDamageVariance;
  const fair = calculateMonsterDamage(totalQuestions);
  const scaled = Array.from({ length: totalQuestions }, () =>
    fair * (1 - variance + rng() * variance * 2)
  );
  const sum = scaled.reduce((a, b) => a + b, 0);
  const schedule = scaled.map((v) => round2((v / sum) * BATTLE_CONFIG.initialMonsterHp));
  const remainder = round2(BATTLE_CONFIG.initialMonsterHp - schedule.reduce((a, b) => a + b, 0));
  schedule[schedule.length - 1] = round2(schedule[schedule.length - 1] + remainder);
  return schedule;
}

/**
 * Randomised hero damage for incorrect attempts.
 *
 * Values are integers in [heroDamageMin, heroDamageMax], generated in
 * balanced pairs (a, 2*avg - a) so every pair sums to exactly 2 * avg —
 * the long-run total matches the old flat rate exactly, hits just vary.
 */
export function generateHeroDamagePattern(
  length: number,
  rng: () => number = Math.random
): number[] {
  const avg = BATTLE_CONFIG.heroDamagePerWrongAnswer;
  const min = BATTLE_CONFIG.heroDamageMin;
  const span = BATTLE_CONFIG.heroDamageMax - min + 1;
  const pattern: number[] = [];
  while (pattern.length < length) {
    const a = min + Math.floor(rng() * span);
    const b = avg * 2 - a;
    if (pattern.length + 1 >= length) {
      pattern.push(avg);
      break;
    }
    // Randomise the order within the pair so sequences don't look patterned.
    if (rng() < 0.5) pattern.push(a, b);
    else pattern.push(b, a);
  }
  return pattern.slice(0, length);
}
