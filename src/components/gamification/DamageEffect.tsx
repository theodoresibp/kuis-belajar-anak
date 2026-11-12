"use client";

import type { DamageEvent } from "@/features/gamification/battle.types";
import { displayHp } from "@/features/gamification/battle.utils";

/**
 * Floating event text over the affected character: damage (-N), a potion
 * heal (+N), or a shield block. Pure CSS (battle-damage-float / battle-burst
 * keyframes in globals.css) — no raster effect asset is required.
 */
export default function DamageEffect({ damage }: { damage: DamageEvent }) {
  const isHero = damage.target === "hero";
  return (
    <div
      key={damage.id}
      aria-hidden
      className={`pointer-events-none absolute top-1 z-20 flex flex-col items-center ${
        isHero ? "left-6 sm:left-10" : "right-6 sm:right-10"
      }`}
    >
      {damage.kind === "damage" && <span className="battle-burst block h-10 w-10 sm:h-12 sm:w-12" />}
      <span
        className={`battle-damage-float text-2xl font-black drop-shadow-[0_2px_0_rgba(255,255,255,0.9)] sm:text-3xl ${
          damage.kind === "heal"
            ? "text-emerald-500"
            : damage.kind === "blocked"
              ? "text-sky-500"
              : isHero
                ? "text-red-500"
                : "text-orange-500"
        } ${damage.kind === "damage" ? "-mt-3" : ""}`}
      >
        {damage.kind === "heal"
          ? `+${displayHp(damage.amount)}`
          : damage.kind === "blocked"
            ? "🛡️ DIBLOKIR!"
            : `-${displayHp(damage.amount)}`}
      </span>
    </div>
  );
}
