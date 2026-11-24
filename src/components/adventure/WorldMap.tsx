import { useMemo } from "react";
import type { PlannedEncounter } from "@/features/adventure/encounter-generator";
import { buildWorldMap } from "@/features/adventure/world-map";
import type { ZoneId } from "@/features/adventure/zones";

/**
 * Sprint 2 (Peta Dunia): the run's route as a winding trail through
 * the zones — forest, beach, castle — with one stone per monster.
 * Defeated monsters are green checks, the next monster pulses red,
 * and the final boss wears a crown. Pure presentation of the plan.
 */

const ZONE_BAND: Record<ZoneId, string> = {
  hutan: "#bfe8c9",
  pantai: "#f7e3ae",
  kastil: "#ddd0f5",
};

const ZONE_TEXT: Record<ZoneId, string> = {
  hutan: "#1e6b3c",
  pantai: "#8a6414",
  kastil: "#4b3486",
};

const WIDTH = 640;
const PAD_X = 46;

function nodeX(index: number, count: number): number {
  if (count <= 1) return WIDTH / 2;
  return PAD_X + (index * (WIDTH - PAD_X * 2)) / (count - 1);
}

function nodeY(index: number, count: number, midY: number, amp: number): number {
  if (count <= 1) return midY;
  return midY + (index % 2 === 0 ? -amp : amp);
}

/** Smooth path through the points (quadratic midpoints). */
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
  const map = useMemo(() => buildWorldMap(plan), [plan]);
  const full = variant === "full";
  const height = full ? 230 : 118;
  const midY = full ? 134 : 62;
  const amp = full ? 46 : 24;
  const stoneR = full ? 15 : 11;

  const points = map.nodes.map((node, i) => ({
    x: nodeX(i, map.nodes.length),
    y: nodeY(i, map.nodes.length, midY, amp),
  }));

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
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
            ? WIDTH
            : (nodeX(span.toIndex, map.nodes.length) +
                nodeX(span.toIndex + 1, map.nodes.length)) /
              2;
        const label =
          toX - fromX >= 150
            ? `${span.emoji} ${span.name}`
            : toX - fromX >= 60
              ? span.emoji
              : "";
        return (
          <g key={span.zoneId}>
            <rect
              x={fromX}
              y={0}
              width={toX - fromX}
              height={height}
              fill={ZONE_BAND[span.zoneId]}
            />
            {full && label && (
              <text
                x={(fromX + toX) / 2}
                y={28}
                textAnchor="middle"
                fontSize={15}
                fontWeight={700}
                fill={ZONE_TEXT[span.zoneId]}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}

      <path
        d={trailPath(points)}
        fill="none"
        stroke="#e8cf9a"
        strokeWidth={full ? 15 : 10}
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
        const r = stoneR + (node.isBoss ? 4 : 0);
        return (
          <g key={node.index}>
            {current && (
              <circle cx={x} cy={y - r - (full ? 16 : 11)} r={full ? 5 : 4} fill="#e2574c">
                <animate
                  attributeName="r"
                  values={`${full ? 5 : 4};${full ? 8 : 6};${full ? 5 : 4}`}
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
              <text
                x={x}
                y={y + (full ? 5.5 : 4.5)}
                textAnchor="middle"
                fontSize={node.isBoss ? (full ? 17 : 13) : full ? 14 : 11}
              >
                {node.isBoss ? "👑" : node.emoji}
              </text>
            )}
            {full && (
              <text
                x={x}
                y={y + r + 17}
                textAnchor="middle"
                fontSize={10.5}
                fontWeight={600}
                fill="#475569"
              >
                {node.monsterName}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
