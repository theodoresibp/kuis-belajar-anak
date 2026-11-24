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
import type { DifficultySettings } from "@/features/adventure/difficulty";
import type { ZoneId } from "@/features/adventure/zones";
import type { AdventureChest } from "@/features/adventure/chests";

type VirtualDirection = "left" | "right" | "jump";

interface Props {
  isFullscreen: boolean;
  onToggleFullscreen: () => void | Promise<void>;
  /** The run plan from the encounter generator (Sprint C); the scene
   *  builds its whole world from it. */
  plan: PlannedEncounter[];
  /** Controls boss timed-attack pacing inside the scene. */
  difficulty: DifficultySettings;
  heroId: string;
  heroHp: number;
  score: number;
  totalQuestions: number;
  monsterProgress: number;
  shieldCharges: number;
  /** Sprint 3 (Peti Harta): an Energy Orb is waiting to double the
   *  next correct answer's damage. */
  energyOrbActive: boolean;
  isDefeated: boolean;
  /** Incremented on every correct answer; the scene restarts the boss
   *  timed-attack cycle whenever this changes. */
  bossResetSignal: number;
  onEncounter: (encounter: AdventureEncounter, resolve: () => void) => void;
  onAdventureComplete: () => void;
  onHazard: () => void;
  onPickup: (kind: "heart" | "shield" | "orb") => void;
  /** Misi Kumpulkan: a collectible of this zone was picked up. */
  onCollectible: (zoneId: ZoneId) => void;
  /** Misi Kumpulkan progress for the hero's current zone (HUD chip). */
  missionProgress: {
    emoji: string;
    collected: number;
    goal: number;
    done: boolean;
  } | null;
  onBossWarning: (active: boolean) => void;
  onBossAttack: () => void;
  /** Sprint 1 (Burung Hantu): the scene paused at a zone's owl;
   *  resolve() resumes the run. */
  onOwlStop: (zoneId: ZoneId, resolve: () => void) => void;
  /** Sprint 3 (Peti Harta): the scene paused at a treasure chest;
   *  resolve(opened) resumes — opened=true pops the reward out. */
  onChestStop: (
    chest: AdventureChest,
    resolve: (opened: boolean) => void,
  ) => void;
  /** Sprint 2 (Peta Dunia): while true, the scene pauses the run. */
  worldMapOpen: boolean;
  onOpenWorldMap: () => void;
  onRequestRestart: () => void;
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
  difficulty,
  isFullscreen,
  onToggleFullscreen,
  heroId,
  heroHp,
  score,
  totalQuestions,
  monsterProgress,
  shieldCharges,
  energyOrbActive,
  missionProgress,
  isDefeated,
  bossResetSignal,
  onEncounter,
  onAdventureComplete,
  onHazard,
  onPickup,
  onCollectible,
  onBossWarning,
  onBossAttack,
  onOwlStop,
  onChestStop,
  worldMapOpen,
  onOpenWorldMap,
  onRequestRestart,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);

  // Menyimpan pointer ID agar beberapa tombol dapat ditekan bersamaan.
  const activePointers = useRef<Map<number, VirtualDirection>>(new Map());
  const dpadRef = useRef<HTMLDivElement>(null);
  // Which D-pad halves are currently held (drives the pressed styling).
  const [dpadDirections, setDpadDirections] = useState<
    ReadonlySet<VirtualDirection>
  >(new Set());
  const onEncounterRef = useRef(onEncounter);
  const onAdventureCompleteRef = useRef(onAdventureComplete);
  const onHazardRef = useRef(onHazard);
  const onPickupRef = useRef(onPickup);
  const onCollectibleRef = useRef(onCollectible);
  const onBossWarningRef = useRef(onBossWarning);
  const onBossAttackRef = useRef(onBossAttack);
  const onOwlStopRef = useRef(onOwlStop);
  const onChestStopRef = useRef(onChestStop);

  useEffect(() => {
    onEncounterRef.current = onEncounter;
    onAdventureCompleteRef.current = onAdventureComplete;
    onHazardRef.current = onHazard;
    onPickupRef.current = onPickup;
    onCollectibleRef.current = onCollectible;
    onBossWarningRef.current = onBossWarning;
    onBossAttackRef.current = onBossAttack;
    onOwlStopRef.current = onOwlStop;
    onChestStopRef.current = onChestStop;
  }, [
    onEncounter,
    onAdventureComplete,
    onHazard,
    onPickup,
    onCollectible,
    onBossWarning,
    onBossAttack,
    onOwlStop,
    onChestStop,
  ]);

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
            autoRound: true,
            width: 960,
            height: 540,
            // Large-screen tablets (e.g. Xiaomi Pad 5) report a landscape
            // viewport several times the pixel area of a phone — RESIZE
            // mode would render the full Phaser scene at that resolution
            // every frame. Capping it keeps the draw cost phone-like while
            // the CSS layer (`width/height: 100%` on the canvas) still
            // stretches the smaller buffer to fill the screen.
            max: { width: 1100, height: 650 },
          },
          physics: {
            default: "arcade",
            arcade: {
              gravity: { x: 0, y: 2100 },
              debug: false,
            },
          },
          render: {
            antialias: true,
            pixelArt: false,
            powerPreference: "high-performance",
          },
          // Cap at 60 FPS: tablets like the Xiaomi Pad 5 have 120Hz
          // panels, and an uncapped loop would try to render twice as
          // many frames as on a 60Hz phone for the exact same scene.
          fps: { target: 60 },
          scene: [
            new AdventureScene(
              plan,
              heroId,
              difficulty,
              // A fresh layout seed per boot: each zone's treasure
              // chest lands on a different (always reachable) high
              // platform from run to run (Sprint 3).
              Math.random().toString(36).slice(2, 10),
            ),
          ],
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
        const handlePickup = (kind: "heart" | "shield" | "orb") =>
          onPickupRef.current(kind);
        const handleCollectible = (zoneId: ZoneId) =>
          onCollectibleRef.current(zoneId);
        const handleBossWarning = () => onBossWarningRef.current(true);
        const handleBossWarningClear = () => onBossWarningRef.current(false);
        const handleBossAttack = () => {
          onBossWarningRef.current(false);
          onBossAttackRef.current();
        };
        const handleOwlStop = (zoneId: ZoneId) => {
          onOwlStopRef.current(zoneId, () => {
            game.events.emit("resolve-owl");
          });
        };
        const handleChestStop = (chest: AdventureChest) => {
          onChestStopRef.current(chest, (opened: boolean) => {
            game.events.emit("resolve-chest", chest.id, opened);
          });
        };

        game.events.on("monster-encounter", handleEncounter);
        game.events.on("adventure-complete", handleAdventureComplete);
        game.events.on("adventure-hazard", handleHazard);
        game.events.on("adventure-pickup", handlePickup);
        game.events.on("adventure-collectible", handleCollectible);
        game.events.on("boss-attack-warning", handleBossWarning);
        game.events.on("boss-attack-warning-clear", handleBossWarningClear);
        game.events.on("boss-attack", handleBossAttack);
        game.events.on("owl-stop", handleOwlStop);
        game.events.on("chest-stop", handleChestStop);

        game.events.once(Phaser.Core.Events.DESTROY, () => {
          game.events.off("monster-encounter", handleEncounter);
          game.events.off("adventure-complete", handleAdventureComplete);
          game.events.off("adventure-hazard", handleHazard);
          game.events.off("adventure-pickup", handlePickup);
          game.events.off("adventure-collectible", handleCollectible);
          game.events.off("boss-attack-warning", handleBossWarning);
          game.events.off("boss-attack-warning-clear", handleBossWarningClear);
          game.events.off("boss-attack", handleBossAttack);
          game.events.off("owl-stop", handleOwlStop);
          game.events.off("chest-stop", handleChestStop);
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
  }, [plan, heroId, difficulty]);

  useEffect(() => {
    if (isDefeated) {
      gameRef.current?.events.emit("stop-adventure");
    }
  }, [isDefeated]);

  const bossResetSeenRef = useRef(bossResetSignal);
  useEffect(() => {
    if (bossResetSeenRef.current === bossResetSignal) return;
    bossResetSeenRef.current = bossResetSignal;
    gameRef.current?.events.emit("boss-attack-reset");
  }, [bossResetSignal]);

  // Sprint 2 (Peta Dunia): pause the run while the map is open.
  useEffect(() => {
    gameRef.current?.events.emit(worldMapOpen ? "pause-run" : "resume-run");
  }, [worldMapOpen]);

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
    event: ReactPointerEvent<HTMLButtonElement | HTMLDivElement>,
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
    syncDpadDirections();
  };

  const syncDpadDirections = () => {
    setDpadDirections(
      new Set(
        Array.from(activePointers.current.values()).filter(
          (direction) => direction === "left" || direction === "right",
        ),
      ),
    );
  };

  // The D-pad is one fused rocker: the direction comes from WHERE on
  // the pad the pointer is, and follows pointermove — so sliding a
  // thumb from the right half to the left half switches direction in
  // the same gesture. (With two separate buttons + pointer capture,
  // that slide never registered on the other button: changing
  // direction felt stuck/laggy, especially right -> left.)
  const dpadDirectionAt = (clientX: number): VirtualDirection => {
    const rect = dpadRef.current?.getBoundingClientRect();
    if (!rect) return "left";
    return clientX < rect.left + rect.width / 2 ? "left" : "right";
  };

  const handleDpadPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    if (!ready || activePointers.current.has(event.pointerId)) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    const direction = dpadDirectionAt(event.clientX);
    activePointers.current.set(event.pointerId, direction);
    sendControl(direction, true);
    syncDpadDirections();
  };

  const handleDpadPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const current = activePointers.current.get(event.pointerId);
    if (!current || (current !== "left" && current !== "right")) {
      return;
    }
    const direction = dpadDirectionAt(event.clientX);
    if (direction === current) {
      return;
    }
    activePointers.current.set(event.pointerId, direction);
    const anotherPointerHoldingOldDirection = Array.from(
      activePointers.current.values(),
    ).some((activeDirection) => activeDirection === current);
    if (!anotherPointerHoldingOldDirection) {
      sendControl(current, false);
    }
    sendControl(direction, true);
    syncDpadDirections();
  };

  return (
    <div
      className="adventure-game-surface h-full w-full"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div
        className="relative isolate h-full min-h-0 w-full touch-none select-none overflow-hidden bg-sky-200"
        aria-label="Game petualangan Enchanted Forest"
      >
        <div ref={hostRef} className="adventure-game-host absolute inset-0" />

        {/* HUD ringkas di dalam scene */}
        <div className="pointer-events-none adventure-hud absolute inset-x-3 z-20 flex items-start justify-between gap-2 sm:inset-x-5 sm:top-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 rounded-2xl border border-white/60 bg-slate-950/70 px-3 py-2 text-white shadow-lg sm:gap-4 sm:px-4">
            <div className="min-w-[112px] flex-1">
              <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-extrabold sm:text-xs">
                <span>❤️ HP Petualang</span>
                <span>{heroHp}/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/30 sm:h-2.5">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, heroHp))}%` }}
                />
              </div>
              <div className="mt-1 text-[9px] font-semibold text-white/85 sm:text-[10px]">
                🛡️ {shieldCharges} perisai
                {energyOrbActive && (
                  <span className="ml-2 font-black text-violet-300">
                    🔮 Orb aktif: damage 2×!
                  </span>
                )}
                {missionProgress && (
                  <span className="ml-2 font-black text-teal-300">
                    {missionProgress.done
                      ? "🎯 Misi selesai! 🛡️ +1"
                      : `🎯 ${missionProgress.emoji} ${missionProgress.collected}/${missionProgress.goal}`}
                  </span>
                )}
              </div>
            </div>
            <div className="px-1 text-center">
              <div className="text-[9px] font-bold text-white/80 sm:text-[10px]">
                BENAR
              </div>
              <div className="text-base font-black leading-tight sm:text-xl">
                ⭐ {score}/{totalQuestions}
              </div>
            </div>
            <div className="px-1 text-center">
              <div className="text-[9px] font-bold text-white/80 sm:text-[10px]">
                MONSTER
              </div>
              <div className="text-base font-black leading-tight sm:text-xl">
                👾 {monsterProgress}/{plan.length}
              </div>
            </div>
          </div>

          <div className="pointer-events-auto flex shrink-0 flex-col items-stretch gap-2">
            <button
              type="button"
              aria-pressed={soundEnabled}
              aria-label={
                soundEnabled ? "Matikan efek suara" : "Nyalakan efek suara"
              }
              disabled={!ready}
              onClick={() => {
                const nextEnabled = !soundEnabled;
                setSoundEnabled(nextEnabled);
                gameRef.current?.events.emit("toggle-sound", nextEnabled);
              }}
              className="rounded-xl border border-white/70 bg-slate-950/70 px-2.5 py-2 text-xs font-bold text-white shadow-lg sm:px-3 sm:text-sm disabled:opacity-50"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>
            <button
              type="button"
              aria-label="Ulang petualangan"
              disabled={!ready}
              onClick={onRequestRestart}
              className="rounded-xl border border-white/70 bg-slate-950/70 px-2.5 py-2 text-xs font-bold text-white shadow-lg sm:px-3 sm:text-sm disabled:opacity-50"
            >
              🔄
            </button>
            <button
              type="button"
              aria-label="Buka peta dunia"
              disabled={!ready}
              onClick={onOpenWorldMap}
              className="rounded-xl border border-white/70 bg-slate-950/70 px-2.5 py-2 text-xs font-bold text-white shadow-lg sm:px-3 sm:text-sm disabled:opacity-50"
            >
              🗺️
            </button>
          </div>
        </div>

        {/* Kontrol sentuh: arah di kiri, lompat di kanan */}
        <div
          className="pointer-events-none adventure-controls absolute inset-x-3 z-20 flex items-end justify-between sm:inset-x-5 sm:bottom-5"
          aria-label="Kontrol permainan"
        >
          {/* One fused rocker pad: the wrapper owns the pointer events
              and the direction follows the thumb's position, so sliding
              across the middle switches direction instantly. The two
              halves are presentational (pointer-events-none). */}
          <div
            ref={dpadRef}
            className="adventure-control-dpad pointer-events-auto flex touch-none select-none divide-x divide-white/30 overflow-hidden rounded-2xl border-2 border-white/70 bg-violet-700/95 shadow-xl"
            onPointerDown={handleDpadPointerDown}
            onPointerMove={handleDpadPointerMove}
            onPointerUp={handlePointerRelease}
            onPointerCancel={handlePointerRelease}
            onLostPointerCapture={handlePointerRelease}
          >
            {(["left", "right"] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                aria-label={CONTROL_LABELS[direction]}
                disabled={!ready}
                tabIndex={-1}
                className={
                  "adventure-control-btn pointer-events-none flex h-14 w-14 touch-none select-none items-center justify-center text-3xl font-black text-white transition-colors duration-75 disabled:opacity-50 sm:h-[72px] sm:w-[72px] sm:text-4xl" +
                  (dpadDirections.has(direction) ? " bg-violet-900" : "")
                }
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
            className="adventure-jump-btn pointer-events-auto flex h-[68px] w-[68px] touch-none select-none items-center justify-center rounded-full border-[3px] border-white/80 bg-amber-500 text-3xl font-black text-white shadow-xl active:scale-95 active:bg-amber-600 disabled:opacity-50 sm:h-[84px] sm:w-[84px] sm:text-4xl"
          >
            ↑
          </button>
        </div>

        {error && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 p-4 text-center text-sm font-bold text-white">
            Game gagal dimuat. Silakan refresh halaman.
          </div>
        )}
        {!ready && !error && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35 text-sm font-bold text-white">
            Menyiapkan dunia petualangan...
          </div>
        )}
      </div>
    </div>
  );
}
