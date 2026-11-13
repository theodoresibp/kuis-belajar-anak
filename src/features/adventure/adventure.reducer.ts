import { BATTLE_CONFIG } from "@/features/gamification/battle.config";

export type AdventureRunStatus =
  | "exploring"
  | "encounter"
  | "victory"
  | "defeat";

export interface AdventureRunState {
  heroHp: number;
  score: number;
  currentQuestionIndex: number;
  encounterIndex: number;
  monsterHp: number;
  status: AdventureRunStatus;
}

export type AdventureRunAction =
  | { type: "START_ENCOUNTER" }
  | { type: "WRONG_ANSWER" }
  | { type: "CORRECT_ANSWER"; damage: number }
  | { type: "NEXT_ENCOUNTER" }
  | { type: "VICTORY" }
  | { type: "DEFEAT" };

export function createInitialAdventureRunState(): AdventureRunState {
  return {
    heroHp: BATTLE_CONFIG.initialHeroHp,
    score: 0,
    currentQuestionIndex: 0,
    encounterIndex: 0,
    monsterHp: BATTLE_CONFIG.initialMonsterHp,
    status: "exploring",
  };
}

export function adventureReducer(
  state: AdventureRunState,
  action: AdventureRunAction,
): AdventureRunState {
  switch (action.type) {
    case "START_ENCOUNTER":
      if (state.status === "victory" || state.status === "defeat") return state;
      return { ...state, status: "encounter" };

    case "WRONG_ANSWER": {
      if (state.status !== "encounter") return state;
      const heroHp = Math.max(0, state.heroHp - BATTLE_CONFIG.heroDamagePerWrongAnswer);
      return {
        ...state,
        heroHp,
        status: heroHp <= 0 ? "defeat" : "encounter",
      };
    }

    case "CORRECT_ANSWER":
      if (state.status !== "encounter" || state.monsterHp <= 0) return state;
      return {
        ...state,
        score: state.score + 1,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        monsterHp: Math.max(0, Math.round((state.monsterHp - action.damage) * 100) / 100),
      };

    case "NEXT_ENCOUNTER":
      if (state.status !== "encounter" || state.monsterHp > 0) return state;
      return {
        ...state,
        encounterIndex: state.encounterIndex + 1,
        monsterHp: BATTLE_CONFIG.initialMonsterHp,
        status: "exploring",
      };

    case "VICTORY":
      return { ...state, status: "victory" };

    case "DEFEAT":
      return { ...state, heroHp: 0, status: "defeat" };

    default:
      return state;
  }
}
