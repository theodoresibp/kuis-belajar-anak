import { describe, expect, it } from "vitest";
import { ADVENTURE_MONSTERS } from "./monsters.config";
import { monsterLinesFor, pickMonsterLine } from "./monster-lines";

describe("monster lines", () => {
  it("every monster in the catalogue has at least one greeting line", () => {
    expect(ADVENTURE_MONSTERS).toHaveLength(12);
    for (const monster of ADVENTURE_MONSTERS) {
      const lines = monsterLinesFor(monster.id, monster.tier);
      expect(lines.length).toBeGreaterThanOrEqual(1);
      for (const line of lines) {
        expect(line.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("Monster Mama gets extra theatrical lines", () => {
    expect(monsterLinesFor("monster-mama", "final-boss").length).toBe(3);
  });

  it("unknown monsters fall back to a tier line, never empty", () => {
    for (const tier of ["normal", "elite", "mini-boss", "final-boss"] as const) {
      const line = pickMonsterLine("monster-yang-tidak-ada", tier, 0);
      expect(line.trim().length).toBeGreaterThan(10);
    }
  });

  it("the pick is deterministic per seed and cycles through the lines", () => {
    const lines = monsterLinesFor("monster-mama", "final-boss");
    for (let seed = 0; seed < lines.length; seed += 1) {
      expect(pickMonsterLine("monster-mama", "final-boss", seed)).toBe(
        lines[seed],
      );
      expect(pickMonsterLine("monster-mama", "final-boss", seed)).toBe(
        pickMonsterLine("monster-mama", "final-boss", seed),
      );
    }
    expect(
      pickMonsterLine("monster-mama", "final-boss", lines.length),
    ).toBe(lines[0]);
    expect(pickMonsterLine("monster-mama", "final-boss", -1)).toBe(
      lines[lines.length - 1],
    );
  });
});
