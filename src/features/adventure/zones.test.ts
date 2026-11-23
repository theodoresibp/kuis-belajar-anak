import { describe, expect, it } from "vitest";
import {
  zoneIdAtX,
  zoneIdForEncounter,
  zoneRangesForEncounters,
} from "./zones";

describe("zoneIdForEncounter", () => {
  it("a single encounter is the castle boss zone", () => {
    expect(zoneIdForEncounter(0, 1)).toBe("kastil");
  });

  it("two encounters: forest, then castle", () => {
    expect([0, 1].map((i) => zoneIdForEncounter(i, 2))).toEqual([
      "hutan",
      "kastil",
    ]);
  });

  it("three encounters visit all three zones in order", () => {
    expect([0, 1, 2].map((i) => zoneIdForEncounter(i, 3))).toEqual([
      "hutan",
      "pantai",
      "kastil",
    ]);
  });

  it("the last encounter is always the castle, for any run length", () => {
    for (let count = 1; count <= 15; count += 1) {
      expect(zoneIdForEncounter(count - 1, count)).toBe("kastil");
      // Zones never go backwards: hutan... pantai... kastil.
      const order = { hutan: 0, pantai: 1, kastil: 2 } as const;
      const sequence = Array.from({ length: count }, (_, i) =>
        zoneIdForEncounter(i, count),
      );
      for (let i = 1; i < sequence.length; i += 1) {
        expect(order[sequence[i]]).toBeGreaterThanOrEqual(
          order[sequence[i - 1]],
        );
      }
    }
  });
});

describe("zoneRangesForEncounters", () => {
  it("covers the whole world without gaps", () => {
    const ranges = zoneRangesForEncounters([760, 1520, 2280], 2620);
    expect(ranges.map((r) => r.id)).toEqual(["hutan", "pantai", "kastil"]);
    expect(ranges[0].x0).toBe(0);
    expect(ranges[ranges.length - 1].x1).toBe(2620);
    for (let i = 1; i < ranges.length; i += 1) {
      expect(ranges[i].x0).toBe(ranges[i - 1].x1);
    }
    // Every monster stands inside its own zone.
    expect(zoneIdAtX(ranges, 760)).toBe("hutan");
    expect(zoneIdAtX(ranges, 1520)).toBe("pantai");
    expect(zoneIdAtX(ranges, 2280)).toBe("kastil");
  });
});
