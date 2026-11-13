import { describe, expect, it } from "vitest";
import { generateLevelLayout, LEVEL } from "./level-layout";

const onGround = (layout: ReturnType<typeof generateLevelLayout>, x: number) =>
  layout.groundSegments.some(
    (segment) => x >= segment.x && x <= segment.x + segment.width,
  );

describe("generateLevelLayout — shapes", () => {
  it("single encounter: one full-width ground segment", () => {
    const layout = generateLevelLayout(1);
    expect(layout.worldWidth).toBe(1100);
    expect(layout.groundSegments).toEqual([{ x: 0, width: 1100 }]);
    expect(layout.encounters).toEqual([{ index: 0, x: 760 }]);
    expect(layout.pickups).toEqual([]);
  });

  it("three encounters reproduce the original hand-placed world", () => {
    const layout = generateLevelLayout(3);
    expect(layout.worldWidth).toBe(2620);
    expect(layout.encounters.map((e) => e.x)).toEqual([760, 1520, 2280]);
    expect(layout.groundSegments).toEqual([
      { x: 0, width: 900 },
      { x: 1010, width: 650 },
      { x: 1770, width: 850 },
    ]);
    expect(layout.hazards.map((h) => h.x)).toEqual([480, 1240, 2000]);
    expect(layout.pickups).toEqual([
      { x: 1040, kind: "heart" },
      { x: 1800, kind: "shield" },
      { x: 2130, kind: "heart" },
    ]);
  });
});

describe("generateLevelLayout — invariants for any run length", () => {
  it("holds for 1..25 encounters", () => {
    for (let n = 1; n <= 25; n += 1) {
      const layout = generateLevelLayout(n);

      // World grows by one monster step per extra encounter.
      expect(layout.worldWidth).toBe(
        LEVEL.firstMonsterX + (n - 1) * LEVEL.monsterStep + LEVEL.worldTail,
      );

      // Segments are sorted, non-overlapping, and together with the gaps
      // span the whole world.
      let cursor = 0;
      for (const segment of layout.groundSegments) {
        expect(segment.x).toBeGreaterThanOrEqual(cursor);
        expect(segment.width).toBeGreaterThan(0);
        cursor = segment.x + segment.width;
        expect(cursor).toBeLessThanOrEqual(layout.worldWidth);
      }
      expect(layout.groundSegments).toHaveLength(n);
      expect(cursor).toBeLessThanOrEqual(layout.worldWidth);

      // Every monster stands on solid ground, clear of segment edges.
      for (const encounter of layout.encounters) {
        expect(onGround(layout, encounter.x - 60)).toBe(true);
        expect(onGround(layout, encounter.x + 60)).toBe(true);
      }

      // Hazards and pickups sit on ground, away from monsters.
      for (const hazard of layout.hazards) {
        expect(onGround(layout, hazard.x)).toBe(true);
        for (const encounter of layout.encounters) {
          expect(Math.abs(hazard.x - encounter.x)).toBeGreaterThanOrEqual(200);
        }
      }
      for (const pickup of layout.pickups) {
        expect(onGround(layout, pickup.x)).toBe(true);
        for (const encounter of layout.encounters) {
          expect(Math.abs(pickup.x - encounter.x)).toBeGreaterThanOrEqual(120);
        }
      }

      // Spawn area (x=120) is safe: no hazard within 200px.
      for (const hazard of layout.hazards) {
        expect(Math.abs(hazard.x - 120)).toBeGreaterThanOrEqual(200);
      }

      // Platform rules: low row keeps 9px head clearance for the 88px
      // hero walking underneath (underside 459 vs head at 468), and
      // every platform top is within jump reach from the ground
      // (<= 205px up; max jump is ~216px).
      for (const platform of layout.platforms) {
        if (platform.y === 445) {
          expect(platform.y + 14).toBeLessThanOrEqual(
            LEVEL.groundTopY - 88 - 9,
          );
        }
        expect(LEVEL.groundTopY - (platform.y - 14)).toBeLessThanOrEqual(205);
      }

      // Surfaces cover every ground segment and platform.
      expect(layout.surfaces).toHaveLength(
        layout.groundSegments.length + layout.platforms.length,
      );
    }
  });
});
