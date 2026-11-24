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

/** A point on the illustrated map, in percent of the background
 *  image (1600x893). */
export interface WorldMapPoint {
  x: number;
  y: number;
}

/**
 * Anchor points along the dashed trail of the illustrated world
 * map (public/assets/adventure/world-map-bg.jpg), traced per zone:
 * START in the forest, over the bridge, along the rainbow beach
 * (Titik Tengah), then up the climbing loops to the castle FINISH.
 */
export const ZONE_TRAILS: Record<ZoneId, WorldMapPoint[]> = {
  hutan: [
    { x: 26.5, y: 34 },
    { x: 33, y: 38 },
    { x: 38.5, y: 44 },
    { x: 35, y: 52 },
    { x: 39, y: 57.5 },
  ],
  pantai: [
    { x: 46, y: 62 },
    { x: 49, y: 69 },
    { x: 52.5, y: 72.5 },
    { x: 60, y: 71 },
    { x: 67, y: 69.5 },
  ],
  kastil: [
    { x: 74, y: 66 },
    { x: 83, y: 61 },
    { x: 86.5, y: 52 },
    { x: 79, y: 44 },
    { x: 84, y: 37.5 },
    { x: 86.5, y: 34.5 },
  ],
};

/** Point at fraction `t` (0..1) of a polyline's total arc length. */
export function sampleTrail(
  points: readonly WorldMapPoint[],
  t: number,
): WorldMapPoint {
  if (points.length === 0) return { x: 50, y: 50 };
  if (points.length === 1) return points[0];
  const clamped = Math.min(1, Math.max(0, t));
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const len = Math.hypot(dx, dy);
    lengths.push(len);
    total += len;
  }
  let target = clamped * total;
  for (let i = 0; i < lengths.length; i += 1) {
    if (target <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] === 0 ? 0 : target / lengths[i];
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * f,
        y: points[i].y + (points[i + 1].y - points[i].y) * f,
      };
    }
    target -= lengths[i];
  }
  return points[points.length - 1];
}

export interface LaidOutWorldMapNode {
  node: WorldMapNode;
  x: number;
  y: number;
}

/**
 * Positions for every node on the illustrated map: each zone's
 * nodes spread along that zone's stretch of the trail (inset from
 * the ends so they sit inside their region), and the final boss
 * stands exactly on the castle FINISH point.
 */
export function layoutWorldMapNodes(map: WorldMapData): LaidOutWorldMapNode[] {
  const byZone = new Map<ZoneId, WorldMapNode[]>();
  map.nodes.forEach((node) => {
    const list = byZone.get(node.zoneId) ?? [];
    list.push(node);
    byZone.set(node.zoneId, list);
  });

  return map.nodes.map((node) => {
    const trail = ZONE_TRAILS[node.zoneId];
    if (node.isBoss) {
      const finish = trail[trail.length - 1];
      return { node, x: finish.x, y: finish.y };
    }
    const siblings = byZone.get(node.zoneId) ?? [node];
    const ownIndex = siblings.indexOf(node);
    const t =
      siblings.length <= 1
        ? 0.45
        : 0.1 + (ownIndex / (siblings.length - 1)) * 0.72;
    const point = sampleTrail(trail, t);
    return { node, x: point.x, y: point.y };
  });
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
