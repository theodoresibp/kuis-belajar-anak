import { describe, expect, it } from "vitest";
import { ADVENTURE_MONSTERS } from "./monsters.config";
import {
  ALBUM_TOTAL,
  MONSTER_FACTS,
  buildAlbumCards,
  countCollected,
  parseAlbum,
  recordDefeat,
  serializeAlbum,
  type AlbumCollection,
} from "./monster-album";

describe("monster album — catalogue", () => {
  it("covers all 12 monsters, each with a fact", () => {
    expect(ALBUM_TOTAL).toBe(12);
    ADVENTURE_MONSTERS.forEach((monster) => {
      expect(MONSTER_FACTS[monster.id]).toBeTruthy();
    });
    const cards = buildAlbumCards({});
    expect(cards).toHaveLength(12);
    expect(cards.every((card) => !card.defeated)).toBe(true);
    expect(countCollected({})).toBe(0);
  });
});

describe("recordDefeat", () => {
  it("adds a first defeat, then counts up and updates the zone", () => {
    const once = recordDefeat({}, "poison-frog", "hutan");
    expect(once["poison-frog"]).toEqual({
      monsterId: "poison-frog",
      defeats: 1,
      lastZoneId: "hutan",
    });
    const twice = recordDefeat(once, "poison-frog", "pantai");
    expect(twice["poison-frog"].defeats).toBe(2);
    expect(twice["poison-frog"].lastZoneId).toBe("pantai");
    // The original collection is not mutated.
    expect(once["poison-frog"].defeats).toBe(1);
    expect(countCollected(twice)).toBe(1);
  });

  it("ignores unknown monster ids", () => {
    const empty: AlbumCollection = {};
    expect(recordDefeat(empty, "not-a-monster", "hutan")).toBe(empty);
  });

  it("cards reflect defeats with counts and zones", () => {
    const collection = recordDefeat(
      recordDefeat({}, "monster-mama", "kastil"),
      "forest-slime",
      "hutan",
    );
    const cards = buildAlbumCards(collection);
    const mama = cards.find((card) => card.monster.id === "monster-mama");
    expect(mama?.defeated).toBe(true);
    expect(mama?.defeats).toBe(1);
    expect(mama?.lastZoneId).toBe("kastil");
    expect(countCollected(collection)).toBe(2);
  });
});

describe("parseAlbum / serializeAlbum", () => {
  it("round-trips a collection", () => {
    const collection = recordDefeat(
      recordDefeat({}, "leaf-sprite", "pantai"),
      "leaf-sprite",
      "pantai",
    );
    expect(parseAlbum(serializeAlbum(collection))).toEqual(collection);
  });

  it("returns an empty collection for missing or broken data", () => {
    expect(parseAlbum(null)).toEqual({});
    expect(parseAlbum("")).toEqual({});
    expect(parseAlbum("{not json")).toEqual({});
    expect(parseAlbum("[1,2,3]")).toEqual({});
    expect(parseAlbum('"text"')).toEqual({});
  });

  it("drops invalid entries but keeps valid ones", () => {
    const raw = JSON.stringify({
      "poison-frog": { monsterId: "poison-frog", defeats: 3, lastZoneId: "hutan" },
      "forest-slime": { monsterId: "forest-slime", defeats: -2, lastZoneId: "hutan" },
      "moss-golem": { monsterId: "moss-golem", defeats: 1, lastZoneId: "bulan" },
      "unknown-monster": { monsterId: "unknown-monster", defeats: 9, lastZoneId: "hutan" },
      "crystal-owl": "bukan objek",
    });
    const parsed = parseAlbum(raw);
    expect(Object.keys(parsed)).toEqual(["poison-frog"]);
    expect(parsed["poison-frog"].defeats).toBe(3);
  });
});
