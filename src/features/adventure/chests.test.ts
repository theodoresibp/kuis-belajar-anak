import { describe, expect, it } from "vitest";
import { generateLevelLayout } from "./level-layout";
import { buildChests } from "./chests";

describe("buildChests", () => {
  it("places one chest per zone with the zone's new power-up", () => {
    const layout = generateLevelLayout(4);
    const chests = buildChests(layout);
    expect(chests.map((chest) => chest.zoneId)).toEqual([
      "hutan",
      "pantai",
      "kastil",
    ]);
    expect(chests.map((chest) => chest.reward)).toEqual([
      "orb",
      "berry",
      "wing",
    ]);
  });

  it("every chest stands on a high platform inside its own zone", () => {
    const layout = generateLevelLayout(5);
    buildChests(layout).forEach((chest) => {
      const zone = layout.zones.find((range) => range.id === chest.zoneId);
      expect(zone).toBeDefined();
      expect(chest.x).toBeGreaterThanOrEqual(zone!.x0);
      expect(chest.x).toBeLessThan(zone!.x1);
      // High platform tops only: 380-14 or 365-14.
      expect([366, 351]).toContain(chest.platformTopY);
      const onPlatform = layout.platforms.some(
        (platform) =>
          platform.y - 14 === chest.platformTopY &&
          chest.x >= platform.x &&
          chest.x <= platform.x + platform.width,
      );
      expect(onPlatform).toBe(true);
    });
  });

  it("a boss-only run gets just the castle chest (wing)", () => {
    const chests = buildChests(generateLevelLayout(1));
    expect(chests).toHaveLength(1);
    expect(chests[0].zoneId).toBe("kastil");
    expect(chests[0].reward).toBe("wing");
  });

  it("a two-encounter run has forest + castle chests, no beach chest", () => {
    const chests = buildChests(generateLevelLayout(2));
    expect(chests.map((chest) => chest.reward)).toEqual(["orb", "wing"]);
  });
});
