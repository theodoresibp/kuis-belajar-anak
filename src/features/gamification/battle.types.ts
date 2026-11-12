export type HeroAnimation = "idle" | "attack" | "hurt" | "victory" | "exhausted";
export type MonsterAnimation = "idle" | "attack" | "hurt" | "defeat";

export type BattleStatus = "playing" | "hero_exhausted" | "monster_defeated" | "completed";

/** A floating damage number event. `id` changes per event so React can re-run its CSS animation. */
export interface DamageEvent {
  id: number;
  target: "hero" | "monster";
  amount: number;
}

export interface BattleState {
  totalQuestions: number;
  correctAnswers: number;
  heroHp: number;
  monsterHp: number;
  /** True once the current question has already dealt monster damage — guards against duplicates. */
  currentQuestionDamaged: boolean;
  heroAnimation: HeroAnimation;
  monsterAnimation: MonsterAnimation;
  battleStatus: BattleStatus;
  lastDamage: DamageEvent | null;
}

/** Snapshot shown on the result screen. */
export interface BattleSummary {
  heroHp: number;
  monsterHp: number;
  correctAnswers: number;
  totalQuestions: number;
  battleStatus: BattleStatus;
}

export type BattleAction =
  | { type: "START"; totalQuestions: number }
  | { type: "WRONG_ANSWER" }
  | { type: "CORRECT_ANSWER" }
  | { type: "NEXT_QUESTION" }
  | { type: "ANIMATION_DONE" }
  | { type: "COMPLETE" };
