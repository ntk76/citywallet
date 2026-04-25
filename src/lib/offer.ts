// Generative Offer Engine
// Composes a unique offer from (context signals) × (merchant rules).
// Not a static coupon library: copy + discount + product are assembled at runtime.

import type { ContextSignals, DayPart, WeatherKind } from "./context";

export type GoalKind = "footfall" | "clear_stock" | "reward_loyal" | "new_customers";

export interface MerchantRules {
  merchantName: string;
  category: "cafe" | "bakery" | "restaurant" | "bookstore" | "boutique";
  goal: GoalKind;
  maxDiscountPct: number; // 5..50
  minDiscountPct: number; // 0..maxDiscount
  triggers: {
    rainy: boolean;
    morning: boolean;
    evening: boolean;
    cold: boolean;
    hot: boolean;
  };
  highlightProduct: string; // e.g. "Flat White", "Tagessuppe"
}

export const DEFAULT_RULES: MerchantRules = {
  merchantName: "Café Aurora",
  category: "cafe",
  goal: "footfall",
  maxDiscountPct: 25,
  minDiscountPct: 10,
  triggers: { rainy: true, morning: true, evening: false, cold: true, hot: false },
  highlightProduct: "Flat White",
};

export interface GenerativeOffer {
  id: string;
  title: string;
  body: string;
  discountPct: number;
  validUntil: Date;
  reason: string[]; // human-readable context reasoning
  product: string;
  intentTag: string; // the only thing "sent" — privacy
  token: string;
}

const PRODUCT_BY_CATEGORY: Record<MerchantRules["category"], string[]> = {
  cafe: ["Flat White", "Cappuccino", "Cold Brew", "Heiße Schokolade", "Matcha Latte"],
  bakery: ["Sauerteigbrot", "Croissant", "Zimtschnecke", "Quiche", "Franzbrötchen"],
  restaurant: ["Tagessuppe", "Pasta del Giorno", "Bowl", "Burger", "Saisonsalat"],
  bookstore: ["Roman des Monats", "Notizbuch", "Bildband", "Hörbuch", "Krimi-Highlight"],
  boutique: ["Strick-Pullover", "Leinen-Shirt", "Ledertasche", "Sneaker", "Schal"],
};

function pickProduct(rules: MerchantRules, ctx: ContextSignals): string {
  const list = PRODUCT_BY_CATEGORY[rules.category];
  if (rules.highlightProduct && Math.random() > 0.4) return rules.highlightProduct;
  // Slight context bias
  if (ctx.weather === "cold" && rules.category === "cafe") return "Heiße Schokolade";
  if (ctx.weather === "hot" && rules.category === "cafe") return "Cold Brew";
  if (ctx.dayPart === "morning" && rules.category === "bakery") return "Croissant";
  return list[(ctx.now.getMinutes() + ctx.temperatureC) % list.length];
}

function intensity(ctx: ContextSignals, rules: MerchantRules): number {
  // 0..1 — how strongly context matches a trigger
  let score = 0.3;
  if (rules.triggers.rainy && ctx.weather === "rainy") score += 0.35;
  if (rules.triggers.cold && ctx.weather === "cold") score += 0.25;
  if (rules.triggers.hot && ctx.weather === "hot") score += 0.25;
  if (rules.triggers.morning && ctx.dayPart === "morning") score += 0.2;
  if (rules.triggers.evening && (ctx.dayPart === "evening" || ctx.dayPart === "night")) score += 0.2;
  if (rules.goal === "clear_stock") score += 0.15;
  return Math.min(1, score);
}

const DAYPART_COPY: Record<DayPart, string> = {
  morning: "Starte deinen Morgen",
  midday: "Pause in der Mittagshitze",
  afternoon: "Nachmittags-Boost",
  evening: "Lass den Abend ausklingen",
  night: "Nachtschwärmer-Bonus",
};

const WEATHER_COPY: Record<WeatherKind, string> = {
  sunny: "bei Sonne",
  cloudy: "unter grauem Himmel",
  rainy: "im Regen",
  cold: "in der Kälte",
  hot: "an einem heißen Tag",
};

const GOAL_COPY: Record<GoalKind, string> = {
  footfall: "Zeit für einen Spontanbesuch",
  clear_stock: "Heute besonders günstig",
  reward_loyal: "Danke, dass du wiederkommst",
  new_customers: "Erstbesuch-Gruß",
};

function rid(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export function generateOffer(ctx: ContextSignals, rules: MerchantRules): GenerativeOffer {
  const i = intensity(ctx, rules);
  const range = Math.max(0, rules.maxDiscountPct - rules.minDiscountPct);
  const discountPct = Math.round(rules.minDiscountPct + range * i);
  const product = pickProduct(rules, ctx);

  const reason: string[] = [];
  if (rules.triggers.rainy && ctx.weather === "rainy") reason.push("Regen-Trigger aktiv");
  if (rules.triggers.cold && ctx.weather === "cold") reason.push(`Temperatur ${ctx.temperatureC}°C`);
  if (rules.triggers.hot && ctx.weather === "hot") reason.push(`Temperatur ${ctx.temperatureC}°C`);
  if (rules.triggers.morning && ctx.dayPart === "morning") reason.push("Morgen-Fenster");
  if (rules.triggers.evening && (ctx.dayPart === "evening" || ctx.dayPart === "night"))
    reason.push("Abend-Fenster");
  if (reason.length === 0) reason.push("Basis-Angebot");
  reason.push(`Ziel: ${GOAL_COPY[rules.goal]}`);

  const title = `${DAYPART_COPY[ctx.dayPart]} ${WEATHER_COPY[ctx.weather]}`;
  const body = `${discountPct}% auf ${product} bei ${rules.merchantName} (${ctx.neighborhood}).`;

  const validUntil = new Date(ctx.now.getTime() + 90 * 60 * 1000); // 90 min
  const intentTag = `${rules.category}:${ctx.dayPart}:${ctx.weather}`;
  const token = `CW-${rid().toUpperCase()}`;

  return {
    id: rid(),
    title,
    body,
    discountPct,
    validUntil,
    reason,
    product,
    intentTag,
    token,
  };
}
