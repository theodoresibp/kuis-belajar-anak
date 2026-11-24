import type { PlannedEncounter } from "./encounter-generator";
import { ZONES, zoneIdForEncounter, type ZoneId } from "./zones";

/**
 * Sprint 2 (Peta Dunia): the run plan drawn as a journey map.
 * Pure data only — the WorldMap component renders nodes along a
 * winding path, coloured by zone, with the final boss at the end.
 * Nothing here changes the plan; it only describes it.
 */

export interface WorldMapNode {
  index: number;
  zoneId: ZoneId;
  monsterId: string;
  monsterName: string;
  emoji: string;
  tier: PlannedEncounter["tier"];
  isBoss: boolean;
}

export interface WorldMapZoneSpan {
  zoneId: ZoneId;
  name: string;
  emoji: string;
  /** First node index belonging to this zone. */
  fromIndex: number;
  /** Last node index belonging to this zone (inclusive). */
  toIndex: number;
}

export interface WorldMapData {
  nodes: WorldMapNode[];
  zones: WorldMapZoneSpan[];
}

export function buildWorldMap(
  plan: readonly PlannedEncounter[],
): WorldMapData {
  const nodes: WorldMapNode[] = plan.map((encounter, i) => ({
    index: encounter.index,
    zoneId: zoneIdForEncounter(i, plan.length),
    monsterId: encounter.monsterId,
    monsterName: encounter.name,
    emoji: encounter.emoji,
    tier: encounter.tier,
    isBoss: i === plan.length - 1,
  }));

  const zones: WorldMapZoneSpan[] = [];
  nodes.forEach((node) => {
    const last = zones[zones.length - 1];
    if (last && last.zoneId === node.zoneId) {
      last.toIndex = node.index;
    } else {
      zones.push({
        zoneId: node.zoneId,
        name: ZONES[node.zoneId].name,
        emoji: ZONES[node.zoneId].emoji,
        fromIndex: node.index,
        toIndex: node.index,
      });
    }
  });

  return { nodes, zones };
}
