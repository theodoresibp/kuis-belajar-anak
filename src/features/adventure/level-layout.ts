/**
 * Level layout generator (Sprint C).
 *
 * Derives the Phaser world geometry from the number of encounters in a
 * run: monster positions, ground segments (with jumpable gaps between
 * encounters), floating platforms, hazards, pickups and the walkable
 * surfaces used for contact shadows. Pure and deterministic — it
 * generalises the original hand-placed 3-encounter world (monsters at
 * 760/1510/2320, gaps 110px wide, platform rows at y 445/380/365) so any
 * run length keeps the same look, spacing and jump distances.
 *
 * Gameplay invariants this layout preserves:
 * - The hero spawns at x=120 with no hazard or monster nearby.
 * - Every monster stands on solid ground with room to approach.
 * - Ground gaps (110px) only appear between encounters, never under a
 *   monster, a hazard or a pickup.
 * - The low platform row (centre y 445, underside 459) always leaves 9px
 *   of head clearance over the 88px hero walking underneath — the ground
 *   path to each monster is never blocked (the Sprint B platform fix).
 * - Platform tops are at most 205px above the surface below them, inside
 *   the ~216px jump reach.
 * - Sprint 3 (Peti Harta): each zone gets ONE chest step — a platform
 *   100px above one of the zone's high platforms (16px of head
 *   clearance over a hero standing on that high platform), so the
 *   chest takes two deliberate jumps to reach. Which high platform
 *   hosts it is chosen by the layout seed: the game passes a fresh
 *   random seed on every load, so the chest's spot changes from run
 *   to run while always staying on a validated, reachable platform.
 */

export interface LevelEncounterSpot {
  index: number;
  x: number;
}

export interface LevelGroundSegment {
  x: number;
  width: number;
}

export interface LevelPlatform {
  /** Left edge; centre Y (the scene's addPlatform convention). */
  x: number;
  y: number;
  width: number;
  kind: "wood" | "stone";
}

export interface LevelPickup {
  x: number;
  kind: "heart" | "shield";
}

export interface LevelSurface {
  x0: number;
  x1: number;
  top: number;
}

/** The extra step above a zone's chosen high platform; the zone's
 *  treasure chest stands on it (Sprint 3). Also part of `platforms`. */
export interface LevelChestPlatform extends LevelPlatform {
  zoneId: ZoneId;
}

export interface LevelLayout {
  worldWidth: number;
  worldHeight: number;
  groundTopY: number;
  encounters: LevelEncounterSpot[];
  groundSegments: LevelGroundSegment[];
  platforms: LevelPlatform[];
  chestPlatforms: LevelChestPlatform[];
  hazards: { x: number }[];
  pickups: LevelPickup[];
  surfaces: LevelSurface[];
  /** Location zones (forest → beach → castle) across the world. */
  zones: ZoneRange[];
}

import {
  zoneIdForEncounter,
  zoneRangesForEncounters,
  type ZoneId,
  type ZoneRange,
} from "./zones";
import { hashSeed, mulberry32 } from "./encounter-generator";

export const LEVEL = {
  worldHeight: 640,
  groundTopY: 556,
  firstMonsterX: 760,
  monsterStep: 760,
  worldTail: 340,
  gapOffset: 140,
  gapWidth: 110,
  platformWidth: 180,
} as const;

export function generateLevelLayout(
  encounterCount: number,
  seed?: string,
): LevelLayout {
  const count = Math.max(1, Math.floor(encounterCount));
  const {
    firstMonsterX,
    monsterStep,
    worldTail,
    gapOffset,
    gapWidth,
    platformWidth,
    groundTopY,
  } = LEVEL;

  const worldWidth = firstMonsterX + (count - 1) * monsterStep + worldTail;
  const encounters: LevelEncounterSpot[] = Array.from(
    { length: count },
    (_, index) => ({ index, x: firstMonsterX + index * monsterStep }),
  );

  // Ground segments: solid ground everywhere except a gap after each
  // non-final monster.
  const groundSegments: LevelGroundSegment[] = [];
  let segmentStart = 0;
  for (let i = 0; i < count - 1; i += 1) {
    const gapStart = encounters[i].x + gapOffset;
    groundSegments.push({ x: segmentStart, width: gapStart - segmentStart });
    segmentStart = gapStart + gapWidth;
  }
  groundSegments.push({
    x: segmentStart,
    width: worldWidth - segmentStart,
  });

  // Two floating platforms per approach zone (the stretch before each
  // monster), alternating materials and heights like the original world.
  // Materials also follow the location: wooden platforms on the beach,
  // stone ones at the castle gate.
  const platforms: LevelPlatform[] = [];
  for (let i = 0; i < count; i += 1) {
    const zoneStart = i * monsterStep;
    const zone = zoneIdForEncounter(i, count);
    const lowKind =
      zone === "pantai" ? "wood" : zone === "kastil" ? "stone" : i % 2 === 0 ? "wood" : "stone";
    const highKind =
      zone === "pantai" ? "wood" : zone === "kastil" ? "stone" : i % 2 === 0 ? "stone" : "wood";
    platforms.push({
      x: zoneStart + 360,
      y: 445,
      width: platformWidth,
      kind: lowKind,
    });
    platforms.push({
      x: zoneStart + 640,
      y: i % 2 === 0 ? 380 : 365,
      width: platformWidth,
      kind: highKind,
    });
  }

  const zones = zoneRangesForEncounters(
    encounters.map((spot) => spot.x),
    worldWidth,
  );

  // Sprint 3 (Peti Harta): one chest step per zone, 100px above one
  // of the zone's high platforms — half-overlapping it, so the hop up
  // mirrors the game's other platform hops, with 16px of head
  // clearance over a hero standing on the high platform below. The
  // layout seed picks which high platform hosts it (first one when
  // no seed is given, e.g. in tests and previews); the game passes a
  // fresh random seed per load, so the chest's spot varies per run
  // but always lands on a validated platform inside its own zone.
  const chestPlatforms: LevelChestPlatform[] = [];
  const rng = seed === undefined ? null : mulberry32(hashSeed(seed));
  zones.forEach((zone) => {
    const candidates = platforms.filter((platform) => {
      const center = platform.x + platform.width / 2;
      return platform.y <= 400 && center >= zone.x0 && center < zone.x1;
    });
    if (candidates.length === 0) return;
    const base =
      candidates[
        rng === null ? 0 : Math.floor(rng() * candidates.length)
      ];
    const step: LevelChestPlatform = {
      x: base.x + 90,
      y: base.y - 100,
      width: platformWidth,
      kind: base.kind,
      zoneId: zone.id,
    };
    platforms.push(step);
    chestPlatforms.push(step);
  });

  // One spike hazard per approach zone, on the ground under the low
  // platform — visible, and avoidable by jumping onto the platform.
  const hazards = encounters.map((_, i) => ({ x: i * monsterStep + 480 }));

  // A pickup after each monster (alternating heart/shield), plus a bonus
  // heart before the final boss on longer runs.
  const pickups: LevelPickup[] = [];
  for (let i = 0; i < count - 1; i += 1) {
    pickups.push({
      x: encounters[i].x + 280,
      kind: i % 2 === 0 ? "heart" : "shield",
    });
  }
  if (count >= 3) {
    pickups.push({ x: encounters[count - 1].x - 150, kind: "heart" });
  }

  const surfaces: LevelSurface[] = [
    ...groundSegments.map((segment) => ({
      x0: segment.x,
      x1: segment.x + segment.width,
      top: groundTopY,
    })),
    ...platforms.map((platform) => ({
      x0: platform.x,
      x1: platform.x + platform.width,
      top: platform.y - 14,
    })),
  ];

  return {
    worldWidth,
    worldHeight: LEVEL.worldHeight,
    groundTopY,
    encounters,
    groundSegments,
    platforms,
    chestPlatforms,
    hazards,
    pickups,
    surfaces,
    zones,
  };
}
