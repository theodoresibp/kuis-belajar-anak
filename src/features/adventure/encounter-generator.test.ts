import { describe, expect, it } from "vitest";
import { generateEncounterPlan } from "./encounter-generator";
import { getAdventureMonsterById } from "./monsters.config";

const tiersOf = (n: number, seed = "bab-uji") =>
  generateEncounterPlan(n, { seed }).map((encounter) => encounter.tier);
const countsOf = (n: number, seed = "bab-uji") =>
  generateEncounterPlan(n, { seed }).map((encounter) => encounter.questionCount);

describe("generateEncounterPlan — agreed run shapes", () => {
  it("5 questions: a single final-boss encounter", () => {
    const plan = generateEncounterPlan(5, { seed: "bab-uji" });
    expect(plan).toHaveLength(1);
    expect(plan[0].tier).toBe("final-boss");
    expect(plan[0].questionCount).toBe(5);
    expect(plan[0].monsterMaxHp).toBe(200);
  });

  it("10 questions: one 5-question encounter + boss with 5", () => {
    expect(countsOf(10)).toEqual([5, 5]);
    expect(tiersOf(10)).toEqual(["normal", "final-boss"]);
  });

  it("20 questions: 2x5 + boss with 10", () => {
    expect(countsOf(20)).toEqual([5, 5, 10]);
  });

  it("30 questions: 4x5 + boss with 10", () => {
    expect(countsOf(30)).toEqual([5, 5, 5, 5, 10]);
  });

  it("40 questions: tier pattern N,N,E,N,E,N + boss", () => {
    expect(countsOf(40)).toEqual([5, 5, 5, 5, 5, 5, 10]);
    expect(tiersOf(40)).toEqual([
      "normal",
      "normal",
      "elite",
      "normal",
      "elite",
      "normal",
      "final-boss",
    ]);
  });

  it("42 questions: uneven split differs by at most 1", () => {
    expect(countsOf(42)).toEqual([5, 5, 5, 5, 4, 4, 4, 10]);
  });

  it("50 questions: 8 non-boss encounters incl. one mini-boss", () => {
    const plan = generateEncounterPlan(50, { seed: "bab-uji" });
    expect(plan).toHaveLength(9);
    expect(plan.filter((e) => e.tier === "mini-boss")).toHaveLength(1);
    expect(plan.filter((e) => e.tier === "elite")).toHaveLength(3);
  });

  it("75 questions: 13x5 + boss 10, tiers 7N/5E/1MB", () => {
    const plan = generateEncounterPlan(75, { seed: "bab-uji" });
    expect(plan).toHaveLength(14);
    expect(plan.filter((e) => e.tier === "normal")).toHaveLength(7);
    expect(plan.filter((e) => e.tier === "elite")).toHaveLength(5);
    expect(plan.filter((e) => e.tier === "mini-boss")).toHaveLength(1);
    expect(plan[13].tier).toBe("final-boss");
    expect(plan[13].questionCount).toBe(10);
  });

  it("100 questions: 18x5 + boss 10, tiers 10N/7E/1MB", () => {
    const plan = generateEncounterPlan(100, { seed: "bab-uji" });
    expect(plan).toHaveLength(19);
    expect(plan.filter((e) => e.tier === "normal")).toHaveLength(10);
    expect(plan.filter((e) => e.tier === "elite")).toHaveLength(7);
    expect(plan.filter((e) => e.tier === "mini-boss")).toHaveLength(1);
  });

  it("HP and attack damage come from the monster definitions", () => {
    const plan = generateEncounterPlan(75, { seed: "bab-uji" });
    for (const encounter of plan) {
      const definition = getAdventureMonsterById(encounter.monsterId);
      expect(encounter.monsterMaxHp).toBe(definition.maxHp);
      expect(encounter.attackDamage).toBe(definition.attackDamage);
      expect(encounter.name).toBe(definition.name);
    }
    expect(plan.find((e) => e.tier === "mini-boss")?.attackDamage).toBe(12);
    expect(plan.find((e) => e.tier === "final-boss")?.attackDamage).toBe(15);
  });
});

describe("generateEncounterPlan — properties for every size", () => {
  it("holds for n = 1..120", () => {
    for (let n = 1; n <= 120; n += 1) {
      const plan = generateEncounterPlan(n, { seed: `bab-${n % 7}` });

      // Exact total, no empty encounters, indexes in order.
      expect(plan.reduce((sum, e) => sum + e.questionCount, 0)).toBe(n);
      expect(plan.every((e) => e.questionCount >= 1)).toBe(true);
      expect(plan.map((e) => e.index)).toEqual(plan.map((_, i) => i));

      // Exactly one final boss, always last.
      expect(plan.filter((e) => e.tier === "final-boss")).toHaveLength(1);
      expect(plan[plan.length - 1].tier).toBe("final-boss");

      // Never the same monster twice in a row (pools allow variety).
      for (let i = 1; i < plan.length; i += 1) {
        expect(plan[i].monsterId).not.toBe(plan[i - 1].monsterId);
      }

      if (n >= 10) {
        const nonBoss = plan.slice(0, -1);
        const counts = nonBoss.map((e) => e.questionCount);
        expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
        expect(plan[plan.length - 1].questionCount).toBe(n >= 20 ? 10 : 5);
        expect(nonBoss.filter((e) => e.tier === "mini-boss")).toHaveLength(
          nonBoss.length >= 8 ? 1 : 0,
        );
      }
    }
  });

  it("is deterministic for the same seed", () => {
    const first = generateEncounterPlan(60, { seed: "bab-3-musik" });
    const second = generateEncounterPlan(60, { seed: "bab-3-musik" });
    expect(second).toEqual(first);
  });

  it("varies the monster order between chapters", () => {
    const orders = ["bab-1", "bab-2", "bab-3", "bab-4", "bab-5"].map((seed) =>
      generateEncounterPlan(75, { seed })
        .map((e) => e.monsterId)
        .join(","),
    );
    expect(new Set(orders).size).toBeGreaterThan(1);
  });

  it("includePlanned=false only fields ready monsters (boss excepted)", () => {
    const plan = generateEncounterPlan(75, {
      seed: "bab-uji",
      includePlanned: false,
    });
    for (const encounter of plan) {
      if (encounter.tier === "final-boss") continue;
      expect(getAdventureMonsterById(encounter.monsterId).assetStatus).toBe(
        "ready",
      );
    }
    expect(plan[plan.length - 1].monsterId).toBe("tree-guardian");
  });
});
