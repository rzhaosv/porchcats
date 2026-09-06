import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PurchasesPackage } from 'react-native-purchases';
import { colors, radius, type } from '../theme';
import { PrimaryButton, Label, Tag } from '../components/UI';
import { Cat } from '../components/Cat';
import { getPackages, purchase, restore, isCancelledError, isSubscription, isAnnual, goldFor } from '../services/billing';
import { useApp } from '../store/AppContext';
import { ScreenProps } from '../navigation';
import { GOLD_PACKS } from '../content/items';

export const SITE = 'https://tryforma.app/porchcats';
const BENEFITS: [string, string][] = [
  ['Bowls never empty', 'Jeeves, the Club butler, refills the food while you are away.'],
  ['5 gold fish a day', 'Instead of one. Every day you open the porch.'],
  ['Exchange twice a day', '500 silver → 10 gold, two times instead of one.'],
  ['The backyard', 'Four more spots, a lawn, and the cats that only visit there.'],
  ['Jeeves himself', 'A Club-only cat who brings gold every visit.'],
];
const REASON: Record<string, string> = {
  gold: 'Gold fish buy the good food and the rare items.',
  backyard: 'The backyard is included in the Cat Club, or 180 gold on its own.',
  food: 'Not enough gold for that food. Packs below, or the Club brings 5 a day.',
  jeeves: 'Jeeves only visits Cat Club porches.',
  exchange: 'Cat Club members can exchange twice a day.',
};

export default function ClubScreen({ navigation, route }: ScreenProps<'Club'>) {
  const { state, club, setClub, creditGold } = useApp();
  const [pkgs, setPkgs] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fromOnboarding = route.params?.fromOnboarding;
  const reason = route.params?.reason;

  useEffect(() => {
    getPackages().then((p) => {
      setPkgs(p);
      const annual = p.find(isAnnual);
      setSelected((annual ?? p.find(isSubscription))?.identifier ?? null);
      setLoaded(true);
    });
  }, []);

  const close = () => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('Tabs'));

  const buy = async (pkg: PurchasesPackage) => {
    setBusy(true);
    try {
      const r = await purchase(pkg);
      const fish = goldFor(pkg);
      if (fish > 0) {
        creditGold(fish, r.txId);
        Alert.alert(`+${fish} gold fish`, 'Added to your porch. Thank you.');
      } else if (r.club) {
        setClub(true);
        close();
      }
    } catch (e) {
      if (!isCancelledError(e)) Alert.alert('Purchase failed', 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const onSubscribe = () => {
    const pkg = pkgs.find((p) => p.identifier === selected);
    if (!pkg) return Alert.alert('Not available yet', 'Plans could not be loaded right now. Please check your connection and try again.');
    buy(pkg);
  };

  const onRestore = async () => {
    setBusy(true);
    try {
      const ok = await restore();
      if (ok) {
        setClub(true);
        close();
      } else Alert.alert('Nothing to restore', 'No active membership was found for this Apple ID.');
    } catch {
      Alert.alert('Restore failed', 'Please try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  const subs = pkgs.filter(isSubscription).sort((a, b) => (isAnnual(a) ? -1 : isAnnual(b) ? 1 : 0));
  const golds = pkgs.filter((p) => goldFor(p) > 0).sort((a, b) => goldFor(a) - goldFor(b));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable onPress={close} hitSlop={12} style={styles.close}>
        <Text style={{ color: colors.inkSoft, fontSize: 16, fontWeight: '600' }}>{fromOnboarding ? 'Skip' : '✕'}</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {(reason === 'gold' || reason === 'food') && golds.length > 0 ? null : null}
        <View style={{ alignItems: 'center' }}>
          <View style={styles.stage}>
            <Cat pattern="tuxedo" pose="sit" size={130} />
          </View>
        </View>
        <Text style={[type.display, { textAlign: 'center', marginTop: 8 }]}>{club ? 'You are in the Club' : 'The Cat Club'}</Text>
        <Text style={[type.bodySoft, { textAlign: 'center', marginTop: 6 }]}>{reason ? REASON[reason] : 'Jeeves keeps the bowls full. You keep collecting.'}</Text>

        {!club && (
          <>
            <View style={styles.benefits}>
              {BENEFITS.map(([label, sub]) => (
                <View key={label} style={styles.benefitRow}>
                  <View style={styles.dot} />
                  <View style={{ flex: 1 }}>
                    <Text style={type.h3}>{label}</Text>
                    <Text style={type.sub}>{sub}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={{ gap: 12 }}>
              {!loaded ? (
                <Text style={[type.caption, { textAlign: 'center' }]}>Loading plans…</Text>
              ) : subs.length === 0 ? (
                <View style={styles.plan}><Text style={[type.bodySoft, { textAlign: 'center', flex: 1 }]}>Plans are not available right now. The porch stays open; try again later.</Text></View>
              ) : (
                subs.map((p) => {
                  const active = p.identifier === selected;
                  const annual = isAnnual(p);
                  return (
                    <Pressable key={p.identifier} onPress={() => setSelected(p.identifier)} style={[styles.plan, active && styles.planActive]}>
                      <View style={{ flex: 1 }}>
                        <Text style={type.h3}>{annual ? 'Yearly' : 'Monthly'}</Text>
                        <Text style={[type.caption, { color: annual ? colors.accentDeep : colors.inkSoft, marginTop: 2 }]}>{annual ? '7-day free trial, then yearly · best value' : '7-day free trial, then monthly'}</Text>
                      </View>
                      <Text style={[type.numSm, { fontSize: 17, color: active ? colors.ink : colors.inkSoft }]}>{p.product.priceString}</Text>
                    </Pressable>
                  );
                })
              )}
            </View>
            <PrimaryButton title="Start my 7-day free trial" onPress={onSubscribe} loading={busy} disabled={!selected} style={{ marginTop: 16 }} />
            <Text style={[type.caption, { textAlign: 'center', lineHeight: 17, marginTop: 10 }]}>
              Free for 7 days, then the plan price is charged to your Apple ID. Auto-renews unless cancelled at least 24 hours before the end of the current period. Cancel anytime in Settings.
            </Text>
          </>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 8 }}>
          <Label style={{ marginBottom: 0 }}>Gold fish</Label>
          <Tag text={`You have ${state.gold}`} tone="gold" />
        </View>
        <View style={{ gap: 10 }}>
          {(golds.length ? golds : []).map((p) => {
            const fish = goldFor(p);
            const meta = GOLD_PACKS.find((g) => g.fish === fish);
            return (
              <Pressable key={p.identifier} onPress={() => buy(p)} disabled={busy} style={styles.pack}>
                <Text style={{ fontSize: 26 }}>🐠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={type.h3}>{fish} gold fish</Text>
                  <Text style={type.caption}>{meta?.label ?? ''}</Text>
                </View>
                <Text style={[type.numSm, { fontSize: 16 }]}>{p.product.priceString}</Text>
              </Pressable>
            );
          })}
          {loaded && golds.length === 0 && <Text style={[type.caption, { textAlign: 'center' }]}>Gold packs are not available right now.</Text>}
        </View>
        <Text style={[type.caption, { textAlign: 'center', marginTop: 10 }]}>Gold fish never expire. You also earn them from rare cats, the daily gift and the exchange.</Text>

        <View style={styles.links}>
          <Pressable onPress={onRestore}><Text style={styles.link}>Restore purchases</Text></Pressable>
          <Pressable onPress={() => Linking.openURL(`${SITE}/terms.html`)}><Text style={styles.link}>Terms</Text></Pressable>
          <Pressable onPress={() => Linking.openURL(`${SITE}/privacy.html`)}><Text style={styles.link}>Privacy</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  close: { position: 'absolute', top: 54, right: 20, zIndex: 5, padding: 6 },
  scroll: { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 30 },
  stage: { width: 160, height: 140, borderRadius: radius.xl, backgroundColor: colors.wood, alignItems: 'center', justifyContent: 'flex-end', borderWidth: 1, borderColor: colors.line },
  benefits: { marginTop: 20, marginBottom: 18, gap: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 7 },
  plan: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, gap: 10 },
  planActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  pack: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.card, borderRadius: radius.lg, padding: 14 },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 22, marginTop: 22 },
  link: { color: colors.inkSoft, fontSize: 13, fontWeight: '600' },
});
