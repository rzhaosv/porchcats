import { Platform, TextStyle } from 'react-native';

/** Late-afternoon porch: cream paper, warm wood, marmalade accent, sage for silver. */
export const colors = {
  bg: '#FFF6E9',
  bgElevated: '#F8EBD8',
  card: '#FFFCF6',
  cardAlt: '#F6E9D6',
  ink: '#2B1D14',
  inkSoft: '#7A6555',
  inkFaint: '#A8978A',
  accent: '#E58A3C',
  accentDeep: '#B9651F',
  accentSoft: 'rgba(229,138,60,0.16)',
  gold: '#E6B23A',
  goldDeep: '#B7861B',
  goldSoft: 'rgba(230,178,58,0.18)',
  silver: '#8FA3A8',
  silverSoft: 'rgba(143,163,168,0.18)',
  sage: '#7FA684',
  sageSoft: 'rgba(127,166,132,0.16)',
  wood: '#C99A6B',
  woodDeep: '#9C7047',
  sky: '#DCEBF2',
  line: 'rgba(43,29,20,0.08)',
  lineStrong: 'rgba(43,29,20,0.16)',
  danger: '#B9463A',
  dangerSoft: 'rgba(185,70,58,0.12)',
  overlay: 'rgba(43,29,20,0.55)',
  onAccent: '#2B1D14',
  onInk: '#FFF6E9',
};

export const radius = { sm: 12, md: 16, lg: 20, xl: 28, pill: 999 };

export const serif = Platform.select({
  ios: 'Georgia',
  web: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
  default: 'serif',
}) as string;

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

export const type: Record<string, TextStyle> = {
  display: { fontFamily: serif, fontSize: 34, fontWeight: '700', color: colors.ink, letterSpacing: -0.4, lineHeight: 40 },
  h1: { fontFamily: serif, fontSize: 27, fontWeight: '700', color: colors.ink, letterSpacing: -0.3, lineHeight: 33 },
  h2: { fontFamily: serif, fontSize: 21, fontWeight: '700', color: colors.ink, letterSpacing: -0.2, lineHeight: 27 },
  h3: { fontSize: 17, fontWeight: '700', color: colors.ink },
  body: { fontSize: 16, fontWeight: '400', color: colors.ink, lineHeight: 23 },
  bodySoft: { fontSize: 15, fontWeight: '400', color: colors.inkSoft, lineHeight: 22 },
  label: { fontSize: 12, fontWeight: '700', color: colors.accentDeep, letterSpacing: 1.4, textTransform: 'uppercase' },
  sub: { fontSize: 13, fontWeight: '500', color: colors.inkSoft },
  caption: { fontSize: 12, fontWeight: '500', color: colors.inkFaint },
  num: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -0.8, ...tabular },
  numSm: { fontSize: 15, fontWeight: '700', color: colors.ink, ...tabular },
  numLg: { fontSize: 44, fontWeight: '800', color: colors.ink, letterSpacing: -1.2, ...tabular },
};

export const switchProps = Platform.OS === 'web' ? ({ activeThumbColor: '#fff' } as Record<string, unknown>) : {};
