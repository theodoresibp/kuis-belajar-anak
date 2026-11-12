import type { BattleState } from "./battle.types";

/**
 * Speech-bubble lines for both characters, derived purely from battle state.
 * Lines rotate by event id / question index so the same event always shows
 * the same line (no flicker between re-renders), while different events vary.
 */

const HERO_ATTACK = ["Rasakan ini! 💥", "Hajar! ⚔️", "Ini serangan terbaikku!", "Maju terus! 🌟"];
const HERO_HURT = ["Aduh! 😣", "Tidak apa-apa, aku bangkit lagi! 💪", "Sedikit lagi, aku pasti bisa!"];
const HERO_IDLE = ["Ayo, kita pasti bisa! 🌈", "Pikirkan baik-baik ya… 🤔", "Aku siap! Kamu juga siap kan?"];
const HERO_STREAK = ["Lagi! Aku lagi semangat! 🔥", "Hebat, pertahankan! ⭐", "Kita tidak terkalahkan!"];
const MONSTER_ATTACK = ["Giliranku! 😈", "Rasakan seranganku!", "Hehe, kena kamu! 😜"];
const MONSTER_HURT = ["Aduh, sakit! 😖", "Grr… tunggu pembalasanku!", "Kamu kuat juga ya… 😤"];
const MONSTER_IDLE = ["Kamu tidak akan bisa mengalahkanku! 😏", "Coba saja kalau berani… 😼", "Hmm, soal berikutnya apa ya?"];
const MONSTER_PANIC = ["Aduh! Aku mulai goyah… 😵", "Jangan dong… ampun! 😰", "Sedikit lagi aku kalah… 😱"];

function pick(lines: string[], seed: number): string {
  return lines[Math.abs(seed) % lines.length];
}

export function heroLineFor(battle: BattleState): string | null {
  if (battle.battleStatus === "completed") {
    return battle.monsterHp <= 0 ? "Hore! Kita berhasil! 🎉" : "Latihan yang seru! Sampai jumpa! 👋";
  }
  if (battle.heroAnimation === "exhausted" || battle.heroHp <= 0) return "Aku… lelah sekali… 💤";
  if (battle.heroAnimation === "attack") return pick(HERO_ATTACK, battle.lastDamage?.id ?? 0);
  if (battle.heroAnimation === "hurt") return pick(HERO_HURT, battle.lastDamage?.id ?? 0);
  if (battle.lastDamage?.kind === "blocked") return "Untung ada perisai! 🛡️";
  if (battle.lastDamage?.kind === "heal") return "Segar lagi! Terima kasih ramuannya! 🧪";
  if (battle.correctStreak >= 2) return pick(HERO_STREAK, battle.correctStreak);
  // Idle chatter only on the first question's calm moment, to keep the stage tidy.
  if (battle.currentQuestionIndex === 0 && battle.correctAnswers === 0 && battle.wrongAttempts === 0) {
    return pick(HERO_IDLE, 0);
  }
  return null;
}

export function monsterLineFor(battle: BattleState): string | null {
  if (battle.monsterHp <= 0) return "Aku kalah… sampai jumpa lagi… 💫";
  if (battle.monsterAnimation === "attack") return pick(MONSTER_ATTACK, battle.lastDamage?.id ?? 0);
  if (battle.monsterAnimation === "hurt") return pick(MONSTER_HURT, battle.lastDamage?.id ?? 0);
  if (battle.monsterHp <= 25) return pick(MONSTER_PANIC, battle.currentQuestionIndex);
  if (battle.currentQuestionIndex === 0 && battle.correctAnswers === 0 && battle.wrongAttempts === 0) {
    return pick(MONSTER_IDLE, 0);
  }
  return null;
}
