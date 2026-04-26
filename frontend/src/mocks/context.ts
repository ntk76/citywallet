import type { TimeslotMinutes } from "@/lib/timeslot";
import { normalizeTimeslot } from "@/lib/timeslot";

// Mock context API: weather + time + location + timeslot
export type Weather = {
  condition: "sunny" | "cloudy" | "rain" | "cold" | "warm";
  temperatureC: number;
  emoji: string;
  label: string;
};

export type LatLng = { lat: number; lng: number };
export type LivePoi = {
  id: string;
  name: string;
  category: "food" | "events" | "markets" | "museums" | "shopping";
  location: LatLng;
  walkMin: number;
  distanceM: number;
  openNow: boolean;
  indoor: boolean;
  priceLevel: 1 | 2 | 3;
  tags: string[];
  demand: number;
  imageHue: number;
  imageUrl?: string;
  description: string;
};

export type ContextSignals = {
  weather: Weather;
  hour: number;
  minute: number;
  partOfDay: "morning" | "midday" | "afternoon" | "evening" | "night";
  location: LatLng;
  timeslotMin: TimeslotMinutes;
  source: "mock" | "backend";
  events: Array<{
    title: string;
    url: string;
    snippet: string;
    imageUrl?: string;
    imageSource?: "tavily" | "og";
  }>;
  eventsSource: "tavily" | "fallback";
  livePois: LivePoi[];
};

const conditions: Weather[] = [
  { condition: "sunny", temperatureC: 24, emoji: "☀️", label: "Sunny" },
  { condition: "warm", temperatureC: 28, emoji: "🌤️", label: "Warm" },
  { condition: "cloudy", temperatureC: 17, emoji: "⛅", label: "Cloudy" },
  { condition: "rain", temperatureC: 12, emoji: "🌧️", label: "Rain" },
  { condition: "cold", temperatureC: 4, emoji: "🥶", label: "Cold" },
];

function partOfDay(hour: number): ContextSignals["partOfDay"] {
  if (hour < 6) return "night";
  if (hour < 11) return "morning";
  if (hour < 14) return "midday";
  if (hour < 18) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

// Deterministic-ish weather based on date so it's stable across navigation
export function fetchContext(timeslotMin: TimeslotMinutes | number = 30): ContextSignals {
  const slot = normalizeTimeslot(timeslotMin);
  const now = new Date();
  const day = now.getDate();
  const weather = conditions[day % conditions.length];
  const hour = now.getHours();
  const minute = now.getMinutes();
  return {
    weather,
    hour,
    minute,
    partOfDay: partOfDay(hour),
    // Muenchen Balanstrasse 73 as anchor
    location: { lat: 48.1192, lng: 11.5946 },
    timeslotMin: slot,
    source: "mock",
    events: [],
    eventsSource: "fallback",
    livePois: [],
  };
}
