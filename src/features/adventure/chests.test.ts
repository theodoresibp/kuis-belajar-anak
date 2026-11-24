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

  it("every chest stands on its zone's chest step, one hop above a high platform", () => {
    const layout = generateLevelLayout(5);
    buildChests(layout).forEach((chest) => {
      const zone = layout.zones.find((range) => range.id === chest.zoneId);
      expect(zone).toBeDefined();
      expect(chest.x).toBeGreaterThanOrEqual(zone!.x0);
      expect(chest.x).toBeLessThan(zone!.x1);
      // Chest step tops: (380-100)-14 or (365-100)-14.
      expect([266, 251]).toContain(chest.platformTopY);
      const step = layout.chestPlatforms.find(
        (platform) => platform.zoneId === chest.zoneId,
      );
      expect(step).toBeDefined();
      expect(chest.x).toBe(step!.x + step!.width / 2);
      expect(chest.platformTopY).toBe(step!.y - 14);
    });
  });

  it("without a seed the chest uses the zone's first high platform; a seed varies the spot", () => {
    // 5 encounters: the forest holds encounters 0 and 1, whose high
    // platforms centre on x=730 and x=1490 — chest steps centre 90px
    // further right, so the forest chest sits at x=820 or x=1580.
    const unseeded = buildChests(generateLevelLayout(5));
    expect(unseeded[0].x).toBe(820);

    const spots = new Set<number>();
    for (let i = 0; i < 16; i += 1) {
      const chests = buildChests(generateLevelLayout(5, `run-${i}`));
      expect([820, 1580]).toContain(chests[0].x);
      spots.add(chests[0].x);
    }
    expect(spots.size).toBe(2);
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
