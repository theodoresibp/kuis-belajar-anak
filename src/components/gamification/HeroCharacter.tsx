"use client";

import { useState } from "react";
import Image from "next/image";
import { HERO_ASSETS } from "@/features/gamification/battle.config";
import type { HeroAnimation } from "@/features/gamification/battle.types";

interface Props {
  animation: HeroAnimation;
  hp: number;
}

const ANIMATION_CLASS: Record<HeroAnimation, string> = {
  idle: "battle-idle",
  attack: "battle-attack-right",
  hurt: "battle-hurt",
  victory: "battle-victory",
  exhausted: "battle-exhausted",
};

/**
 * The girl adventurer. When her HP is 0 the exhausted pose wins over idle,
 * so she stays visibly tired while the child finishes in practice mode.
 * If the image asset fails to load, a friendly emoji fallback keeps the stage usable.
 */
export default function HeroCharacter({ animation, hp }: Props) {
  const [failed, setFailed] = useState(false);
  const pose: HeroAnimation = animation === "idle" && hp <= 0 ? "exhausted" : animation;

  if (failed) {
    return (
      <div
        role="img"
        aria-label="Pahlawan petualang"
        className={`flex h-24 w-24 items-end justify-center text-7xl sm:h-32 sm:w-32 sm:text-8xl ${ANIMATION_CLASS[pose]}`}
      >
        🦸‍♀️
      </div>
    );
  }

  return (
    <Image
      src={HERO_ASSETS[pose]}
      alt="Pahlawan petualang"
      width={480}
      height={480}
      unoptimized
      onError={() => setFailed(true)}
      className={`h-24 w-24 object-contain drop-shadow-lg sm:h-32 sm:w-32 ${ANIMATION_CLASS[pose]}`}
    />
  );
}
