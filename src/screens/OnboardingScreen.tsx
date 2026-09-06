import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, type } from '../theme';
import { PrimaryButton, GhostButton, ProgressDots } from '../components/UI';
import { Cat } from '../components/Cat';
import { ItemSprite } from '../components/Item';
import { ITEM_BY_ID } from '../content/items';
import { useApp } from '../store/AppContext';
import { demo } from '../dev/demo';

const STEPS = 3;

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(demo ? 'Maple Street Porch' : '');
  const finish = () => {
    completeOnboarding(name);
    onDone();
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.top}>
        <ProgressDots count={STEPS} index={step} />
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <>
            <View style={styles.scene}>
              <View style={{ position: 'absolute', bottom: 16, left: 24 }}>
                <ItemSprite item={ITEM_BY_ID.box_plain} size={120} />
              </View>
              <View style={{ position: 'absolute', bottom: 40, left: 44 }}>
                <Cat pattern="tabby" pose="loaf" size={88} />
              </View>
              <View style={{ position: 'absolute', bottom: 18, right: 30 }}>
                <Cat pattern="tuxedo" pose="sit" size={100} flip />
              </View>
            </View>
            <Text style={[type.label, { textAlign: 'center' }]}>Porch Cats</Text>
            <Text style={[styles.q, { textAlign: 'center' }]}>Put out a bowl. See who comes.</Text>
            <Text style={[type.bodySoft, { marginTop: 10, textAlign: 'center' }]}>
              Leave food and a few things on the porch. Neighbourhood cats drop by while you are away, nap on your stuff, and leave fish as thanks. Pet the ones you catch. Collect all thirty-one.
            </Text>
          </>
        )}
        {step === 1 && (
          <>
            <View style={styles.scene}>
              <View style={{ position: 'absolute', bottom: 22, left: 20 }}>
                <Cat pattern="calico" pose="sleep" size={96} />
              </View>
              <View style={{ position: 'absolute', bottom: 22, right: 20 }}>
                <Cat pattern="orange" pose="play" size={96} flip />
              </View>
            </View>
            <Text style={type.label}>How it works</Text>
            <Text style={styles.q}>Cats come on their own time.</Text>
            <View style={{ gap: 12, marginTop: 14 }}>
              {[
                ['Real time', 'Close the app. Come back to notes about who was here, what they did, and what they left.'],
                ['Pet them', 'Tap a cat on the porch. Bond grows; gifts grow with it; at bond 5 they leave a memento.'],
                ['Fish', 'Silver fish buy toys and food. Gold fish buy the good stuff. Swap 500 silver for 10 gold, once a day, free.'],
                ['No ads', 'Ever.'],
              ].map(([t, s]) => (
                <View key={t} style={styles.row}>
                  <View style={styles.dot} />
                  <View style={{ flex: 1 }}>
                    <Text style={type.h3}>{t}</Text>
                    <Text style={type.sub}>{s}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={type.label}>Your porch</Text>
            <Text style={styles.q}>What should we call it?</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Maple Street Porch" placeholderTextColor={colors.inkFaint} style={styles.input} autoFocus={!demo} returnKeyType="done" onSubmitEditing={finish} />
            <Text style={[type.caption, { marginTop: 12 }]}>You start with 60 silver fish, 3 gold fish, a cardboard box and a red ball. Biscuit is probably already on his way.</Text>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        {step > 0 ? <GhostButton title="Back" onPress={() => setStep(step - 1)} /> : <View style={{ width: 60 }} />}
        <PrimaryButton title={step === STEPS - 1 ? 'Open the porch' : 'Next'} onPress={() => (step < STEPS - 1 ? setStep(step + 1) : finish())} style={{ flex: 1, marginLeft: 12 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { paddingTop: 14, paddingBottom: 6 },
  body: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 30 },
  scene: { height: 200, borderRadius: radius.xl, backgroundColor: colors.wood, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
  q: { ...type.h1, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 7 },
  input: { marginTop: 14, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.lineStrong, paddingHorizontal: 16, paddingVertical: 14, color: colors.ink, fontSize: 18, fontWeight: '600' },
  footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
});
