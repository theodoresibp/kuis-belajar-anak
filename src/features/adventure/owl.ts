import type { QuizChapter } from "@/types/quiz";
import { zoneIdForEncounter, type ZoneId } from "./zones";

/**
 * Sprint 1 (Burung Hantu): the owl greets the hero at the start of
 * each zone. What it says depends on the zone:
 *
 * - First zone of the run: the chapter's study material, presented
 *   IN FULL by the panel (MaterialSections renders summary + every
 *   section verbatim — nothing is trimmed). Chapters without
 *   material get a friendly intro instead.
 * - Pantai (middle zone): a recall stop — one key point quoted
 *   verbatim from the material (first bullet, else first paragraph).
 * - Kastil (when it is not the first zone): the boss warning,
 *   including the correct-answer timer-reset rule.
 *
 * A boss-only run (zones = [kastil]) therefore shows just the
 * material stop: the boss tip already lives in the battle popup.
 */

export type OwlStopKind = "material" | "intro" | "recall" | "boss-tip";

export interface OwlStop {
  zoneId: ZoneId;
  kind: OwlStopKind;
  title: string;
  /** Body text for intro/recall/boss-tip stops. Material stops carry
   *  no text: the panel renders chapter.material in full instead. */
  text?: string;
  buttonLabel: string;
}

const BOSS_TIP_TEXT =
  "Di gerbang kastil, boss terakhir sudah menunggu! Boss menyerang " +
  "secara berkala, tapi setiap jawaban benar mengatur ulang waktu " +
  "serangannya. Jawab dengan cepat dan tepat, ya!";

const GENERIC_RECALL_TEXT =
  "Jangan lupa kumpulkan hati untuk menambah HP dan perisai untuk " +
  "menahan satu serangan. Lompat dengan hati-hati di atas lubang!";

function recallText(chapter: QuizChapter): string {
  const sections = chapter.material?.sections ?? [];
  for (const section of sections) {
    if (section.bullets && section.bullets.length > 0) {
      return `${section.heading}: ${section.bullets[0]}`;
    }
  }
  for (const section of sections) {
    if (section.paragraphs && section.paragraphs.length > 0) {
      return `${section.heading}: ${section.paragraphs[0]}`;
    }
  }
  return GENERIC_RECALL_TEXT;
}

/** Ordered, de-duplicated zone list for a run of `encounterCount`. */
export function zoneSequence(encounterCount: number): ZoneId[] {
  const zones: ZoneId[] = [];
  for (let i = 0; i < Math.max(1, encounterCount); i += 1) {
    const zone = zoneIdForEncounter(i, encounterCount);
    if (!zones.includes(zone)) zones.push(zone);
  }
  return zones;
}

/** The owl stop for each zone of the run, keyed by zone id. Zones
 *  without an entry simply have no owl stop. */
export function buildOwlStops(
  chapter: QuizChapter,
  encounterCount: number,
): Partial<Record<ZoneId, OwlStop>> {
  const zones = zoneSequence(encounterCount);
  const stops: Partial<Record<ZoneId, OwlStop>> = {};

  const firstZone = zones[0];
  stops[firstZone] = chapter.material
    ? {
        zoneId: firstZone,
        kind: "material",
        title: "Materi Hari Ini",
        buttonLabel: "Siap, Ayo Mulai!",
      }
    : {
        zoneId: firstZone,
        kind: "intro",
        title: "Selamat Datang!",
        text:
          `Hari ini kita berpetualang sambil belajar "${chapter.title}". ` +
          "Dekati monster untuk menjawab soal — setiap jawaban benar " +
          "menyerang monster itu. Kumpulkan hati dan perisai di jalan. " +
          "Semangat!",
        buttonLabel: "Siap, Ayo Mulai!",
      };

  if (zones.includes("pantai")) {
    stops.pantai = {
      zoneId: "pantai",
      kind: "recall",
      title: "Ingat Ya!",
      text: recallText(chapter),
      buttonLabel: "Siap, Lanjut!",
    };
  }

  if (zones.includes("kastil") && firstZone !== "kastil") {
    stops.kastil = {
      zoneId: "kastil",
      kind: "boss-tip",
      title: "Hati-hati, Boss di Depan!",
      text: BOSS_TIP_TEXT,
      buttonLabel: "Siap, Hadapi Boss!",
    };
  }

  return stops;
}
