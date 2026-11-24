import type { MonsterTier } from "./monsters.config";

/**
 * Fitur "Monster Berbicara": every monster greets the hero with one
 * short, funny line when its battle popup opens — personality before
 * the questions start. Lines are per monster (Monster Mama, the final
 * boss, gets extra theatrical ones); unknown ids fall back to a
 * tier-flavoured line so a future monster never shows up mute.
 *
 * The pick is deterministic (seeded by the encounter index) so the
 * line never flickers between re-renders of the battle dialog.
 */

export const MONSTER_LINES: Record<string, readonly string[]> = {
  "forest-slime": [
    "Blub blub! Berani-beraninya kamu masuk hutanku! Jawab soal-soalku dulu!",
    "Aku memang lembek, tapi soal-soalku tidak lembek, lho!",
  ],
  "mushroom-goblin": [
    "Hihihi! Aku bersembunyi di balik jamur berhari-hari menunggumu!",
    "Jamurku saja bisa berhitung. Kamu bisa, tidak?",
  ],
  "thorn-beetle": [
    "Krrk! Duriku tajam, tapi otakku jauh lebih tajam!",
    "Berhenti! Tunjukkan dulu kepintaranmu sebelum lewat!",
  ],
  "leaf-sprite": [
    "Halo, halo! Daun-daun membisikkan namamu. Ayo main soal bersamaku!",
    "Aku kecil dan cepat! Tangkap aku dengan jawaban yang benar!",
  ],
  "poison-frog": [
    "Kroak! Kolam ini wilayahku. Menjawab dulu, baru boleh lewat!",
    "Kroak kroak! Suaraku merdu, kan? Sekarang giliranmu menjawab!",
  ],
  "vine-crawler": [
    "Ssst… rambatku sudah mengikat jalan ini. Jawab dulu kalau mau lewat!",
    "Aku merayap pelan-pelan, tapi soal-soalku mengejutkan!",
  ],
  "forest-fox": [
    "Kamu pikir bisa menipuku? Aku penjaga hutan yang paling cerdik!",
    "Rubah adalah yang paling pintar di hutan ini. Buktikan kamu lebih pintar!",
  ],
  "moss-golem": [
    "DUG… DUG… AKU TIDUR SERATUS TAHUN. KAMU MEMBANGUNKANKU…",
    "BATU TIDAK BISA KALAH… BATU HANYA BISA DIJAWAB…",
  ],
  "crystal-owl": [
    "Hu hu… Aku melihat semua jawaban dari atas. Tunjukkan milikmu!",
    "Bijak itu bukan cuma tahu, tapi berani mencoba. Ayo!",
  ],
  "purple-dragon": [
    "RAWR! Apiku ungu dan panas! Hanya anak pintar yang boleh lewat!",
    "Naga Ungu tidak takut apa pun… kecuali jawaban yang benar!",
  ],
  "tree-guardian": [
    "Akar-akarku sudah menjaga hutan ini sejak dulu kala…",
    "Anak muda, hutan mengujimu. Jawablah dengan hati yang tenang.",
  ],
  "monster-mama": [
    "Hmmph! Berani-beraninya masuk kastil Mama tanpa permisi! Duduk! Kerjakan soal-soal Mama!",
    "Mama sudah menyiapkan soal paling seru khusus untukmu. Jangan sampai salah, ya!",
    "Mahkota Mama tidak akan jatuh hanya karena senyuman. Tunjukkan kepintaranmu!",
  ],
};

const TIER_FALLBACK_LINES: Record<MonsterTier, readonly string[]> = {
  normal: ["Berhenti! Jawab soal-soalku dulu sebelum lewat!"],
  elite: ["Aku bukan monster sembarangan. Buktikan kepintaranmu!"],
  "mini-boss": ["Kekuatanku jauh di atas monster biasa. Bersiaplah!"],
  "final-boss": [
    "Inilah ujian terakhirmu. Tunjukkan semua yang sudah kamu pelajari!",
  ],
};

/** The greeting lines for a monster: its own lines when it has any,
 *  otherwise the fallback for its tier. Never empty. */
export function monsterLinesFor(
  monsterId: string,
  tier: MonsterTier,
): readonly string[] {
  return MONSTER_LINES[monsterId] ?? TIER_FALLBACK_LINES[tier];
}

/** Deterministically pick one greeting line (seed = encounter index,
 *  so the same encounter always shows the same line). */
export function pickMonsterLine(
  monsterId: string,
  tier: MonsterTier,
  seed: number,
): string {
  const lines = monsterLinesFor(monsterId, tier);
  const floored = Math.floor(seed);
  const index = ((floored % lines.length) + lines.length) % lines.length;
  return lines[index];
}
