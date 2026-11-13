/**
 * Procedural background-music engine for Adventure Mode.
 *
 * Like the SFX engine (features/gamification/sound.ts) everything is
 * synthesised with WebAudio — no audio files. A lookahead scheduler
 * plays a two-bar loop per track: soft pads, a bass line and a simple
 * lead melody. Four tracks share the scheduler:
 *
 *   explore      — calm major-key wandering music
 *   battle       — normal monsters: minor key, driving bass
 *   battle-elite — elite: faster, denser
 *   battle-boss  — mini-boss & final boss: slowest-heavy, dramatic
 *
 * Track changes happen on bar boundaries with a short crossfade.
 * Muting follows the shared `kuis-battle-muted` flag (the SFX toggle),
 * polled by the scheduler, so every existing mute button controls the
 * music too. Safe anywhere: no-ops on the server / without AudioContext,
 * and the context only ever resumes inside start(), which the page
 * calls from user-gesture handlers (autoplay policy).
 */

import { isSoundMuted } from "../gamification/sound";
import type { MonsterTier } from "./monsters.config";

export type MusicTrack = "explore" | "battle" | "battle-elite" | "battle-boss";

/** Which track a battle against this tier (or no battle) should use. */
export function trackForTier(tier: MonsterTier | null): MusicTrack {
  switch (tier) {
    case "elite":
      return "battle-elite";
    case "mini-boss":
    case "final-boss":
      return "battle-boss";
    case "normal":
      return "battle";
    default:
      return "explore";
  }
}

type BassStyle = "beats" | "eighths" | "driving";

interface TrackDef {
  bpm: number;
  level: number;
  /** Bass root (MIDI) for bar A and bar B of the loop. */
  bassRoots: [number, number];
  bassStyle: BassStyle;
  bassType: OscillatorType;
  /** Pad chord (MIDI notes) for bar A and bar B. */
  pads: [number[], number[]];
  /** Lead melody over the 32 sixteenth steps of the loop; null = rest. */
  lead: (number | null)[];
  leadType: OscillatorType;
  leadGain: number;
  /** Steps (0-31) that get a soft hat tick. */
  hatSteps: number[];
}

const OFFBEAT_HATS = [4, 12, 20, 28];
const EIGHTH_HATS = [2, 6, 10, 14, 18, 22, 26, 30];
const SIXTEENTH_OFF_HATS = [2, 4, 6, 10, 12, 14, 18, 20, 22, 26, 28, 30];

export const MUSIC_TRACKS: Record<MusicTrack, TrackDef> = {
  explore: {
    bpm: 100,
    level: 0.8,
    bassRoots: [36, 41], // C2, F2
    bassStyle: "beats",
    bassType: "sine",
    pads: [
      [48, 55, 64],
      [48, 53, 60],
    ],
    lead: [
      72, null, 76, null, 79, null, 76, null, 81, null, 79, null, 76, null, 74, null,
      77, null, 81, null, 84, null, 81, null, 79, null, 77, null, 76, null, null, null,
    ],
    leadType: "triangle",
    leadGain: 0.05,
    hatSteps: OFFBEAT_HATS,
  },
  battle: {
    bpm: 124,
    level: 0.9,
    bassRoots: [45, 43], // A2, G2
    bassStyle: "eighths",
    bassType: "triangle",
    pads: [
      [48, 52, 57],
      [47, 50, 55],
    ],
    lead: [
      69, null, 72, null, 74, null, 72, null, 69, null, null, null, 67, null, 69, null,
      69, null, 72, null, 76, null, 74, null, 72, null, 74, null, 71, null, null, null,
    ],
    leadType: "triangle",
    leadGain: 0.058,
    hatSteps: EIGHTH_HATS,
  },
  "battle-elite": {
    bpm: 136,
    level: 0.95,
    bassRoots: [45, 41], // A2, F2
    bassStyle: "driving",
    bassType: "triangle",
    pads: [
      [48, 52, 57],
      [48, 53, 57],
    ],
    lead: [
      69, null, 72, 74, null, 72, null, 76, 74, null, 72, null, null, null, 71, null,
      72, null, 74, 76, null, 79, null, 76, 74, null, 72, null, 74, null, 71, null,
    ],
    leadType: "square",
    leadGain: 0.032,
    hatSteps: SIXTEENTH_OFF_HATS,
  },
  "battle-boss": {
    bpm: 142,
    level: 1,
    bassRoots: [38, 34], // D2, Bb1
    bassStyle: "driving",
    bassType: "sawtooth",
    pads: [
      [50, 53, 57],
      [50, 53, 58],
    ],
    lead: [
      74, null, null, 74, null, null, 77, null, 74, null, null, 73, null, null, null, null,
      74, null, null, 74, null, null, 81, null, 79, null, 77, null, 76, null, 73, null,
    ],
    leadType: "sawtooth",
    leadGain: 0.03,
    hatSteps: EIGHTH_HATS,
  },
};

/** Bass note (MIDI) for a step, per style; null = no bass note. */
function bassNoteAt(def: TrackDef, step: number): number | null {
  const bar = step < 16 ? 0 : 1;
  const root = def.bassRoots[bar];
  const s = step % 16;
  switch (def.bassStyle) {
    case "beats":
      if (s % 4 !== 0) return null;
      return s === 8 ? root + 7 : root;
    case "eighths":
      if (s % 2 !== 0) return null;
      return s === 6 || s === 14 ? root + 12 : root;
    case "driving":
      if (s % 2 !== 0) return null;
      if (s === 14) return root + 7;
      return s === 6 ? root + 12 : root;
    default:
      return null;
  }
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/* ------------------------------------------------------------------ */
/* Engine (module singleton)                                           */
/* ------------------------------------------------------------------ */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let trackGains: Record<MusicTrack, GainNode> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let noiseBuf: AudioBuffer | null = null;

let currentTrack: MusicTrack = "explore";
let pendingTrack: MusicTrack | null = null;
let step = 0;
let nextStepTime = 0;
let lastMuted: boolean | null = null;

const TRACK_NAMES: MusicTrack[] = ["explore", "battle", "battle-elite", "battle-boss"];

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    trackGains = {
      explore: ctx.createGain(),
      battle: ctx.createGain(),
      "battle-elite": ctx.createGain(),
      "battle-boss": ctx.createGain(),
    };
    for (const name of TRACK_NAMES) {
      trackGains[name].gain.value = 0;
      trackGains[name].connect(master);
    }
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

function tone(
  dest: GainNode,
  time: number,
  midi: number,
  dur: number,
  type: OscillatorType,
  peak: number,
  attack = 0.01,
): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = midiToFreq(midi);
  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.exponentialRampToValueAtTime(peak, time + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(amp).connect(dest);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

function hat(dest: GainNode, time: number): void {
  if (!ctx || !noiseBuf) return;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuf;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7800;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.exponentialRampToValueAtTime(0.014, time + 0.005);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
  source.connect(filter).connect(amp).connect(dest);
  source.start(time);
  source.stop(time + 0.08);
}

function scheduleStep(stepIndex: number, time: number): void {
  if (!ctx || !trackGains) return;
  const def = MUSIC_TRACKS[currentTrack];
  const out = trackGains[currentTrack];
  const stepDur = 60 / def.bpm / 4;

  if (stepIndex % 16 === 0) {
    // Bar start: soft pad chord for the whole bar.
    const chord = def.pads[stepIndex < 16 ? 0 : 1];
    for (const note of chord) {
      tone(out, time, note, stepDur * 16, "triangle", 0.026, 0.4);
    }
  }
  const bass = bassNoteAt(def, stepIndex);
  if (bass !== null) {
    tone(out, time, bass, stepDur * (def.bassStyle === "beats" ? 3.4 : 1.8), def.bassType, 0.13);
  }
  const lead = def.lead[stepIndex];
  if (lead !== null && lead !== undefined) {
    tone(out, time, lead, stepDur * 1.9, def.leadType, def.leadGain);
  }
  if (def.hatSteps.includes(stepIndex)) hat(out, time);
}

function schedulerTick(): void {
  if (!ctx || !master || !trackGains) return;
  // The shared mute flag drives the master gain — every existing mute
  // toggle in the app therefore controls the music too.
  const muted = isSoundMuted();
  if (muted !== lastMuted) {
    lastMuted = muted;
    master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.08);
  }
  const def = MUSIC_TRACKS[currentTrack];
  const stepDur = 60 / def.bpm / 4;
  while (nextStepTime < ctx.currentTime + 0.24) {
    if (step % 16 === 0 && pendingTrack && pendingTrack !== currentTrack) {
      const previous = trackGains[currentTrack];
      currentTrack = pendingTrack;
      pendingTrack = null;
      previous.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      trackGains[currentTrack].gain.setTargetAtTime(
        MUSIC_TRACKS[currentTrack].level,
        ctx.currentTime,
        0.25,
      );
      step = 0;
    }
    scheduleStep(step, nextStepTime);
    nextStepTime += stepDur;
    step = (step + 1) % 32;
  }
}

/** Start (or resume) the music. Call from a user-gesture handler. */
export function startMusic(): void {
  try {
    const audio = ensureContext();
    if (!audio || !trackGains) return;
    if (audio.state === "suspended") void audio.resume();
    if (timer) return;
    step = 0;
    nextStepTime = audio.currentTime + 0.06;
    lastMuted = null;
    trackGains[currentTrack].gain.setTargetAtTime(
      MUSIC_TRACKS[currentTrack].level,
      audio.currentTime,
      0.3,
    );
    timer = setInterval(schedulerTick, 90);
  } catch {
    // Music must never break the game.
  }
}

/** Switch track at the next bar boundary (crossfaded). */
export function setMusicTrack(track: MusicTrack): void {
  if (track === currentTrack) {
    pendingTrack = null;
    return;
  }
  pendingTrack = track;
}

/** Stop the music and release the scheduler (page unmount). */
export function stopMusic(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (ctx && master) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
  }
  pendingTrack = null;
}
