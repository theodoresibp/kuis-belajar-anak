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
  const stickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  // The analog stick's active pointer (at most one thumb steers).
  const stickStateRef = useRef<{
    pointerId: number;
    dir: "left" | "right" | null;
    jump: boolean;
  } | null>(null);
  // Which way the stick is pushed (highlights the ring arrows).
  const [stickDir, setStickDir] = useState<"left" | "right" | null>(null);
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
      stickStateRef.current = null;

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

    // Jangan melepas arah jika masih ditahan sumber lain
    // (jari lain di tombol yang sama, atau analog stick).
    if (!isDirectionHeld(direction)) {
      sendControl(direction, false);
    }
  };

  // A direction counts as held while ANY source holds it: a button
  // pointer or the analog stick. Releases consult this so one source
  // letting go never cancels another source's hold.
  const isDirectionHeld = (direction: VirtualDirection): boolean => {
    if (
      Array.from(activePointers.current.values()).some(
        (activeDirection) => activeDirection === direction,
      )
    ) {
      return true;
    }
    const stick = stickStateRef.current;
    if (!stick) return false;
    return direction === "jump" ? stick.jump : stick.dir === direction;
  };

  // Analog stick (MOBA style): the knob follows the thumb anywhere
  // inside the round base, so steering is one continuous slide —
  // push left/right to walk, push up to jump. The previous two-button
  // look made players lift their finger to change direction (which
  // felt like lag); a stick invites sliding instead.
  const STICK_DEAD_ZONE = 8; // px of sideways travel before walking engages
  const STICK_JUMP_TRAVEL = 22; // px of upward travel that counts as jump

  const setKnobOffset = (x: number, y: number) => {
    const knob = knobRef.current;
    if (knob) {
      knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
  };

  const applyStickPosition = (clientX: number, clientY: number) => {
    const state = stickStateRef.current;
    const rect = stickRef.current?.getBoundingClientRect();
    if (!state || !rect) return;
    let dx = clientX - (rect.left + rect.width / 2);
    let dy = clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    const maxTravel = rect.width * 0.28;
    if (distance > maxTravel) {
      dx = (dx / distance) * maxTravel;
      dy = (dy / distance) * maxTravel;
    }
    setKnobOffset(dx, dy);

    const dir =
      dx < -STICK_DEAD_ZONE ? "left" : dx > STICK_DEAD_ZONE ? "right" : null;
    if (dir !== state.dir) {
      const previous = state.dir;
      state.dir = dir;
      if (previous && !isDirectionHeld(previous)) {
        sendControl(previous, false);
      }
      if (dir) {
        sendControl(dir, true);
      }
      setStickDir(dir);
    }
    const jump = dy < -STICK_JUMP_TRAVEL;
    if (jump !== state.jump) {
      state.jump = jump;
      if (jump) {
        sendControl("jump", true);
      } else if (!isDirectionHeld("jump")) {
        sendControl("jump", false);
      }
    }
  };

  const handleStickPointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    if (!ready || stickStateRef.current) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    stickStateRef.current = { pointerId: event.pointerId, dir: null, jump: false };
    applyStickPosition(event.clientX, event.clientY);
  };

  const handleStickPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (stickStateRef.current?.pointerId !== event.pointerId) {
      return;
    }
    applyStickPosition(event.clientX, event.clientY);
  };

  const handleStickPointerRelease = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const state = stickStateRef.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }
    stickStateRef.current = null;
    if (state.dir && !isDirectionHeld(state.dir)) {
      sendControl(state.dir, false);
    }
    if (state.jump && !isDirectionHeld("jump")) {
      sendControl("jump", false);
    }
    setKnobOffset(0, 0);
    setStickDir(null);
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
          {/* Analog stick (MOBA style): a round base with a knob that
              follows the thumb, so steering is one continuous slide
              instead of two buttons players kept lifting off. Push
              left/right to walk, push up to jump; the separate jump
              button on the right still works as before. */}
          <div
            ref={stickRef}
            role="button"
            aria-label="Analog arah: geser kiri atau kanan untuk berjalan, dorong ke atas untuk melompat"
            className={
              "adventure-control-stick pointer-events-auto relative h-32 w-32 touch-none select-none rounded-full border-2 border-white/50 bg-slate-900/40 shadow-xl sm:h-36 sm:w-36" +
              (ready ? "" : " opacity-50")
            }
            onPointerDown={handleStickPointerDown}
            onPointerMove={handleStickPointerMove}
            onPointerUp={handleStickPointerRelease}
            onPointerCancel={handleStickPointerRelease}
            onLostPointerCapture={handleStickPointerRelease}
          >
            <span
              aria-hidden
              className={
                "absolute left-2.5 top-1/2 -translate-y-1/2 text-base font-black transition-colors duration-75 " +
                (stickDir === "left" ? "text-white" : "text-white/40")
              }
            >
              ◀
            </span>
            <span
              aria-hidden
              className={
                "absolute right-2.5 top-1/2 -translate-y-1/2 text-base font-black transition-colors duration-75 " +
                (stickDir === "right" ? "text-white" : "text-white/40")
              }
            >
              ▶
            </span>
            <span
              aria-hidden
              className="absolute left-1/2 top-2 -translate-x-1/2 text-sm font-black text-white/40"
            >
              ▲
            </span>
            <div
              ref={knobRef}
              aria-hidden
              className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full border-2 border-white/85 bg-violet-600 shadow-lg sm:h-16 sm:w-16"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <div className="absolute inset-2 rounded-full border border-white/25" />
            </div>
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
