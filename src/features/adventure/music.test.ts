import { describe, expect, it } from "vitest";

import { MUSIC_TRACKS, trackForTier } from "./music";

describe("trackForTier", () => {
  it("maps tiers to escalating battle tracks", () => {
    expect(trackForTier(null)).toBe("explore");
    expect(trackForTier("normal")).toBe("battle");
    expect(trackForTier("elite")).toBe("battle-elite");
    expect(trackForTier("mini-boss")).toBe("battle-boss");
    expect(trackForTier("final-boss")).toBe("battle-boss");
  });
});

describe("MUSIC_TRACKS", () => {
  it("battle tracks get faster and louder as the tier rises", () => {
    expect(MUSIC_TRACKS.battle.bpm).toBeGreaterThan(MUSIC_TRACKS.explore.bpm);
    expect(MUSIC_TRACKS["battle-elite"].bpm).toBeGreaterThan(MUSIC_TRACKS.battle.bpm);
    expect(MUSIC_TRACKS["battle-boss"].bpm).toBeGreaterThan(MUSIC_TRACKS["battle-elite"].bpm);
    expect(MUSIC_TRACKS["battle-boss"].level).toBeGreaterThanOrEqual(MUSIC_TRACKS.battle.level);
  });

  it("every loop is two bars of sane MIDI notes", () => {
    for (const def of Object.values(MUSIC_TRACKS)) {
      expect(def.lead).toHaveLength(32);
      for (const note of def.lead) {
        if (note !== null) {
          expect(note).toBeGreaterThanOrEqual(55);
          expect(note).toBeLessThanOrEqual(88);
        }
      }
      expect(def.bassRoots).toHaveLength(2);
      for (const root of def.bassRoots) {
        expect(root).toBeGreaterThanOrEqual(28);
        expect(root).toBeLessThanOrEqual(48);
      }
      for (const hatStep of def.hatSteps) {
        expect(hatStep).toBeGreaterThanOrEqual(0);
        expect(hatStep).toBeLessThan(32);
      }
    }
  });
});
