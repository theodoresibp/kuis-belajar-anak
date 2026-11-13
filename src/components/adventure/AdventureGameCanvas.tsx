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
  onEncounter: (encounter: AdventureEncounter, resolve: () => void) => void;
  onAdventureComplete: () => void;
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
  onEncounter,
  onAdventureComplete,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);

  // Menyimpan pointer ID agar beberapa tombol dapat ditekan bersamaan.
  const activePointers = useRef<Map<number, VirtualDirection>>(new Map());
  const onEncounterRef = useRef(onEncounter);
  const onAdventureCompleteRef = useRef(onAdventureComplete);
  onEncounterRef.current = onEncounter;
  onAdventureCompleteRef.current = onAdventureComplete;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

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

        game.events.on("monster-encounter", handleEncounter);
        game.events.on("adventure-complete", handleAdventureComplete);

        game.events.once(Phaser.Core.Events.DESTROY, () => {
          game.events.off("monster-encounter", handleEncounter);
          game.events.off("adventure-complete", handleAdventureComplete);
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
        className="aspect-[16/9] w-full overflow-hidden rounded-2xl border-4 border-white bg-sky-200 shadow-xl"
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
          className="flex shrink-0 items-center justify-center gap-2"
          aria-label="Kontrol permainan"
        >
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
              className="h-12 min-w-12 touch-none select-none rounded-xl bg-violet-600 px-4 text-2xl font-black text-white shadow-md transition hover:bg-violet-700 active:scale-95 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {CONTROL_SYMBOLS[direction]}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-slate-500 sm:text-right">
        Gunakan tombol di layar atau keyboard untuk bermain.
      </p>
    </div>
  );
}
