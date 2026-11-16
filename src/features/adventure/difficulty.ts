/**
 * Adventure Mode difficulty presets. "hard" preserves the original tuning
 * (boss attacks every 12s with a 2.5s warning, full damage); "medium" and
 * "easy" slow the boss down and soften its hits for younger players.
 */

export type Difficulty = "easy" | "medium" | "hard";

export interface DifficultySettings {
  id: Difficulty;
  label: string;
  emoji: string;
  description: string;
  /** Milliseconds between boss timed-attack warnings (lower = faster boss). */
  bossAttackIntervalMs: number;
  /** Milliseconds between the warning flash and the actual strike. */
  bossAttackWarningMs: number;
  /** Multiplies boss timed-attack damage and wrong-answer damage. */
  damageMultiplier: number;
}

export const DIFFICULTIES: DifficultySettings[] = [
  {
    id: "easy",
    label: "Mudah",
    emoji: "🌱",
    description: "Boss lebih santai dan pukulannya ringan. Cocok untuk pemula.",
    bossAttackIntervalMs: 22000,
    bossAttackWarningMs: 4000,
    damageMultiplier: 0.5,
  },
  {
    id: "medium",
    label: "Sedang",
    emoji: "⚔️",
    description: "Tantangan seimbang, tidak terlalu cepat.",
    bossAttackIntervalMs: 16000,
    bossAttackWarningMs: 3200,
    damageMultiplier: 0.75,
  },
  {
    id: "hard",
    label: "Sulit",
    emoji: "🔥",
    description: "Boss menyerang cepat dan keras, untuk yang sudah jago.",
    bossAttackIntervalMs: 12000,
    bossAttackWarningMs: 2500,
    damageMultiplier: 1,
  },
];

export const DEFAULT_DIFFICULTY: Difficulty = "medium";

export function getDifficulty(id: string | undefined): DifficultySettings {
  return (
    DIFFICULTIES.find((d) => d.id === id) ??
    DIFFICULTIES.find((d) => d.id === DEFAULT_DIFFICULTY)!
  );
}
