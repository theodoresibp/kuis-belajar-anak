import type { HeroPoseSet, MonsterPoseSet } from "./battle.types";

/**
 * Central configuration for the Adventure Battle gamification layer.
 * Gameplay numbers, characters, monsters and arenas live here only —
 * components never hardcode them.
 */
export const BATTLE_CONFIG = {
  initialHeroHp: 100,
  initialMonsterHp: 100,
  /**
   * Average hero damage per incorrect attempt. Actual damage is randomised
   * per attempt (see generateHeroDamagePattern) in balanced pairs that
   * average exactly this value.
   */
  heroDamagePerWrongAnswer: 5,
  heroDamageMin: 3,
  heroDamageMax: 7,
  /** Monster damage per correct answer varies randomly within ±40% of the
   *  fair share (100 / totalQuestions), normalised so the schedule for a
   *  session always sums to exactly 100. */
  monsterDamageVariance: 0.4,
  /** How long an attack/hurt animation + damage number stays on screen. */
  animationDurationMs: 800,
} as const;

/* ------------------------------------------------------------------ */
/* Heroes (selectable on the quiz settings screen)                     */
/* ------------------------------------------------------------------ */

export interface HeroDef {
  id: string;
  name: string;
  tagline: string;
  fallbackEmoji: string;
  assets: HeroPoseSet;
}

export const HEROES: HeroDef[] = [
  {
    id: "rara",
    name: "Velo",
    tagline: "Petualang pita merah muda",
    fallbackEmoji: "🦸‍♀️",
    assets: {
      idle: "/assets/gamification/hero/hero-idle.webp",
      attack: "/assets/gamification/hero/hero-attack.webp",
      hurt: "/assets/gamification/hero/hero-hurt.webp",
      victory: "/assets/gamification/hero/hero-victory.webp",
      exhausted: "/assets/gamification/hero/hero-exhausted.webp",
    },
  },
  {
    id: "bimo",
    name: "Theo",
    tagline: "Petualang topi biru",
    fallbackEmoji: "🦸‍♂️",
    assets: {
      idle: "/assets/gamification/hero/bimo/idle.webp",
      attack: "/assets/gamification/hero/bimo/attack.webp",
      hurt: "/assets/gamification/hero/bimo/hurt.webp",
      victory: "/assets/gamification/hero/bimo/victory.webp",
      exhausted: "/assets/gamification/hero/bimo/exhausted.webp",
    },
  },
  {
    id: "tari",
    name: "Sera",
    tagline: "Petualang jepit bintang",
    fallbackEmoji: "🦸‍♀️",
    assets: {
      idle: "/assets/gamification/hero/tari/idle.webp",
      attack: "/assets/gamification/hero/tari/attack.webp",
      hurt: "/assets/gamification/hero/tari/hurt.webp",
      victory: "/assets/gamification/hero/tari/victory.webp",
      exhausted: "/assets/gamification/hero/tari/exhausted.webp",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Monsters (each brings its own arena background)                     */
/* ------------------------------------------------------------------ */

export interface MonsterDef {
  id: string;
  name: string;
  tagline: string;
  fallbackEmoji: string;
  /** Arena background shown behind this monster in the BattleStage. */
  background: string;
  assets: MonsterPoseSet;
}

export const MONSTERS: MonsterDef[] = [
  {
    id: "purple-dragon",
    name: "Naga Ungu",
    tagline: "Arena kastil di siang hari",
    fallbackEmoji: "🐉",
    background: "/assets/gamification/backgrounds/fantasy-arena-day.webp",
    assets: {
      idle: "/assets/gamification/monsters/purple-dragon/idle.webp",
      attack: "/assets/gamification/monsters/purple-dragon/attack.webp",
      hurt: "/assets/gamification/monsters/purple-dragon/hurt.webp",
      defeat: "/assets/gamification/monsters/purple-dragon/defeat.webp",
    },
  },
  {
    id: "slime",
    name: "Slime Daun",
    tagline: "Arena hutan hijau",
    fallbackEmoji: "🌱",
    background: "/assets/gamification/backgrounds/fantasy-forest-day.webp",
    assets: {
      idle: "/assets/gamification/monsters/slime/idle.webp",
      attack: "/assets/gamification/monsters/slime/attack.webp",
      hurt: "/assets/gamification/monsters/slime/hurt.webp",
      defeat: "/assets/gamification/monsters/slime/defeat.webp",
    },
  },
  {
    id: "fox",
    name: "Rubah Oranye",
    tagline: "Arena padang rumput",
    fallbackEmoji: "🦊",
    background: "/assets/gamification/backgrounds/fantasy-field-day.webp",
    assets: {
      idle: "/assets/gamification/monsters/fox/idle.webp",
      attack: "/assets/gamification/monsters/fox/attack.webp",
      hurt: "/assets/gamification/monsters/fox/hurt.webp",
      defeat: "/assets/gamification/monsters/fox/defeat.webp",
    },
  },
];

export function getHeroById(id: string): HeroDef {
  return HEROES.find((h) => h.id === id) ?? HEROES[0];
}

export function getMonsterById(id: string): MonsterDef {
  return MONSTERS.find((m) => m.id === id) ?? MONSTERS[0];
}

/** "Auto" opponent: a stable per-chapter pick, so different chapters feature different monsters/arenas. */
export function pickMonsterForChapter(chapterId: string): MonsterDef {
  let hash = 0;
  for (let i = 0; i < chapterId.length; i++) hash = (hash * 31 + chapterId.charCodeAt(i)) >>> 0;
  return MONSTERS[hash % MONSTERS.length];
}

/* Legacy single-character exports (kept for compatibility). */
export const HERO_ASSETS = HEROES[0].assets;
export const MONSTER_ASSETS = MONSTERS[0].assets;
export const BATTLE_BACKGROUND = MONSTERS[0].background;
