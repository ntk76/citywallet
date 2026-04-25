import type { ContextSignals } from "@/mocks/context";
import type { POI } from "@/mocks/pois";
import type { Preferences } from "./prefs";
import { listMerchantOffers, toDynamicOffer } from "./merchant-offers";

export type DynamicOffer = {
  id: string;
  poiId: string;
  headline: string;
  emotional: string;
  factual: string;
  discountPct: number;
  validForMin: number;
  cta: string;
  token: string;
};

export type Recommendation = {
  poi: POI;
  score: number;
  fitsTimeslot: boolean;
  offer?: DynamicOffer;
  reason: string;
};

function emotionalLine(ctx: ContextSignals, poi: POI): string {
  const w = ctx.weather.condition;
  if (w === "rain" && poi.indoor) return "Regen draußen? Wir haben einen warmen Platz für dich.";
  if (w === "cold" && poi.tags.includes("warm")) return "Kalt heute — Zeit für etwas Wärmendes.";
  if (w === "sunny" && !poi.indoor) return "Sonne ist da — raus damit!";
  if (ctx.partOfDay === "morning" && poi.category === "food") return "Guter Morgen. Erst mal ankommen.";
  if (ctx.partOfDay === "evening" && poi.category === "events") return "Der Abend ruft.";
  return "Passt gerade gut in deinen Tag.";
}

function factualLine(poi: POI, ctx: ContextSignals, discount?: number): string {
  const parts: string[] = [];
  if (discount) parts.push(`${discount}% bei ${poi.name}`);
  else parts.push(poi.name);
  parts.push(`${poi.distanceM} m`);
  parts.push(`${poi.walkMin} Min`);
  return parts.join(" · ");
}

function tokenize(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function recommend(
  pois: POI[],
  ctx: ContextSignals,
  prefs: Preferences,
): Recommendation[] {
  const activeMerchantByPoi = new Map(
    listMerchantOffers()
      .filter((offer) => offer.active)
      .map((offer) => [offer.poiId, offer] as const),
  );

  return pois
    .map((poi): Recommendation => {
      let score = 0;

      // Category weight
      score += (prefs.weights[poi.category] ?? 0.4) * 40;

      // Distance / radius
      if (poi.distanceM <= prefs.radiusM) score += 15;
      else score -= 10;

      // Open now
      if (poi.openNow) score += 10;
      else score -= 20;

      // Budget
      if (poi.priceLevel <= prefs.budget) score += 8;
      else score -= 6;

      // Weather fit
      if (ctx.weather.condition === "rain" && prefs.indoorWhenRain && poi.indoor) score += 14;
      if (ctx.weather.condition === "sunny" && !poi.indoor) score += 8;
      if (ctx.weather.condition === "cold" && poi.tags.includes("warm")) score += 8;

      // Time of day fit
      if (ctx.partOfDay === "morning" && poi.category === "food") score += 6;
      if (ctx.partOfDay === "evening" && poi.category === "events") score += 10;
      if (ctx.partOfDay === "midday" && poi.category === "markets") score += 6;

      // Fits timeslot? (round trip)
      const fitsTimeslot = poi.walkMin * 2 + 10 <= ctx.timeslotMin;
      if (fitsTimeslot) score += 10;

      // Dynamic offer when demand is low
      let offer: DynamicOffer | undefined;
      const merchantOffer = activeMerchantByPoi.get(poi.id);
      if (merchantOffer && poi.openNow) {
        offer = toDynamicOffer(merchantOffer);
        score += 15;
      } else if (poi.demand < 0.4 && poi.openNow) {
        const discount = poi.demand < 0.25 ? 20 : 15;
        offer = {
          id: `offer-${poi.id}`,
          poiId: poi.id,
          headline: `${discount}% on the spot`,
          emotional: emotionalLine(ctx, poi),
          factual: factualLine(poi, ctx, discount),
          discountPct: discount,
          validForMin: ctx.timeslotMin,
          cta: "Einlösen",
          token: tokenize(),
        };
        score += 12;
      }

      const reason = offer
        ? `${offer.emotional}`
        : `Passt zu ${ctx.weather.label.toLowerCase()} & ${ctx.partOfDay}.`;

      return { poi, score, fitsTimeslot, offer, reason };
    })
    .sort((a, b) => b.score - a.score);
}
