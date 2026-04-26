import { useEffect, useState } from "react";
import { fetchContext, type ContextSignals } from "@/mocks/context";
import type { POI, Category } from "@/mocks/pois";
import { normalizeTimeslot, type TimeslotMinutes } from "@/lib/timeslot";

type BackendEventItem = {
  title: string;
  url: string;
  snippet: string;
  imageUrl?: string;
  imageSource?: "tavily" | "og";
};

type BackendEventsMeta = {
  source: "tavily" | "fallback";
  cacheHit: boolean;
  note?: string;
  /** Tavily search phrase used by the backend (Munich / Balanstrasse by default). */
  searchQuery?: string;
};

/** `GET /events` — events + dining from Tavily (two queries on the backend). */
type BackendEventsPayload = {
  events: BackendEventItem[];
  eventsMeta?: BackendEventsMeta;
  dining?: BackendEventItem[];
  diningMeta?: BackendEventsMeta;
};

type BackendContext = {
  time: string;
  weather: {
    condition: "sunny" | "cloudy" | "rain" | "cold";
    tempC: number;
    label: string;
  };
  timeslot: number;
  discoveries?: Array<{
    id: string;
    name: string;
    category: Category;
    url: string;
    snippet: string;
  }>;
  events: BackendEventItem[];
  eventsMeta?: BackendEventsMeta;
  weatherMeta?: {
    source: "tavily" | "fallback";
    cacheHit: boolean;
    note?: string;
  };
};

const MUENCHEN_BALANSTRASSE_73 = { lat: 48.1192, lng: 11.5946 };
const API_BASE = import.meta.env.VITE_CONTEXT_API_URL ?? "http://localhost:8787";

const emojiByCondition: Record<BackendContext["weather"]["condition"], string> = {
  sunny: "☀️",
  cloudy: "⛅",
  rain: "🌧️",
  cold: "🥶",
};

const cache = new Map<string, { value: ContextSignals; expiresAt: number }>();

function partOfDay(hour: number): ContextSignals["partOfDay"] {
  if (hour < 6) return "night";
  if (hour < 11) return "morning";
  if (hour < 14) return "midday";
  if (hour < 18) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

function hueByCategory(category: Category): number {
  return (
    {
      food: 24,
      events: 280,
      markets: 95,
      museums: 220,
      shopping: 35,
    } as const
  )[category];
}

function mapDiscoveriesToPois(discoveries: NonNullable<BackendContext["discoveries"]>): POI[] {
  return discoveries.map((item, idx) => {
    const distanceM = 250 + ((idx % 8) + 1) * 140;
    return {
      id: `live-${item.id}`,
      name: item.name,
      category: item.category,
      location: {
        lat: MUENCHEN_BALANSTRASSE_73.lat + (idx % 5) * 0.0012,
        lng: MUENCHEN_BALANSTRASSE_73.lng + (idx % 4) * 0.0011,
      },
      walkMin: Math.max(3, Math.round(distanceM / 95)),
      distanceM,
      openNow: true,
      indoor: item.category !== "markets",
      priceLevel: item.category === "shopping" ? 3 : item.category === "markets" ? 1 : 2,
      tags: [item.category, "live", "tavily"],
      demand: 0.35 + ((idx % 4) * 0.1),
      imageHue: hueByCategory(item.category),
      description: item.snippet,
    };
  });
}

async function fetchLiveContext(timeslotMin: TimeslotMinutes): Promise<ContextSignals> {
  const key = String(timeslotMin);
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return cached.value;

  let contextRes: Response;
  let eventsRes: Response;
  try {
    [contextRes, eventsRes] = await Promise.all([
      fetch(`${API_BASE}/context`, {
        headers: {
          "X-Timeslot": String(timeslotMin),
        },
      }),
      fetch(`${API_BASE}/events`),
    ]);
  } catch {
    console.warn("[context-api] backend fetch failed, using mock", { timeslotMin, apiBase: API_BASE });
    return fetchContext(timeslotMin);
  }

  let eventsPayload: BackendEventsPayload | null = null;
  if (eventsRes.ok) {
    try {
      eventsPayload = (await eventsRes.json()) as BackendEventsPayload;
    } catch {
      eventsPayload = null;
    }
  }

  if (!contextRes.ok) {
    if (eventsPayload?.events?.length) {
      const base = fetchContext(timeslotMin);
      const merged: ContextSignals = {
        ...base,
        source: "backend",
        events: eventsPayload.events,
        eventsSource: eventsPayload.eventsMeta?.source ?? "fallback",
        dining: eventsPayload.dining ?? [],
        diningSource: eventsPayload.diningMeta?.source ?? "fallback",
      };
      console.info("[context-api] /context unavailable; using /events only", {
        timeslotMin,
        apiBase: API_BASE,
        eventsSource: merged.eventsSource,
        searchQuery: eventsPayload.eventsMeta?.searchQuery,
      });
      cache.set(key, { value: merged, expiresAt: now + 60_000 });
      return merged;
    }
    console.warn("[context-api] /context not ok and no /events", {
      timeslotMin,
      apiBase: API_BASE,
      contextStatus: contextRes.status,
      eventsStatus: eventsRes.status,
    });
    return fetchContext(timeslotMin);
  }

  try {
    const json = (await contextRes.json()) as BackendContext;
    const date = new Date(json.time);
    const hour = date.getHours();
    const minute = date.getMinutes();

    const eventsList = eventsPayload?.events?.length ? eventsPayload.events : (json.events ?? []);
    const eventsSource = eventsPayload?.events?.length
      ? (eventsPayload.eventsMeta?.source ?? "fallback")
      : (json.eventsMeta?.source ?? "fallback");

    const diningList = eventsPayload?.dining?.length
      ? eventsPayload.dining
      : (json.dining ?? []);
    const diningSource = eventsPayload?.dining?.length
      ? (eventsPayload.diningMeta?.source ?? "fallback")
      : (json.diningMeta?.source ?? "fallback");

    const mapped: ContextSignals = {
      weather: {
        condition: json.weather.condition,
        temperatureC: json.weather.tempC,
        emoji: emojiByCondition[json.weather.condition] ?? "⛅",
        label: json.weather.label,
      },
      hour,
      minute,
      partOfDay: partOfDay(hour),
      location: MUENCHEN_BALANSTRASSE_73,
      timeslotMin: normalizeTimeslot(json.timeslot),
      source:
        eventsSource === "tavily" ||
        diningSource === "tavily" ||
        json.eventsMeta?.source === "tavily" ||
        json.diningMeta?.source === "tavily" ||
        json.weatherMeta?.source === "tavily"
          ? "backend"
          : "mock",
      events: eventsList,
      eventsSource,
      dining: diningList,
      diningSource,
      livePois: mapDiscoveriesToPois(json.discoveries ?? []),
    };

    console.info("[context-api] backend /context + /events", {
      timeslotMin,
      apiBase: API_BASE,
      eventsSource: mapped.eventsSource,
      diningSource: mapped.diningSource,
      eventsFromEndpoint: Boolean(eventsPayload?.events?.length),
      diningFromEndpoint: Boolean(eventsPayload?.dining?.length),
      eventsSearchQuery: eventsPayload?.eventsMeta?.searchQuery ?? json.eventsMeta?.searchQuery,
      diningSearchQuery: eventsPayload?.diningMeta?.searchQuery ?? json.diningMeta?.searchQuery,
      contextEventsCacheHit: json.eventsMeta?.cacheHit,
      eventsEndpointCacheHit: eventsPayload?.eventsMeta?.cacheHit,
    });
    cache.set(key, { value: mapped, expiresAt: now + 60_000 });
    return mapped;
  } catch {
    console.warn("[context-api] /context JSON error, using mock", { timeslotMin, apiBase: API_BASE });
    return fetchContext(timeslotMin);
  }
}

export function useContextSignals(timeslotMin: TimeslotMinutes): ContextSignals {
  const [ctx, setCtx] = useState<ContextSignals>(() => fetchContext(timeslotMin));

  useEffect(() => {
    let active = true;
    const sync = () =>
      fetchLiveContext(timeslotMin).then((next) => {
        if (active) setCtx(next);
      });

    sync();
    const intervalId = window.setInterval(sync, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [timeslotMin]);

  return ctx;
}
