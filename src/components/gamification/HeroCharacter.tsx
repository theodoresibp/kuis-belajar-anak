"use client";

import { useState } from "react";
import Image from "next/image";
import type { HeroDef } from "@/features/gamification/battle.config";
import type { HeroAnimation } from "@/features/gamification/battle.types";

interface Props {
  hero: HeroDef;
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
 * The selected adventurer. When their HP is 0 the exhausted pose wins over
 * idle, so they stay visibly tired while the child finishes in practice mode.
 * If the image asset fails to load, a friendly emoji fallback keeps the stage usable.
 */
export default function HeroCharacter({ hero, animation, hp }: Props) {
  const [failed, setFailed] = useState(false);
  const pose: HeroAnimation = animation === "idle" && hp <= 0 ? "exhausted" : animation;

  if (failed) {
    return (
      <div
        role="img"
        aria-label={hero.name}
        className={`flex h-24 w-24 items-end justify-center text-7xl sm:h-32 sm:w-32 sm:text-8xl ${ANIMATION_CLASS[pose]}`}
      >
        {hero.fallbackEmoji}
      </div>
    );
  }

  return (
    <Image
      key={hero.id}
      src={hero.assets[pose]}
      alt={hero.name}
      width={480}
      height={480}
      unoptimized
      onError={() => setFailed(true)}
      className={`battle-enter-left h-24 w-24 object-contain drop-shadow-lg sm:h-32 sm:w-32 ${ANIMATION_CLASS[pose]}`}
    />
  );
}
