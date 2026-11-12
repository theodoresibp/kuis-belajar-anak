"use client";

import { BATTLE_BACKGROUND, BATTLE_CONFIG } from "@/features/gamification/battle.config";
import type { BattleState } from "@/features/gamification/battle.types";
import BattleHealthBar from "./BattleHealthBar";
import DamageEffect from "./DamageEffect";
import EnemyCharacter from "./EnemyCharacter";
import HeroCharacter from "./HeroCharacter";

/**
 * Compact battle strip between the quiz progress header and the question card.
 * Presentational only — all HP/animation state comes from the battle reducer.
 */
export default function BattleStage({ battle }: { battle: BattleState }) {
  const heroExhausted = battle.heroHp <= 0;
  const monsterDefeated = battle.monsterHp <= 0;

  return (
    <section
      aria-label="Pertarungan petualangan"
      className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-4 border-white bg-sky-100 shadow-xl"
    >
      {/* Fantasy arena backdrop (decorative; the stage works without it too). */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${BATTLE_BACKGROUND})` }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/60" />

      <div className="relative px-4 pt-3 sm:px-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <BattleHealthBar
            label="🦸‍♀️ Hero"
            hp={battle.heroHp}
            maxHp={BATTLE_CONFIG.initialHeroHp}
            fillClassName="bg-green-500"
          />
          <span
            aria-hidden
            className="battle-vs mt-4 shrink-0 text-2xl font-black italic text-amber-500 drop-shadow-[0_2px_0_rgba(255,255,255,0.9)] sm:text-3xl"
          >
            VS
          </span>
          <BattleHealthBar
            label="🐉 Naga"
            hp={battle.monsterHp}
            maxHp={BATTLE_CONFIG.initialMonsterHp}
            fillClassName="bg-red-500"
          />
        </div>
      </div>

      <div className="relative flex items-end justify-between px-6 pb-2 sm:px-12">
        <HeroCharacter animation={battle.heroAnimation} hp={battle.heroHp} />
        <EnemyCharacter animation={battle.monsterAnimation} hp={battle.monsterHp} />
        {battle.lastDamage && <DamageEffect damage={battle.lastDamage} />}
      </div>

      {(heroExhausted || monsterDefeated) && (
        <p className="relative px-4 pb-3 text-center text-sm font-bold text-slate-700 sm:text-base">
          {monsterDefeated
            ? "🎉 Hebat! Naganya berhasil dikalahkan! Selesaikan soal sisanya ya!"
            : "💤 Hero sudah lelah, tidak apa-apa! Lanjutkan latihan sampai selesai ya, kamu pasti bisa!"}
        </p>
      )}
    </section>
  );
}
