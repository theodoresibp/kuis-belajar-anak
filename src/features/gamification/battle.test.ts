import { describe, expect, it } from "vitest";
import { BATTLE_CONFIG } from "./battle.config";
import { battleReducer, createInitialBattleState } from "./battle.reducer";
import type { BattleState } from "./battle.types";
import {
  calculateMonsterDamage,
  clampHp,
  generateHeroDamagePattern,
  generateMonsterDamageSchedule,
  heroHpAfterWrongAnswers,
  monsterHpAfterCorrectAnswers,
} from "./battle.utils";

function start(totalQuestions: number): BattleState {
  return battleReducer(createInitialBattleState(0), { type: "START", totalQuestions });
}
/** Answer the current question correctly and move on. */
function correctAndNext(s: BattleState): BattleState {
  return battleReducer(battleReducer(s, { type: "CORRECT_ANSWER" }), { type: "NEXT_QUESTION" });
}
function wrong(s: BattleState): BattleState {
  return battleReducer(s, { type: "WRONG_ANSWER" });
}

describe("battle utils", () => {
  it("clamps HP and snaps float drift to exact edges", () => {
    expect(clampHp(-5)).toBe(0);
    expect(clampHp(150)).toBe(100);
    expect(clampHp(100 - 3 * (100 / 3))).toBe(0);
    expect(clampHp(66.666666)).toBe(66.67);
  });

  it("monster damage is 100 / totalQuestions", () => {
    expect(calculateMonsterDamage(20)).toBe(5);
    expect(calculateMonsterDamage(1)).toBe(100);
    expect(calculateMonsterDamage(0)).toBe(0);
    expect(monsterHpAfterCorrectAnswers(3, 3)).toBe(0);
    expect(heroHpAfterWrongAnswers(20)).toBe(0);
    expect(heroHpAfterWrongAnswers(25)).toBe(0); // never negative
  });
});

describe("battle reducer — spec scenarios", () => {
  it("1. correct answer on first attempt damages the monster once", () => {
    const s = battleReducer(start(20), { type: "CORRECT_ANSWER" });
    expect(s.monsterHp).toBe(95);
    expect(s.heroHp).toBe(100);
    expect(s.correctAnswers).toBe(1);
    expect(s.heroAnimation).toBe("attack");
    expect(s.monsterAnimation).toBe("hurt");
    expect(s.lastDamage).toMatchObject({ target: "monster", amount: 5 });
  });

  it("2. incorrect then correct: hero -5, monster damaged once", () => {
    let s = wrong(start(20));
    expect(s.heroHp).toBe(95);
    expect(s.monsterHp).toBe(100);
    s = battleReducer(s, { type: "CORRECT_ANSWER" });
    expect(s.heroHp).toBe(95);
    expect(s.monsterHp).toBe(95);
  });

  it("3. multiple incorrect attempts: hero damaged every time, monster only once", () => {
    let s = start(20);
    s = wrong(wrong(wrong(s)));
    expect(s.heroHp).toBe(100 - 3 * BATTLE_CONFIG.heroDamagePerWrongAnswer);
    s = battleReducer(s, { type: "CORRECT_ANSWER" });
    // A duplicate CORRECT_ANSWER for the same question must not damage again.
    const dup = battleReducer(s, { type: "CORRECT_ANSWER" });
    expect(s.monsterHp).toBe(95);
    expect(dup.monsterHp).toBe(95);
    expect(dup.correctAnswers).toBe(1);
  });

  it("4. HP never resets when moving to the next question", () => {
    let s = wrong(start(10));
    s = correctAndNext(s);
    expect(s.heroHp).toBe(95);
    expect(s.monsterHp).toBe(90);
    expect(s.currentQuestionDamaged).toBe(false);
  });

  it("5. monster HP reaches exactly zero on the last correct answer", () => {
    let s = start(3);
    s = correctAndNext(correctAndNext(correctAndNext(s)));
    expect(s.monsterHp).toBe(0);
    expect(s.battleStatus).toBe("monster_defeated");
    expect(s.monsterAnimation).toBe("idle"); // NEXT_QUESTION reset; pose re-derived from HP in the UI
  });

  it("6. hero HP reaches zero: exhausted, quiz can continue (practice mode)", () => {
    let s = start(20);
    for (let i = 0; i < 20; i++) s = wrong(s);
    expect(s.heroHp).toBe(0);
    expect(s.battleStatus).toBe("hero_exhausted");
    // Still answers questions afterwards; monster can still be damaged.
    s = battleReducer(s, { type: "CORRECT_ANSWER" });
    expect(s.monsterHp).toBe(95);
    expect(s.heroHp).toBe(0); // never negative
  });

  it("7. quiz completes with both characters alive", () => {
    let s = start(5);
    s = correctAndNext(correctAndNext(s));
    s = battleReducer(s, { type: "COMPLETE" });
    expect(s.battleStatus).toBe("completed");
    expect(s.heroHp).toBe(100);
    expect(s.monsterHp).toBe(60);
  });

  it("8. quiz completes with hero exhausted", () => {
    let s = start(50);
    for (let i = 0; i < 20; i++) s = wrong(s);
    s = battleReducer(s, { type: "COMPLETE" });
    expect(s.battleStatus).toBe("completed");
    expect(s.heroHp).toBe(0);
    expect(s.heroAnimation).toBe("exhausted");
  });

  it("9. one-question quiz: one correct answer defeats the monster", () => {
    const s = battleReducer(start(1), { type: "CORRECT_ANSWER" });
    expect(s.monsterHp).toBe(0);
    expect(s.battleStatus).toBe("monster_defeated");
    expect(s.monsterAnimation).toBe("defeat");
  });

  it("10. large quiz (100 questions): no float drift, HP stays in range", () => {
    let s = start(100);
    for (let i = 0; i < 37; i++) s = correctAndNext(s);
    expect(s.monsterHp).toBe(63);
    for (let i = 0; i < 63; i++) s = correctAndNext(s);
    expect(s.monsterHp).toBe(0);
    expect(s.correctAnswers).toBe(100);
  });

  it("11. START begins a fresh session — the only HP reset", () => {
    let s = wrong(start(10));
    s = battleReducer(s, { type: "START", totalQuestions: 10 });
    expect(s.heroHp).toBe(100);
    expect(s.monsterHp).toBe(100);
    expect(s.correctAnswers).toBe(0);
    expect(s.battleStatus).toBe("playing");
  });

  it("12. ANIMATION_DONE always recovers animations to idle", () => {
    let s = battleReducer(start(20), { type: "CORRECT_ANSWER" });
    s = battleReducer(s, { type: "ANIMATION_DONE" });
    expect(s.heroAnimation).toBe("idle");
    expect(s.monsterAnimation).toBe("idle");
    expect(s.lastDamage).toBeNull();
    expect(s.monsterHp).toBe(95); // recovering animation never touches HP
  });
});

describe("randomised damage (v2)", () => {
  it("monster schedule always sums to exactly 100, whatever the quiz length", () => {
    for (const total of [1, 2, 3, 7, 20, 100]) {
      const schedule = generateMonsterDamageSchedule(total);
      expect(schedule).toHaveLength(total);
      expect(schedule.every((d) => d > 0)).toBe(true);
      expect(Math.round(schedule.reduce((a, b) => a + b, 0) * 100) / 100).toBe(100);
    }
    expect(generateMonsterDamageSchedule(1)).toEqual([100]);
    expect(generateMonsterDamageSchedule(0)).toEqual([]);
  });

  it("monster schedule actually varies between questions", () => {
    // A seeded rng makes this deterministic: alternating low/high rolls.
    let i = 0;
    const rng = () => (i++ % 2 === 0 ? 0 : 1);
    const schedule = generateMonsterDamageSchedule(10, rng);
    expect(new Set(schedule.slice(0, 9)).size).toBeGreaterThan(1);
  });

  it("hero pattern values are 3-7 and every pair totals exactly 10 (average 5)", () => {
    const pattern = generateHeroDamagePattern(40);
    expect(pattern).toHaveLength(40);
    expect(pattern.every((d) => d >= 3 && d <= 7)).toBe(true);
    for (let p = 0; p < pattern.length; p += 2) {
      expect(pattern[p] + pattern[p + 1]).toBe(10);
    }
  });

  it("reducer uses the schedule slot of the CURRENT question (failed questions lose their slot)", () => {
    let s = battleReducer(createInitialBattleState(0), {
      type: "START",
      totalQuestions: 3,
      monsterDamageSchedule: [50, 30, 20],
    });
    s = battleReducer(s, { type: "CORRECT_ANSWER" }); // Q1 slot: 50
    expect(s.monsterHp).toBe(50);
    expect(s.lastDamage?.amount).toBe(50);
    s = battleReducer(s, { type: "NEXT_QUESTION" });
    // Q2 is never answered correctly (child runs out of lives in the quiz layer) -> slot 30 is lost.
    s = battleReducer(s, { type: "NEXT_QUESTION" });
    s = battleReducer(s, { type: "CORRECT_ANSWER" }); // Q3 slot: 20
    expect(s.monsterHp).toBe(30);
    expect(s.correctAnswers).toBe(2);
  });

  it("answering everything correctly with a schedule defeats the monster exactly", () => {
    const schedule = generateMonsterDamageSchedule(7);
    let s = battleReducer(createInitialBattleState(0), {
      type: "START",
      totalQuestions: 7,
      monsterDamageSchedule: schedule,
    });
    for (let q = 0; q < 7; q++) s = correctAndNext(s);
    expect(s.monsterHp).toBe(0);
    expect(s.battleStatus).toBe("monster_defeated");
  });

  it("reducer uses the hero pattern per attempt and tracks totals", () => {
    let s = battleReducer(createInitialBattleState(0), {
      type: "START",
      totalQuestions: 10,
      heroDamagePattern: [3, 7, 4, 6],
    });
    s = wrong(s);
    expect(s.heroHp).toBe(97);
    expect(s.lastDamage?.amount).toBe(3);
    s = wrong(s);
    expect(s.heroHp).toBe(90);
    s = wrong(wrong(s));
    expect(s.heroHp).toBe(80); // 3+7+4+6 = 20 = 4 attempts x average 5
    // Beyond the pattern, damage falls back to the flat average.
    s = wrong(s);
    expect(s.heroHp).toBe(75);
    expect(s.wrongAttempts).toBe(5);
  });

  it("combo streak builds on correct answers and resets on a wrong one", () => {
    let s = start(10);
    s = battleReducer(s, { type: "CORRECT_ANSWER" });
    s = battleReducer(battleReducer(s, { type: "NEXT_QUESTION" }), { type: "CORRECT_ANSWER" });
    expect(s.correctStreak).toBe(2);
    s = wrong(s);
    expect(s.correctStreak).toBe(0);
  });

  it("START records the chosen hero and monster for the session", () => {
    const s = battleReducer(createInitialBattleState(0), {
      type: "START",
      totalQuestions: 5,
      heroId: "bimo",
      monsterId: "slime",
    });
    expect(s.heroId).toBe("bimo");
    expect(s.monsterId).toBe("slime");
  });
});

describe("power-ups, dialogue (v3)", () => {
  function threeInARow(s: BattleState): BattleState {
    let out = s;
    for (let i = 0; i < 3; i++) {
      out = battleReducer(out, { type: "CORRECT_ANSWER" });
      out = battleReducer(out, { type: "NEXT_QUESTION" });
    }
    return out;
  }

  it("combo x3 grants exactly one power-up choice; claiming adds the item", () => {
    let s = threeInARow(start(10));
    expect(s.correctStreak).toBe(3);
    expect(s.powerUpChoices).toBe(1);
    s = battleReducer(s, { type: "CHOOSE_REWARD", item: "potion" });
    expect(s.powerUpChoices).toBe(0);
    expect(s.items.potion).toBe(1);
    // No pending choice: claiming again does nothing.
    s = battleReducer(s, { type: "CHOOSE_REWARD", item: "shield" });
    expect(s.items.shield).toBe(0);
  });

  it("potion heals 15 (capped at 100), consumes the item, and can revive an exhausted hero", () => {
    let s = wrong(wrong(start(10))); // hero 90
    s = { ...s, items: { potion: 2, shield: 0, hint: 0 } };
    s = battleReducer(s, { type: "USE_POTION" });
    expect(s.heroHp).toBe(100); // 90 + 15 capped
    expect(s.items.potion).toBe(1);
    // Full HP: potion is not consumed.
    s = battleReducer(s, { type: "USE_POTION" });
    expect(s.items.potion).toBe(1);
    // Revive from 0.
    s = { ...s, heroHp: 0, battleStatus: "hero_exhausted" };
    s = battleReducer(s, { type: "USE_POTION" });
    expect(s.heroHp).toBe(15);
    expect(s.battleStatus).toBe("playing");
    expect(s.lastDamage).toMatchObject({ kind: "heal", amount: 15 });
  });

  it("shield blocks the next wrong answer completely and is then gone", () => {
    let s = battleReducer(createInitialBattleState(0), {
      type: "START",
      totalQuestions: 10,
      heroDamagePattern: [7, 3],
    });
    s = { ...s, items: { potion: 0, shield: 1, hint: 0 } };
    s = battleReducer(s, { type: "USE_SHIELD" });
    expect(s.shieldActive).toBe(true);
    expect(s.items.shield).toBe(0);
    s = wrong(s);
    expect(s.heroHp).toBe(100); // blocked
    expect(s.shieldActive).toBe(false);
    expect(s.lastDamage).toMatchObject({ kind: "blocked", amount: 0 });
    expect(s.wrongAttempts).toBe(0); // pattern not consumed by a blocked hit
    s = wrong(s);
    expect(s.heroHp).toBe(93); // first pattern value (7) applies now
  });

  it("hint use only consumes inventory when one is available", () => {
    let s = { ...start(10), items: { potion: 0, shield: 0, hint: 1 } };
    s = battleReducer(s, { type: "USE_HINT" });
    expect(s.items.hint).toBe(0);
    s = battleReducer(s, { type: "USE_HINT" });
    expect(s.items.hint).toBe(0);
  });

  it("dialogue: monster panics at low HP, hero cheers on attack, defeat line at 0 HP", async () => {
    const { heroLineFor, monsterLineFor } = await import("./dialogue");
    const base = start(20);
    const attacking = battleReducer(base, { type: "CORRECT_ANSWER" });
    expect(heroLineFor(attacking)).toBeTruthy();
    expect(monsterLineFor(attacking)).toBeTruthy(); // hurt line
    const lowMonster = { ...base, monsterHp: 20 };
    expect(monsterLineFor(lowMonster)).toMatch(/goyah|ampun|kalah/);
    const deadMonster = { ...base, monsterHp: 0 };
    expect(monsterLineFor(deadMonster)).toMatch(/kalah/);
    const exhausted = { ...base, heroHp: 0 };
    expect(heroLineFor(exhausted)).toMatch(/lelah/);
  });
});
