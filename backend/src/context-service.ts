import { fetchRelevantEvents } from "./tavily.js";
import type { ContextResponse, DemandProxy, WeatherMock } from "./types.js";

export function parseTimeslot(value: string | undefined): 15 | 30 | 60 {
  if (value === "15" || value === "30" || value === "60") return Number(value) as 15 | 30 | 60;
  return 30;
}

function mockWeather(now: Date): WeatherMock {
  const hour = now.getHours();
  if (hour >= 6 && hour < 11) return { condition: "cloudy", tempC: 14, label: "Bedeckt und mild" };
  if (hour >= 11 && hour < 17) return { condition: "sunny", tempC: 21, label: "Sonnig" };
  if (hour >= 17 && hour < 21) return { condition: "rain", tempC: 13, label: "Leichter Regen" };
  return { condition: "cold", tempC: 8, label: "Kuehl am Abend" };
}

function mockDemand(now: Date, timeslot: 15 | 30 | 60): DemandProxy {
  const hour = now.getHours();
  const base = hour >= 17 && hour <= 20 ? 0.78 : hour >= 11 && hour <= 13 ? 0.67 : 0.42;
  const slotBoost = timeslot === 15 ? 0.07 : timeslot === 60 ? -0.05 : 0;
  const score = Math.max(0, Math.min(1, Number((base + slotBoost).toFixed(2))));
  const level: DemandProxy["level"] = score >= 0.7 ? "high" : score >= 0.45 ? "medium" : "low";
  return {
    level,
    score,
    reason: level === "high" ? "Feierabend und hohe Innenstadt-Frequenz" : "Normale Auslastung",
  };
}

export async function buildContext(params: {
  timeslot: 15 | 30 | 60;
  tavilyApiKey?: string;
  cacheMinutes?: number;
  timeoutMs?: number;
}): Promise<ContextResponse> {
  const now = new Date();
  const eventsResult = await fetchRelevantEvents({
    apiKey: params.tavilyApiKey,
    cacheMinutes: params.cacheMinutes,
    timeoutMs: params.timeoutMs,
  });

  return {
    time: now.toISOString(),
    location: {
      city: "Stuttgart",
      region: "Mitte",
    },
    weather: mockWeather(now),
    timeslot: params.timeslot,
    demandProxy: mockDemand(now, params.timeslot),
    events: eventsResult.events.slice(0, 5),
    eventsMeta: {
      source: eventsResult.source,
      cacheHit: eventsResult.cacheHit,
      note: eventsResult.note,
    },
  };
}
