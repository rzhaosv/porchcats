export type Pattern = 'tabby' | 'calico' | 'tuxedo' | 'orange' | 'grey' | 'black' | 'white' | 'siamese' | 'tortie' | 'cream' | 'lilac';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'club';
export type Pose = 'sit' | 'loaf' | 'sleep' | 'play' | 'stretch';

export type ItemKind = 'cushion' | 'box' | 'ball' | 'tunnel' | 'post' | 'bed' | 'basket' | 'plant' | 'hat' | 'sock' | 'teapot' | 'radio';

export type CatDef = {
  id: string;
  name: string;
  pattern: Pattern;
  rarity: Rarity;
  /** One-line personality shown in the Catbook. */
  bio: string;
  /** Items this cat prefers; each adds attraction. Rare cats require at least one. */
  likes: ItemKind[];
  /** Minimum food tier index (0 = any food). */
  foodTier: number;
  /** Silver gift multiplier. */
  power: number;
};

export type FoodDef = { id: string; name: string; tier: number; cost: { silver?: number; gold?: number }; servings: number; blurb: string };

export type ItemDef = {
  id: string;
  name: string;
  kind: ItemKind;
  cost: { silver?: number; gold?: number };
  /** Slot size: 1 = small (one cat), 2 = large (two cats). */
  size: 1 | 2;
  color: string;
  accent?: string;
  blurb: string;
  /** Some items belong to the Backyard only. */
  backyard?: boolean;
};

/** A slot on the porch (or backyard). */
export type Slot = { id: string; area: 'porch' | 'backyard'; itemId: string | null; size: 1 | 2 };

/** A cat currently sitting on the porch. */
export type Visit = { catId: string; slotId: string; pose: Pose; arrivedAt: number; leavesAt: number; pets: number };

/** A visit that ended; shown as a trace on the porch and logged in the Catbook. */
export type Trace = { id: string; catId: string; slotId: string; itemId: string | null; startedAt: number; endedAt: number; silver: number; gold: number; seen: boolean };

export type CatRecord = { visits: number; bond: number; lastSeen: number; mementoAt?: number; pets: number; silver: number; gold: number };

export type AppState = {
  onboarded: boolean;
  porchName: string;
  silver: number;
  gold: number;
  /** Food currently in the bowl, and how many servings remain (0 = empty; cats stop coming). */
  food: { id: string; servings: number };
  slots: Slot[];
  /** Items owned (ids), including ones not placed. */
  owned: string[];
  visits: Visit[];
  traces: Trace[];
  cats: Record<string, CatRecord>;
  backyard: boolean;
  /** Epoch ms of the last simulation tick. */
  simAt: number;
  /** YYYY-MM-DD of the last daily gift / exchange. */
  giftDay: string;
  exchangeDay: string;
  exchangesToday: number;
  notifications: boolean;
  /** RevenueCat transaction ids already credited (consumables). */
  credited: string[];
  createdAt: string;
  totalPets: number;
};

export const DEFAULT_SLOTS: Slot[] = [
  { id: 'p1', area: 'porch', itemId: null, size: 1 },
  { id: 'p2', area: 'porch', itemId: null, size: 1 },
  { id: 'p3', area: 'porch', itemId: null, size: 2 },
  { id: 'p4', area: 'porch', itemId: null, size: 1 },
  { id: 'p5', area: 'porch', itemId: null, size: 1 },
  { id: 'b1', area: 'backyard', itemId: null, size: 1 },
  { id: 'b2', area: 'backyard', itemId: null, size: 2 },
  { id: 'b3', area: 'backyard', itemId: null, size: 1 },
  { id: 'b4', area: 'backyard', itemId: null, size: 1 },
];

export const DEFAULT_STATE: AppState = {
  onboarded: false,
  porchName: '',
  silver: 60,
  gold: 3,
  food: { id: 'thrifty', servings: 6 },
  slots: DEFAULT_SLOTS.map((s) => (s.id === 'p3' ? { ...s, itemId: 'box_plain' } : { ...s })),
  owned: ['box_plain', 'ball_red'],
  visits: [],
  traces: [],
  cats: {},
  backyard: false,
  simAt: 0,
  giftDay: '',
  exchangeDay: '',
  exchangesToday: 0,
  notifications: false,
  credited: [],
  createdAt: '',
  totalPets: 0,
};

export const BACKYARD_GOLD = 180;
export const EXCHANGE_SILVER = 500;
export const EXCHANGE_GOLD = 10;
export const DAILY_GOLD = 1;
export const CLUB_DAILY_GOLD = 5;
export const MAX_PETS_PER_VISIT = 3;
export const MEMENTO_BOND = 5;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
