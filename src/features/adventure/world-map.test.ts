import { describe, expect, it } from "vitest";
import type { PlannedEncounter } from "./encounter-generator";
import { buildWorldMap, layoutWorldMapNodes, ZONE_TRAILS } from "./world-map";

function encounter(index: number, tier: PlannedEncounter["tier"]): PlannedEncounter {
  return {
    index,
    monsterId: `monster-${index}`,
    name: `Monster ${index}`,
    emoji: "👾",
    tier,
    questionCount: 5,
    monsterMaxHp: 100,
    attackDamage: 0,
  };
}

describe("buildWorldMap", () => {
  it("boss-only run: one castle node, marked as boss", () => {
    const map = buildWorldMap([encounter(0, "boss")]);
    expect(map.nodes).toHaveLength(1);
    expect(map.nodes[0].zoneId).toBe("kastil");
    expect(map.nodes[0].isBoss).toBe(true);
    expect(map.zones).toEqual([
      { zoneId: "kastil", name: "Gerbang Kastil Senja", emoji: "🏰", fromIndex: 0, toIndex: 0 },
    ]);
  });

  it("three encounters span all three zones in order", () => {
    const map = buildWorldMap([
      encounter(0, "normal"),
      encounter(1, "normal"),
      encounter(2, "boss"),
    ]);
    expect(map.nodes.map((n) => n.zoneId)).toEqual(["hutan", "pantai", "kastil"]);
    expect(map.nodes.map((n) => n.isBoss)).toEqual([false, false, true]);
    expect(map.zones.map((z) => z.zoneId)).toEqual(["hutan", "pantai", "kastil"]);
  });

  it("zone spans group consecutive nodes of the same zone", () => {
    const plan = [
      encounter(0, "normal"),
      encounter(1, "normal"),
      encounter(2, "elite"),
      encounter(3, "normal"),
      encounter(4, "boss"),
    ];
    const map = buildWorldMap(plan);
    expect(map.zones.map((z) => [z.zoneId, z.fromIndex, z.toIndex])).toEqual([
      ["hutan", 0, 1],
      ["pantai", 2, 3],
      ["kastil", 4, 4],
    ]);
    expect(map.nodes[4].monsterName).toBe("Monster 4");
  });
});

describe("layoutWorldMapNodes (illustrated map)", () => {
  it("the boss stands exactly on the castle FINISH point", () => {
    const map = buildWorldMap([encounter(0, "boss")]);
    const laid = layoutWorldMapNodes(map);
    const finish = ZONE_TRAILS.kastil[ZONE_TRAILS.kastil.length - 1];
    expect(laid[0].x).toBe(finish.x);
    expect(laid[0].y).toBe(finish.y);
  });

  it("every node lands inside the image and inside its zone's region", () => {
    const plan = [
      encounter(0, "normal"),
      encounter(1, "normal"),
      encounter(2, "elite"),
      encounter(3, "normal"),
      encounter(4, "boss"),
    ];
    const laid = layoutWorldMapNodes(buildWorldMap(plan));
    laid.forEach(({ x, y }) => {
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(100);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(100);
    });
    // Forest nodes stay on the forest (left) side, beach nodes low,
    // castle nodes on the right side.
    expect(laid[0].x).toBeLessThan(45);
    expect(laid[2].y).toBeGreaterThan(55);
    expect(laid[3].x).toBeGreaterThan(40);
    expect(laid[4].x).toBeGreaterThan(80);
  });
});
