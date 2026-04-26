import { loadJSON, saveJSON } from "@/lib/storage";
import type { DynamicOffer } from "@/lib/recommend";

const KEY = "citywallet.merchant.offers.v1";

export type MerchantOffer = {
  id: string;
  /** Demo: fixed merchant id from mocks/merchant.ts */
  merchantId?: string;
  poiId: string;
  headline: string;
  emotional: string;
  factual: string;
  discountPct: number;
  validForMin: number;
  active: boolean;
  createdAt: string;
};

export type MerchantOfferInput = Omit<MerchantOffer, "id" | "createdAt">;

export function listMerchantOffers(): MerchantOffer[] {
  return loadJSON<MerchantOffer[]>(KEY, []);
}

export function createMerchantOffer(input: MerchantOfferInput): MerchantOffer {
  const offer: MerchantOffer = {
    ...input,
    id: `mof-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
  };
  const all = [offer, ...listMerchantOffers()];
  saveJSON(KEY, all);
  window.dispatchEvent(new Event("merchant-offers-updated"));
  return offer;
}

export function toggleMerchantOffer(id: string): void {
  const next = listMerchantOffers().map((o) => (o.id === id ? { ...o, active: !o.active } : o));
  saveJSON(KEY, next);
  window.dispatchEvent(new Event("merchant-offers-updated"));
}

export function toDynamicOffer(offer: MerchantOffer): DynamicOffer {
  return {
    id: offer.id,
    poiId: offer.poiId,
    headline: offer.headline,
    emotional: offer.emotional,
    factual: offer.factual,
    discountPct: offer.discountPct,
    validForMin: offer.validForMin,
    cta: "Redeem",
    token: `MRC-${offer.id.slice(-6).toUpperCase()}`,
  };
}
