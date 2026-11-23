/**
 * Adventure world zones (locations).
 *
 * A run no longer crosses a single forest: the world is divided into
 * three locations that the hero walks through in order —
 *
 *   🌲 Hutan Ajaib (the original Enchanted Forest)
 *   🏖️ Pantai Pelangi (a sunny beach)
 *   🏰 Gerbang Kastil Senja (the final boss's castle gate at dusk)
 *
 * The final encounter always stands in the castle zone; the remaining
 * encounters split between forest (first half) and beach (second half).
 * Pure and deterministic, like the encounter generator and level layout
 * it feeds: the same run length always produces the same journey.
 */

export type ZoneId = "hutan" | "pantai" | "kastil";

export interface ZoneDefinition {
  id: ZoneId;
  name: string;
  emoji: string;
}

export const ZONES: Record<ZoneId, ZoneDefinition> = {
  hutan: { id: "hutan", name: "Hutan Ajaib", emoji: "🌲" },
  pantai: { id: "pantai", name: "Pantai Pelangi", emoji: "🏖️" },
  kastil: { id: "kastil", name: "Gerbang Kastil Senja", emoji: "🏰" },
};

/** A contiguous stretch of the world (in world X coordinates) that
 *  belongs to one zone. */
export interface ZoneRange {
  id: ZoneId;
  x0: number;
  x1: number;
}

/** Which zone the encounter at `index` (of `count` encounters) stands
 *  in. The last encounter — always the final boss — is in the castle
 *  zone; a one-encounter run is therefore all castle. */
export function zoneIdForEncounter(index: number, count: number): ZoneId {
  const total = Math.max(1, Math.floor(count));
  const i = Math.min(Math.max(0, Math.floor(index)), total - 1);
  if (i >= total - 1) return "kastil";
  const nonBoss = total - 1;
  const forestCount = Math.ceil(nonBoss / 2);
  return i < forestCount ? "hutan" : "pantai";
}

/** Zone ranges for a run: boundaries sit halfway between the encounter
 *  spots where the zone changes, so each monster stands well inside its
 *  own location and the scenery changes in the gaps between fights. */
export function zoneRangesForEncounters(
  encounterXs: readonly number[],
  worldWidth: number,
): ZoneRange[] {
  const count = encounterXs.length;
  if (count === 0) return [{ id: "hutan", x0: 0, x1: worldWidth }];

  const ranges: ZoneRange[] = [];
  let currentId = zoneIdForEncounter(0, count);
  let currentStart = 0;
  for (let i = 1; i < count; i += 1) {
    const id = zoneIdForEncounter(i, count);
    if (id !== currentId) {
      const boundary = Math.round((encounterXs[i - 1] + encounterXs[i]) / 2);
      ranges.push({ id: currentId, x0: currentStart, x1: boundary });
      currentId = id;
      currentStart = boundary;
    }
  }
  ranges.push({ id: currentId, x0: currentStart, x1: worldWidth });
  return ranges;
}

/** The zone covering world position `x` (first range wins on edges). */
export function zoneIdAtX(ranges: readonly ZoneRange[], x: number): ZoneId {
  for (const range of ranges) {
    if (x >= range.x0 && x < range.x1) return range.id;
  }
  return ranges.length > 0 ? ranges[ranges.length - 1].id : "hutan";
}
