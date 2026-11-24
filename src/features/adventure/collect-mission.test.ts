import { describe, expect, it } from "vitest";
import type { PlannedEncounter } from "./encounter-generator";
import { zoneIdForEncounter, type ZoneId } from "./zones";
import {
  COLLECTIBLES_PER_ENCOUNTER,
  MISSION_GOAL,
  encountersInZone,
  missionForZone,
} from "./collect-mission";

function fakePlan(count: number): PlannedEncounter[] {
  return Array.from({ length: count }, (_, index) => ({
    index,
    monsterId: "forest-slime",
    name: "Slime Hutan",
    emoji: "🟢",
    tier: index === count - 1 ? "final-boss" : "normal",
    questionCount: 5,
    monsterMaxHp: 100,
    attackDamage: 0,
  }));
}

const ZONES: ZoneId[] = ["hutan", "pantai", "kastil"];

describe("collect mission", () => {
  it("boss-only run: only the castle has a mission, goal capped by availability", () => {
    const plan = fakePlan(1);
    expect(encountersInZone(plan, "kastil")).toBe(1);
    expect(missionForZone(plan, "hutan")).toBeNull();
    expect(missionForZone(plan, "pantai")).toBeNull();
    const mission = missionForZone(plan, "kastil");
    expect(mission?.available).toBe(COLLECTIBLES_PER_ENCOUNTER);
    expect(mission?.goal).toBe(COLLECTIBLES_PER_ENCOUNTER);
    expect(mission?.item.kind).toBe("star");
  });

  it("three-encounter run: one encounter per zone, goal 2 everywhere", () => {
    const plan = fakePlan(3);
    for (const zone of ZONES) {
      const mission = missionForZone(plan, zone);
      expect(mission).not.toBeNull();
      expect(mission?.goal).toBe(2);
      expect(mission?.available).toBe(2);
    }
    expect(missionForZone(plan, "hutan")?.item.kind).toBe("firefly");
    expect(missionForZone(plan, "pantai")?.item.kind).toBe("shell");
    expect(missionForZone(plan, "kastil")?.item.kind).toBe("star");
  });

  it("goal never exceeds availability and caps at MISSION_GOAL (n = 1..25)", () => {
    for (let n = 1; n <= 25; n += 1) {
      const plan = fakePlan(n);
      for (const zone of ZONES) {
        const expectedCount = plan.filter(
          (_, i) => zoneIdForEncounter(i, n) === zone,
        ).length;
        expect(encountersInZone(plan, zone)).toBe(expectedCount);
        const mission = missionForZone(plan, zone);
        if (expectedCount === 0) {
          expect(mission).toBeNull();
        } else {
          expect(mission?.available).toBe(
            expectedCount * COLLECTIBLES_PER_ENCOUNTER,
          );
          expect(mission?.goal).toBe(
            Math.min(MISSION_GOAL, expectedCount * COLLECTIBLES_PER_ENCOUNTER),
          );
        }
      }
    }
  });
});
