import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Screen, Header, Card, Label, Chip, Tag, SecondaryButton } from '../components/UI';
import { ItemSprite, Bowl } from '../components/Item';
import { colors, radius, type } from '../theme';
import { useApp } from '../store/AppContext';
import { TabProps } from '../navigation';
import { ITEMS, FOODS, FOOD_BY_ID } from '../content/items';
import { FishPills } from './PorchScreen';

function Cost({ silver, gold }: { silver?: number; gold?: number }) {
  return <Text style={[type.numSm, { color: gold ? colors.goldDeep : colors.inkSoft }]}>{gold ? `🐠 ${gold}` : silver ? `🐟 ${silver}` : 'Free'}</Text>;
}

export default function ShopScreen({ navigation }: TabProps<'Shop'>) {
  const { state, club, buyItem, buyFood } = useApp();
  const [tab, setTab] = useState<'food' | 'items' | 'backyard'>('food');
  const food = FOOD_BY_ID[state.food.id];

  const onBuyItem = (id: string) => {
    const r = buyItem(id);
    if (r === 'gold') navigation.navigate('Club', { reason: 'gold' });
    if (r === 'silver') Alert.alert('Not enough silver fish', 'Cats leave silver when they visit. Pet them and it adds up faster.');
  };
  const onBuyFood = (id: string) => {
    if (state.food.id === id && state.food.servings > 0) {
      Alert.alert('Top up?', 'This replaces what is in the bowl with a full serving.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Fill it', onPress: () => doFood(id) }]);
      return;
    }
    doFood(id);
  };
  const doFood = (id: string) => {
    const r = buyFood(id);
    if (r === 'gold') navigation.navigate('Club', { reason: 'food' });
    if (r === 'silver') Alert.alert('Not enough silver fish', 'Thrifty Bits are always free.');
  };

  const items = ITEMS.filter((i) => (tab === 'backyard' ? i.backyard : !i.backyard));

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
        <Text style={type.h1}>Shop</Text>
        <FishPills silver={state.silver} gold={state.gold} onGold={() => navigation.navigate('Club', { reason: 'gold' })} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <Chip text="Food" selected={tab === 'food'} onPress={() => setTab('food')} />
        <Chip text="Porch" selected={tab === 'items'} onPress={() => setTab('items')} />
        <Chip text="Backyard" selected={tab === 'backyard'} onPress={() => setTab('backyard')} />
      </View>

      {tab === 'food' && (
        <>
          <Card style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Bowl level={food ? state.food.servings / food.servings : 0} size={72} tier={food?.tier ?? 0} />
            <View style={{ flex: 1 }}>
              <Label style={{ marginBottom: 2 }}>In the bowl</Label>
              <Text style={type.h3}>{food?.name ?? 'Nothing'}</Text>
              <Text style={type.sub}>{state.food.servings} servings left{club ? ' · Jeeves refills it when empty' : ''}</Text>
            </View>
          </Card>
          <Text style={[type.bodySoft, { marginTop: 14 }]}>Better food, rarer cats. Rare cats need Deluxe Tuna or better and one thing they like.</Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            {FOODS.map((f) => (
              <Pressable key={f.id} onPress={() => onBuyFood(f.id)} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={type.h3}>{f.name}</Text>
                    {f.tier >= 3 && <Tag text="Rare cats" tone="gold" />}
                  </View>
                  <Text style={type.sub}>{f.blurb} · {f.servings} servings</Text>
                </View>
                <Cost {...f.cost} />
              </Pressable>
            ))}
          </View>
        </>
      )}

      {tab !== 'food' && (
        <>
          {tab === 'backyard' && !state.backyard && (
            <Card style={{ marginTop: 14 }}>
              <Text style={type.h3}>Backyard is locked</Text>
              <Text style={type.sub}>Unlock it on the Porch for 180 gold, or join the Cat Club.</Text>
              <SecondaryButton title="See the Cat Club" small onPress={() => navigation.navigate('Club', { reason: 'backyard' })} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
            </Card>
          )}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            {items.map((it) => {
              const owned = state.owned.includes(it.id);
              return (
                <Pressable key={it.id} onPress={() => !owned && onBuyItem(it.id)} style={[styles.tile, owned && { opacity: 0.7 }]}>
                  <ItemSprite item={it} size={96} />
                  <Text style={[type.h3, { fontSize: 14 }]} numberOfLines={1}>{it.name}</Text>
                  <Text style={[type.caption, { textAlign: 'center' }]} numberOfLines={2}>{it.blurb}</Text>
                  <View style={{ marginTop: 6 }}>{owned ? <Tag text="Owned" /> : <Cost {...it.cost} />}</View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
      <Text style={[type.caption, { marginTop: 18, textAlign: 'center' }]}>Out of gold? Tap the gold pill, or exchange 500 silver on the Porch.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.line },
  tile: { width: '47.5%', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: 10, borderWidth: 1, borderColor: colors.line },
});
