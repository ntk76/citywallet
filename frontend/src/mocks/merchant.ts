import { POIS } from "@/mocks/pois";

/**
 * Fixed demo merchant tied to a POI in the City Wallet mock world.
 * Offers use `heroPoiId` so they surface in customer recommendations and detail.
 */
export const MOCK_MERCHANT = {
  id: "merchant-demo-cafe-mueller",
  displayName: "Café Müller",
  heroPoiId: "cafe-mueller",
  /** Short line for the merchant console */
  tagline: "Demo partner · mock data",
} as const;

export function getMerchantHomePoi() {
  return POIS.find((p) => p.id === MOCK_MERCHANT.heroPoiId);
}

/** Customer app: only this demo merchant’s offers (plus legacy without merchantId on the same POI). */
export function isMockMerchantOffer(offer: { merchantId?: string; poiId: string }): boolean {
  if (offer.merchantId === MOCK_MERCHANT.id) return true;
  if (!offer.merchantId && offer.poiId === MOCK_MERCHANT.heroPoiId) return true;
  return false;
}
