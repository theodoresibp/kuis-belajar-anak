"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { AdventureEncounter } from "@/game/adventure/AdventureScene";
import type { PlannedEncounter } from "@/features/adventure/encounter-generator";

type VirtualDirection = "left" | "right" | "jump";

interface Props {
  /** The run plan from the encounter generator (Sprint C); the scene
   *  builds its whole world from it. */
  plan: PlannedEncounter[];
  heroId: string;
  heroHp: number;
  score: number;
  totalQuestions: number;
  monsterProgress: number;
  shieldCharges: number;
  isDefeated: boolean;
  onEncounter: (encounter: AdventureEncounter, resolve: () => void) => void;
  onAdventureComplete: () => void;
  onHazard: () => void;
  onPickup: (kind: "heart" | "shield") => void;
  onBossWarning: (active: boolean) => void;
  onBossAttack: () => void;
}

const CONTROL_LABELS: Record<VirtualDirection, string> = {
  left: "Bergerak ke kiri",
  right: "Bergerak ke kanan",
  jump: "Melompat",
};

const CONTROL_SYMBOLS: Record<VirtualDirection, string> = {
  left: "←",
  right: "→",
  jump: "↑",
};

export default function AdventureGameCanvas({
  plan,
  heroId,
  heroHp,
  score,
  totalQuestions,
  monsterProgress,
  shieldCharges,
  isDefeated,
  onEncounter,
  onAdventureComplete,
  onHazard,
  onPickup,
  onBossWarning,
  onBossAttack,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);

  // Menyimpan pointer ID agar beberapa tombol dapat ditekan bersamaan.
  const activePointers = useRef<Map<number, VirtualDirection>>(new Map());
  const onEncounterRef = useRef(onEncounter);
  const onAdventureCompleteRef = useRef(onAdventureComplete);
  const onHazardRef = useRef(onHazard);
  const onPickupRef = useRef(onPickup);
  const onBossWarningRef = useRef(onBossWarning);
  const onBossAttackRef = useRef(onBossAttack);

  useEffect(() => {
    onEncounterRef.current = onEncounter;
    onAdventureCompleteRef.current = onAdventureComplete;
    onHazardRef.current = onHazard;
    onPickupRef.current = onPickup;
    onBossWarningRef.current = onBossWarning;
    onBossAttackRef.current = onBossAttack;
  }, [onEncounter, onAdventureComplete, onHazard, onPickup, onBossWarning, onBossAttack]);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    let disposed = false;
    const pointers = activePointers.current;

    async function boot() {
      try {
        const [Phaser, { default: AdventureScene }] = await Promise.all([
          import("phaser"),
          import("@/game/adventure/AdventureScene"),
        ]);

        if (disposed || !hostRef.current) {
          return;
        }

        const game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: hostRef.current,
          backgroundColor: "#7dd3fc",
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 960,
            height: 540,
          },
          physics: {
            default: "arcade",
            arcade: {
              gravity: { x: 0, y: 1100 },
              debug: false,
            },
          },
          render: {
            antialias: true,
            pixelArt: false,
          },
          scene: [new AdventureScene(plan, heroId)],
        });

        gameRef.current = game;

        const handleEncounter = (encounter: AdventureEncounter) => {
          onEncounterRef.current(encounter, () => {
            game.events.emit("resolve-encounter", encounter.index);
          });
        };
        const handleAdventureComplete = () => {
          onAdventureCompleteRef.current();
        };
        const handleHazard = () => onHazardRef.current();
        const handlePickup = (kind: "heart" | "shield") => onPickupRef.current(kind);
        const handleBossWarning = () => onBossWarningRef.current(true);
        const handleBossWarningClear = () => onBossWarningRef.current(false);
        const handleBossAttack = () => {
          onBossWarningRef.current(false);
          onBossAttackRef.current();
        };

        game.events.on("monster-encounter", handleEncounter);
        game.events.on("adventure-complete", handleAdventureComplete);
        game.events.on("adventure-hazard", handleHazard);
        game.events.on("adventure-pickup", handlePickup);
        game.events.on("boss-attack-warning", handleBossWarning);
        game.events.on("boss-attack-warning-clear", handleBossWarningClear);
        game.events.on("boss-attack", handleBossAttack);

        game.events.once(Phaser.Core.Events.DESTROY, () => {
          game.events.off("monster-encounter", handleEncounter);
          game.events.off("adventure-complete", handleAdventureComplete);
          game.events.off("adventure-hazard", handleHazard);
          game.events.off("adventure-pickup", handlePickup);
          game.events.off("boss-attack-warning", handleBossWarning);
          game.events.off("boss-attack-warning-clear", handleBossWarningClear);
          game.events.off("boss-attack", handleBossAttack);
        });

        if (!disposed) {
          setReady(true);
        } else {
          game.destroy(true);
        }
      } catch (cause) {
        console.error("Gagal menyiapkan Adventure Mode:", cause);

        if (!disposed) {
          setError(true);
        }
      }
    }

    void boot();

    return () => {
      disposed = true;

      pointers.clear();

      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [plan, heroId]);

  useEffect(() => {
    if (isDefeated) {
      gameRef.current?.events.emit("stop-adventure");
    }
  }, [isDefeated]);

  const sendControl = useCallback(
    (direction: VirtualDirection, pressed: boolean) => {
      gameRef.current?.events.emit("virtual-control", direction, pressed);
    },
    [],
  );

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    direction: VirtualDirection,
  ) => {
    event.preventDefault();

    // Abaikan pointer yang sudah terdaftar.
    if (activePointers.current.has(event.pointerId)) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    activePointers.current.set(event.pointerId, direction);
    sendControl(direction, true);
  };

  const handlePointerRelease = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const direction = activePointers.current.get(event.pointerId);

    if (!direction) {
      return;
    }

    activePointers.current.delete(event.pointerId);

    // Jangan melepas arah jika masih ada jari lain
    // yang sedang menahan tombol dengan arah yang sama.
    const anotherPointerHoldingSameDirection = Array.from(
      activePointers.current.values(),
    ).some((activeDirection) => activeDirection === direction);

    if (!anotherPointerHoldingSameDirection) {
      sendControl(direction, false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative isolate aspect-[16/10] w-full touch-none overflow-hidden rounded-2xl border-4 border-white bg-sky-200 shadow-xl" aria-label="Game petualangan Enchanted Forest">
        <div ref={hostRef} className="absolute inset-0" />

        {/* HUD ringkas di dalam scene */}
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2 sm:inset-x-5 sm:top-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 rounded-2xl border border-white/60 bg-slate-950/55 px-3 py-2 text-white shadow-lg backdrop-blur-sm sm:gap-4 sm:px-4">
            <div className="min-w-[112px] flex-1">
              <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-extrabold sm:text-xs">
                <span>❤️ HP Petualang</span><span>{heroHp}/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/30 sm:h-2.5">
                <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.max(0, Math.min(100, heroHp))}%` }} />
              </div>
              <div className="mt-1 text-[9px] font-semibold text-white/85 sm:text-[10px]">🛡️ {shieldCharges} perisai</div>
            </div>
            <div className="px-1 text-center">
              <div className="text-[9px] font-bold text-white/80 sm:text-[10px]">BENAR</div>
              <div className="text-base font-black leading-tight sm:text-xl">⭐ {score}/{totalQuestions}</div>
            </div>
            <div className="px-1 text-center">
              <div className="text-[9px] font-bold text-white/80 sm:text-[10px]">MONSTER</div>
              <div className="text-base font-black leading-tight sm:text-xl">👾 {monsterProgress}/{plan.length}</div>
            </div>
          </div>
          <button
            type="button"
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Matikan efek suara" : "Nyalakan efek suara"}
            disabled={!ready}
            onClick={() => {
              const nextEnabled = !soundEnabled;
              setSoundEnabled(nextEnabled);
              gameRef.current?.events.emit("toggle-sound", nextEnabled);
            }}
            className="pointer-events-auto shrink-0 rounded-xl border border-white/70 bg-slate-950/55 px-2.5 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm sm:px-3 sm:text-sm disabled:opacity-50"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>

        {/* Kontrol sentuh: arah di kiri, lompat di kanan */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-end justify-between sm:inset-x-5 sm:bottom-5" aria-label="Kontrol permainan">
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
            {(["left", "right"] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                aria-label={CONTROL_LABELS[direction]}
                disabled={!ready}
                onPointerDown={(event) => handlePointerDown(event, direction)}
                onPointerUp={handlePointerRelease}
                onPointerCancel={handlePointerRelease}
                onLostPointerCapture={handlePointerRelease}
                className="flex h-14 w-14 touch-none select-none items-center justify-center rounded-2xl border-2 border-white/70 bg-violet-700/85 text-3xl font-black text-white shadow-xl backdrop-blur-sm active:scale-95 active:bg-violet-900 disabled:opacity-50 sm:h-[72px] sm:w-[72px] sm:text-4xl"
              >
                {CONTROL_SYMBOLS[direction]}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label={CONTROL_LABELS.jump}
            disabled={!ready}
            onPointerDown={(event) => handlePointerDown(event, "jump")}
            onPointerUp={handlePointerRelease}
            onPointerCancel={handlePointerRelease}
            onLostPointerCapture={handlePointerRelease}
            className="pointer-events-auto flex h-[68px] w-[68px] touch-none select-none items-center justify-center rounded-full border-[3px] border-white/80 bg-amber-500/90 text-3xl font-black text-white shadow-xl backdrop-blur-sm active:scale-95 active:bg-amber-600 disabled:opacity-50 sm:h-[84px] sm:w-[84px] sm:text-4xl"
          >
            ↑
          </button>
        </div>

        {error && <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 p-4 text-center text-sm font-bold text-white">Game gagal dimuat. Silakan refresh halaman.</div>}
        {!ready && !error && <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35 text-sm font-bold text-white">Menyiapkan dunia petualangan...</div>}
      </div>
      <p className="mt-2 text-center text-[11px] font-semibold text-slate-500 sm:text-xs">
        Tahan tombol ← → untuk bergerak, dan tahan ↑ untuk melompat. Bisa juga memakai keyboard.
      </p>
    </div>
  );
}
