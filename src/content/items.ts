import { FoodDef, ItemDef } from '../logic/types';

export const FOODS: FoodDef[] = [
  { id: 'thrifty', name: 'Thrifty Bits', tier: 0, cost: {}, servings: 6, blurb: 'Free, forever. Cats come, slowly.' },
  { id: 'frisky', name: 'Frisky Bits', tier: 1, cost: { silver: 30 }, servings: 8, blurb: 'The regulars notice.' },
  { id: 'ritzy', name: 'Ritzy Bits', tier: 2, cost: { gold: 7 }, servings: 10, blurb: 'Word gets around the block.' },
  { id: 'tuna', name: 'Deluxe Tuna', tier: 3, cost: { gold: 12 }, servings: 10, blurb: 'The rare ones start to appear.' },
  { id: 'sashimi', name: 'Sashimi', tier: 4, cost: { gold: 25 }, servings: 8, blurb: 'Clementine has been seen for this.' },
];
export const FOOD_BY_ID: Record<string, FoodDef> = Object.fromEntries(FOODS.map((f) => [f.id, f]));

const I = (id: string, name: string, kind: ItemDef['kind'], cost: ItemDef['cost'], size: 1 | 2, color: string, blurb: string, accent?: string, backyard?: boolean): ItemDef => ({ id, name, kind, cost, size, color, accent, blurb, backyard });

export const ITEMS: ItemDef[] = [
  I('ball_red', 'Red Ball', 'ball', { silver: 15 }, 1, '#D9534F', 'Rolls. That is the whole appeal.'),
  I('ball_yarn', 'Yarn Ball', 'ball', { silver: 40 }, 1, '#7FA6D9', 'Unravels slowly, satisfyingly.'),
  I('box_plain', 'Cardboard Box', 'box', { silver: 20 }, 2, '#C99A6B', 'If it fits.'),
  I('box_tall', 'Tall Box', 'box', { silver: 60 }, 1, '#B5875A', 'For the cat who wants to be seen and hidden at once.'),
  I('cushion_blue', 'Blue Cushion', 'cushion', { silver: 45 }, 1, '#6F8FBF', 'Plush, sun-warmed.'),
  I('cushion_velvet', 'Velvet Cushion', 'cushion', { gold: 18 }, 1, '#8E4A6B', 'Thread count: sufficient for a Duchess.'),
  I('sock_grey', 'Lost Sock', 'sock', { silver: 12 }, 1, '#9AA5A8', 'It was yours. It is not anymore.'),
  I('tunnel_green', 'Green Tunnel', 'tunnel', { silver: 90 }, 2, '#7FA684', 'Two ends, one cat, endless mystery.'),
  I('post_sisal', 'Scratching Post', 'post', { silver: 70 }, 1, '#D9B98C', 'Saves the furniture. Attracts the serious.'),
  I('basket_wicker', 'Wicker Basket', 'basket', { silver: 110 }, 1, '#C9A46C', 'A basket, a cat, a whole afternoon.'),
  I('plant_fern', 'Potted Fern', 'plant', { silver: 55 }, 1, '#5F8F6A', 'Will be nibbled. Accept this.', '#B36A4A'),
  I('bed_heated', 'Heated Bed', 'bed', { gold: 22 }, 1, '#E0A070', 'The single most attractive object on earth, to a cat.'),
  I('bed_fourposter', 'Four-poster Bed', 'bed', { gold: 45 }, 2, '#8E4A6B', 'Only the Baroness deserves it. She agrees.', '#E6B23A'),
  I('hat_straw', 'Straw Hat', 'hat', { silver: 150 }, 1, '#E3C97A', 'Left on the rail. Now a cat lives in it.'),
  I('teapot_blue', 'Blue Teapot', 'teapot', { gold: 15 }, 1, '#5B7FB5', 'Purely decorative. The Professor disagrees.'),
  I('radio_old', 'Old Radio', 'radio', { gold: 20 }, 1, '#7A5A3A', 'Plays jazz at low volume. Sage approves.', '#E6B23A'),
  I('tunnel_long', 'Long Tunnel', 'tunnel', { gold: 30 }, 2, '#5F6F8F', 'Backyard-sized. Sable-approved.', undefined, true),
  I('basket_hanging', 'Hanging Basket', 'basket', { gold: 16 }, 1, '#A66A3A', 'Swings gently. Moon watches from it.', undefined, true),
  I('plant_lavender', 'Lavender Pot', 'plant', { silver: 120 }, 1, '#8F7FBF', 'Bees, cats, and a scent that keeps the mood.', '#B36A4A', true),
];
export const ITEM_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

/** Gold fish packs. Identifiers double as RevenueCat product ids. Mirrors Neko Atsume's ladder. */
export const GOLD_PACKS: { id: string; fish: number; price: string; label: string }[] = [
  { id: 'com.formaz.porchcats.gold50', fish: 50, price: '$0.99', label: 'A handful' },
  { id: 'com.formaz.porchcats.gold120', fish: 120, price: '$1.99', label: 'A bowlful' },
  { id: 'com.formaz.porchcats.gold200', fish: 200, price: '$2.99', label: 'A bucket' },
  { id: 'com.formaz.porchcats.gold300', fish: 300, price: '$3.99', label: 'The whole catch' },
];
