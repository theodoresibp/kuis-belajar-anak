import type { LevelLayout } from "./level-layout";
import type { ZoneId } from "./zones";

/**
 * Sprint 3 (Peti Harta): one treasure chest per zone, standing on a
 * dedicated chest step — an extra platform one hop above one of the
 * zone's high platforms. Answering one bonus question opens it, and
 * the reward pops out as a pickup.
 *
 * Each zone introduces one NEW power-up (the user reopened the door
 * to new variants for this sprint):
 *   Hutan  -> Orb Energi   (the next correct answer deals 2x damage)
 *   Pantai -> Berry Kecepatan (run 1.5x faster for 20 seconds)
 *   Kastil -> Bulu Sayap   (double jump for 30 seconds)
 *
 * The spots themselves come from the level layout (which high
 * platform hosts the step is picked by the layout's seed — the game
 * passes a fresh random seed per load, so the chest's spot changes
 * from run to run while always staying on a validated platform).
 */

export type ChestRewardKind = "orb" | "berry" | "wing";

export interface ChestRewardDefinition {
  kind: ChestRewardKind;
  name: string;
  emoji: string;
  description: string;
}

export const CHEST_REWARDS: Record<ChestRewardKind, ChestRewardDefinition> = {
  orb: {
    kind: "orb",
    name: "Orb Energi",
    emoji: "🔮",
    description: "Jawaban benar berikutnya memberi damage 2 kali lipat!",
  },
  berry: {
    kind: "berry",
    name: "Berry Kecepatan",
    emoji: "🍓",
    description: "Lari 1,5 kali lebih cepat selama 20 detik!",
  },
  wing: {
    kind: "wing",
    name: "Bulu Sayap",
    emoji: "🪶",
    description: "Bisa lompat dua kali di udara selama 30 detik!",
  },
};

/** Which new power-up each zone's chest introduces. */
export const ZONE_CHEST_REWARD: Record<ZoneId, ChestRewardKind> = {
  hutan: "orb",
  pantai: "berry",
  kastil: "wing",
};

export const BERRY_DURATION_MS = 20_000;
export const BERRY_SPEED_MULTIPLIER = 1.5;
export const WING_DURATION_MS = 30_000;

export interface AdventureChest {
  id: string;
  zoneId: ZoneId;
  reward: ChestRewardKind;
  /** World X of the chest's centre. */
  x: number;
  /** Y of the top of the platform the chest stands on. */
  platformTopY: number;
}

/**
 * One chest per zone of the run, standing on the zone's chest step
 * from the level layout (see generateLevelLayout).
 */
export function buildChests(layout: LevelLayout): AdventureChest[] {
  return layout.chestPlatforms.map((platform) => ({
    id: `chest-${platform.zoneId}`,
    zoneId: platform.zoneId,
    reward: ZONE_CHEST_REWARD[platform.zoneId],
    x: platform.x + platform.width / 2,
    platformTopY: platform.y - 14,
  }));
}
