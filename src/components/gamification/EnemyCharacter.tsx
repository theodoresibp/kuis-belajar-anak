"use client";

import { useState } from "react";
import Image from "next/image";
import type { MonsterDef } from "@/features/gamification/battle.config";
import type { MonsterAnimation } from "@/features/gamification/battle.types";

interface Props {
  monster: MonsterDef;
  animation: MonsterAnimation;
  hp: number;
}

const ANIMATION_CLASS: Record<MonsterAnimation, string> = {
  idle: "battle-idle",
  attack: "battle-attack-left",
  hurt: "battle-hurt",
  defeat: "battle-exhausted",
};

/**
 * The selected monster. At 0 HP the defeat pose wins over idle, so it stays
 * happily defeated while the remaining questions are finished.
 * Falls back to an emoji if the image asset fails to load.
 */
export default function EnemyCharacter({ monster, animation, hp }: Props) {
  const [failed, setFailed] = useState(false);
  const pose: MonsterAnimation = animation === "idle" && hp <= 0 ? "defeat" : animation;

  if (failed) {
    return (
      <div
        role="img"
        aria-label={monster.name}
        className={`flex h-24 w-24 items-end justify-center text-7xl sm:h-32 sm:w-32 sm:text-8xl ${ANIMATION_CLASS[pose]}`}
      >
        {monster.fallbackEmoji}
      </div>
    );
  }

  return (
    <Image
      key={monster.id}
      src={monster.assets[pose]}
      alt={monster.name}
      width={480}
      height={480}
      unoptimized
      onError={() => setFailed(true)}
      className={`battle-enter-right h-24 w-24 object-contain drop-shadow-lg sm:h-32 sm:w-32 ${ANIMATION_CLASS[pose]}`}
    />
  );
}
