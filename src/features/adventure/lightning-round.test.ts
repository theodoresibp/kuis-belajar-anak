import { describe, expect, it } from "vitest";
import type { QuizQuestion } from "@/types/quiz";
import { mulberry32 } from "./encounter-generator";
import {
  LIGHTNING_MAX_QUESTIONS,
  buildLightningQueue,
  shieldsEarned,
  shouldTriggerLightningRound,
} from "./lightning-round";

function makeQuestion(n: number): QuizQuestion {
  return {
    id: `q${n}`,
    question: `Soal nomor ${n}?`,
    options: [
      { id: `q${n}-a`, text: "Pilihan A" },
      { id: `q${n}-b`, text: "Pilihan B" },
      { id: `q${n}-c`, text: "Pilihan C" },
      { id: `q${n}-d`, text: "Pilihan D" },
    ],
    correctOptionId: `q${n}-a`,
    explanation: "Penjelasan",
  } as QuizQuestion;
}

describe("shouldTriggerLightningRound", () => {
  it("triggers only on zone transitions (recall and boss tip)", () => {
    expect(shouldTriggerLightningRound("recall")).toBe(true);
    expect(shouldTriggerLightningRound("boss-tip")).toBe(true);
    expect(shouldTriggerLightningRound("material")).toBe(false);
    expect(shouldTriggerLightningRound("intro")).toBe(false);
  });
});

describe("shieldsEarned", () => {
  it("awards one shield per three correct answers", () => {
    expect(shieldsEarned(0)).toBe(0);
    expect(shieldsEarned(2)).toBe(0);
    expect(shieldsEarned(3)).toBe(1);
    expect(shieldsEarned(5)).toBe(1);
    expect(shieldsEarned(6)).toBe(2);
    expect(shieldsEarned(11)).toBe(3);
    expect(shieldsEarned(-4)).toBe(0);
  });
});

describe("buildLightningQueue", () => {
  const bank = Array.from({ length: 20 }, (_, i) => makeQuestion(i + 1));

  it("caps the queue and draws only from the bank", () => {
    const queue = buildLightningQueue(bank, mulberry32(42));
    expect(queue).toHaveLength(LIGHTNING_MAX_QUESTIONS);
    queue.forEach((question) => {
      expect(bank.some((item) => item.id === question.id)).toBe(true);
    });
    expect(new Set(queue.map((q) => q.id)).size).toBe(queue.length);
  });

  it("uses the whole bank when it is smaller than the cap", () => {
    const small = bank.slice(0, 5);
    expect(buildLightningQueue(small, mulberry32(7))).toHaveLength(5);
    expect(buildLightningQueue([], mulberry32(7))).toEqual([]);
  });

  it("keeps every option, only reordered, and never mutates the bank", () => {
    const snapshot = JSON.stringify(bank);
    const queue = buildLightningQueue(bank, mulberry32(3));
    queue.forEach((question) => {
      const original = bank.find((item) => item.id === question.id);
      expect(
        question.options.map((option) => option.id).sort(),
      ).toEqual(original?.options.map((option) => option.id).sort());
      expect(question.correctOptionId).toBe(original?.correctOptionId);
    });
    expect(JSON.stringify(bank)).toBe(snapshot);
  });

  it("is deterministic for a given rng seed", () => {
    const a = buildLightningQueue(bank, mulberry32(99));
    const b = buildLightningQueue(bank, mulberry32(99));
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
});
