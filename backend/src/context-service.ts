import { fetchDiscoveries, fetchRelevantEvents, fetchWeatherFromTavily } from "./tavily.js";
import type { ContextResponse, DemandProxy, TimeslotMinutes, WeatherMock } from "./types.js";

export function parseTimeslot(value: string | undefined): TimeslotMinutes {
  const v = value ?? "30";
  if (v === "30" || v === "60" || v === "120" || v === "720" || v === "1440") return Number(v) as TimeslotMinutes;
  if (v === "15") return 30;
  return 30;
}

function toBerlinIso(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "shortOffset",
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const rawOffset = map.timeZoneName?.replace("GMT", "") ?? "+00";
  const normalizedOffset = (() => {
    if (rawOffset.includes(":")) return rawOffset;
    const sign = rawOffset.startsWith("-") ? "-" : "+";
    const digits = rawOffset.replace(/[+-]/g, "");
    const hh = digits.padStart(2, "0");
    return `${sign}${hh}:00`;
  })();

  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}${normalizedOffset}`;
}

function mockWeather(now: Date): WeatherMock {
  const hour = now.getHours();
  if (hour >= 6 && hour < 11) return { condition: "cloudy", tempC: 14, label: "Bedeckt und mild" };
  if (hour >= 11 && hour < 17) return { condition: "sunny", tempC: 21, label: "Sonnig" };
  if (hour >= 17 && hour < 21) return { condition: "rain", tempC: 13, label: "Leichter Regen" };
  return { condition: "cold", tempC: 8, label: "Kuehl am Abend" };
}

function mockDemand(now: Date, timeslot: TimeslotMinutes): DemandProxy {
  const hour = now.getHours();
  const base = hour >= 17 && hour <= 20 ? 0.78 : hour >= 11 && hour <= 13 ? 0.67 : 0.42;
  const slotBoost =
    timeslot === 30 ? 0.05 : timeslot === 60 ? 0 : timeslot === 120 ? -0.03 : timeslot === 720 ? -0.08 : -0.1;
  const score = Math.max(0, Math.min(1, Number((base + slotBoost).toFixed(2))));
  const level: DemandProxy["level"] = score >= 0.7 ? "high" : score >= 0.45 ? "medium" : "low";
  return {
    level,
    score,
    reason: level === "high" ? "Feierabend und hohe Innenstadt-Frequenz" : "Normale Auslastung",
  };
}

export async function buildContext(params: {
  timeslot: TimeslotMinutes;
  tavilyApiKey?: string;
  cacheMinutes?: number;
  timeoutMs?: number;
}): Promise<ContextResponse> {
  const now = new Date();
  const [eventsResult, weatherResult, discoveryResult] = await Promise.all([
    fetchRelevantEvents({
      apiKey: params.tavilyApiKey,
      cacheMinutes: params.cacheMinutes,
      timeoutMs: params.timeoutMs,
    }),
    fetchWeatherFromTavily({
      apiKey: params.tavilyApiKey,
      cacheMinutes: params.cacheMinutes,
      timeoutMs: params.timeoutMs,
    }),
    fetchDiscoveries({
      apiKey: params.tavilyApiKey,
      cacheMinutes: params.cacheMinutes,
      timeoutMs: params.timeoutMs,
    }),
  ]);
  const weather = weatherResult.source === "tavily" ? weatherResult.weather : mockWeather(now);

  return {
    time: toBerlinIso(now),
    location: {
      city: "Muenchen",
      region: "Balanstrasse 73",
    },
    weather,
    timeslot: params.timeslot,
    demandProxy: mockDemand(now, params.timeslot),
    events: eventsResult.events.slice(0, 5),
    discoveries: discoveryResult.discoveries,
    eventsMeta: {
      source: eventsResult.source,
      cacheHit: eventsResult.cacheHit,
      note: eventsResult.note ?? discoveryResult.note,
    },
    weatherMeta: {
      source: weatherResult.source,
      cacheHit: weatherResult.cacheHit,
      note: weatherResult.note,
    },
  };
}
