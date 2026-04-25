import { loadJSON, saveJSON } from "@/lib/storage";
import type { PaymentMethod } from "@/lib/prefs";

const KEY = "citywallet.payments.v1";

export type PaymentStatus = "pending_merchant" | "confirmed";

export type PaymentTransaction = {
  id: string;
  transactionId: string;
  poiId?: string;
  poiName?: string;
  method: PaymentMethod;
  amountEur: number;
  discountEur: number;
  totalEur: number;
  status: PaymentStatus;
  createdAt: string;
  confirmedAt?: string;
};

export function listPaymentTransactions(): PaymentTransaction[] {
  return loadJSON<PaymentTransaction[]>(KEY, []);
}

export function addPaymentTransaction(tx: Omit<PaymentTransaction, "id" | "createdAt">): PaymentTransaction {
  const record: PaymentTransaction = {
    ...tx,
    id: `pay-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
  };
  const next = [record, ...listPaymentTransactions()];
  saveJSON(KEY, next);
  window.dispatchEvent(new Event("payments-updated"));
  return record;
}

export function confirmPaymentTransaction(id: string): void {
  const next = listPaymentTransactions().map((tx) =>
    tx.id === id ? { ...tx, status: "confirmed" as const, confirmedAt: new Date().toISOString() } : tx,
  );
  saveJSON(KEY, next);
  window.dispatchEvent(new Event("payments-updated"));
}
