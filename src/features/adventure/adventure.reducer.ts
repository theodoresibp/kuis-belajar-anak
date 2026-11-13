import { BATTLE_CONFIG } from "../gamification/battle.config";

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
  /** HP of the current encounter's monster at full health. Varies per
   *  monster tier since Sprint C (normal 100, elite 125, mini-boss 150,
   *  final boss 200); correct-answer damage is maxHp / questions. */
  monsterMaxHp: number;
  shieldCharges: number;
  status: AdventureRunStatus;
}

export type AdventureRunAction =
  | { type: "START_ENCOUNTER" }
  | { type: "WRONG_ANSWER" }
  | { type: "CORRECT_ANSWER"; damage: number }
  | { type: "NEXT_QUESTION" }
  | { type: "NEXT_ENCOUNTER"; monsterMaxHp?: number }
  | { type: "VICTORY" }
  | { type: "DEFEAT" }
  | { type: "HAZARD" }
  | { type: "BOSS_ATTACK"; damage?: number }
  | { type: "COLLECT_HEART" }
  | { type: "COLLECT_SHIELD" };

export function createInitialAdventureRunState(
  firstMonsterMaxHp: number = BATTLE_CONFIG.initialMonsterHp,
): AdventureRunState {
  return {
    heroHp: BATTLE_CONFIG.initialHeroHp,
    score: 0,
    currentQuestionIndex: 0,
    encounterIndex: 0,
    monsterHp: firstMonsterMaxHp,
    monsterMaxHp: firstMonsterMaxHp,
    shieldCharges: 0,
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
        monsterHp: Math.max(0, Math.round((state.monsterHp - action.damage) * 100) / 100),
      };

    case "NEXT_QUESTION":
      if (state.status !== "encounter" || state.monsterHp <= 0) return state;
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };

    case "NEXT_ENCOUNTER": {
      if (state.status !== "encounter" || state.monsterHp > 0) return state;
      const monsterMaxHp = action.monsterMaxHp ?? BATTLE_CONFIG.initialMonsterHp;
      return {
        ...state,
        encounterIndex: state.encounterIndex + 1,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        monsterHp: monsterMaxHp,
        monsterMaxHp,
        status: "exploring",
      };
    }

    case "VICTORY":
      return { ...state, status: "victory" };

    case "HAZARD": {
      if (state.status !== "exploring") return state;
      if (state.shieldCharges > 0) {
        return { ...state, shieldCharges: state.shieldCharges - 1 };
      }
      const heroHp = Math.max(0, state.heroHp - 10);
      return { ...state, heroHp, status: heroHp <= 0 ? "defeat" : "exploring" };
    }

    case "BOSS_ATTACK": {
      if (state.status !== "encounter" || state.monsterHp <= 0) return state;
      if (state.shieldCharges > 0) {
        return { ...state, shieldCharges: state.shieldCharges - 1 };
      }
      // Default 15 = the final boss; mini-bosses pass their own damage.
      const heroHp = Math.max(0, state.heroHp - (action.damage ?? 15));
      return { ...state, heroHp, status: heroHp <= 0 ? "defeat" : "encounter" };
    }

    case "COLLECT_HEART":
      if (state.status !== "exploring" || state.heroHp <= 0) return state;
      return {
        ...state,
        heroHp: Math.min(BATTLE_CONFIG.initialHeroHp, state.heroHp + 15),
      };

    case "COLLECT_SHIELD":
      if (state.status !== "exploring") return state;
      return { ...state, shieldCharges: state.shieldCharges + 1 };

    case "DEFEAT":
      return { ...state, heroHp: 0, status: "defeat" };

    default:
      return state;
  }
}
