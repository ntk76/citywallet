import { DEFAULT_RULES, type MerchantRules } from "./offer";
import { loadJSON, saveJSON } from "./storage";

const KEY = "cw.merchant.rules";

export function loadRules(): MerchantRules {
  return loadJSON<MerchantRules>(KEY, DEFAULT_RULES);
}

export function saveRules(r: MerchantRules): void {
  saveJSON(KEY, r);
}

// Mock KPIs derived deterministically from rules (so the dashboard feels alive).
export interface MerchantKPIs {
  impressions: number;
  redemptions: number;
  ctrPct: number;
  revenueEUR: number;
}

export function computeKPIs(rules: MerchantRules, redeemedCount: number): MerchantKPIs {
  const base = 240 + rules.maxDiscountPct * 18;
  const triggerBoost =
    Object.values(rules.triggers).filter(Boolean).length * 80;
  const impressions = base + triggerBoost;
  const redemptions = Math.min(impressions, Math.round(impressions * (rules.maxDiscountPct / 200)) + redeemedCount);
  const ctrPct = Math.round((redemptions / impressions) * 1000) / 10;
  const revenueEUR = redemptions * 7;
  return { impressions, redemptions, ctrPct, revenueEUR };
}
