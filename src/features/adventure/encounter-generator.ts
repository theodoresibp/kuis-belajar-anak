/**
 * Dynamic encounter generator (Sprint C).
 *
 * Turns a question count into a complete Adventure Mode run plan: which
 * monsters appear, in which order, how many questions each one asks, and
 * how much HP it has. Pure and deterministic — the same (questionCount,
 * seed) always produces the same plan, so server render, client render
 * and the Phaser scene all agree, and a chapter always plays the same.
 *
 * Rules (agreed in docs/adventure-upgrade/AUDIT-DAN-RENCANA.md):
 * - The final boss is always the last encounter.
 * - questionCount < 10: a single final-boss encounter with all questions.
 * - 10 <= n < 20: the boss takes 5 questions; n >= 20: the boss takes 10.
 * - The remaining questions are split over ceil(remaining / 5) encounters
 *   whose counts differ by at most 1 (earlier encounters get the extras).
 * - Non-boss tiers follow the repeating pattern
 *   [normal, normal, elite, normal, elite].
 * - With 8+ non-boss encounters, the middle normal encounter is upgraded
 *   to a mini-boss (exactly one per run).
 * - The same monster never appears twice in a row when its tier pool has
 *   more than one monster to choose from.
 */

import {
  ADVENTURE_MONSTERS,
  type MonsterDefinition,
  type MonsterTier,
} from "./monsters.config";

export interface PlannedEncounter {
  /** Position in the run (0-based); unique even when a monster repeats. */
  index: number;
  monsterId: string;
  name: string;
  emoji: string;
  tier: MonsterTier;
  questionCount: number;
  monsterMaxHp: number;
  /** Timed attack damage; 0 = this monster has no timed attack. */
  attackDamage: number;
}

export interface EncounterPlanOptions {
  /** Deterministic seed, normally the chapter id: different chapters get
   *  different monster orders, the same chapter always gets the same. */
  seed?: string;
  /** false = only monsters whose artwork already exists (plus the final
   *  boss, which must always be available). Runtime uses false until
   *  Sprint D delivers the remaining artwork. */
  includePlanned?: boolean;
}

const QUESTIONS_PER_ENCOUNTER = 5;
const BOSS_QUESTIONS_SMALL = 5;
const BOSS_QUESTIONS_LARGE = 10;
const LARGE_RUN_THRESHOLD = 20;
const MINI_BOSS_MIN_NON_BOSS = 8;

/** Non-boss tier for the encounter at position `index` in the run. */
function tierPattern(index: number): "normal" | "elite" {
  return index % 5 === 2 || index % 5 === 4 ? "elite" : "normal";
}

/* ---------------- deterministic RNG (mulberry32 + FNV-1a hash) ------- */

function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ------------------------------- pools ------------------------------- */

function tierPool(tier: MonsterTier, includePlanned: boolean): MonsterDefinition[] {
  const all = ADVENTURE_MONSTERS.filter((monster) => monster.tier === tier);
  if (includePlanned) return all;
  const ready = all.filter((monster) => monster.assetStatus === "ready");
  // The final boss must always exist, artwork or not (the scene falls
  // back to a generated graphic until Sprint D delivers its poses).
  return ready.length > 0 ? ready : all;
}

/** Deals monsters from a shuffled pool, reshuffling when it runs out and
 *  never dealing the same monster twice in a row when the pool allows. */
class MonsterDealer {
  private deck: MonsterDefinition[] = [];
  private lastDealtId: string | null = null;

  constructor(
    private readonly pool: MonsterDefinition[],
    private readonly rng: () => number,
  ) {}

  deal(): MonsterDefinition {
    if (this.deck.length === 0) {
      this.deck = shuffled(this.pool, this.rng);
      // After a reshuffle the top card could repeat the previous deal.
      if (
        this.deck.length > 1 &&
        this.deck[this.deck.length - 1].id === this.lastDealtId
      ) {
        [this.deck[0], this.deck[this.deck.length - 1]] = [
          this.deck[this.deck.length - 1],
          this.deck[0],
        ];
      }
    }
    const monster = this.deck.pop()!;
    this.lastDealtId = monster.id;
    return monster;
  }
}

/* ----------------------------- generator ----------------------------- */

export function generateEncounterPlan(
  questionCount: number,
  options: EncounterPlanOptions = {},
): PlannedEncounter[] {
  const total = Math.max(1, Math.floor(questionCount));
  const includePlanned = options.includePlanned ?? true;
  const rng = mulberry32(hashSeed(options.seed ?? "adventure"));

  const dealers = new Map<MonsterTier, MonsterDealer>();
  const dealerFor = (tier: MonsterTier): MonsterDealer => {
    let dealer = dealers.get(tier);
    if (!dealer) {
      dealer = new MonsterDealer(tierPool(tier, includePlanned), rng);
      dealers.set(tier, dealer);
    }
    return dealer;
  };

  const toEncounter = (
    index: number,
    tier: MonsterTier,
    questions: number,
  ): PlannedEncounter => {
    const monster = dealerFor(tier).deal();
    return {
      index,
      monsterId: monster.id,
      name: monster.name,
      emoji: monster.emoji,
      tier,
      questionCount: questions,
      monsterMaxHp: monster.maxHp,
      attackDamage: monster.attackDamage,
    };
  };

  // Short run: everything goes to the final boss.
  if (total < BOSS_QUESTIONS_LARGE) {
    return [toEncounter(0, "final-boss", total)];
  }

  const bossQuestions =
    total >= LARGE_RUN_THRESHOLD ? BOSS_QUESTIONS_LARGE : BOSS_QUESTIONS_SMALL;
  const remaining = total - bossQuestions;
  const nonBossCount = Math.ceil(remaining / QUESTIONS_PER_ENCOUNTER);
  const base = Math.floor(remaining / nonBossCount);
  const extras = remaining % nonBossCount;

  // Tier assignment, with the middle normal upgraded to a mini-boss on
  // long runs.
  const tiers: MonsterTier[] = Array.from({ length: nonBossCount }, (_, i) =>
    tierPattern(i),
  );
  if (nonBossCount >= MINI_BOSS_MIN_NON_BOSS) {
    const normalSlots = tiers
      .map((tier, i) => (tier === "normal" ? i : -1))
      .filter((i) => i >= 0);
    const middleNormal = normalSlots[Math.floor((normalSlots.length - 1) / 2)];
    tiers[middleNormal] = "mini-boss";
  }

  const plan: PlannedEncounter[] = tiers.map((tier, i) =>
    toEncounter(i, tier, base + (i < extras ? 1 : 0)),
  );
  plan.push(toEncounter(nonBossCount, "final-boss", bossQuestions));
  return plan;
}
