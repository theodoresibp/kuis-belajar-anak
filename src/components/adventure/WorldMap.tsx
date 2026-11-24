import { useMemo } from "react";
import Image from "next/image";
import type { PlannedEncounter } from "@/features/adventure/encounter-generator";
import {
  buildWorldMap,
  layoutWorldMapNodes,
} from "@/features/adventure/world-map";
import { getAdventureMonsterById } from "@/features/adventure/monsters.config";
import type { ZoneId } from "@/features/adventure/zones";

/**
 * Sprint 2 (Peta Dunia): the run's route as a journey map.
 *
 * The full variant draws the nodes over the illustrated parchment
 * map (START in the forest, over the bridge, along the rainbow
 * beach, up to the castle FINISH) — the final boss node shows the
 * boss's face (Monster Mama). The compact variant (owl panel) is a
 * simple SVG trail with zone bands. Both are pure presentations of
 * the plan: defeated = green check, next = pulsing red ring.
 */

const ZONE_BAND: Record<ZoneId, string> = {
  hutan: "#bfe8c9",
  pantai: "#f7e3ae",
  kastil: "#ddd0f5",
};

const SVG_WIDTH = 640;
const PAD_X = 46;

function nodeX(index: number, count: number): number {
  if (count <= 1) return SVG_WIDTH / 2;
  return PAD_X + (index * (SVG_WIDTH - PAD_X * 2)) / (count - 1);
}

function trailPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x - 24} ${p.y} L ${p.x + 24} ${p.y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y}, ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function CompactMap({
  plan,
  currentIndex,
}: {
  plan: readonly PlannedEncounter[];
  currentIndex: number;
}) {
  const map = useMemo(() => buildWorldMap(plan), [plan]);
  const height = 118;
  const midY = 62;
  const amp = 24;
  const points = map.nodes.map((node, i) => ({
    x: nodeX(i, map.nodes.length),
    y: map.nodes.length <= 1 ? midY : midY + (i % 2 === 0 ? -amp : amp),
  }));

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${height}`}
      className="block h-auto w-full"
      role="img"
      aria-label="Peta perjalanan petualangan"
    >
      {map.zones.map((span) => {
        const fromX =
          span.fromIndex === 0
            ? 0
            : (nodeX(span.fromIndex - 1, map.nodes.length) +
                nodeX(span.fromIndex, map.nodes.length)) /
              2;
        const toX =
          span.toIndex === map.nodes.length - 1
            ? SVG_WIDTH
            : (nodeX(span.toIndex, map.nodes.length) +
                nodeX(span.toIndex + 1, map.nodes.length)) /
              2;
        return (
          <rect
            key={span.zoneId}
            x={fromX}
            y={0}
            width={toX - fromX}
            height={height}
            fill={ZONE_BAND[span.zoneId]}
          />
        );
      })}
      <path
        d={trailPath(points)}
        fill="none"
        stroke="#e8cf9a"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d={trailPath(points)}
        fill="none"
        stroke="#c9a86a"
        strokeWidth={2.5}
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      {map.nodes.map((node, i) => {
        const { x, y } = points[i];
        const defeated = i < currentIndex;
        const current = i === currentIndex;
        const r = 11 + (node.isBoss ? 4 : 0);
        return (
          <g key={node.index}>
            {current && (
              <circle cx={x} cy={y - r - 11} r={4} fill="#e2574c">
                <animate
                  attributeName="r"
                  values="4;6;4"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={defeated ? "#2f9e5f" : node.isBoss ? "#7c5cd6" : "#ffffff"}
              stroke={current ? "#e2574c" : defeated ? "#2f9e5f" : "#9aa3ad"}
              strokeWidth={current ? 3.5 : 2.5}
            />
            {defeated ? (
              <path
                d={`M ${x - 6} ${y} l 4.5 4.5 l 8 -9`}
                stroke="#ffffff"
                strokeWidth={2.8}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <text x={x} y={y + 4.5} textAnchor="middle" fontSize={node.isBoss ? 13 : 11}>
                {node.isBoss ? "👑" : node.emoji}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

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
  variant = "full",
}: {
  plan: readonly PlannedEncounter[];
  /** Number of monsters already defeated; that node is "current". */
  currentIndex: number;
  variant?: "full" | "compact";
}) {
  if (variant === "compact") {
    return <CompactMap plan={plan} currentIndex={currentIndex} />;
  }
  return <IllustratedMap plan={plan} currentIndex={currentIndex} />;
}
