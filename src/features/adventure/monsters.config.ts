/**
 * Adventure Mode monster pool (Sprint A foundation).
 *
 * Single source of truth for the monsters that can appear in Adventure Mode
 * encounters. The dynamic encounter generator (Sprint C) picks monsters from
 * this pool; MonsterActor (Sprint D) loads their poses from `assets`.
 *
 * Wired up in Sprint C (encounter generator + scene) and completed in
 * Sprint D, when the remaining eight monsters got their artwork — every
 * monster is now "ready" and the generator fields the full pool.
 *
 * Kept separate from `features/gamification/battle.config.ts` on purpose:
 * adding adventure monsters must never change the Quiz Battle monster picker.
 */

export type MonsterTier = "normal" | "elite" | "mini-boss" | "final-boss";

export interface MonsterPoseSet {
  idle: string;
  attack: string;
  hurt: string;
  defeat: string;
}

export interface MonsterDefinition {
  id: string;
  name: string;
  /** Shown in the battle popup header and HUD labels. */
  emoji: string;
  tier: MonsterTier;
  /** Monster HP for one encounter with this monster (Sprint C wires this
   *  into the adventure reducer as monsterMaxHp). */
  maxHp: number;
  /** Damage of this monster's timed/special attack. 0 = no timed attack;
   *  normal and elite monsters only "attack" through wrong answers. */
  attackDamage: number;
  /** On-screen size in the Phaser scene. */
  displaySize: { width: number; height: number };
  /** "ready" = artwork already in the repo, "planned" = arrives in Sprint D. */
  assetStatus: "ready" | "planned";
  assets: MonsterPoseSet;
  /** Special abilities, implemented in Sprint D/F. Data only for now. */
  abilities?: string[];
}

function gamificationPoses(folder: string): MonsterPoseSet {
  return {
    idle: `/assets/gamification/monsters/${folder}/idle.webp`,
    attack: `/assets/gamification/monsters/${folder}/attack.webp`,
    hurt: `/assets/gamification/monsters/${folder}/hurt.webp`,
    defeat: `/assets/gamification/monsters/${folder}/defeat.webp`,
  };
}

function adventurePoses(id: string): MonsterPoseSet {
  return {
    idle: `/assets/adventure/monsters/${id}/idle.webp`,
    attack: `/assets/adventure/monsters/${id}/attack.webp`,
    hurt: `/assets/adventure/monsters/${id}/hurt.webp`,
    defeat: `/assets/adventure/monsters/${id}/defeat.webp`,
  };
}

const NORMAL_SIZE = { width: 104, height: 100 } as const;
const ELITE_SIZE = { width: 124, height: 118 } as const;

export const ADVENTURE_MONSTERS: MonsterDefinition[] = [
  /* ---------------- Normal ---------------- */
  {
    id: "forest-slime",
    name: "Slime Hutan",
    emoji: "🌱",
    tier: "normal",
    maxHp: 100,
    attackDamage: 0,
    displaySize: { ...NORMAL_SIZE },
    assetStatus: "ready",
    assets: gamificationPoses("slime"),
  },
  {
    id: "mushroom-goblin",
    name: "Goblin Jamur",
    emoji: "🍄",
    tier: "normal",
    maxHp: 100,
    attackDamage: 0,
    displaySize: { ...NORMAL_SIZE },
    assetStatus: "ready",
    assets: adventurePoses("mushroom-goblin"),
  },
  {
    id: "thorn-beetle",
    name: "Kumbang Duri",
    emoji: "🪲",
    tier: "normal",
    maxHp: 100,
    attackDamage: 0,
    displaySize: { ...NORMAL_SIZE },
    assetStatus: "ready",
    assets: adventurePoses("thorn-beetle"),
    abilities: ["spiky-shell"],
  },
  {
    id: "leaf-sprite",
    name: "Peri Daun",
    emoji: "🧚",
    tier: "normal",
    maxHp: 100,
    attackDamage: 0,
    displaySize: { width: 92, height: 96 },
    assetStatus: "ready",
    assets: adventurePoses("leaf-sprite"),
  },
  {
    id: "poison-frog",
    name: "Katak Giok",
    emoji: "🐸",
    tier: "normal",
    maxHp: 100,
    attackDamage: 0,
    displaySize: { ...NORMAL_SIZE },
    assetStatus: "ready",
    assets: adventurePoses("poison-frog"),
    abilities: ["poison-bubbles"],
  },
  {
    id: "vine-crawler",
    name: "Perayap Rambat",
    emoji: "🐛",
    tier: "normal",
    maxHp: 100,
    attackDamage: 0,
    displaySize: { width: 118, height: 96 },
    assetStatus: "ready",
    assets: adventurePoses("vine-crawler"),
  },

  /* ---------------- Elite ---------------- */
  {
    id: "forest-fox",
    name: "Rubah Penjaga Hutan",
    emoji: "🦊",
    tier: "elite",
    maxHp: 125,
    attackDamage: 0,
    displaySize: { ...ELITE_SIZE },
    assetStatus: "ready",
    assets: gamificationPoses("fox"),
    abilities: ["quick-dash"],
  },
  {
    id: "moss-golem",
    name: "Golem Lumut",
    emoji: "🗿",
    tier: "elite",
    maxHp: 125,
    attackDamage: 0,
    displaySize: { ...ELITE_SIZE },
    assetStatus: "ready",
    assets: adventurePoses("moss-golem"),
    abilities: ["sturdy-body"],
  },
  {
    id: "crystal-owl",
    name: "Burung Hantu Kristal",
    emoji: "🦉",
    tier: "elite",
    maxHp: 125,
    attackDamage: 0,
    displaySize: { ...ELITE_SIZE },
    assetStatus: "ready",
    assets: adventurePoses("crystal-owl"),
    abilities: ["swoop-warning"],
  },

  /* ---------------- Mini-boss ---------------- */
  {
    id: "purple-dragon",
    name: "Naga Ungu",
    emoji: "🐉",
    tier: "mini-boss",
    maxHp: 150,
    attackDamage: 12,
    displaySize: { width: 150, height: 140 },
    assetStatus: "ready",
    assets: gamificationPoses("purple-dragon"),
    abilities: ["timed-breath-attack"],
  },

  /* ---------------- Final boss ---------------- */
  {
    id: "tree-guardian",
    name: "Penjaga Pohon Purba",
    emoji: "🌳",
    tier: "final-boss",
    maxHp: 200,
    attackDamage: 15,
    displaySize: { width: 190, height: 176 },
    assetStatus: "ready",
    assets: adventurePoses("tree-guardian"),
    abilities: ["timed-root-attack", "branch-slam"],
  },
];

export function getAdventureMonsterById(id: string): MonsterDefinition {
  return ADVENTURE_MONSTERS.find((monster) => monster.id === id) ?? ADVENTURE_MONSTERS[0];
}

export function getMonstersByTier(tier: MonsterTier): MonsterDefinition[] {
  return ADVENTURE_MONSTERS.filter((monster) => monster.tier === tier);
}
