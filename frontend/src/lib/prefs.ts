import { loadJSON, saveJSON } from "./storage";
import type { Category } from "@/mocks/pois";
import { normalizeTimeslot, type TimeslotMinutes } from "@/lib/timeslot";

export type Diet = "none" | "vegetarian" | "vegan" | "glutenfree";
export type PaymentMethod = "applepay" | "googlepay" | "paypal" | "card" | "cash";
export type PaymentProfile = {
  id: string;
  method: PaymentMethod;
  label: string;
  details?: string;
};

export type Preferences = {
  weights: Record<Category, number>; // 0..1
  budget: 1 | 2 | 3;
  radiusM: number;
  diet: Diet;
  indoorWhenRain: boolean;
  defaultTimeslot: TimeslotMinutes;
  paymentMethods: PaymentMethod[];
  preferredPaymentMethod: PaymentMethod;
  paymentProfiles: PaymentProfile[];
  preferredPaymentProfileId?: string;
};

export const DEFAULT_PREFS: Preferences = {
  weights: { food: 0.7, events: 0.5, markets: 0.4, museums: 0.5, shopping: 0.3 },
  budget: 2,
  radiusM: 1500,
  diet: "none",
  indoorWhenRain: true,
  defaultTimeslot: 30,
  paymentMethods: ["applepay", "googlepay", "paypal", "card"],
  preferredPaymentMethod: "applepay",
  paymentProfiles: [],
  preferredPaymentProfileId: undefined,
};

const KEY = "citywallet.prefs.v1";

export function loadPrefs(): Preferences {
  const raw = loadJSON<Partial<Preferences>>(KEY, DEFAULT_PREFS);
  const weights = { ...DEFAULT_PREFS.weights, ...(raw.weights ?? {}) };
  const paymentMethods =
    raw.paymentMethods && raw.paymentMethods.length > 0 ? raw.paymentMethods : DEFAULT_PREFS.paymentMethods;
  const paymentProfiles = raw.paymentProfiles ?? DEFAULT_PREFS.paymentProfiles;
  const preferredPaymentProfileId =
    raw.preferredPaymentProfileId && paymentProfiles.some((p) => p.id === raw.preferredPaymentProfileId)
      ? raw.preferredPaymentProfileId
      : undefined;

  return {
    ...DEFAULT_PREFS,
    ...raw,
    weights,
    paymentMethods,
    paymentProfiles,
    preferredPaymentProfileId,
    defaultTimeslot: normalizeTimeslot(raw.defaultTimeslot ?? DEFAULT_PREFS.defaultTimeslot),
    preferredPaymentMethod:
      raw.preferredPaymentMethod && paymentMethods.includes(raw.preferredPaymentMethod)
        ? raw.preferredPaymentMethod
        : paymentMethods[0] ?? "card",
  };
}
export function savePrefs(p: Preferences) {
  saveJSON(KEY, p);
}
