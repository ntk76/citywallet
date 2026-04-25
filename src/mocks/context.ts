// Mock context API: weather + time + location + timeslot
export type Weather = {
  condition: "sunny" | "cloudy" | "rain" | "cold" | "warm";
  temperatureC: number;
  emoji: string;
  label: string;
};

export type LatLng = { lat: number; lng: number };

export type ContextSignals = {
  weather: Weather;
  hour: number;
  partOfDay: "morning" | "midday" | "afternoon" | "evening" | "night";
  location: LatLng;
  timeslotMin: 15 | 30 | 60;
};

const conditions: Weather[] = [
  { condition: "sunny", temperatureC: 24, emoji: "☀️", label: "Sonnig" },
  { condition: "warm", temperatureC: 28, emoji: "🌤️", label: "Warm" },
  { condition: "cloudy", temperatureC: 17, emoji: "⛅", label: "Bewölkt" },
  { condition: "rain", temperatureC: 12, emoji: "🌧️", label: "Regen" },
  { condition: "cold", temperatureC: 4, emoji: "🥶", label: "Kalt" },
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
export function fetchContext(timeslotMin: 15 | 30 | 60 = 30): ContextSignals {
  const now = new Date();
  const day = now.getDate();
  const weather = conditions[day % conditions.length];
  const hour = now.getHours();
  return {
    weather,
    hour,
    partOfDay: partOfDay(hour),
    // München Marienplatz as anchor
    location: { lat: 48.1374, lng: 11.5755 },
    timeslotMin,
  };
}
