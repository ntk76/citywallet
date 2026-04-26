import type { PaymentMethod } from "@/lib/prefs";

export type PayResult = {
  success: boolean;
  method: PaymentMethod;
  amountEur: number;
  message: string;
  transactionId?: string;
};

export async function payInvoice(method: PaymentMethod, amountEur: number): Promise<PayResult> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const ok = amountEur > 0 && Math.random() < 0.9;
  if (!ok) {
    return {
      success: false,
      method,
      amountEur,
      message: "Payment failed. Try another method or try again.",
    };
  }

  return {
    success: true,
    method,
    amountEur,
    message: "Payment completed successfully.",
    transactionId: `TX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  };
}
