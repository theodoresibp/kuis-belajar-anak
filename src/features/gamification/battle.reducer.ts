import { BATTLE_CONFIG } from "./battle.config";
import type { BattleAction, BattleStartOptions, BattleState } from "./battle.types";
import {
  clampHp,
  calculateMonsterDamage,
  getBattleStatus,
} from "./battle.utils";

export function createInitialBattleState(
  totalQuestions: number,
  options: BattleStartOptions = {}
): BattleState {
  return {
    totalQuestions,
    currentQuestionIndex: 0,
    correctAnswers: 0,
    wrongAttempts: 0,
    correctStreak: 0,
    heroHp: BATTLE_CONFIG.initialHeroHp,
    monsterHp: BATTLE_CONFIG.initialMonsterHp,
    currentQuestionDamaged: false,
    heroAnimation: "idle",
    monsterAnimation: "idle",
    battleStatus: totalQuestions > 0 ? "playing" : "completed",
    lastDamage: null,
    heroId: options.heroId ?? "rara",
    monsterId: options.monsterId ?? "purple-dragon",
    monsterDamageSchedule: options.monsterDamageSchedule ?? [],
    heroDamagePattern: options.heroDamagePattern ?? [],
  };
}

let damageEventId = 0;
function nextDamageId(): number {
  damageEventId += 1;
  return damageEventId;
}

/** Damage slot for the question at `index`: randomised schedule if present, fair split otherwise. */
function monsterDamageForQuestion(state: BattleState): number {
  const scheduled = state.monsterDamageSchedule[state.currentQuestionIndex];
  return scheduled !== undefined ? scheduled : calculateMonsterDamage(state.totalQuestions);
}

/** Damage for the next incorrect attempt: randomised pattern if present, flat average otherwise. */
function heroDamageForAttempt(state: BattleState): number {
  return state.heroDamagePattern[state.wrongAttempts] ?? BATTLE_CONFIG.heroDamagePerWrongAnswer;
}

/**
 * Pure battle state machine. HP is cumulative for the whole quiz session:
 * nothing here resets HP on question navigation — only START (a new session) does.
 */
export function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case "START":
      return createInitialBattleState(action.totalQuestions, action);

    case "WRONG_ANSWER": {
      // Every incorrect attempt hurts the hero, with this session's randomised amount.
      const amount = heroDamageForAttempt(state);
      const heroHp = clampHp(state.heroHp - amount, BATTLE_CONFIG.initialHeroHp);
      return {
        ...state,
        heroHp,
        wrongAttempts: state.wrongAttempts + 1,
        correctStreak: 0,
        heroAnimation: heroHp <= 0 ? "exhausted" : "hurt",
        monsterAnimation: state.monsterHp <= 0 ? "defeat" : "attack",
        battleStatus: getBattleStatus(heroHp, state.monsterHp, false),
        lastDamage: { id: nextDamageId(), target: "hero", amount },
      };
    }

    case "CORRECT_ANSWER": {
      // Monster damage is awarded exactly once per question.
      if (state.currentQuestionDamaged) {
        return { ...state, heroAnimation: "attack", correctStreak: state.correctStreak + 1 };
      }
      const amount = monsterDamageForQuestion(state);
      // If this was the last unanswered slot, the schedule sums to exactly 100,
      // so clampHp snaps the remainder to exactly 0.
      const monsterHp = clampHp(state.monsterHp - amount);
      return {
        ...state,
        correctAnswers: state.correctAnswers + 1,
        correctStreak: state.correctStreak + 1,
        monsterHp,
        currentQuestionDamaged: true,
        heroAnimation: state.heroHp <= 0 ? "exhausted" : "attack",
        monsterAnimation: monsterHp <= 0 ? "defeat" : "hurt",
        battleStatus: getBattleStatus(state.heroHp, monsterHp, false),
        lastDamage: { id: nextDamageId(), target: "monster", amount },
      };
    }

    case "NEXT_QUESTION":
      // Only the per-question damage guard and index move on — HP and score carry over.
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
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
        heroAnimation: state.heroHp <= 0 ? "exhausted" : "victory",
        monsterAnimation: state.monsterHp <= 0 ? "defeat" : "idle",
        lastDamage: null,
      };

    default:
      return state;
  }
}
