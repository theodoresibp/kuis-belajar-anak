"use client";

import { useState } from "react";
import Image from "next/image";
import { BATTLE_CONFIG, getHeroById, getMonsterById } from "@/features/gamification/battle.config";
import type { BattleSummary } from "@/features/gamification/battle.types";
import { displayHp } from "@/features/gamification/battle.utils";
import BattleHealthBar from "./BattleHealthBar";

/**
 * Battle summary block embedded in the existing ResultScreen —
 * it extends the result screen, it does not replace it.
 * Shows the actual hero and monster the child played with.
 */
export default function BattleResult({ battle, score }: { battle: BattleSummary; score: number }) {
  const [heroFailed, setHeroFailed] = useState(false);
  const [monsterFailed, setMonsterFailed] = useState(false);
  const hero = getHeroById(battle.heroId);
  const monster = getMonsterById(battle.monsterId);
  const monsterDefeated = battle.monsterHp <= 0;
  const heroExhausted = battle.heroHp <= 0;

  return (
    <div className="mb-8 rounded-3xl border-2 border-violet-100 bg-violet-50/60 px-4 py-5 text-left">
      <h3 className="mb-1 text-center text-lg font-extrabold text-slate-800">⚔️ Hasil Pertarungan</h3>
      <p className="mb-4 text-center font-bold text-slate-600">
        {monsterDefeated
          ? `🎉 ${monster.name} berhasil dikalahkan oleh ${hero.name}! Kerja bagus, Petualang!`
          : heroExhausted
            ? `💪 ${hero.name} kelelahan, tapi kamu tetap berjuang sampai akhir. Hebat!`
            : "🌈 Pertarungan selesai! Terus berlatih supaya bisa mengalahkan lawannya!"}
      </p>

      <div className="mb-4 flex items-end justify-center gap-4">
        {heroFailed ? (
          <span className="text-6xl" role="img" aria-label={hero.name}>{hero.fallbackEmoji}</span>
        ) : (
          <Image
            src={heroExhausted ? hero.assets.exhausted : hero.assets.victory}
            alt={`${hero.name} di akhir pertarungan`}
            width={480}
            height={480}
            unoptimized
            onError={() => setHeroFailed(true)}
            className="battle-victory h-20 w-20 object-contain sm:h-24 sm:w-24"
          />
        )}
        <span aria-hidden className="pb-3 text-xl font-black italic text-amber-500">VS</span>
        {monsterFailed ? (
          <span className="text-6xl" role="img" aria-label={monster.name}>{monster.fallbackEmoji}</span>
        ) : (
          <Image
            src={monsterDefeated ? monster.assets.defeat : monster.assets.idle}
            alt={`${monster.name} di akhir pertarungan`}
            width={480}
            height={480}
            unoptimized
            onError={() => setMonsterFailed(true)}
            className="h-20 w-20 object-contain sm:h-24 sm:w-24"
          />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <BattleHealthBar label={`${hero.fallbackEmoji} ${hero.name}`} hp={battle.heroHp} maxHp={BATTLE_CONFIG.initialHeroHp} fillClassName="bg-green-500" />
        <BattleHealthBar label={`${monster.fallbackEmoji} ${monster.name}`} hp={battle.monsterHp} maxHp={BATTLE_CONFIG.initialMonsterHp} fillClassName="bg-red-500" />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-center text-sm font-bold text-slate-600 sm:grid-cols-4">
        <div className="rounded-2xl bg-white px-2 py-2">
          <dt>HP Hero Akhir</dt>
          <dd className="text-lg font-black text-green-600">{displayHp(battle.heroHp)}</dd>
        </div>
        <div className="rounded-2xl bg-white px-2 py-2">
          <dt>HP Lawan Akhir</dt>
          <dd className="text-lg font-black text-red-500">{displayHp(battle.monsterHp)}</dd>
        </div>
        <div className="rounded-2xl bg-white px-2 py-2">
          <dt>Jawaban Benar</dt>
          <dd className="text-lg font-black text-violet-600">
            {battle.correctAnswers} / {battle.totalQuestions}
          </dd>
        </div>
        <div className="rounded-2xl bg-white px-2 py-2">
          <dt>Skor Kuis</dt>
          <dd className="text-lg font-black text-violet-600">{score}</dd>
        </div>
      </dl>
    </div>
  );
}
