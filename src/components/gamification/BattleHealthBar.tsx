"use client";

import { displayHp } from "@/features/gamification/battle.utils";

interface Props {
  label: string;
  hp: number;
  maxHp: number;
  /** Tailwind fill colour — green for the hero, red for the monster. */
  fillClassName: string;
}

/**
 * One health bar. Hero and monster bars share this exact structure and size.
 * No heart icons: HP is always a bar, per the battle design.
 */
export default function BattleHealthBar({ label, hp, maxHp, fillClassName }: Props) {
  const pct = maxHp > 0 ? Math.min(100, Math.max(0, (hp / maxHp) * 100)) : 0;
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs font-extrabold text-slate-700 sm:text-sm">
        <span className="truncate">{label}</span>
        <span>
          HP {displayHp(hp)} / {maxHp}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} HP`}
        aria-valuenow={displayHp(hp)}
        aria-valuemin={0}
        aria-valuemax={maxHp}
        className="h-4 w-full overflow-hidden rounded-full border-2 border-white bg-slate-200 shadow-inner sm:h-5"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillClassName}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
