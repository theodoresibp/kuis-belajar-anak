import type { PlannedEncounter } from "./encounter-generator";
import { zoneIdForEncounter, type ZoneId } from "./zones";

/**
 * Fitur "Misi Kumpulkan": at every zone entrance the owl teacher
 * gives the hero a small side mission — collect a few floating items
 * that hover over the zone's platforms while exploring. Finishing a
 * zone's mission grants +1 shield (the ordinary COLLECT_SHIELD).
 *
 * The level layout scatters COLLECTIBLES_PER_ENCOUNTER items per
 * encounter approach, all assigned to that encounter's zone, so the
 * goal below is always reachable: it never exceeds the number of
 * items the zone actually holds.
 */

export type CollectItemKind = "firefly" | "shell" | "star";

export interface CollectItemInfo {
  kind: CollectItemKind;
  name: string;
  emoji: string;
}

export const COLLECT_ITEMS: Record<ZoneId, CollectItemInfo> = {
  hutan: { kind: "firefly", name: "Kunang-kunang", emoji: "✨" },
  pantai: { kind: "shell", name: "Kerang Cantik", emoji: "🐚" },
  kastil: { kind: "star", name: "Bintang Kecil", emoji: "⭐" },
};

/** Items the layout places per encounter approach (one over the low
 *  platform, one over the high platform). */
export const COLLECTIBLES_PER_ENCOUNTER = 2;

/** How many items a zone mission asks for (capped by availability). */
export const MISSION_GOAL = 3;

export interface ZoneMission {
  zoneId: ZoneId;
  item: CollectItemInfo;
  /** Items to collect in this zone to earn the shield. */
  goal: number;
  /** Items present in this zone. */
  available: number;
}

/** How many of the plan's encounters belong to a zone. */
export function encountersInZone(
  plan: readonly PlannedEncounter[],
  zoneId: ZoneId,
): number {
  let count = 0;
  for (let i = 0; i < plan.length; i += 1) {
    if (zoneIdForEncounter(i, plan.length) === zoneId) count += 1;
  }
  return count;
}

/** The collect mission for one zone of this run, or null when the
 *  zone does not appear in the run. */
export function missionForZone(
  plan: readonly PlannedEncounter[],
  zoneId: ZoneId,
): ZoneMission | null {
  const available =
    encountersInZone(plan, zoneId) * COLLECTIBLES_PER_ENCOUNTER;
  if (available === 0) return null;
  return {
    zoneId,
    item: COLLECT_ITEMS[zoneId],
    goal: Math.min(MISSION_GOAL, available),
    available,
  };
}
