import { BATTLE_CONFIG } from "./battle.config";
import type { BattleStatus } from "./battle.types";

/** Clamp HP into [0, max] and round to 2 decimals so float drift never shows up in the UI. */
export function clampHp(value: number, max: number = BATTLE_CONFIG.initialMonsterHp): number {
  const clamped = Math.min(max, Math.max(0, value));
  const rounded = Math.round(clamped * 100) / 100;
  // Anything within epsilon of an edge snaps exactly onto it (e.g. 100 - 3 * (100 / 3)).
  if (rounded < 0.01) return 0;
  if (max - rounded < 0.01) return max;
  return rounded;
}

/** Damage dealt to the monster by one correctly answered question. */
export function calculateMonsterDamage(totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return BATTLE_CONFIG.initialMonsterHp / totalQuestions;
}

/**
 * Monster HP is derived from the number of questions answered correctly,
 * not accumulated by repeated subtraction — repeated float subtraction drifts,
 * this formula only needs the final value clamped to exactly 0.
 */
export function monsterHpAfterCorrectAnswers(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return BATTLE_CONFIG.initialMonsterHp;
  if (correctAnswers >= totalQuestions) return 0;
  return clampHp(
    BATTLE_CONFIG.initialMonsterHp - correctAnswers * calculateMonsterDamage(totalQuestions)
  );
}

/** Hero HP after `wrongAttempts` incorrect answers across the whole session. */
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
