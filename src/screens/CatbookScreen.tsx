import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Screen, Header, Tag } from '../components/UI';
import { Cat } from '../components/Cat';
import { colors, radius, type } from '../theme';
import { useApp } from '../store/AppContext';
import { TabProps } from '../navigation';
import { CATS, RARITY_LABEL } from '../content/cats';

export default function CatbookScreen({ navigation }: TabProps<'Catbook'>) {
  const { state, club } = useApp();
  const seen = CATS.filter((c) => state.cats[c.id]?.visits);
  const mementos = seen.filter((c) => state.cats[c.id]?.mementoAt).length;
  return (
    <Screen scroll>
      <Header big title="Catbook" right={<Tag text={`${seen.length} / ${CATS.length}`} tone="gold" />} />
      <Text style={[type.bodySoft, { marginTop: -2 }]}>
        {seen.length === 0 ? 'Empty for now. The first visitor is usually Biscuit.' : `${mementos} memento${mementos === 1 ? '' : 's'} · ${state.totalPets} pets given.`}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
        {CATS.map((c) => {
          const rec = state.cats[c.id];
          const known = !!rec?.visits;
          const hidden = c.rarity === 'club' && !club && !known;
          return (
            <Pressable key={c.id} onPress={() => navigation.navigate('CatDetail', { id: c.id })} style={[styles.tile, !known && { backgroundColor: colors.bgElevated }]}>
              <Cat pattern={c.pattern} pose={known ? 'sit' : 'sit'} size={84} silhouette={!known} />
              <Text style={[type.h3, { fontSize: 14 }]} numberOfLines={1}>{known ? c.name : hidden ? 'Cat Club only' : '???'}</Text>
              <Text style={type.caption}>{known ? `${rec.visits} visit${rec.visits === 1 ? '' : 's'} · bond ${rec.bond}` : RARITY_LABEL[c.rarity]}</Text>
              {rec?.mementoAt && <View style={styles.memento}><Text style={{ fontSize: 11 }}>🎀</Text></View>}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: { width: '30.5%', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 4, borderWidth: 1, borderColor: colors.line },
  memento: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.goldSoft, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
});
