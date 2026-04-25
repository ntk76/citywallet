import { loadJSON, saveJSON } from "./storage";
import type { Category } from "@/mocks/pois";

export type Diet = "none" | "vegetarian" | "vegan" | "glutenfree";

export type Preferences = {
  weights: Record<Category, number>; // 0..1
  budget: 1 | 2 | 3;
  radiusM: number;
  diet: Diet;
  indoorWhenRain: boolean;
  defaultTimeslot: 15 | 30 | 60;
};

export const DEFAULT_PREFS: Preferences = {
  weights: { food: 0.7, events: 0.5, markets: 0.4, museums: 0.5, shopping: 0.3 },
  budget: 2,
  radiusM: 1500,
  diet: "none",
  indoorWhenRain: true,
  defaultTimeslot: 30,
};

const KEY = "citywallet.prefs.v1";

export function loadPrefs(): Preferences {
  return loadJSON<Preferences>(KEY, DEFAULT_PREFS);
}
export function savePrefs(p: Preferences) {
  saveJSON(KEY, p);
}
