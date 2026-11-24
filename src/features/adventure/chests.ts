import type { LevelLayout } from "./level-layout";
import type { ZoneId } from "./zones";

/**
 * Sprint 3 (Peti Harta): one treasure chest per zone, standing on a
 * high platform the player must deliberately jump to. Answering one
 * bonus question opens it, and the reward pops out as a pickup.
 *
 * Each zone introduces one NEW power-up (the user reopened the door
 * to new variants for this sprint):
 *   Hutan  -> Orb Energi   (the next correct answer deals 2x damage)
 *   Pantai -> Berry Kecepatan (run 1.5x faster for 20 seconds)
 *   Kastil -> Bulu Sayap   (double jump for 30 seconds)
 *
 * Pure and deterministic like the rest of the adventure generators:
 * chest spots derive from the level layout's own platforms, so a
 * chest always stands on a real platform inside its zone.
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
 * One chest per zone of the run: on the zone's first HIGH platform
 * (the layout's upper row, centre y 365/380 — reaching it takes a
 * deliberate jump from the low row or the ground).
 */
export function buildChests(layout: LevelLayout): AdventureChest[] {
  const chests: AdventureChest[] = [];
  layout.zones.forEach((zone) => {
    const platform = layout.platforms.find((candidate) => {
      const center = candidate.x + candidate.width / 2;
      return (
        candidate.y <= 400 && center >= zone.x0 && center < zone.x1
      );
    });
    if (!platform) return;
    chests.push({
      id: `chest-${zone.id}`,
      zoneId: zone.id,
      reward: ZONE_CHEST_REWARD[zone.id],
      x: platform.x + platform.width / 2,
      platformTopY: platform.y - 14,
    });
  });
  return chests;
}
