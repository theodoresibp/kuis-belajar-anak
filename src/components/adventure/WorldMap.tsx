import { useMemo } from "react";
import Image from "next/image";
import type { PlannedEncounter } from "@/features/adventure/encounter-generator";
import {
  buildWorldMap,
  layoutWorldMapNodes,
} from "@/features/adventure/world-map";
import { getAdventureMonsterById } from "@/features/adventure/monsters.config";

/**
 * Sprint 2 (Peta Dunia): the run's route as a journey map.
 *
 * The nodes are drawn over the illustrated parchment
 * map (START in the forest, over the bridge, along the rainbow
 * beach, up to the castle FINISH) — the final boss node shows the
 * boss's face (Monster Mama). It is a pure presentation of the
 * plan: defeated = green check, next = pulsing red ring.
 */

function IllustratedMap({
  plan,
  currentIndex,
}: {
  plan: readonly PlannedEncounter[];
  currentIndex: number;
}) {
  const map = useMemo(() => buildWorldMap(plan), [plan]);
  const laidOut = useMemo(() => layoutWorldMapNodes(map), [map]);

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: "1600 / 893" }}
      role="img"
      aria-label="Peta perjalanan petualangan"
    >
      <Image
        src="/assets/adventure/world-map-bg.jpg"
        alt=""
        fill
        unoptimized
        sizes="(max-width: 768px) 100vw, 672px"
        className="object-cover"
      />
      {laidOut.map(({ node, x, y }, i) => {
        const defeated = i < currentIndex;
        const current = i === currentIndex;
        if (node.isBoss) {
          const face = getAdventureMonsterById(node.monsterId).assets.idle;
          return (
            <div
              key={node.index}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative">
                {current && (
                  <span className="absolute -top-3 left-1/2 z-10 h-3 w-3 -translate-x-1/2 animate-ping rounded-full bg-red-500" />
                )}
                <div
                  className={`relative h-14 w-14 overflow-hidden rounded-full bg-white shadow-lg ring-4 sm:h-16 sm:w-16 ${
                    current ? "ring-red-500" : defeated ? "ring-emerald-500" : "ring-violet-600"
                  }`}
                >
                  {/* The boss sprite, zoomed onto her face (the head
                      sits at ~49%/31% of the 480px sprite). */}
                  <Image
                    src={face}
                    alt={node.monsterName}
                    fill
                    unoptimized
                    sizes="64px"
                    style={{
                      objectFit: "cover",
                      transform: "scale(2.4)",
                      transformOrigin: "49% 31%",
                    }}
                  />
                  {defeated && (
                    <span className="absolute inset-0 flex items-center justify-center bg-emerald-500/45 text-2xl font-black text-white">
                      ✓
                    </span>
                  )}
                </div>
                <span className="absolute -right-2 -top-2 text-lg drop-shadow">👑</span>
              </div>
              <span className="mt-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow sm:text-[11px]">
                {node.monsterName}
              </span>
            </div>
          );
        }
        return (
          <div
            key={node.index}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="relative">
              {current && (
                <span className="absolute -top-3 left-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 animate-ping rounded-full bg-red-500" />
              )}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg shadow-lg ring-4 sm:h-11 sm:w-11 ${
                  defeated
                    ? "bg-emerald-500 ring-emerald-600"
                    : current
                      ? "bg-white ring-red-500"
                      : "bg-white ring-slate-400/70"
                }`}
              >
                {defeated ? (
                  <span className="text-base font-black text-white">✓</span>
                ) : (
                  node.emoji
                )}
              </div>
            </div>
            <span className="mt-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow sm:text-[11px]">
              {node.monsterName}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function WorldMap({
  plan,
  currentIndex,
}: {
  plan: readonly PlannedEncounter[];
  /** Number of monsters already defeated; that node is "current". */
  currentIndex: number;
}) {
  return <IllustratedMap plan={plan} currentIndex={currentIndex} />;
}
