"use client";

/**
 * Sprint 4 (Album Monster): the collection album overlay. Shows all
 * 12 adventure monsters — defeated ones in full colour with their
 * name, tier, a fun fact and their defeat count; the rest as dark
 * silhouettes with a "?", so there is always a reason to play again.
 */

import Image from "next/image";
import {
  ALBUM_TOTAL,
  TIER_LABELS,
  buildAlbumCards,
  countCollected,
  type AlbumCollection,
} from "@/features/adventure/monster-album";
import type { MonsterTier } from "@/features/adventure/monsters.config";
import { ZONES } from "@/features/adventure/zones";

const TIER_CHIP_CLASSES: Record<MonsterTier, string> = {
  normal: "bg-emerald-100 text-emerald-800",
  elite: "bg-sky-100 text-sky-800",
  "mini-boss": "bg-violet-100 text-violet-800",
  "final-boss": "bg-rose-100 text-rose-800",
};

export default function MonsterAlbum({
  collection,
  onClose,
}: {
  collection: AlbumCollection;
  onClose: () => void;
}) {
  const cards = buildAlbumCards(collection);
  const collected = countCollected(collection);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Album Monster"
    >
      <section className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-4 border-violet-200 bg-gradient-to-b from-violet-50 to-white shadow-2xl">
        <header className="px-5 pt-5 sm:px-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-violet-900 sm:text-3xl">
                📖 Album Monster
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {collected} dari {ALBUM_TOTAL} monster terkumpul
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup album"
              className="rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              ✕
            </button>
          </div>
          <div
            className="mt-3 h-3 overflow-hidden rounded-full bg-violet-100"
            role="progressbar"
            aria-valuenow={collected}
            aria-valuemin={0}
            aria-valuemax={ALBUM_TOTAL}
            aria-label={`Kemajuan album: ${collected} dari ${ALBUM_TOTAL} monster`}
          >
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${(collected / ALBUM_TOTAL) * 100}%` }}
            />
          </div>
        </header>

        <div className="mt-4 grid flex-1 grid-cols-2 gap-3 overflow-y-auto px-5 pb-2 sm:grid-cols-3 sm:px-7">
          {cards.map((card) =>
            card.defeated ? (
              <article
                key={card.monster.id}
                className="flex flex-col items-center rounded-2xl border-2 border-violet-100 bg-white p-3 text-center shadow-sm"
              >
                <Image
                  src={card.monster.assets.idle}
                  alt={card.monster.name}
                  width={112}
                  height={112}
                  className="h-24 w-24 object-contain"
                />
                <h3 className="mt-1 text-sm font-black text-slate-800">
                  {card.monster.emoji} {card.monster.name}
                </h3>
                <span
                  className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${TIER_CHIP_CLASSES[card.monster.tier]}`}
                >
                  {TIER_LABELS[card.monster.tier]}
                </span>
                <p className="mt-2 flex-1 text-xs font-medium leading-relaxed text-slate-500">
                  {card.fact}
                </p>
                <p className="mt-2 text-[11px] font-bold text-violet-700">
                  🏆 Dikalahkan {card.defeats}×
                  {card.lastZoneId
                    ? ` • terakhir di ${ZONES[card.lastZoneId].name}`
                    : ""}
                </p>
              </article>
            ) : (
              <article
                key={card.monster.id}
                className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-3 text-center"
                aria-label="Monster misterius yang belum dikalahkan"
              >
                <div className="relative">
                  <Image
                    src={card.monster.assets.idle}
                    alt=""
                    width={112}
                    height={112}
                    className="h-24 w-24 object-contain opacity-25 brightness-0"
                  />
                  <span
                    className="absolute inset-0 flex items-center justify-center text-4xl font-black text-slate-500"
                    aria-hidden
                  >
                    ?
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-black text-slate-400">
                  ???
                </h3>
                <span
                  className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${TIER_CHIP_CLASSES[card.monster.tier]} opacity-60`}
                >
                  {TIER_LABELS[card.monster.tier]}
                </span>
                <p className="mt-2 flex-1 text-xs font-medium leading-relaxed text-slate-400">
                  Monster misterius — kalahkan untuk membuka!
                </p>
              </article>
            ),
          )}
        </div>

        <footer className="px-5 pb-5 pt-2 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-violet-600 px-8 py-3 font-bold text-white shadow-md transition hover:bg-violet-700"
          >
            Kembali
          </button>
        </footer>
      </section>
    </div>
  );
}
