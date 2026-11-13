"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { AdventureEncounter } from "@/game/adventure/AdventureScene";

type VirtualDirection = "left" | "right" | "jump";

interface Props {
  encounterCount: number;
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
  encounterCount,
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
          scene: [new AdventureScene(encounterCount)],
        });

        gameRef.current = game;

        const handleEncounter = (encounter: AdventureEncounter) => {
          onEncounterRef.current(encounter, () => {
            game.events.emit("resolve-encounter", encounter.id);
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
  }, [encounterCount]);

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

  const directions: VirtualDirection[] = ["left", "right", "jump"];

  return (
    <div className="w-full">
      <div
        ref={hostRef}
        className="aspect-[16/10] w-full touch-none overflow-hidden rounded-2xl border-4 border-white bg-sky-200 shadow-xl sm:aspect-[16/9]"
        aria-label="Game petualangan Enchanted Forest"
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {error ? (
            <p className="text-sm font-semibold text-red-600">
              Game gagal dimuat. Silakan refresh halaman.
            </p>
          ) : (
            <p className="text-sm font-semibold text-slate-600">
              {ready
                ? "Keyboard: A/D atau ←/→ untuk bergerak, Space/↑ untuk melompat."
                : "Menyiapkan dunia petualangan..."}
            </p>
          )}
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-center gap-2"
          aria-label="Kontrol permainan"
        >
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
            className="h-14 rounded-xl border-2 border-violet-200 bg-white px-3 text-sm font-bold text-violet-800 shadow-sm transition hover:bg-violet-50 disabled:opacity-50"
          >
            {soundEnabled ? "🔊 Suara" : "🔇 Senyap"}
          </button>
          {directions.map((direction) => (
            <button
              key={direction}
              type="button"
              aria-label={CONTROL_LABELS[direction]}
              disabled={!ready}
              onPointerDown={(event) => handlePointerDown(event, direction)}
              onPointerUp={handlePointerRelease}
              onPointerCancel={handlePointerRelease}
              onLostPointerCapture={handlePointerRelease}
              className="h-14 min-w-14 touch-none select-none rounded-xl bg-violet-600 px-5 text-2xl font-black text-white shadow-md transition hover:bg-violet-700 active:scale-95 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {CONTROL_SYMBOLS[direction]}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 sm:text-right">
        Sentuh dan tahan tombol untuk bergerak. Tekan ↑ untuk melompat. Efek suara aktif setelah interaksi pertama.
      </p>
    </div>
  );
}
