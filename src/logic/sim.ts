/**
 * Porch simulation. Everything is real-time: cats arrive while the app is closed.
 * On every open we replay elapsed time in TICK steps (capped at a day) so a night away
 * produces a morning of traces, and never an empty porch with nothing to read.
 */
import { AppState, Visit, Trace, Pose, CatDef, uid, MAX_PETS_PER_VISIT } from './types';
import { CATS } from '../content/cats';
import { ITEM_BY_ID, FOOD_BY_ID } from '../content/items';

export const TICK = 10 * 60_000; // 10 minutes
const MAX_REPLAY = 24 * 60 * 60_000;
const POSES: Pose[] = ['sit', 'loaf', 'sleep', 'play', 'stretch'];

/** Deterministic-ish random from a seed so replays are stable within a session. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Attraction of a cat to a placed item: likes match strongly, anything else a little. */
function attraction(cat: CatDef, itemId: string | null, foodTier: number): number {
  if (cat.foodTier > foodTier) return 0;
  const item = itemId ? ITEM_BY_ID[itemId] : null;
  if (!item) return cat.rarity === 'common' ? 0.35 : cat.rarity === 'uncommon' ? 0.08 : 0;
  const liked = cat.likes.includes(item.kind);
  if (cat.rarity === 'rare') return liked ? 0.55 : 0;
  if (cat.rarity === 'uncommon') return liked ? 0.8 : 0.18;
  return liked ? 1 : 0.45;
}

export type SimResult = { state: AppState; newTraces: Trace[]; arrivals: string[] };

export function simulate(state: AppState, now: number, isClub: boolean): SimResult {
  const from = state.simAt || now;
  let t = Math.max(from, now - MAX_REPLAY);
  const r = rng(Math.floor(from / TICK));
  let food = { ...state.food };
  let visits = state.visits.map((v) => ({ ...v }));
  const traces: Trace[] = [];
  const cats = { ...state.cats };
  const arrivals: string[] = [];
  const foodTier = FOOD_BY_ID[food.id]?.tier ?? 0;
  const activeSlots = state.slots.filter((s) => s.area === 'porch' || state.backyard);

  const endVisit = (v: Visit, at: number) => {
    const cat = CATS.find((c) => c.id === v.catId)!;
    const rec = cats[cat.id] ?? { visits: 0, bond: 0, lastSeen: 0, pets: 0, silver: 0, gold: 0 };
    const hours = Math.max(0.5, (at - v.arrivedAt) / 3_600_000);
    const bondBoost = 1 + Math.min(rec.bond, 10) * 0.08;
    const silver = Math.round((4 + hours * 5) * cat.power * bondBoost * (0.8 + r() * 0.5));
    const goldChance = cat.rarity === 'rare' ? 0.6 : cat.rarity === 'uncommon' ? 0.15 : cat.rarity === 'club' ? 1 : 0.04;
    const gold = r() < goldChance ? (cat.rarity === 'rare' ? 1 + Math.floor(r() * 3) : 1) : 0;
    cats[cat.id] = { ...rec, visits: rec.visits + 1, lastSeen: at, silver: rec.silver + silver, gold: rec.gold + gold, pets: rec.pets + v.pets };
    traces.push({ id: uid(), catId: cat.id, slotId: v.slotId, itemId: state.slots.find((s) => s.id === v.slotId)?.itemId ?? null, startedAt: v.arrivedAt, endedAt: at, silver, gold, seen: false });
  };

  while (t < now) {
    const next = Math.min(now, t + TICK);
    // departures
    visits = visits.filter((v) => {
      if (v.leavesAt <= next) {
        endVisit(v, v.leavesAt);
        return false;
      }
      return true;
    });
    // eating
    if (food.servings > 0 && visits.length > 0 && r() < 0.12 * visits.length) food = { ...food, servings: Math.max(0, food.servings - 1) };
    if (food.servings === 0 && isClub) food = { ...food, servings: FOOD_BY_ID[food.id]?.servings ?? 6 };
    // arrivals: one per tick at most, only when there is food
    if (food.servings > 0) {
      const free = activeSlots.filter((s) => !visits.some((v) => v.slotId === s.id));
      if (free.length > 0) {
        const present = new Set(visits.map((v) => v.catId));
        const candidates = CATS.filter((c) => !present.has(c.id) && (c.rarity !== 'club' || isClub));
        const weighted = candidates.flatMap((c) => free.map((s) => ({ c, s, w: attraction(c, s.itemId, foodTier) }))).filter((x) => x.w > 0);
        const total = weighted.reduce((a, x) => a + x.w, 0);
        // base chance per tick scales with food tier and free slots; roughly one cat every 40–70 min early on
        const chance = Math.min(0.55, 0.13 + foodTier * 0.05 + free.length * 0.02);
        if (total > 0 && r() < chance) {
          let pick = r() * total;
          for (const x of weighted) {
            pick -= x.w;
            if (pick <= 0) {
              const stay = (1 + r() * 2.5) * 3_600_000;
              visits.push({ catId: x.c.id, slotId: x.s.id, pose: POSES[Math.floor(r() * POSES.length)], arrivedAt: next, leavesAt: next + stay, pets: 0 });
              arrivals.push(x.c.id);
              break;
            }
          }
        }
      }
    }
    t = next;
  }
  const state2: AppState = {
    ...state,
    food,
    visits,
    traces: [...traces.reverse(), ...state.traces].slice(0, 60),
    cats,
    simAt: now,
    silver: state.silver + traces.reduce((a, x) => a + x.silver, 0),
    gold: state.gold + traces.reduce((a, x) => a + x.gold, 0),
  };
  return { state: state2, newTraces: traces, arrivals };
}

/** Pet a visiting cat: bond +1 (max 3 pets per visit), returns the line to show or null. */
export function pet(state: AppState, catId: string): { state: AppState; ok: boolean } {
  const v = state.visits.find((x) => x.catId === catId);
  if (!v || v.pets >= MAX_PETS_PER_VISIT) return { state, ok: false };
  const rec = state.cats[catId] ?? { visits: 0, bond: 0, lastSeen: 0, pets: 0, silver: 0, gold: 0 };
  const bond = rec.bond + 1;
  return {
    ok: true,
    state: {
      ...state,
      totalPets: state.totalPets + 1,
      visits: state.visits.map((x) => (x.catId === catId ? { ...x, pets: x.pets + 1 } : x)),
      cats: { ...state.cats, [catId]: { ...rec, bond, pets: rec.pets + 1, mementoAt: rec.mementoAt ?? (bond >= 5 ? Date.now() : undefined) } },
    },
  };
}

export function fmtDuration(ms: number): string {
  const m = Math.round(ms / 60_000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem >= 15 ? `${h}h ${rem}m` : `${h}h`;
}

export function fmtAgo(ms: number, now = Date.now()): string {
  const d = now - ms;
  if (d < 60_000) return 'just now';
  if (d < 3_600_000) return `${Math.round(d / 60_000)} min ago`;
  if (d < 86_400_000) return `${Math.round(d / 3_600_000)}h ago`;
  return `${Math.round(d / 86_400_000)}d ago`;
}
