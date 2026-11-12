"use client";

import { BATTLE_CONFIG, type HeroDef, type MonsterDef } from "@/features/gamification/battle.config";
import type { BattleState } from "@/features/gamification/battle.types";
import BattleHealthBar from "./BattleHealthBar";
import DamageEffect from "./DamageEffect";
import EnemyCharacter from "./EnemyCharacter";
import HeroCharacter from "./HeroCharacter";

interface Props {
  battle: BattleState;
  hero: HeroDef;
  monster: MonsterDef;
}

/**
 * Compact battle strip between the quiz progress header and the question card.
 * Presentational only — all HP/animation state comes from the battle reducer.
 * The arena background follows the monster (dragon = castle, slime = forest,
 * fox = meadow), and attack projectiles/combo/sparkles are pure CSS layers.
 */
export default function BattleStage({ battle, hero, monster }: Props) {
  const heroExhausted = battle.heroHp <= 0;
  const monsterDefeated = battle.monsterHp <= 0;
  const heroAttacking = battle.heroAnimation === "attack";
  const monsterAttacking = battle.monsterAnimation === "attack";
  const someoneHurt = battle.heroAnimation === "hurt" || battle.monsterAnimation === "hurt";

  return (
    <section
      aria-label="Pertarungan petualangan"
      className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-4 border-white bg-sky-100 shadow-xl"
    >
      {/* Arena backdrop for the current monster (decorative; the stage works without it too). */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-500"
        style={{ backgroundImage: `url(${monster.background})` }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/60" />

      <div className="relative px-4 pt-3 sm:px-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <BattleHealthBar
            label={`${hero.fallbackEmoji} ${hero.name}`}
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
            label={`${monster.fallbackEmoji} ${monster.name}`}
            hp={battle.monsterHp}
            maxHp={BATTLE_CONFIG.initialMonsterHp}
            fillClassName="bg-red-500"
          />
        </div>
      </div>

      <div className={`relative flex items-end justify-between px-6 pb-2 sm:px-12 ${someoneHurt ? "battle-stage-shake" : ""}`}>
        <HeroCharacter hero={hero} animation={battle.heroAnimation} hp={battle.heroHp} />
        <EnemyCharacter monster={monster} animation={battle.monsterAnimation} hp={battle.monsterHp} />

        {/* Attack projectiles: a slash arc flying to the monster, a fire puff flying to the hero. */}
        {heroAttacking && <span aria-hidden className="battle-slash-fly pointer-events-none absolute left-[30%] top-8 z-20 text-4xl sm:left-[34%]">💥</span>}
        {monsterAttacking && <span aria-hidden className="battle-fire-fly pointer-events-none absolute right-[30%] top-8 z-20 text-4xl sm:right-[34%]">🔥</span>}

        {/* Victory sparkles once the monster is defeated. */}
        {monsterDefeated && (
          <span aria-hidden className="pointer-events-none absolute right-4 top-2 z-20 flex gap-2 text-2xl text-amber-400">
            <span className="battle-sparkle">✦</span>
            <span className="battle-sparkle battle-sparkle-delay-1">✦</span>
            <span className="battle-sparkle battle-sparkle-delay-2">✦</span>
          </span>
        )}

        {battle.lastDamage && <DamageEffect damage={battle.lastDamage} />}
      </div>

      {battle.correctStreak >= 2 && !monsterDefeated && (
        <p className="relative pb-1 text-center">
          <span className="battle-combo-pop inline-block rounded-full bg-amber-400 px-4 py-1 text-sm font-black text-amber-900 shadow">
            🔥 Kombo x{battle.correctStreak}! Terus pertahankan!
          </span>
        </p>
      )}

      {(heroExhausted || monsterDefeated) && (
        <p className="relative px-4 pb-3 text-center text-sm font-bold text-slate-700 sm:text-base">
          {monsterDefeated
            ? `🎉 Hebat! ${monster.name} berhasil dikalahkan! Selesaikan soal sisanya ya!`
            : `💤 ${hero.name} sudah lelah, tidak apa-apa! Lanjutkan latihan sampai selesai ya, kamu pasti bisa!`}
        </p>
      )}
    </section>
  );
}
