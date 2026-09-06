import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Card, Label, Tag, PrimaryButton, SecondaryButton, sheetStyles } from '../components/UI';
import { Cat } from '../components/Cat';
import { ItemSprite, Bowl } from '../components/Item';
import { colors, radius, type } from '../theme';
import { useApp } from '../store/AppContext';
import { TabProps } from '../navigation';
import { CAT_BY_ID, PET_LINES, TRACE_LINES } from '../content/cats';
import { ITEM_BY_ID, FOOD_BY_ID } from '../content/items';
import { Slot, Trace, EXCHANGE_SILVER, EXCHANGE_GOLD, BACKYARD_GOLD, MAX_PETS_PER_VISIT } from '../logic/types';
import { fmtDuration, fmtAgo } from '../logic/sim';
import { snap, demo } from '../dev/demo';

let Haptics: typeof import('expo-haptics') | null = null;
try {
  Haptics = Platform.OS === 'web' ? null : require('expo-haptics');
} catch {
  Haptics = null;
}

export function FishPills({ silver, gold, onGold }: { silver: number; gold: number; onGold?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <View style={[styles.pill, { backgroundColor: colors.silverSoft }]}>
        <Text style={{ fontSize: 13 }}>🐟</Text>
        <Text style={[type.numSm, { color: colors.ink }]}>{silver}</Text>
      </View>
      <Pressable onPress={onGold} style={[styles.pill, { backgroundColor: colors.goldSoft }]}>
        <Text style={{ fontSize: 13 }}>🐠</Text>
        <Text style={[type.numSm, { color: colors.goldDeep }]}>{gold}</Text>
        {onGold && <Text style={{ color: colors.goldDeep, fontWeight: '800', marginLeft: 2 }}>+</Text>}
      </Pressable>
    </View>
  );
}

function traceLine(t: Trace): string {
  const cat = CAT_BY_ID[t.catId];
  const item = t.itemId ? ITEM_BY_ID[t.itemId] : null;
  const on = item ? `on the ${item.name.toLowerCase()}` : 'on the step';
  const idx = (t.startedAt / 60_000) % TRACE_LINES.length;
  const tpl = TRACE_LINES[Math.floor(idx)];
  return `${cat.name} ${tpl.replace('{on}', on).replace('{h}', fmtDuration(t.endedAt - t.startedAt))}`;
}

export default function PorchScreen({ navigation }: TabProps<'Porch'>) {
  const { state, club, tick, petCat, place, claimDaily, exchange, unlockBackyard, markTracesSeen } = useApp();
  const [picking, setPicking] = useState<Slot | null>(null);
  const [bubble, setBubble] = useState<{ catId: string; text: string } | null>(null);
  const [gift, setGift] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      tick();
      const id = setTimeout(markTracesSeen, 4000);
      return () => clearTimeout(id);
    }, [tick, markTracesSeen]),
  );

  useEffect(() => {
    if (!bubble || snap) return;
    const id = setTimeout(() => setBubble(null), 1800);
    return () => clearTimeout(id);
  }, [bubble]);

  const food = FOOD_BY_ID[state.food.id];
  const level = food ? state.food.servings / food.servings : 0;
  const porch = state.slots.filter((s) => s.area === 'porch');
  const yard = state.slots.filter((s) => s.area === 'backyard');
  const unseen = state.traces.filter((t) => !t.seen);
  const today = (demo?.now ?? new Date()).toISOString().slice(0, 10);
  const giftReady = state.giftDay !== today;
  const exchangesLeft = (club ? 2 : 1) - (state.exchangeDay === today ? state.exchangesToday : 0);
  const canExchange = exchangesLeft > 0 && state.silver >= EXCHANGE_SILVER;
  const unplaced = useMemo(() => state.owned.filter((id) => !state.slots.some((s) => s.itemId === id)), [state.owned, state.slots]);

  const onPet = (catId: string) => {
    const ok = petCat(catId);
    const v = state.visits.find((x) => x.catId === catId);
    if (ok) {
      Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const bond = (state.cats[catId]?.bond ?? 0) + 1;
      setBubble({ catId, text: PET_LINES[Math.min(PET_LINES.length - 1, Math.floor(bond / 2))] });
    } else setBubble({ catId, text: v && v.pets >= MAX_PETS_PER_VISIT ? 'enough, thanks' : '...' });
  };

  const onDaily = () => {
    const n = claimDaily();
    if (n !== null) setGift(n);
  };

  const onExchange = () => {
    if (state.silver < EXCHANGE_SILVER) return Alert.alert('Not enough silver', `Fish exchange is ${EXCHANGE_SILVER} silver for ${EXCHANGE_GOLD} gold.`);
    if (exchangesLeft <= 0) {
      if (club) return Alert.alert('Done for today', 'Cat Club members can exchange twice a day. Come back tomorrow.');
      return navigation.navigate('Club', { reason: 'exchange' });
    }
    exchange();
  };

  const onBackyard = () => {
    const r = unlockBackyard();
    if (r === 'gold') navigation.navigate('Club', { reason: 'backyard' });
  };

  const renderSlot = (s: Slot, big?: boolean) => {
    const item = s.itemId ? ITEM_BY_ID[s.itemId] : null;
    const v = state.visits.find((x) => x.slotId === s.id);
    const cat = v ? CAT_BY_ID[v.catId] : null;
    const w = big ? 150 : 108;
    return (
      <Pressable key={s.id} onPress={() => (cat ? onPet(cat.id) : setPicking(s))} style={[styles.slot, { width: w, height: w + 8 }]}>
        {item ? <ItemSprite item={item} size={w} /> : <View style={styles.empty}><Text style={{ fontSize: 22, color: colors.inkFaint }}>+</Text></View>}
        {cat && (
          <View style={{ position: 'absolute', bottom: 18, left: 0, right: 0, alignItems: 'center' }}>
            <Cat pattern={cat.pattern} pose={v!.pose} size={w * 0.78} flip={s.id.endsWith('2') || s.id.endsWith('4')} />
          </View>
        )}
        {cat && (
          <View style={styles.nameTag}>
            <Text style={styles.nameText}>{cat.name}</Text>
          </View>
        )}
        {bubble && cat && bubble.catId === cat.id && (
          <View style={styles.bubble}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.ink }}>{bubble.text}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <Screen scroll contentStyle={{ paddingHorizontal: 0 }}>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
        <View>
          <Text style={type.caption}>{state.visits.length ? `${state.visits.length} on the porch` : 'Quiet right now'}</Text>
          <Text style={type.h1}>{state.porchName}</Text>
        </View>
        <FishPills silver={state.silver} gold={state.gold} onGold={() => navigation.navigate('Club', { reason: 'gold' })} />
      </View>

      {/* the porch */}
      <View style={styles.scene}>
        <View style={styles.sky} />
        <View style={styles.rail} />
        <View style={styles.deck}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
            {renderSlot(porch[0])}
            {renderSlot(porch[1])}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: -6 }}>
            {renderSlot(porch[2], true)}
            <Pressable onPress={() => navigation.navigate('Shop')} style={{ alignItems: 'center' }}>
              <Bowl level={level} size={96} tier={food?.tier ?? 0} />
              <Text style={[type.caption, { marginTop: -8 }]}>{state.food.servings > 0 ? `${food?.name} · ${state.food.servings} left` : 'Bowl is empty'}</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: -6 }}>
            {renderSlot(porch[3])}
            {renderSlot(porch[4])}
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {state.food.servings === 0 && (
          <Card style={{ marginTop: 12, borderColor: colors.accent }}>
            <Text style={type.h3}>The bowl is empty.</Text>
            <Text style={[type.sub, { marginTop: 2 }]}>No food, no cats. Thrifty Bits are free.{club ? ' Jeeves is on his way to refill it.' : ''}</Text>
            <SecondaryButton title="Fill the bowl" small onPress={() => navigation.navigate('Shop')} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
          </Card>
        )}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Pressable onPress={onDaily} style={[styles.action, giftReady && { borderColor: colors.gold, backgroundColor: colors.goldSoft }]}>
            <Text style={{ fontSize: 20 }}>🎁</Text>
            <Text style={type.h3}>{giftReady ? 'Daily fish' : 'Claimed'}</Text>
            <Text style={type.caption}>{club ? '5 gold a day' : '1 gold a day'}</Text>
          </Pressable>
          <Pressable onPress={onExchange} style={[styles.action, canExchange && { borderColor: colors.silver, backgroundColor: colors.silverSoft }]}>
            <Text style={{ fontSize: 20 }}>🔁</Text>
            <Text style={type.h3}>Exchange</Text>
            <Text style={type.caption}>{EXCHANGE_SILVER} silver → {EXCHANGE_GOLD} gold · {Math.max(0, exchangesLeft)} left</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
          <Label style={{ marginBottom: 0 }}>While you were out</Label>
          {unseen.length > 0 && <Tag text={`${unseen.length} new`} tone="gold" />}
        </View>
        {state.traces.length === 0 ? (
          <Card>
            <Text style={type.bodySoft}>Nothing yet. Cats keep their own hours; check back in an hour or leave the app and come back tonight.</Text>
          </Card>
        ) : (
          <Card style={{ paddingVertical: 6 }}>
            {state.traces.slice(0, 8).map((t, i, arr) => {
              const cat = CAT_BY_ID[t.catId];
              return (
                <Pressable key={t.id} onPress={() => navigation.navigate('CatDetail', { id: t.catId })} style={[styles.trace, i === arr.length - 1 && { borderBottomWidth: 0 }, !t.seen && { backgroundColor: colors.goldSoft, marginHorizontal: -18, paddingHorizontal: 18 }]}>
                  <Cat pattern={cat.pattern} pose="sit" size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={type.body}>{traceLine(t)}</Text>
                    <Text style={type.caption}>
                      {fmtAgo(t.endedAt, demo?.now?.getTime())} · left 🐟 {t.silver}
                      {t.gold ? ` 🐠 ${t.gold}` : ''}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
          <Label style={{ marginBottom: 0 }}>Backyard</Label>
          {!state.backyard && <Tag text={club ? 'Included in Cat Club' : `${BACKYARD_GOLD} gold`} tone={club ? 'gold' : 'plain'} />}
        </View>
        {state.backyard ? (
          <View style={[styles.scene, { marginHorizontal: 0, borderRadius: radius.lg }]}>
            <View style={[styles.deck, { backgroundColor: colors.sage }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                {renderSlot(yard[0])}
                {renderSlot(yard[1], true)}
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: -6 }}>
                {renderSlot(yard[2])}
                {renderSlot(yard[3])}
              </View>
            </View>
          </View>
        ) : (
          <Card>
            <Text style={type.h3}>Four more spots, a lawn, and the rare ones.</Text>
            <Text style={[type.sub, { marginTop: 4 }]}>Sable only visits a long tunnel. Moon only watches from a hanging basket. Both live back here.</Text>
            <PrimaryButton title={club ? 'Open the backyard' : `Unlock for ${BACKYARD_GOLD} gold`} small onPress={onBackyard} style={{ marginTop: 12 }} />
            {!club && (
              <Pressable onPress={() => navigation.navigate('Club', { reason: 'backyard' })} style={{ marginTop: 8 }}>
                <Text style={[type.sub, { color: colors.accentDeep }]}>Or join the Cat Club — it's included ›</Text>
              </Pressable>
            )}
          </Card>
        )}
        <Text style={[type.caption, { marginTop: 16, textAlign: 'center' }]}>Tap a cat to pet it. Tap an empty spot to place something.</Text>
      </View>

      {/* item picker */}
      <Modal visible={!!picking} transparent animationType="slide" onRequestClose={() => setPicking(null)}>
        <View style={{ flex: 1 }}>
          <View style={sheetStyles.backdrop} onTouchEnd={() => setPicking(null)} />
          <View style={sheetStyles.sheet}>
            <Text style={type.h2}>{picking?.itemId ? 'Swap or clear' : 'Put something here'}</Text>
            <Text style={[type.sub, { marginTop: 4 }]}>{picking?.size === 2 ? 'A big spot. Boxes, beds and tunnels fit.' : 'A small spot.'}</Text>
            <ScrollView style={{ marginTop: 12, maxHeight: 360 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {unplaced
                  .map((id) => ITEM_BY_ID[id])
                  .filter((it) => it && (picking?.size === 2 || it.size === 1) && (!it.backyard || picking?.area === 'backyard'))
                  .map((it) => (
                    <Pressable
                      key={it.id}
                      onPress={() => {
                        place(picking!.id, it.id);
                        setPicking(null);
                      }}
                      style={styles.pickItem}
                    >
                      <ItemSprite item={it} size={72} />
                      <Text style={[type.caption, { textAlign: 'center' }]} numberOfLines={1}>{it.name}</Text>
                    </Pressable>
                  ))}
                {unplaced.length === 0 && <Text style={type.bodySoft}>Everything you own is already out. The Shop has more.</Text>}
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              {picking?.itemId && (
                <SecondaryButton
                  title="Clear spot"
                  onPress={() => {
                    place(picking.id, null);
                    setPicking(null);
                  }}
                  style={{ flex: 1 }}
                />
              )}
              <SecondaryButton
                title="Go to Shop"
                onPress={() => {
                  setPicking(null);
                  navigation.navigate('Shop');
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={gift !== null} transparent animationType="fade" onRequestClose={() => setGift(null)}>
        <Pressable style={[sheetStyles.backdrop, { alignItems: 'center', justifyContent: 'center' }]} onPress={() => setGift(null)}>
          <View style={styles.giftCard}>
            <Text style={{ fontSize: 44 }}>🐠</Text>
            <Text style={type.h2}>+{gift} gold fish</Text>
            <Text style={[type.sub, { marginTop: 4 }]}>{club ? 'Cat Club daily catch.' : 'Come back tomorrow for another. Cat Club members get five.'}</Text>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  scene: { marginTop: 14, marginHorizontal: 12, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, backgroundColor: colors.wood },
  sky: { height: 34, backgroundColor: colors.sky },
  rail: { height: 10, backgroundColor: colors.woodDeep, opacity: 0.6 },
  deck: { paddingVertical: 8, paddingHorizontal: 4, backgroundColor: colors.wood },
  slot: { alignItems: 'center', justifyContent: 'flex-end' },
  empty: { width: 70, height: 50, borderRadius: radius.md, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(43,29,20,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  nameTag: { position: 'absolute', bottom: 2, backgroundColor: 'rgba(43,29,20,0.7)', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  nameText: { color: colors.onInk, fontSize: 11, fontWeight: '700' },
  bubble: { position: 'absolute', top: 0, backgroundColor: colors.card, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.line },
  action: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, borderWidth: 1.5, borderColor: colors.line, gap: 2 },
  trace: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  pickItem: { width: 96, alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: 6, borderWidth: 1, borderColor: colors.line },
  giftCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 28, alignItems: 'center', width: 280, borderWidth: 1, borderColor: colors.gold },
});
