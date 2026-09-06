import React, { useState } from 'react';
import { View, Text, Linking, TextInput, Alert, Modal } from 'react-native';
import { Screen, Header, PrimaryButton, Card, Row, Group, SectionCaption, ToggleRow, sheetStyles, SecondaryButton } from '../components/UI';
import { colors, type } from '../theme';
import { useApp } from '../store/AppContext';
import { restore } from '../services/billing';
import { TabProps } from '../navigation';
import { SITE } from './ClubScreen';
import { CATS } from '../content/cats';

export const SUPPORT_EMAIL = 'tryformaapp@gmail.com';

export default function SettingsScreen({ navigation }: TabProps<'Settings'>) {
  const { state, club, setClub, update, setNotifications, resetAll } = useApp();
  const [sheet, setSheet] = useState<null | 'name' | 'about'>(null);
  const [text, setText] = useState('');
  const seen = CATS.filter((c) => state.cats[c.id]?.visits).length;

  const onDelete = () =>
    Alert.alert('Start over?', 'Your porch, fish, items and Catbook are removed from this phone. Gold fish you bought are not refunded and cannot be recovered. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete everything', style: 'destructive', onPress: () => resetAll() },
    ]);

  const onNotif = async (v: boolean) => {
    const ok = await setNotifications(v);
    if (v && !ok) Alert.alert('Notifications are off', 'Allow notifications for Porch Cats in iOS Settings to hear about visitors.');
  };

  const onRestore = async () => {
    try {
      const ok = await restore();
      if (ok) setClub(true);
      Alert.alert(ok ? 'Restored' : 'Nothing to restore', ok ? 'Cat Club is active.' : 'No active membership was found for this Apple ID. Gold fish packs are one-time and were added when bought.');
    } catch {
      Alert.alert('Restore failed', 'Please try again in a moment.');
    }
  };

  return (
    <Screen scroll>
      <Header big title="Settings" />
      <Card style={{ marginTop: 4 }}>
        <Text style={type.label}>Membership</Text>
        <Text style={[type.h2, { marginTop: 6 }]}>{club ? 'Cat Club' : 'Free porch'}</Text>
        {!club && (
          <>
            <Text style={[type.sub, { marginTop: 4 }]}>Everything works free. The Club keeps the bowl full, brings 5 gold a day, doubles the exchange, opens the backyard and sends Jeeves.</Text>
            <PrimaryButton title="Join the Cat Club" onPress={() => navigation.navigate('Club')} style={{ marginTop: 14, height: 46 }} />
          </>
        )}
      </Card>

      <SectionCaption>PORCH</SectionCaption>
      <Group>
        <Row label="Porch name" value={state.porchName} onPress={() => { setText(state.porchName); setSheet('name'); }} />
        <Row label="Catbook" value={`${seen} of ${CATS.length}`} onPress={() => navigation.navigate('Catbook')} />
        <ToggleRow label="Visitor notifications" sub="Empty bowl and a couple of porch notes a day. Local only." value={state.notifications} onChange={onNotif} last />
      </Group>

      <SectionCaption>PURCHASES</SectionCaption>
      <Group>
        <Row label="Gold fish" value={`${state.gold}`} onPress={() => navigation.navigate('Club', { reason: 'gold' })} />
        <Row label="Restore purchases" onPress={onRestore} />
        <Row label="Manage subscription" onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')} last />
      </Group>

      <SectionCaption>ABOUT</SectionCaption>
      <Group>
        <Row label="How the porch works" onPress={() => setSheet('about')} />
        <Row label="Privacy policy" onPress={() => Linking.openURL(`${SITE}/privacy.html`)} />
        <Row label="Terms of use" onPress={() => Linking.openURL(`${SITE}/terms.html`)} />
        <Row label="Support" value={SUPPORT_EMAIL} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Porch%20Cats%20support`)} />
        <Row label="Delete all data" danger onPress={onDelete} last />
      </Group>
      <Text style={[type.caption, { marginTop: 16, lineHeight: 17 }]}>Porch Cats 1.0 · No account, no ads, no analytics. Your porch lives on this phone.</Text>

      <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <View style={{ flex: 1 }}>
          <View style={sheetStyles.backdrop} onTouchEnd={() => setSheet(null)} />
          <View style={sheetStyles.sheet}>
            {sheet === 'name' && (
              <>
                <Text style={type.h2}>Porch name</Text>
                <TextInput value={text} onChangeText={setText} style={sheetStyles.input} autoFocus placeholderTextColor={colors.inkFaint} />
                <PrimaryButton title="Save" onPress={() => { update({ porchName: text.trim() || state.porchName }); setSheet(null); }} style={{ marginTop: 16 }} />
              </>
            )}
            {sheet === 'about' && (
              <>
                <Text style={type.h2}>How the porch works</Text>
                <Text style={[type.body, { marginTop: 10 }]}>Cats visit in real time, including while the app is closed. Food in the bowl is what brings them; items decide who. Each cat likes two kinds of thing. Rare cats need Deluxe Tuna or better plus something they like.</Text>
                <Text style={[type.body, { marginTop: 10 }]}>When a cat leaves it drops silver fish (more if you petted it, more if you have a bond) and sometimes a gold fish. Bond 5 earns a memento in the Catbook.</Text>
                <Text style={[type.body, { marginTop: 10 }]}>Gold fish come from rare cats, the daily gift, exchanging 500 silver, or packs. Nothing in the game is timed to make you pay, and there are no ads.</Text>
                <SecondaryButton title="Close" onPress={() => setSheet(null)} style={{ marginTop: 16 }} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
