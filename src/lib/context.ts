// Context Sensing — visible signals: time-of-day + weather-mock + optional location stub.
// All client-side; only the derived "intent" gets sent (privacy by design).

export type DayPart = "morning" | "midday" | "afternoon" | "evening" | "night";
export type WeatherKind = "sunny" | "cloudy" | "rainy" | "cold" | "hot";

export interface ContextSignals {
  now: Date;
  dayPart: DayPart;
  weekday: string;
  weather: WeatherKind;
  temperatureC: number;
  neighborhood: string; // location stub
}

export function getDayPart(d: Date): DayPart {
  const h = d.getHours();
  if (h < 6) return "night";
  if (h < 11) return "morning";
  if (h < 14) return "midday";
  if (h < 18) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}

const NEIGHBORHOODS = ["Mitte", "Kreuzberg", "Prenzlauer Berg", "Schanze", "Altstadt"];
const WEATHERS: WeatherKind[] = ["sunny", "cloudy", "rainy", "cold", "hot"];

// Deterministic mock per hour so UI feels stable while still varying.
function seededWeather(d: Date): { weather: WeatherKind; temperatureC: number } {
  const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate() + d.getHours();
  const weather = WEATHERS[seed % WEATHERS.length];
  const baseTemp =
    weather === "hot" ? 28 : weather === "cold" ? 4 : weather === "rainy" ? 12 : weather === "sunny" ? 22 : 17;
  const temperatureC = baseTemp + ((seed % 5) - 2);
  return { weather, temperatureC };
}

export function readContext(now: Date = new Date()): ContextSignals {
  const { weather, temperatureC } = seededWeather(now);
  const neighborhood = NEIGHBORHOODS[now.getDate() % NEIGHBORHOODS.length];
  const weekday = now.toLocaleDateString("de-DE", { weekday: "long" });
  return {
    now,
    dayPart: getDayPart(now),
    weekday,
    weather,
    temperatureC,
    neighborhood,
  };
}

export const WEATHER_LABEL: Record<WeatherKind, string> = {
  sunny: "Sonnig",
  cloudy: "Bewölkt",
  rainy: "Regnerisch",
  cold: "Kalt",
  hot: "Heiß",
};

export const DAYPART_LABEL: Record<DayPart, string> = {
  morning: "Morgen",
  midday: "Mittag",
  afternoon: "Nachmittag",
  evening: "Abend",
  night: "Nacht",
};

export const WEATHER_EMOJI: Record<WeatherKind, string> = {
  sunny: "☀️",
  cloudy: "⛅",
  rainy: "🌧️",
  cold: "🧊",
  hot: "🔥",
};
