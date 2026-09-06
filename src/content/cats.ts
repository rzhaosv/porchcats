import { CatDef } from '../logic/types';

const C = (id: string, name: string, pattern: CatDef['pattern'], rarity: CatDef['rarity'], bio: string, likes: CatDef['likes'], foodTier = 0, power = 1): CatDef => ({ id, name, pattern, rarity, bio, likes, foodTier, power });

/** Thirty-one regulars, one Club cat. Names are the kind a neighbourhood gives out. */
export const CATS: CatDef[] = [
  // common
  C('biscuit', 'Biscuit', 'tabby', 'common', 'Shows up first, leaves last. Considers the box his.', ['box', 'cushion']),
  C('pickle', 'Pickle', 'tuxedo', 'common', 'Formal from the front, chaos from behind.', ['ball', 'sock']),
  C('mochi', 'Mochi', 'white', 'common', 'Sits like a dumpling. Judges quietly.', ['cushion', 'bed']),
  C('rusty', 'Rusty', 'orange', 'common', 'Orange cat behaviour, fully expressed.', ['ball', 'tunnel']),
  C('pepper', 'Pepper', 'black', 'common', 'You will not see her until she blinks.', ['box', 'basket']),
  C('dot', 'Dot', 'calico', 'common', 'Three colours, one opinion.', ['plant', 'cushion']),
  C('smudge', 'Smudge', 'grey', 'common', 'Came for the sock. Stayed for the sock.', ['sock', 'box']),
  C('nutmeg', 'Nutmeg', 'tortie', 'common', 'Tortitude in a small package.', ['post', 'basket']),
  C('waffles', 'Waffles', 'cream', 'common', 'Sleeps in the exact shape of a waffle.', ['bed', 'cushion']),
  C('tofu', 'Tofu', 'white', 'common', 'Soft. Bland. Beloved.', ['box', 'teapot']),
  C('miso', 'Miso', 'tabby', 'common', 'Talks the whole visit. Nobody minds.', ['tunnel', 'ball']),
  C('olive', 'Olive', 'grey', 'common', 'Prefers the plant. Will eat the plant.', ['plant', 'basket']),
  // uncommon
  C('captain', 'Captain', 'tuxedo', 'uncommon', 'Inspects every item, approves of one.', ['post', 'hat'], 1, 1.4),
  C('marmalade', 'Marmalade', 'orange', 'uncommon', 'Enormous. Gentle. Blocks the door.', ['bed', 'cushion'], 1, 1.4),
  C('ghost', 'Ghost', 'white', 'uncommon', 'Appears at dusk, leaves before you notice.', ['tunnel', 'box'], 1, 1.5),
  C('pudding', 'Pudding', 'cream', 'uncommon', 'Round on purpose.', ['basket', 'teapot'], 1, 1.4),
  C('inky', 'Inky', 'black', 'uncommon', 'Knocks the ball off the porch, then fetches it.', ['ball', 'radio'], 1, 1.4),
  C('patches', 'Patches', 'calico', 'uncommon', 'Has a spot on the fence she calls hers.', ['plant', 'post'], 1, 1.4),
  C('duchess', 'Duchess', 'lilac', 'uncommon', 'Will not sit on anything under thread count 400.', ['bed', 'cushion'], 2, 1.6),
  C('bandit', 'Bandit', 'tabby', 'uncommon', 'Steals the sock. Returns it. Steals it again.', ['sock', 'tunnel'], 1, 1.4),
  C('sage', 'Sage', 'grey', 'uncommon', 'Listens to the radio. Prefers jazz.', ['radio', 'basket'], 1, 1.5),
  C('cinnamon', 'Cinnamon', 'tortie', 'uncommon', 'Warm colours, warmer purr.', ['bed', 'hat'], 1, 1.4),
  // rare (need a specific item + good food)
  C('baroness', 'The Baroness', 'siamese', 'rare', 'Arrives only when the porch is worthy. Leaves gold.', ['bed', 'teapot'], 3, 2.6),
  C('moon', 'Moon', 'white', 'rare', 'A silver cat under a silver moon. Seen by few.', ['basket', 'radio'], 2, 2.4),
  C('hattie', 'Hattie', 'calico', 'rare', 'Wears the hat. Refuses to explain the hat.', ['hat'], 2, 2.2),
  C('professor', 'The Professor', 'tuxedo', 'rare', 'Sits by the teapot with great seriousness.', ['teapot', 'post'], 3, 2.4),
  C('ember', 'Ember', 'orange', 'rare', 'Warms the whole porch. Bring the good food.', ['bed', 'radio'], 3, 2.5),
  C('sable', 'Sable', 'black', 'rare', 'The neighbourhood legend. Tunnel or nothing.', ['tunnel'], 2, 2.3),
  C('opal', 'Opal', 'lilac', 'rare', 'Pale, patient, particular about cushions.', ['cushion', 'bed'], 3, 2.6),
  C('tigris', 'Tigris', 'tabby', 'rare', 'A very small tiger. Behaves accordingly.', ['post', 'ball'], 2, 2.2),
  C('clementine', 'Clementine', 'orange', 'rare', 'Bright as a fruit. Shows up for sashimi.', ['teapot', 'plant'], 4, 2.8),
  // club
  C('jeeves', 'Jeeves', 'tuxedo', 'club', 'The Cat Club butler. Keeps the bowls full and the gossip current.', ['teapot', 'bed'], 0, 3),
];

export const CAT_BY_ID: Record<string, CatDef> = Object.fromEntries(CATS.map((c) => [c.id, c]));

export const RARITY_LABEL: Record<CatDef['rarity'], string> = { common: 'Regular', uncommon: 'Sometimes', rare: 'Rare', club: 'Cat Club' };

/** Things cats say when petted; picked by bond. */
export const PET_LINES: string[] = ['prrr', 'mrp?', '*slow blink*', 'mrrow', '*headbutt*', '*biscuits*', 'prrrrrr', '*rolls over*'];

/** Notes cats leave when you missed them. {item} is filled in. */
export const TRACE_LINES: string[] = [
  'napped {on} for {h}',
  'sat {on} looking at the street for {h}',
  'kneaded {on} for {h} and left',
  'ate, loafed {on} for {h}, judged a pigeon',
  'stretched out {on} for {h}',
  'played {on} for {h}, knocked something over',
];
