"use client";

import type { DamageEvent } from "@/features/gamification/battle.types";
import { displayHp } from "@/features/gamification/battle.utils";

/**
 * Floating damage number + a small CSS starburst over the character that got hit.
 * Pure CSS (battle-damage-float / battle-burst keyframes in globals.css) —
 * no raster effect asset is required, so a missing effect file can never break it.
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
      <span className="battle-burst block h-10 w-10 sm:h-12 sm:w-12" />
      <span
        className={`battle-damage-float -mt-3 text-2xl font-black drop-shadow-[0_2px_0_rgba(255,255,255,0.9)] sm:text-3xl ${
          isHero ? "text-red-500" : "text-orange-500"
        }`}
      >
        -{displayHp(damage.amount)}
      </span>
    </div>
  );
}
