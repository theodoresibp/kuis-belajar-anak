/**
 * Central configuration for the Adventure Battle gamification layer.
 * Gameplay numbers live here only — components never hardcode them.
 */
export const BATTLE_CONFIG = {
  initialHeroHp: 100,
  initialMonsterHp: 100,
  /** Hero loses this much HP for every incorrect attempt (cumulative per session). */
  heroDamagePerWrongAnswer: 5,
  /** How long an attack/hurt animation + damage number stays on screen. */
  animationDurationMs: 700,
} as const;

/**
 * Runtime character/effect assets (transparent WebP, 480x480).
 * See ASSETS.md in this folder for how to replace them.
 */
export const HERO_ASSETS = {
  idle: "/assets/gamification/hero/hero-idle.webp",
  attack: "/assets/gamification/hero/hero-attack.webp",
  hurt: "/assets/gamification/hero/hero-hurt.webp",
  victory: "/assets/gamification/hero/hero-victory.webp",
  exhausted: "/assets/gamification/hero/hero-exhausted.webp",
} as const;

export const MONSTER_ASSETS = {
  idle: "/assets/gamification/monsters/purple-dragon/idle.webp",
  attack: "/assets/gamification/monsters/purple-dragon/attack.webp",
  hurt: "/assets/gamification/monsters/purple-dragon/hurt.webp",
  defeat: "/assets/gamification/monsters/purple-dragon/defeat.webp",
} as const;

export const BATTLE_BACKGROUND = "/assets/gamification/backgrounds/fantasy-arena-day.webp";
