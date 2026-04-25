// Simulated redemption API. Returns success/fail with a small failure rate.
import { loadJSON, saveJSON } from "./storage";

export type RedemptionStatus = "pending" | "redeemed" | "failed";

export interface RedemptionRecord {
  token: string;
  product: string;
  discountPct: number;
  merchantName: string;
  intentTag: string;
  createdAt: number;
  status: RedemptionStatus;
  redeemedAt?: number;
}

const KEY = "cw.redemptions";

export function listRedemptions(): RedemptionRecord[] {
  return loadJSON<RedemptionRecord[]>(KEY, []);
}

export function saveRedemption(r: RedemptionRecord): void {
  const all = listRedemptions();
  const idx = all.findIndex((x) => x.token === r.token);
  if (idx >= 0) all[idx] = r;
  else all.unshift(r);
  saveJSON(KEY, all.slice(0, 50));
}

export function getRedemption(token: string): RedemptionRecord | undefined {
  return listRedemptions().find((r) => r.token === token);
}

export async function simulateRedeem(token: string): Promise<{ ok: boolean; message: string }> {
  await new Promise((res) => setTimeout(res, 900));
  // 90% success
  const ok = Math.random() > 0.1;
  const rec = getRedemption(token);
  if (rec) {
    rec.status = ok ? "redeemed" : "failed";
    rec.redeemedAt = Date.now();
    saveRedemption(rec);
  }
  return {
    ok,
    message: ok
      ? "Token validiert. Genießen Sie Ihr Angebot."
      : "Token konnte nicht eingelöst werden. Bitte erneut versuchen.",
  };
}
