"use client";

import { useState } from "react";
import {
  BATTLE_CONFIG,
  POWER_UP_INFO,
  type HeroDef,
  type MonsterDef,
} from "@/features/gamification/battle.config";
import type { BattleState, PowerUpKind } from "@/features/gamification/battle.types";
import { heroLineFor, monsterLineFor } from "@/features/gamification/dialogue";
import { isSoundMuted, playSound, setSoundMuted } from "@/features/gamification/sound";
import BattleHealthBar from "./BattleHealthBar";
import DamageEffect from "./DamageEffect";
import EnemyCharacter from "./EnemyCharacter";
import HeroCharacter from "./HeroCharacter";

interface Props {
  battle: BattleState;
  hero: HeroDef;
  monster: MonsterDef;
  /** Whether a hint can currently eliminate an answer option. */
  canUseHint?: boolean;
  onUseItem?: (item: PowerUpKind) => void;
  onChooseReward?: (item: PowerUpKind) => void;
}

const ITEM_KINDS: PowerUpKind[] = ["potion", "shield", "hint"];

function SpeechBubble({ text, align }: { text: string; align: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`battle-bubble-pop pointer-events-none absolute -top-11 z-30 max-w-[160px] rounded-2xl border-2 border-white bg-white/95 px-2.5 py-1 text-center text-[11px] font-bold leading-tight text-slate-700 shadow sm:max-w-[190px] sm:text-xs ${
        align === "left" ? "left-0" : "right-0"
      }`}
    >
      {text}
      <span
        className={`absolute -bottom-[7px] h-3 w-3 rotate-45 bg-white ${
          align === "left" ? "left-6" : "right-6"
        }`}
      />
    </div>
  );
}

/**
 * Compact battle strip between the quiz progress header and the question card.
 * Presentational mostly — HP/animation/inventory state comes from the battle
 * reducer; item uses are reported back through callbacks.
 */
export default function BattleStage({ battle, hero, monster, canUseHint = false, onUseItem, onChooseReward }: Props) {
  const [muted, setMuted] = useState<boolean>(() => isSoundMuted());
  const heroExhausted = battle.heroHp <= 0;
  const monsterDefeated = battle.monsterHp <= 0;
  const heroAttacking = battle.heroAnimation === "attack";
  const monsterAttacking = battle.monsterAnimation === "attack";
  const someoneHurt = battle.heroAnimation === "hurt" || battle.monsterAnimation === "hurt";
  const heroLine = heroLineFor(battle);
  const monsterLine = monsterLineFor(battle);
  const totalItems = battle.items.potion + battle.items.shield + battle.items.hint;

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) playSound("click");
  }

  function itemDisabled(kind: PowerUpKind): boolean {
    if (battle.items[kind] <= 0) return true;
    if (kind === "potion") return battle.heroHp >= BATTLE_CONFIG.initialHeroHp;
    if (kind === "shield") return battle.shieldActive;
    return !canUseHint;
  }

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
        {battle.shieldActive && (
          <p className="mt-1 text-center text-xs font-extrabold text-sky-600">🛡️ Perisai aktif — serangan berikutnya akan diblokir!</p>
        )}
      </div>

      <div className={`relative flex items-end justify-between px-6 pb-2 pt-10 sm:px-12 ${someoneHurt ? "battle-stage-shake" : ""}`}>
        <div className="relative">
          {heroLine && <SpeechBubble text={heroLine} align="left" />}
          <HeroCharacter hero={hero} animation={battle.heroAnimation} hp={battle.heroHp} />
        </div>
        <div className="relative">
          {monsterLine && <SpeechBubble text={monsterLine} align="right" />}
          <EnemyCharacter monster={monster} animation={battle.monsterAnimation} hp={battle.monsterHp} />
        </div>

        {/* Attack projectiles: a slash arc flying to the monster, a fire puff flying to the hero. */}
        {heroAttacking && <span aria-hidden className="battle-slash-fly pointer-events-none absolute left-[30%] top-10 z-20 text-4xl sm:left-[34%]">💥</span>}
        {monsterAttacking && <span aria-hidden className="battle-fire-fly pointer-events-none absolute right-[30%] top-10 z-20 text-4xl sm:right-[34%]">🔥</span>}

        {/* Victory sparkles once the monster is defeated. */}
        {monsterDefeated && (
          <span aria-hidden className="pointer-events-none absolute right-4 top-4 z-20 flex gap-2 text-2xl text-amber-400">
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
        <p className="relative px-4 pb-2 text-center text-sm font-bold text-slate-700 sm:text-base">
          {monsterDefeated
            ? `🎉 Hebat! ${monster.name} berhasil dikalahkan! Selesaikan soal sisanya ya!`
            : `💤 ${hero.name} sudah lelah, tidak apa-apa! Lanjutkan latihan sampai selesai ya, kamu pasti bisa!`}
        </p>
      )}

      {/* Combo reward: pick one power-up. */}
      {battle.powerUpChoices > 0 && onChooseReward && (
        <div className="battle-combo-pop relative mx-3 mb-2 rounded-3xl border-2 border-amber-300 bg-amber-50/95 px-3 py-2 text-center">
          <p className="mb-2 text-sm font-extrabold text-amber-800">🎁 Kombo hebat! Pilih 1 hadiah:</p>
          <div className="flex justify-center gap-2">
            {ITEM_KINDS.map((kind) => (
              <button
                key={kind}
                onClick={() => onChooseReward(kind)}
                className="rounded-2xl border-2 border-amber-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 transition-colors hover:border-amber-500"
              >
                {POWER_UP_INFO[kind].emoji} {POWER_UP_INFO[kind].name}
                <span className="block text-[11px] font-semibold text-slate-400">{POWER_UP_INFO[kind].description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Power-up inventory + sound toggle. */}
      <div className="relative flex items-center justify-center gap-2 px-3 pb-3">
        {ITEM_KINDS.map((kind) => {
          const count = battle.items[kind];
          const disabled = itemDisabled(kind);
          return (
            <button
              key={kind}
              disabled={disabled}
              onClick={() => onUseItem?.(kind)}
              title={`${POWER_UP_INFO[kind].name}: ${POWER_UP_INFO[kind].description}`}
              className="relative rounded-full border-2 border-white bg-white/85 px-3 py-1.5 text-sm font-extrabold text-slate-600 shadow-sm transition-all enabled:hover:bg-white disabled:opacity-45"
            >
              {POWER_UP_INFO[kind].emoji} {POWER_UP_INFO[kind].name}
              <span className="ml-1 rounded-full bg-violet-100 px-1.5 text-xs font-black text-violet-700">{count}</span>
              {kind === "shield" && battle.shieldActive && (
                <span className="absolute -right-2 -top-2 rounded-full bg-sky-500 px-1.5 text-[10px] font-black text-white">ON</span>
              )}
            </button>
          );
        })}
        <button
          onClick={toggleMute}
          aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
          className="absolute right-3 rounded-full border-2 border-white bg-white/85 px-2.5 py-1.5 text-sm shadow-sm transition-all hover:bg-white"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
      {totalItems === 0 && battle.powerUpChoices === 0 && (
        <p className="relative px-3 pb-3 text-center text-xs font-semibold text-slate-500">
          Jawab benar {BATTLE_CONFIG.comboRewardInterval}× beruntun untuk dapat hadiah power-up 🎁
        </p>
      )}
    </section>
  );
}
