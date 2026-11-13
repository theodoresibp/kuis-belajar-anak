import { describe, expect, it } from "vitest";
import {
  adventureReducer,
  createInitialAdventureRunState,
} from "./adventure.reducer";

describe("adventureReducer", () => {
  it("keeps hero HP across encounters while resetting monster HP", () => {
    let state = createInitialAdventureRunState();
    state = adventureReducer(state, { type: "START_ENCOUNTER" });
    state = adventureReducer(state, { type: "WRONG_ANSWER" });
    state = adventureReducer(state, { type: "CORRECT_ANSWER", damage: 100 });
    expect(state.heroHp).toBe(95);
    expect(state.monsterHp).toBe(0);

    state = adventureReducer(state, { type: "NEXT_ENCOUNTER" });
    expect(state.heroHp).toBe(95);
    expect(state.monsterHp).toBe(100);
    expect(state.encounterIndex).toBe(1);
    expect(state.currentQuestionIndex).toBe(1);
    expect(state.status).toBe("exploring");
  });

  it("advances a question only after the player continues", () => {
    let state = createInitialAdventureRunState();
    state = adventureReducer(state, { type: "START_ENCOUNTER" });
    state = adventureReducer(state, { type: "CORRECT_ANSWER", damage: 40 });

    expect(state.currentQuestionIndex).toBe(0);
    expect(state.monsterHp).toBe(60);

    state = adventureReducer(state, { type: "NEXT_QUESTION" });
    expect(state.currentQuestionIndex).toBe(1);
  });

  it("advances exactly one question when moving to the next encounter", () => {
    let state = createInitialAdventureRunState();
    state = adventureReducer(state, { type: "START_ENCOUNTER" });
    state = adventureReducer(state, { type: "CORRECT_ANSWER", damage: 50 });
    state = adventureReducer(state, { type: "NEXT_QUESTION" });
    state = adventureReducer(state, { type: "CORRECT_ANSWER", damage: 100 });
    state = adventureReducer(state, { type: "NEXT_ENCOUNTER" });

    expect(state.currentQuestionIndex).toBe(2);
    expect(state.encounterIndex).toBe(1);
    expect(state.status).toBe("exploring");
  });

  it("stops the run when hero HP reaches zero", () => {
    let state = createInitialAdventureRunState();
    state = adventureReducer(state, { type: "START_ENCOUNTER" });

    for (let attempt = 0; attempt < 20; attempt += 1) {
      state = adventureReducer(state, { type: "WRONG_ANSWER" });
    }

    expect(state.heroHp).toBe(0);
    expect(state.status).toBe("defeat");
    expect(
      adventureReducer(state, { type: "CORRECT_ANSWER", damage: 100 }),
    ).toEqual(state);
  });

  it("does not allow another monster to start after the run is over", () => {
    const state = {
      ...createInitialAdventureRunState(),
      status: "victory" as const,
    };

    expect(
      adventureReducer(state, { type: "START_ENCOUNTER" }),
    ).toEqual(state);
  });

  it("damages the hero when hitting a hazard and consumes a shield first", () => {
    let state = createInitialAdventureRunState();
    state = adventureReducer(state, { type: "COLLECT_SHIELD" });
    state = adventureReducer(state, { type: "HAZARD" });
    expect(state.heroHp).toBe(100);
    expect(state.shieldCharges).toBe(0);

    state = adventureReducer(state, { type: "HAZARD" });
    expect(state.heroHp).toBe(90);
  });

  it("collecting a heart restores HP but never exceeds the maximum", () => {
    let state = {
      ...createInitialAdventureRunState(),
      heroHp: 90,
    };
    state = adventureReducer(state, { type: "COLLECT_HEART" });
    expect(state.heroHp).toBe(100);
    state = adventureReducer(state, { type: "COLLECT_HEART" });
    expect(state.heroHp).toBe(100);
  });

  it("ends the run when an unblocked hazard removes the last HP", () => {
    let state = {
      ...createInitialAdventureRunState(),
      heroHp: 10,
    };
    state = adventureReducer(state, { type: "HAZARD" });
    expect(state.heroHp).toBe(0);
    expect(state.status).toBe("defeat");
  });

  it("lets the boss damage the hero during combat", () => {
    let state = createInitialAdventureRunState();
    state = adventureReducer(state, { type: "START_ENCOUNTER" });
    state = adventureReducer(state, { type: "BOSS_ATTACK" });
    expect(state.heroHp).toBe(85);
    expect(state.status).toBe("encounter");
  });

  it("uses one shield charge to block a boss attack", () => {
    let state = createInitialAdventureRunState();
    state = adventureReducer(state, { type: "COLLECT_SHIELD" });
    state = adventureReducer(state, { type: "START_ENCOUNTER" });
    state = adventureReducer(state, { type: "BOSS_ATTACK" });
    expect(state.heroHp).toBe(100);
    expect(state.shieldCharges).toBe(0);
  });

  it("ends the run when a boss attack removes the last HP", () => {
    let state = {
      ...createInitialAdventureRunState(),
      heroHp: 15,
      status: "encounter" as const,
    };
    state = adventureReducer(state, { type: "BOSS_ATTACK" });
    expect(state.heroHp).toBe(0);
    expect(state.status).toBe("defeat");
  });
});
