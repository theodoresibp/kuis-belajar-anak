export type HeroAnimation = "idle" | "attack" | "hurt" | "victory" | "exhausted";
export type MonsterAnimation = "idle" | "attack" | "hurt" | "defeat";

export type HeroPoseSet = Record<HeroAnimation, string>;
export type MonsterPoseSet = Record<MonsterAnimation, string>;

export type BattleStatus = "playing" | "hero_exhausted" | "monster_defeated" | "completed";

export type PowerUpKind = "potion" | "shield" | "hint";

export interface PowerUpInventory {
  potion: number;
  shield: number;
  hint: number;
}

/** A floating number/text event. `id` changes per event so React can re-run its CSS animation. */
export interface DamageEvent {
  id: number;
  target: "hero" | "monster";
  amount: number;
  kind: "damage" | "heal" | "blocked";
}

export interface BattleState {
  totalQuestions: number;
  /** Index of the question currently being answered (0-based). */
  currentQuestionIndex: number;
  correctAnswers: number;
  /** Incorrect attempts across the whole session (indexes the hero damage pattern). */
  wrongAttempts: number;
  /** Consecutive correct answers — drives the combo badge. */
  correctStreak: number;
  heroHp: number;
  monsterHp: number;
  /** Full HP of this monster. Quiz Battle always uses the config default
   *  (100); Adventure Mode passes its per-tier HP (100-200). */
  monsterMaxHp?: number;
  /** True once the current question has already dealt monster damage — guards against duplicates. */
  currentQuestionDamaged: boolean;
  heroAnimation: HeroAnimation;
  monsterAnimation: MonsterAnimation;
  battleStatus: BattleStatus;
  lastDamage: DamageEvent | null;
  /** Power-up inventory earned from combo rewards. */
  items: PowerUpInventory;
  /** Unclaimed combo rewards — each one lets the child pick 1 item. */
  powerUpChoices: number;
  /** An equipped shield blocks the next monster attack completely. */
  shieldActive: boolean;
  /** Selected character / opponent for this session. */
  heroId: string;
  monsterId: string;
  /**
   * Randomised damage per question index. Always sums to exactly 100, so
   * answering every question correctly defeats the monster exactly.
   * Empty array = fair split (100 / totalQuestions) for every question.
   */
  monsterDamageSchedule: number[];
  /**
   * Randomised hero damage per incorrect attempt (values 3-7 in balanced
   * pairs averaging exactly 5). Empty array = flat 5 per attempt.
   */
  heroDamagePattern: number[];
}

/** Snapshot shown on the result screen. */
export interface BattleSummary {
  heroHp: number;
  monsterHp: number;
  correctAnswers: number;
  totalQuestions: number;
  battleStatus: BattleStatus;
  heroId: string;
  monsterId: string;
}

export interface BattleStartOptions {
  heroId?: string;
  monsterId?: string;
  monsterDamageSchedule?: number[];
  heroDamagePattern?: number[];
}

export type BattleAction =
  | ({ type: "START"; totalQuestions: number } & BattleStartOptions)
  | { type: "WRONG_ANSWER" }
  | { type: "CORRECT_ANSWER" }
  | { type: "NEXT_QUESTION" }
  | { type: "ANIMATION_DONE" }
  | { type: "COMPLETE" }
  | { type: "CHOOSE_REWARD"; item: PowerUpKind }
  | { type: "USE_POTION" }
  | { type: "USE_SHIELD" }
  | { type: "USE_HINT" };
