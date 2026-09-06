/** Local notifications only: an empty bowl and a daily "someone's on the porch" nudge. Nothing leaves the phone. */
import { Platform } from 'react-native';

type Notif = typeof import('expo-notifications');
let mod: Notif | null = null;
function lib(): Notif | null {
  if (Platform.OS === 'web') return null;
  if (!mod) {
    try {
      mod = require('expo-notifications') as Notif;
      mod.setNotificationHandler({
        handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
      });
    } catch {
      mod = null;
    }
  }
  return mod;
}

export async function requestPermission(): Promise<boolean> {
  const N = lib();
  if (!N) return false;
  const cur = await N.getPermissionsAsync();
  if (cur.granted) return true;
  const res = await N.requestPermissionsAsync();
  return !!res.granted;
}

export async function cancelAll(): Promise<void> {
  const N = lib();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync().catch(() => {});
}

const LINES = [
  'Someone is on the porch.',
  'A cat has been by. There is a note.',
  'The bowl is getting low.',
  'Biscuit says hi. Probably.',
  'Paw prints on the step this morning.',
  'The porch has visitors.',
  'Something knocked the ball off the rail.',
];

/**
 * Rebuild the queue: one line a day at 9am and 6pm for the next week, plus a bowl-empty
 * reminder estimated from current servings (about 45 minutes a serving while cats are about).
 */
export async function schedule(servings: number, porchName: string): Promise<boolean> {
  const N = lib();
  if (!N) return false;
  if (!(await requestPermission())) return false;
  await cancelAll();
  if (Platform.OS === 'android') await N.setNotificationChannelAsync('porch', { name: 'Porch', importance: N.AndroidImportance.DEFAULT }).catch(() => {});
  const now = new Date();
  const title = porchName ? `${porchName}` : 'Porch Cats';
  if (servings > 0) {
    const when = new Date(now.getTime() + servings * 45 * 60_000);
    await N.scheduleNotificationAsync({ content: { title, body: 'The bowl is empty. The cats have opinions.', sound: false }, trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: when } }).catch(() => {});
  }
  for (let d = 0; d < 7; d++) {
    for (const hour of [9, 18]) {
      const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hour, 0, 0, 0);
      if (when.getTime() <= now.getTime() + 60_000) continue;
      const line = LINES[(d * 2 + (hour === 18 ? 1 : 0)) % LINES.length];
      await N.scheduleNotificationAsync({ content: { title, body: line, sound: false }, trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: when } }).catch(() => {});
    }
  }
  return true;
}
