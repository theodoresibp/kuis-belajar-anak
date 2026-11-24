import { describe, expect, it } from "vitest";
import type { QuizChapter } from "@/types/quiz";
import { buildOwlStops, zoneSequence } from "./owl";

function chapter(material?: QuizChapter["material"]): QuizChapter {
  return {
    id: "bab-uji",
    title: "Bab Uji",
    emoji: "📘",
    gradient: "from-sky-400 to-blue-600",
    material,
    questions: [],
  };
}

const WITH_MATERIAL = chapter({
  summary: "Ringkasan lengkap bab ini.",
  sections: [
    {
      heading: "Kata Benda",
      paragraphs: ["Kata benda adalah kata yang menyatakan orang, tempat, atau benda."],
      bullets: ["Contoh kata benda: buku, guru, sekolah.", "Kata benda bisa dilihat atau diraba."],
    },
  ],
});

describe("zoneSequence", () => {
  it("boss-only run is just the castle", () => {
    expect(zoneSequence(1)).toEqual(["kastil"]);
  });

  it("longer runs visit forest, beach, castle in order", () => {
    expect(zoneSequence(5)).toEqual(["hutan", "pantai", "kastil"]);
    expect(zoneSequence(2)).toEqual(["hutan", "kastil"]);
  });
});

describe("buildOwlStops", () => {
  it("first zone presents the material in full (no text payload)", () => {
    const stops = buildOwlStops(WITH_MATERIAL, 5);
    expect(stops.hutan?.kind).toBe("material");
    expect(stops.hutan?.text).toBeUndefined();
  });

  it("beach stop recalls the first material bullet verbatim", () => {
    const stops = buildOwlStops(WITH_MATERIAL, 5);
    expect(stops.pantai?.kind).toBe("recall");
    expect(stops.pantai?.text).toContain("Contoh kata benda: buku, guru, sekolah.");
  });

  it("castle stop warns about the boss and the timer-reset rule", () => {
    const stops = buildOwlStops(WITH_MATERIAL, 5);
    expect(stops.kastil?.kind).toBe("boss-tip");
    expect(stops.kastil?.text).toContain("mengatur ulang waktu serangannya");
  });

  it("boss-only run shows just the material stop at the castle", () => {
    const stops = buildOwlStops(WITH_MATERIAL, 1);
    expect(Object.keys(stops)).toEqual(["kastil"]);
    expect(stops.kastil?.kind).toBe("material");
  });

  it("two-zone run: material in the forest, boss tip at the castle", () => {
    const stops = buildOwlStops(WITH_MATERIAL, 2);
    expect(stops.hutan?.kind).toBe("material");
    expect(stops.pantai).toBeUndefined();
    expect(stops.kastil?.kind).toBe("boss-tip");
  });

  it("chapter without material gets an intro and a generic recall", () => {
    const stops = buildOwlStops(chapter(undefined), 5);
    expect(stops.hutan?.kind).toBe("intro");
    expect(stops.hutan?.text).toContain("Bab Uji");
    expect(stops.pantai?.text).toContain("perisai");
  });
});
