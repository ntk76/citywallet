// Simulated redeem API
export type RedeemResult = {
  success: boolean;
  token: string;
  message: string;
  redeemedAt?: string;
};

export async function redeemToken(token: string): Promise<RedeemResult> {
  await new Promise((r) => setTimeout(r, 700));
  // 85% success
  const ok = Math.random() < 0.85 && token.length > 4;
  return ok
    ? { success: true, token, message: "Redeemed — enjoy!", redeemedAt: new Date().toISOString() }
    : { success: false, token, message: "Token invalid or expired." };
}
