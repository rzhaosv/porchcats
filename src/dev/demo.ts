/**
 * Web-only demo seeding for App Store screenshots: `?demo=<name>` writes a canned state to
 * localStorage under the AsyncStorage key before hydration. `&club=1` unlocks the Cat Club.
 * On iOS/Android `demo` is always null.
 */
import { Platform } from 'react-native';
import { AppState, DEFAULT_STATE, DEFAULT_SLOTS } from '../logic/types';
import { RootStackParamList, TabParamList } from '../navigation';

const STORAGE_KEY = 'porchcats.state.v1';
export type DemoName = 'porch' | 'traces' | 'shop' | 'catbook' | 'club' | 'onboard' | 'cat';
const VALID: DemoName[] = ['porch', 'traces', 'shop', 'catbook', 'club', 'onboard', 'cat'];

export type Demo = { name: DemoName; screen: keyof RootStackParamList | null; tab: keyof TabParamList; club: boolean; snap: boolean; now?: Date; catId?: string };

function buildState(name: DemoName, now: number, club: boolean): AppState | null {
  if (name === 'onboard') return null;
  const H = 3_600_000;
  const cats: AppState['cats'] = {
    biscuit: { visits: 14, bond: 6, lastSeen: now - 2 * H, pets: 11, silver: 210, gold: 1, mementoAt: now - 3 * 86_400_000 },
    pickle: { visits: 9, bond: 3, lastSeen: now - 5 * H, pets: 4, silver: 120, gold: 0 },
    mochi: { visits: 7, bond: 4, lastSeen: now - 1 * H, pets: 6, silver: 90, gold: 0 },
    rusty: { visits: 11, bond: 2, lastSeen: now - 9 * H, pets: 2, silver: 150, gold: 1 },
    pepper: { visits: 3, bond: 1, lastSeen: now - 30 * H, pets: 1, silver: 40, gold: 0 },
    dot: { visits: 5, bond: 2, lastSeen: now - 12 * H, pets: 3, silver: 70, gold: 0 },
    smudge: { visits: 6, bond: 5, lastSeen: now - 20 * H, pets: 8, silver: 80, gold: 0, mementoAt: now - 86_400_000 },
    waffles: { visits: 4, bond: 1, lastSeen: now - 40 * H, pets: 1, silver: 50, gold: 0 },
    captain: { visits: 2, bond: 1, lastSeen: now - 15 * H, pets: 1, silver: 60, gold: 1 },
    marmalade: { visits: 3, bond: 2, lastSeen: now - 3 * H, pets: 2, silver: 80, gold: 0 },
    duchess: { visits: 1, bond: 0, lastSeen: now - 50 * H, pets: 0, silver: 30, gold: 1 },
    baroness: { visits: 1, bond: 0, lastSeen: now - 70 * H, pets: 0, silver: 60, gold: 3 },
  };
  return {
    ...DEFAULT_STATE,
    onboarded: true,
    porchName: 'Maple Street Porch',
    silver: 742,
    gold: 38,
    food: { id: 'frisky', servings: 5 },
    slots: DEFAULT_SLOTS.map((s) => ({ ...s, itemId: { p1: 'cushion_blue', p2: 'ball_yarn', p3: 'box_plain', p4: 'post_sisal', p5: 'plant_fern', b1: 'bed_heated', b2: 'tunnel_green', b3: null, b4: 'teapot_blue' }[s.id] ?? null })),
    owned: ['box_plain', 'ball_red', 'ball_yarn', 'cushion_blue', 'post_sisal', 'plant_fern', 'bed_heated', 'tunnel_green', 'teapot_blue', 'sock_grey'],
    visits: [
      { catId: 'biscuit', slotId: 'p3', pose: 'loaf', arrivedAt: now - 40 * 60_000, leavesAt: now + 2 * H, pets: 1 },
      { catId: 'mochi', slotId: 'p1', pose: 'sleep', arrivedAt: now - 70 * 60_000, leavesAt: now + H, pets: 0 },
      { catId: 'rusty', slotId: 'p2', pose: 'play', arrivedAt: now - 10 * 60_000, leavesAt: now + 3 * H, pets: 0 },
      ...(club ? [{ catId: 'marmalade', slotId: 'b1', pose: 'sleep' as const, arrivedAt: now - 30 * 60_000, leavesAt: now + H, pets: 0 }] : []),
    ],
    traces: [
      { id: 't1', catId: 'pickle', slotId: 'p2', itemId: 'ball_yarn', startedAt: now - 5 * H, endedAt: now - 3 * H, silver: 14, gold: 0, seen: name !== 'traces' },
      { id: 't2', catId: 'captain', slotId: 'p4', itemId: 'post_sisal', startedAt: now - 7 * H, endedAt: now - 5 * H, silver: 22, gold: 1, seen: name !== 'traces' },
      { id: 't3', catId: 'dot', slotId: 'p5', itemId: 'plant_fern', startedAt: now - 9 * H, endedAt: now - 8 * H, silver: 9, gold: 0, seen: name !== 'traces' },
      { id: 't4', catId: 'smudge', slotId: 'p3', itemId: 'box_plain', startedAt: now - 14 * H, endedAt: now - 11 * H, silver: 18, gold: 0, seen: true },
    ],
    cats,
    backyard: club,
    simAt: now,
    giftDay: '',
    exchangeDay: '',
    exchangesToday: 0,
    notifications: club,
    createdAt: new Date(now - 12 * 86_400_000).toISOString(),
    totalPets: 39,
  };
}

function read(): Demo | null {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined' || !window.location || !window.localStorage) return null;
  const params = new URLSearchParams(window.location.search);
  const name = params.get('demo') as DemoName | null;
  if (!name || !VALID.includes(name)) return null;
  const club = params.get('club') === '1';
  const now = Date.now();
  const state = buildState(name, now, club);
  try {
    if (state) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  const tab: keyof TabParamList = name === 'shop' ? 'Shop' : name === 'catbook' || name === 'cat' ? 'Catbook' : 'Porch';
  return {
    name,
    screen: name === 'club' ? 'Club' : name === 'cat' ? 'CatDetail' : name === 'onboard' ? null : 'Tabs',
    tab,
    club,
    snap: params.get('snap') === '1',
    now: new Date(now),
    catId: params.get('cat') ?? 'biscuit',
  };
}

export const demo: Demo | null = read();
export const snap = !!demo?.snap;
