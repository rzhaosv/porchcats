import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, Header, Card, Label, Tag, StatTile, PrimaryButton } from '../components/UI';
import { Cat } from '../components/Cat';
import { colors, radius, type } from '../theme';
import { useApp } from '../store/AppContext';
import { ScreenProps } from '../navigation';
import { CAT_BY_ID, RARITY_LABEL } from '../content/cats';
import { ITEMS, FOODS } from '../content/items';
import { MEMENTO_BOND } from '../logic/types';
import { fmtAgo } from '../logic/sim';
import { demo } from '../dev/demo';

const MEMENTOS: Record<string, string> = {
  biscuit: 'a single whisker, left on the box',
  pickle: 'the sock. He gave it back.',
  mochi: 'a warm dent in the cushion that never quite went away',
  rusty: 'the red ball, slightly chewed',
  baroness: 'a calling card. No name, just a paw print in gold',
};

export default function CatDetailScreen({ navigation, route }: ScreenProps<'CatDetail'>) {
  const { state, club } = useApp();
  const c = CAT_BY_ID[route.params.id] ?? CAT_BY_ID.biscuit;
  const rec = state.cats[c.id];
  const known = !!rec?.visits;
  const visiting = state.visits.find((v) => v.catId === c.id);
  const likes = ITEMS.filter((i) => c.likes.includes(i.kind)).map((i) => i.name);
  const food = FOODS.find((f) => f.tier === c.foodTier);
  const memento = rec?.mementoAt ? MEMENTOS[c.id] ?? `a tuft of ${c.pattern} fur, kept in the Catbook` : null;
  return (
    <Screen scroll>
      <Header title="Catbook" onBack={() => navigation.goBack()} />
      <View style={{ alignItems: 'center', marginTop: 6 }}>
        <View style={styles.stage}>
          <Cat pattern={c.pattern} pose={visiting ? visiting.pose : known ? 'sit' : 'sit'} size={180} silhouette={!known} />
        </View>
        <Text style={[type.display, { marginTop: 8 }]}>{known ? c.name : '???'}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <Tag text={RARITY_LABEL[c.rarity]} tone={c.rarity === 'rare' || c.rarity === 'club' ? 'gold' : 'plain'} />
          {visiting && <Tag text="On the porch now" tone="red" />}
          {rec?.mementoAt && <Tag text="Memento" tone="gold" />}
        </View>
      </View>
      <Text style={[type.body, { textAlign: 'center', marginTop: 12, fontStyle: 'italic' }]}>{known ? c.bio : 'Has not visited yet.'}</Text>

      {known && (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <StatTile label="Visits" value={String(rec.visits)} />
          <StatTile label="Bond" value={`${rec.bond}`} sub={rec.bond >= MEMENTO_BOND ? 'memento earned' : `${MEMENTO_BOND - rec.bond} to memento`} color={colors.accentDeep} />
          <StatTile label="Left" value={`${rec.silver}`} sub={rec.gold ? `+ ${rec.gold} gold` : 'silver fish'} />
        </View>
      )}

      <Card style={{ marginTop: 12 }}>
        <Label>How to see {known ? c.name : 'this cat'}</Label>
        <Text style={type.body}>Likes: {likes.join(', ')}.</Text>
        <Text style={[type.body, { marginTop: 4 }]}>Food: {food ? `${food.name} or better` : 'anything'}.</Text>
        {c.rarity === 'rare' && <Text style={[type.sub, { marginTop: 6 }]}>Rare cats only come for a liked item, and only when the good food is out.</Text>}
        {c.rarity === 'club' && !club && (
          <>
            <Text style={[type.sub, { marginTop: 6 }]}>Jeeves is the Cat Club butler. He keeps the bowl full and brings gold.</Text>
            <PrimaryButton title="Join the Cat Club" small onPress={() => navigation.navigate('Club', { reason: 'jeeves' })} style={{ marginTop: 12 }} />
          </>
        )}
      </Card>

      {memento && (
        <Card style={{ marginTop: 12, borderColor: colors.gold, backgroundColor: colors.goldSoft }}>
          <Label color={colors.goldDeep}>Memento</Label>
          <Text style={type.body}>{c.name} left {memento}.</Text>
        </Card>
      )}
      {known && <Text style={[type.caption, { marginTop: 14, textAlign: 'center' }]}>Last seen {fmtAgo(rec.lastSeen, demo?.now?.getTime())} · petted {rec.pets} times</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { width: 220, height: 200, borderRadius: radius.xl, backgroundColor: colors.wood, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6, borderWidth: 1, borderColor: colors.line },
});
