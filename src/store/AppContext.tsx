import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AppState as RNAppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, DEFAULT_STATE, dateKey, BACKYARD_GOLD, EXCHANGE_SILVER, EXCHANGE_GOLD, DAILY_GOLD, CLUB_DAILY_GOLD } from '../logic/types';
import { simulate, pet as petCat } from '../logic/sim';
import { ITEM_BY_ID, FOOD_BY_ID } from '../content/items';
import { configureBilling, getCustomerInfo, isClub, addClubListener } from '../services/billing';
import { schedule, cancelAll } from '../services/notifications';
import { demo } from '../dev/demo';

export const STORAGE_KEY = 'porchcats.state.v1';
const DEV_UNLOCK = process.env.EXPO_PUBLIC_DEV_UNLOCK === '1' || process.env.EXPO_PUBLIC_DEV_UNLOCK === 'true';

export type BuyResult = 'ok' | 'silver' | 'gold' | 'owned';

type Ctx = {
  ready: boolean;
  state: AppState;
  club: boolean;
  setClub: (v: boolean) => void;
  update: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void;
  completeOnboarding: (porchName: string) => void;
  /** Re-run the simulation up to now (called on focus and on a timer). */
  tick: () => void;
  place: (slotId: string, itemId: string | null) => void;
  buyItem: (itemId: string) => BuyResult;
  buyFood: (foodId: string) => BuyResult;
  petCat: (catId: string) => boolean;
  claimDaily: () => number | null;
  exchange: () => boolean;
  unlockBackyard: () => BuyResult;
  markTracesSeen: () => void;
  setNotifications: (on: boolean) => Promise<boolean>;
  /** Credit a gold pack purchase exactly once per transaction. */
  creditGold: (fish: number, txId: string) => void;
  resetAll: () => Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [club, setClubState] = useState(DEV_UNLOCK || !!demo?.club);
  const stateRef = useRef(state);
  stateRef.current = state;
  const clubRef = useRef(club);
  clubRef.current = club;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<AppState>) });
      } catch {
        /* fresh */
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  useEffect(() => {
    if (demo) return;
    configureBilling();
    getCustomerInfo().then((info) => {
      if (info) setClubState((p) => p || isClub(info));
    });
    return addClubListener((c) => setClubState(DEV_UNLOCK || c));
  }, []);

  const tick = useCallback(() => {
    const now = demo?.now?.getTime() ?? Date.now();
    setState((s) => {
      if (!s.onboarded) return s;
      const { state: s2 } = simulate(s, now, clubRef.current);
      return s2;
    });
  }, []);

  // simulate on load, on foreground, and every minute while open
  useEffect(() => {
    if (!ready) return;
    tick();
    const id = setInterval(tick, 60_000);
    const sub = RNAppState.addEventListener('change', (st) => {
      if (st === 'active') {
        tick();
        const s = stateRef.current;
        if (s.notifications) schedule(s.food.servings, s.porchName).catch(() => {});
      }
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [ready, tick]);

  const update = useCallback<Ctx['update']>((patch) => setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })), []);

  const completeOnboarding = useCallback((porchName: string) => {
    const now = Date.now();
    setState((s) => ({ ...s, onboarded: true, porchName: porchName.trim() || 'The Porch', createdAt: s.createdAt || new Date(now).toISOString(), simAt: now - 90 * 60_000 }));
  }, []);

  const place = useCallback<Ctx['place']>((slotId, itemId) => {
    setState((s) => ({
      ...s,
      slots: s.slots.map((sl) => (sl.id === slotId ? { ...sl, itemId } : sl.itemId === itemId && itemId ? { ...sl, itemId: null } : sl)),
      visits: s.visits.filter((v) => v.slotId !== slotId || itemId !== null),
    }));
  }, []);

  const buyItem = useCallback<Ctx['buyItem']>((itemId) => {
    const s = stateRef.current;
    const item = ITEM_BY_ID[itemId];
    if (!item || s.owned.includes(itemId)) return 'owned';
    if (item.cost.silver && s.silver < item.cost.silver) return 'silver';
    if (item.cost.gold && s.gold < item.cost.gold) return 'gold';
    setState((st) => ({ ...st, silver: st.silver - (item.cost.silver ?? 0), gold: st.gold - (item.cost.gold ?? 0), owned: [...st.owned, itemId] }));
    return 'ok';
  }, []);

  const buyFood = useCallback<Ctx['buyFood']>((foodId) => {
    const s = stateRef.current;
    const f = FOOD_BY_ID[foodId];
    if (!f) return 'owned';
    if (f.cost.silver && s.silver < f.cost.silver) return 'silver';
    if (f.cost.gold && s.gold < f.cost.gold) return 'gold';
    setState((st) => ({ ...st, silver: st.silver - (f.cost.silver ?? 0), gold: st.gold - (f.cost.gold ?? 0), food: { id: foodId, servings: f.servings } }));
    return 'ok';
  }, []);

  const petCatFn = useCallback<Ctx['petCat']>((catId) => {
    const r = petCat(stateRef.current, catId);
    if (r.ok) setState(r.state);
    return r.ok;
  }, []);

  const claimDaily = useCallback<Ctx['claimDaily']>(() => {
    const s = stateRef.current;
    const today = dateKey(demo?.now ?? new Date());
    if (s.giftDay === today) return null;
    const n = clubRef.current ? CLUB_DAILY_GOLD : DAILY_GOLD;
    setState((st) => ({ ...st, giftDay: today, gold: st.gold + n }));
    return n;
  }, []);

  const exchange = useCallback<Ctx['exchange']>(() => {
    const s = stateRef.current;
    const today = dateKey(demo?.now ?? new Date());
    const used = s.exchangeDay === today ? s.exchangesToday : 0;
    const max = clubRef.current ? 2 : 1;
    if (used >= max || s.silver < EXCHANGE_SILVER) return false;
    setState((st) => ({ ...st, silver: st.silver - EXCHANGE_SILVER, gold: st.gold + EXCHANGE_GOLD, exchangeDay: today, exchangesToday: used + 1 }));
    return true;
  }, []);

  const unlockBackyard = useCallback<Ctx['unlockBackyard']>(() => {
    const s = stateRef.current;
    if (s.backyard) return 'owned';
    if (clubRef.current) {
      setState((st) => ({ ...st, backyard: true }));
      return 'ok';
    }
    if (s.gold < BACKYARD_GOLD) return 'gold';
    setState((st) => ({ ...st, backyard: true, gold: st.gold - BACKYARD_GOLD }));
    return 'ok';
  }, []);

  const markTracesSeen = useCallback(() => setState((s) => (s.traces.some((t) => !t.seen) ? { ...s, traces: s.traces.map((t) => ({ ...t, seen: true })) } : s)), []);

  const setNotifications = useCallback<Ctx['setNotifications']>(async (on) => {
    if (!on) {
      await cancelAll();
      update({ notifications: false });
      return true;
    }
    const s = stateRef.current;
    const ok = await schedule(s.food.servings, s.porchName);
    update({ notifications: ok });
    return ok;
  }, [update]);

  const creditGold = useCallback<Ctx['creditGold']>((fish, txId) => {
    setState((s) => (s.credited.includes(txId) ? s : { ...s, gold: s.gold + fish, credited: [...s.credited, txId].slice(-200) }));
  }, []);

  const resetAll = useCallback(async () => {
    await cancelAll();
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState(DEFAULT_STATE);
  }, []);

  return (
    <AppCtx.Provider value={{ ready, state, club, setClub: setClubState, update, completeOnboarding, tick, place, buyItem, buyFood, petCat: petCatFn, claimDaily, exchange, unlockBackyard, markTracesSeen, setNotifications, creditGold, resetAll }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp outside AppProvider');
  return c;
}
