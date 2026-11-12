import { BATTLE_CONFIG } from "./battle.config";
import type { BattleAction, BattleState } from "./battle.types";
import {
  clampHp,
  calculateMonsterDamage,
  getBattleStatus,
  monsterHpAfterCorrectAnswers,
} from "./battle.utils";

export function createInitialBattleState(totalQuestions: number): BattleState {
  return {
    totalQuestions,
    correctAnswers: 0,
    heroHp: BATTLE_CONFIG.initialHeroHp,
    monsterHp: BATTLE_CONFIG.initialMonsterHp,
    currentQuestionDamaged: false,
    heroAnimation: "idle",
    monsterAnimation: "idle",
    battleStatus: totalQuestions > 0 ? "playing" : "completed",
    lastDamage: null,
  };
}

let damageEventId = 0;
function nextDamageId(): number {
  damageEventId += 1;
  return damageEventId;
}

/**
 * Pure battle state machine. HP is cumulative for the whole quiz session:
 * nothing here resets HP on question navigation — only START (a new session) does.
 */
export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case "START":
      return createInitialBattleState(action.totalQuestions);

    case "WRONG_ANSWER": {
      // Every incorrect attempt hurts the hero, even repeated attempts on one question.
      const heroHp = clampHp(state.heroHp - BATTLE_CONFIG.heroDamagePerWrongAnswer, BATTLE_CONFIG.initialHeroHp);
      return {
        ...state,
        heroHp,
        heroAnimation: heroHp <= 0 ? "exhausted" : "hurt",
        monsterAnimation: state.monsterHp <= 0 ? "defeat" : "attack",
        battleStatus: getBattleStatus(heroHp, state.monsterHp, false),
        lastDamage: { id: nextDamageId(), target: "hero", amount: BATTLE_CONFIG.heroDamagePerWrongAnswer },
      };
    }

    case "CORRECT_ANSWER": {
      // Monster damage is awarded exactly once per question.
      if (state.currentQuestionDamaged) {
        return { ...state, heroAnimation: "attack" };
      }
      const correctAnswers = state.correctAnswers + 1;
      const monsterHp = monsterHpAfterCorrectAnswers(correctAnswers, state.totalQuestions);
      return {
        ...state,
        correctAnswers,
        monsterHp,
        currentQuestionDamaged: true,
        heroAnimation: state.heroHp <= 0 ? "exhausted" : "attack",
        monsterAnimation: monsterHp <= 0 ? "defeat" : "hurt",
        battleStatus: getBattleStatus(state.heroHp, monsterHp, false),
        lastDamage: {
          id: nextDamageId(),
          target: "monster",
          amount: Math.round(calculateMonsterDamage(state.totalQuestions) * 100) / 100,
        },
      };
    }

    case "NEXT_QUESTION":
      // Only the per-question damage guard resets — HP and score carry over.
      return {
        ...state,
        currentQuestionDamaged: false,
        heroAnimation: "idle",
        monsterAnimation: "idle",
        lastDamage: null,
      };

    case "ANIMATION_DONE":
      // Always recover to idle (terminal poses are re-derived by the character
      // components from HP), even if something interrupted the animation.
      return { ...state, heroAnimation: "idle", monsterAnimation: "idle", lastDamage: null };

    case "COMPLETE":
      return {
        ...state,
        battleStatus: "completed",
        heroAnimation: state.monsterHp <= 0 ? "victory" : state.heroHp <= 0 ? "exhausted" : "victory",
        monsterAnimation: state.monsterHp <= 0 ? "defeat" : "idle",
        lastDamage: null,
      };

    default:
      return state;
  }
}
