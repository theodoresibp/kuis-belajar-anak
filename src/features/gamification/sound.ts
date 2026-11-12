/**
 * Tiny WebAudio sound-effects engine — every sound is synthesised from
 * oscillators, so the app needs no audio files at all.
 * Safe to call anywhere: it no-ops on the server, when muted, or when the
 * browser has no AudioContext. The context is created lazily inside click
 * handlers (user gestures), which satisfies browser autoplay policies.
 */

export type SoundName =
  | "click"
  | "correct"
  | "wrong"
  | "hit"
  | "hurt"
  | "heal"
  | "shield"
  | "blocked"
  | "powerup"
  | "combo"
  | "victory"
  | "finish";

const MUTE_KEY = "kuis-battle-muted";

export function isSoundMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Storage unavailable (private mode) — muting just won't persist.
  }
}

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface Tone {
  freq: number;
  at: number; // seconds from start
  dur: number;
  type?: OscillatorType;
  gain?: number;
}

function playTones(tones: Tone[]): void {
  if (isSoundMuted()) return;
  const audio = getContext();
  if (!audio) return;
  const start = audio.currentTime;
  for (const tone of tones) {
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = tone.type ?? "sine";
    osc.frequency.value = tone.freq;
    const peak = tone.gain ?? 0.12;
    amp.gain.setValueAtTime(0.0001, start + tone.at);
    amp.gain.exponentialRampToValueAtTime(peak, start + tone.at + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + tone.at + tone.dur);
    osc.connect(amp).connect(audio.destination);
    osc.start(start + tone.at);
    osc.stop(start + tone.at + tone.dur + 0.05);
  }
}

const SOUNDS: Record<SoundName, Tone[]> = {
  click: [{ freq: 660, at: 0, dur: 0.07, type: "triangle", gain: 0.06 }],
  correct: [
    { freq: 523, at: 0, dur: 0.12 },
    { freq: 659, at: 0.09, dur: 0.12 },
    { freq: 784, at: 0.18, dur: 0.22 },
  ],
  wrong: [
    { freq: 220, at: 0, dur: 0.16, type: "triangle", gain: 0.09 },
    { freq: 185, at: 0.13, dur: 0.24, type: "triangle", gain: 0.09 },
  ],
  hit: [
    { freq: 320, at: 0, dur: 0.08, type: "square", gain: 0.07 },
    { freq: 160, at: 0.05, dur: 0.14, type: "square", gain: 0.08 },
  ],
  hurt: [
    { freq: 392, at: 0, dur: 0.1, type: "triangle", gain: 0.09 },
    { freq: 330, at: 0.09, dur: 0.18, type: "triangle", gain: 0.09 },
  ],
  heal: [
    { freq: 440, at: 0, dur: 0.12 },
    { freq: 554, at: 0.1, dur: 0.12 },
    { freq: 659, at: 0.2, dur: 0.24 },
  ],
  shield: [
    { freq: 880, at: 0, dur: 0.1, type: "triangle", gain: 0.08 },
    { freq: 1175, at: 0.08, dur: 0.18, type: "triangle", gain: 0.08 },
  ],
  blocked: [
    { freq: 740, at: 0, dur: 0.09, type: "square", gain: 0.06 },
    { freq: 988, at: 0.07, dur: 0.16, type: "square", gain: 0.06 },
  ],
  powerup: [
    { freq: 659, at: 0, dur: 0.1 },
    { freq: 880, at: 0.08, dur: 0.1 },
    { freq: 1047, at: 0.16, dur: 0.2 },
    { freq: 1319, at: 0.24, dur: 0.28 },
  ],
  combo: [
    { freq: 784, at: 0, dur: 0.1, type: "triangle", gain: 0.1 },
    { freq: 988, at: 0.08, dur: 0.16, type: "triangle", gain: 0.1 },
  ],
  victory: [
    { freq: 523, at: 0, dur: 0.14 },
    { freq: 523, at: 0.16, dur: 0.14 },
    { freq: 523, at: 0.32, dur: 0.14 },
    { freq: 659, at: 0.48, dur: 0.2 },
    { freq: 587, at: 0.68, dur: 0.14 },
    { freq: 659, at: 0.84, dur: 0.36 },
  ],
  finish: [
    { freq: 523, at: 0, dur: 0.14 },
    { freq: 659, at: 0.14, dur: 0.14 },
    { freq: 784, at: 0.28, dur: 0.3 },
  ],
};

export function playSound(name: SoundName): void {
  try {
    playTones(SOUNDS[name]);
  } catch {
    // Audio must never break the quiz.
  }
}
