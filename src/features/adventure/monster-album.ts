/**
 * Sprint 4 (Album Monster): a permanent collection of every monster
 * the player has ever defeated in Adventure Mode, kept in
 * localStorage so it survives closing the app.
 *
 * Defeats are recorded from AdventureMode's battle-completion point
 * (handleContinue) — the reducer, the battles and the questions are
 * untouched. Everything here is pure data work; load/save are thin
 * guarded wrappers around the (de)serialisers so the logic is
 * testable without a browser.
 */

import {
  ADVENTURE_MONSTERS,
  type MonsterDefinition,
  type MonsterTier,
} from "./monsters.config";
import type { ZoneId } from "./zones";

export const ALBUM_STORAGE_KEY = "kuis-adventure-album";

export const ALBUM_TOTAL = ADVENTURE_MONSTERS.length;

export interface AlbumEntry {
  monsterId: string;
  /** How many times this monster has been defeated, across all runs. */
  defeats: number;
  /** Zone of the most recent defeat. */
  lastZoneId: ZoneId;
}

export type AlbumCollection = Record<string, AlbumEntry>;

export const TIER_LABELS: Record<MonsterTier, string> = {
  normal: "Monster Biasa",
  elite: "Monster Elit",
  "mini-boss": "Mini-Boss",
  "final-boss": "Boss Terakhir",
};

/** One short, kid-friendly fact per monster, shown on its card. */
export const MONSTER_FACTS: Record<string, string> = {
  "forest-slime":
    "Badannya kenyal seperti agar-agar dan suka melompat-lompat di rumput basah.",
  "mushroom-goblin":
    "Tinggal di bawah jamur raksasa dan suka mengumpulkan spora yang berkilau.",
  "thorn-beetle":
    "Cangkangnya penuh duri tajam, tapi sebenarnya ia pemalu dan suka bersembunyi.",
  "leaf-sprite":
    "Terbang dengan sayap daunnya dan membantu menumbuhkan bunga-bunga di hutan.",
  "poison-frog":
    "Kulitnya hijau berkilau seperti batu giok dan suaranya terdengar sampai jauh.",
  "vine-crawler":
    "Merayap pelan-pelan di batang pohon dengan sulur-sulur hijaunya.",
  "forest-fox":
    "Berlari sangat cepat dan menjaga jalan setapak di dalam hutan.",
  "moss-golem":
    "Badannya terbuat dari batu dan lumut; ia sudah tidur di hutan selama ratusan tahun.",
  "crystal-owl":
    "Bisa melihat dalam gelap dan bulunya berkilau seperti kristal.",
  "purple-dragon":
    "Naga penjaga yang kuat; napasnya berwarna ungu menyala.",
  "tree-guardian":
    "Pohon hidup raksasa yang menjaga jantung Hutan Ajaib.",
  "monster-mama":
    "Ratu para monster! Mahkotanya berkilau dan tongkatnya sangat kuat.",
};

export interface AlbumCard {
  monster: MonsterDefinition;
  defeated: boolean;
  defeats: number;
  lastZoneId: ZoneId | null;
  fact: string;
}

/** All 12 cards in catalogue order, defeated ones filled in. */
export function buildAlbumCards(collection: AlbumCollection): AlbumCard[] {
  return ADVENTURE_MONSTERS.map((monster) => {
    const entry = collection[monster.id];
    return {
      monster,
      defeated: entry !== undefined && entry.defeats > 0,
      defeats: entry?.defeats ?? 0,
      lastZoneId: entry?.lastZoneId ?? null,
      fact: MONSTER_FACTS[monster.id] ?? "",
    };
  });
}

/** How many distinct monsters have been collected so far. */
export function countCollected(collection: AlbumCollection): number {
  return buildAlbumCards(collection).filter((card) => card.defeated).length;
}

/**
 * Returns a NEW collection with one more defeat for the monster.
 * Unknown monster ids are ignored (the same collection is returned).
 */
export function recordDefeat(
  collection: AlbumCollection,
  monsterId: string,
  zoneId: ZoneId,
): AlbumCollection {
  if (!ADVENTURE_MONSTERS.some((monster) => monster.id === monsterId)) {
    return collection;
  }
  const previous = collection[monsterId];
  return {
    ...collection,
    [monsterId]: {
      monsterId,
      defeats: (previous?.defeats ?? 0) + 1,
      lastZoneId: zoneId,
    },
  };
}

const KNOWN_ZONE_IDS: readonly string[] = [
  "hutan",
  "pantai",
  "kastil",
] satisfies readonly ZoneId[];

/**
 * Parses stored JSON into a collection, dropping anything that does
 * not look like a valid entry for a known monster — a corrupted or
 * hand-edited store can never break the album.
 */
export function parseAlbum(raw: string | null): AlbumCollection {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }
  const collection: AlbumCollection = {};
  for (const monster of ADVENTURE_MONSTERS) {
    const value = (parsed as Record<string, unknown>)[monster.id];
    if (typeof value !== "object" || value === null) continue;
    const entry = value as Record<string, unknown>;
    const defeats = entry.defeats;
    const lastZoneId = entry.lastZoneId;
    if (
      typeof defeats === "number" &&
      Number.isFinite(defeats) &&
      defeats > 0 &&
      typeof lastZoneId === "string" &&
      KNOWN_ZONE_IDS.includes(lastZoneId)
    ) {
      collection[monster.id] = {
        monsterId: monster.id,
        defeats: Math.floor(defeats),
        lastZoneId: lastZoneId as ZoneId,
      };
    }
  }
  return collection;
}

export function serializeAlbum(collection: AlbumCollection): string {
  return JSON.stringify(collection);
}

export function loadAlbum(): AlbumCollection {
  try {
    return parseAlbum(window.localStorage.getItem(ALBUM_STORAGE_KEY));
  } catch {
    return {};
  }
}

export function saveAlbum(collection: AlbumCollection): void {
  try {
    window.localStorage.setItem(ALBUM_STORAGE_KEY, serializeAlbum(collection));
  } catch {
    // Storage full or unavailable (private mode): the album simply
    // will not persist this time; the game itself is unaffected.
  }
}
