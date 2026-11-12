import { describe, expect, it } from "vitest";
import { BATTLE_CONFIG } from "./battle.config";
import { battleReducer, createInitialBattleState } from "./battle.reducer";
import type { BattleState } from "./battle.types";
import {
  calculateMonsterDamage,
  clampHp,
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
