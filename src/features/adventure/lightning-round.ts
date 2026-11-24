/**
 * Sprint 5 (Ronde Kilat): a 30-second rapid-fire bonus round that
 * runs when the player crosses into a new zone — chained after the
 * zone's owl panel, while the scene is still paused.
 *
 * It is a bonus in the same sense as the treasure chest: questions
 * come from the run's own bank, wrong picks only mark the option,
 * and nothing here touches the encounter queue, the battle score or
 * the hero's HP. The only prize is shields, banked through the
 * reducer's ordinary COLLECT_SHIELD action: 1 shield per 3 correct
 * answers. Running out of time (or questions) is never a failure.
 */

import type { QuizQuestion } from "@/types/quiz";
import type { OwlStopKind } from "./owl";

export const LIGHTNING_DURATION_SECONDS = 30;

/** The queue never needs to be longer than a fast player can answer. */
export const LIGHTNING_MAX_QUESTIONS = 12;

/** Correct answers needed per shield earned. */
export const LIGHTNING_SHIELD_EVERY = 3;

export function shieldsEarned(correctCount: number): number {
  return Math.floor(Math.max(0, correctCount) / LIGHTNING_SHIELD_EVERY);
}

/**
 * The round belongs BETWEEN zones: it triggers on the owl stops
 * that announce entering Pantai (recall) and Kastil (boss tip).
 * The first zone's material/intro stop never triggers it, so a
 * boss-only run (material stop only) has no lightning round.
 */
export function shouldTriggerLightningRound(kind: OwlStopKind): boolean {
  return kind === "recall" || kind === "boss-tip";
}

function shuffledCopy<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Builds the round's question queue: up to LIGHTNING_MAX_QUESTIONS
 * questions drawn from the bank in random order, each with its
 * options shuffled. The bank itself is never mutated.
 */
export function buildLightningQueue(
  bank: readonly QuizQuestion[],
  rng: () => number = Math.random,
): QuizQuestion[] {
  return shuffledCopy(bank, rng)
    .slice(0, LIGHTNING_MAX_QUESTIONS)
    .map((question) => ({
      ...question,
      options: shuffledCopy(question.options, rng),
    }));
}
