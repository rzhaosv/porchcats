import Purchases, { CustomerInfo, PurchasesPackage, LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import { demo } from '../dev/demo';
import { GOLD_PACKS } from '../content/items';

const RC_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
export const ENTITLEMENT = 'club';

let configured = false;

export function configureBilling() {
  if (configured || Platform.OS !== 'ios' || !RC_IOS_KEY || RC_IOS_KEY === 'TBD') return;
  try {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey: RC_IOS_KEY });
    configured = true;
  } catch {
    /* ignore — the game still works without the store */
  }
}

export function isClub(info: CustomerInfo | null | undefined): boolean {
  return !!info && !!info.entitlements.active[ENTITLEMENT];
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export function addClubListener(cb: (club: boolean) => void): () => void {
  if (!configured) return () => {};
  const listener = (info: CustomerInfo) => cb(isClub(info));
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}

/** Web-only canned plans so `?demo=club` shows prices. Never used on native. */
const DEMO_PACKAGES = [
  { identifier: '$rc_annual', packageType: 'ANNUAL', product: { identifier: 'com.formaz.porchcats.club.yearly', priceString: '$24.99/yr' } },
  { identifier: '$rc_monthly', packageType: 'MONTHLY', product: { identifier: 'com.formaz.porchcats.club.monthly', priceString: '$3.99/mo' } },
  ...GOLD_PACKS.map((g) => ({ identifier: g.id.split('.').pop(), packageType: 'CUSTOM', product: { identifier: g.id, priceString: g.price } })),
] as unknown as PurchasesPackage[];

export async function getPackages(): Promise<PurchasesPackage[]> {
  if (demo) return DEMO_PACKAGES;
  if (!configured) return [];
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch {
    return [];
  }
}

export const isSubscription = (p: PurchasesPackage) => p.packageType === 'ANNUAL' || p.packageType === 'MONTHLY' || p.identifier === '$rc_annual' || p.identifier === '$rc_monthly';
export const isAnnual = (p: PurchasesPackage) => p.packageType === 'ANNUAL' || p.identifier === '$rc_annual';
export const goldFor = (p: PurchasesPackage) => GOLD_PACKS.find((g) => g.id === p.product.identifier)?.fish ?? 0;

export type PurchaseResult = { club: boolean; productId: string; txId: string };

export async function purchase(pkg: PurchasesPackage): Promise<PurchaseResult> {
  const res = await Purchases.purchasePackage(pkg);
  const txId = (res as any).transaction?.transactionIdentifier ?? `${pkg.product.identifier}:${Date.now()}`;
  return { club: isClub(res.customerInfo), productId: pkg.product.identifier, txId };
}

export async function restore(): Promise<boolean> {
  if (!configured) return false;
  const info = await Purchases.restorePurchases();
  return isClub(info);
}

export function isCancelledError(e: any): boolean {
  return !!e && (e.userCancelled === true || e.code === '1');
}
