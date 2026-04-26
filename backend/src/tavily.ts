import { FALLBACK_EVENTS } from "./fallback-events.js";
import type { ContextEvent, DiscoveryCategory, DiscoveryItem, WeatherMock } from "./types.js";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
};

type TavilyResponse = {
  answer?: string;
  results?: TavilyResult[];
};

type EventsResult = {
  events: ContextEvent[];
  source: "tavily" | "fallback";
  cacheHit: boolean;
  note?: string;
};

type DiscoveriesResult = {
  discoveries: DiscoveryItem[];
  source: "tavily" | "fallback";
  cacheHit: boolean;
  note?: string;
};

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

function clampEventCacheMinutes(value: number): number {
  return Math.max(5, Math.min(5, value));
}

function clampWeatherCacheMinutes(value: number): number {
  return Math.max(1, Math.min(5, value));
}

function toEvent(result: TavilyResult): ContextEvent | null {
  if (!result.title || !result.url) return null;
  return {
    title: result.title.trim(),
    url: result.url,
    snippet: (result.content ?? "").trim().slice(0, 220) || "Weitere Details direkt auf der Quelle.",
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

function toDiscovery(result: TavilyResult, category: DiscoveryCategory): DiscoveryItem | null {
  if (!result.title || !result.url) return null;
  return {
    id: `${category}-${slugify(result.title)}`,
    name: result.title.trim().slice(0, 100),
    category,
    url: result.url,
    snippet: (result.content ?? "").trim().slice(0, 220) || "Details direkt auf der Quelle.",
  };
}

function withFallback(note: string, cacheHit = false): EventsResult {
  return {
    events: FALLBACK_EVENTS.slice(0, 5),
    source: "fallback",
    cacheHit,
    note,
  };
}

export async function fetchRelevantEvents(options: {
  apiKey?: string;
  cacheMinutes?: number;
  timeoutMs?: number;
}): Promise<EventsResult> {
  const query = "Muenchen Balanstrasse 73 heute events highlights";
  const cacheKey = `events:${query}`;
  const ttlMinutes = clampEventCacheMinutes(options.cacheMinutes ?? 5);
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return { ...(cached.value as EventsResult), cacheHit: true };
  }

  if (!options.apiKey) {
    const fallback = withFallback("TAVILY_API_KEY fehlt.");
    cache.set(cacheKey, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
    return fallback;
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 6000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: options.apiKey,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const fallback = withFallback(`Tavily HTTP ${response.status}.`);
      cache.set(cacheKey, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
      return fallback;
    }

    const json = (await response.json()) as TavilyResponse;
    const events = (json.results ?? []).map(toEvent).filter((entry): entry is ContextEvent => entry !== null);

    if (events.length < 3) {
      const fallback = withFallback("Zu wenige Tavily-Treffer.");
      cache.set(cacheKey, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
      return fallback;
    }

    const value: EventsResult = {
      events: events.slice(0, 5),
      source: "tavily",
      cacheHit: false,
    };
    cache.set(cacheKey, { value, expiresAt: now + ttlMinutes * 60_000 });
    return value;
  } catch {
    const fallback = withFallback("Tavily Timeout oder Netzfehler.");
    cache.set(cacheKey, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
    return fallback;
  } finally {
    clearTimeout(timeoutId);
  }
}

function discoveryFallback(note: string, cacheHit = false): DiscoveriesResult {
  const discoveries: DiscoveryItem[] = FALLBACK_EVENTS.slice(0, 5).map((event, i) => ({
    id: `fallback-events-${i}`,
    name: event.title,
    category: "events",
    url: event.url,
    snippet: event.snippet,
  }));
  return {
    discoveries,
    source: "fallback",
    cacheHit,
    note,
  };
}

export async function fetchDiscoveries(options: {
  apiKey?: string;
  cacheMinutes?: number;
  timeoutMs?: number;
}): Promise<DiscoveriesResult> {
  const categories: Array<{ category: DiscoveryCategory; query: string }> = [
    { category: "food", query: "Muenchen Balanstrasse 73 heute restaurant cafe empfehlungen" },
    { category: "events", query: "Muenchen Balanstrasse 73 heute events highlights" },
    { category: "markets", query: "Muenchen heute markt wochenmarkt food market" },
    { category: "museums", query: "Muenchen heute museum ausstellung highlights" },
    { category: "shopping", query: "Muenchen heute shopping concept store mall highlights" },
  ];
  const cacheKey = "discoveries:muenchen-balanstrasse-73";
  const ttlMinutes = clampEventCacheMinutes(options.cacheMinutes ?? 5);
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return { ...(cached.value as DiscoveriesResult), cacheHit: true };
  }

  if (!options.apiKey) {
    const fallback = discoveryFallback("TAVILY_API_KEY fehlt.");
    cache.set(cacheKey, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
    return fallback;
  }

  const timeoutMs = options.timeoutMs ?? 6000;
  const tasks = categories.map(async ({ category, query }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: options.apiKey,
          query,
          search_depth: "basic",
          max_results: 3,
          include_answer: false,
          include_raw_content: false,
        }),
        signal: controller.signal,
      });
      if (!response.ok) return [] as DiscoveryItem[];
      const json = (await response.json()) as TavilyResponse;
      return (json.results ?? [])
        .map((result) => toDiscovery(result, category))
        .filter((entry): entry is DiscoveryItem => entry !== null);
    } catch {
      return [] as DiscoveryItem[];
    } finally {
      clearTimeout(timeoutId);
    }
  });

  const batches = await Promise.all(tasks);
  const dedup = new Map<string, DiscoveryItem>();
  for (const item of batches.flat()) {
    const key = item.url.toLowerCase();
    if (!dedup.has(key)) dedup.set(key, item);
  }
  const discoveries = Array.from(dedup.values()).slice(0, 15);

  if (discoveries.length < 5) {
    const fallback = discoveryFallback("Zu wenige Tavily-Highlights fuer Discoveries.");
    cache.set(cacheKey, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
    return fallback;
  }

  const value: DiscoveriesResult = {
    discoveries,
    source: "tavily",
    cacheHit: false,
  };
  cache.set(cacheKey, { value, expiresAt: now + ttlMinutes * 60_000 });
  return value;
}

type WeatherResult = {
  weather: WeatherMock;
  source: "tavily" | "fallback";
  cacheHit: boolean;
  note?: string;
};

function fallbackWeather(note: string, cacheHit = false): WeatherResult {
  return {
    weather: { condition: "cloudy", tempC: 14, label: "Bedeckt und mild" },
    source: "fallback",
    cacheHit,
    note,
  };
}

function parseWeather(text: string): WeatherMock | null {
  const lowered = text.toLowerCase();
  const tempMatch = lowered.match(/(-?\d{1,2})(?:\s*°?\s*c|\s*grad)/i);
  const tempC = tempMatch ? Number(tempMatch[1]) : undefined;

  const condition: WeatherMock["condition"] = lowered.includes("regen") || lowered.includes("rain")
    ? "rain"
    : lowered.includes("sonn") || lowered.includes("sun")
      ? "sunny"
      : lowered.includes("kalt") || lowered.includes("cold") || (tempC !== undefined && tempC <= 6)
        ? "cold"
        : "cloudy";

  if (tempC === undefined && !lowered) return null;
  const resolvedTemp = tempC ?? (condition === "rain" ? 11 : condition === "sunny" ? 21 : condition === "cold" ? 4 : 14);
  const label =
    condition === "rain"
      ? "Regen"
      : condition === "sunny"
        ? "Sonnig"
        : condition === "cold"
          ? "Kalt"
          : "Bewoelkt";

  return { condition, tempC: resolvedTemp, label };
}

export async function fetchWeatherFromTavily(options: {
  apiKey?: string;
  cacheMinutes?: number;
  timeoutMs?: number;
}): Promise<WeatherResult> {
  const query = "aktuelles wetter heute Muenchen Balanstrasse 73 temperatur celsius";
  const cacheKey = `weather:${query}`;
  const ttlMinutes = clampWeatherCacheMinutes(options.cacheMinutes ?? 1);
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return { ...(cached.value as WeatherResult), cacheHit: true };
  }

  if (!options.apiKey) {
    const fallback = fallbackWeather("TAVILY_API_KEY fehlt.");
    cache.set(cacheKey, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
    return fallback;
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 6000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: options.apiKey,
        query,
        search_depth: "basic",
        max_results: 3,
        include_answer: true,
        include_raw_content: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const fallback = fallbackWeather(`Tavily HTTP ${response.status}.`);
      cache.set(cacheKey, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
      return fallback;
    }

    const json = (await response.json()) as TavilyResponse;
    const candidateText = [json.answer, ...(json.results ?? []).map((r) => `${r.title ?? ""} ${r.content ?? ""}`)]
      .filter(Boolean)
      .join(" ");
    const parsed = parseWeather(candidateText);
    if (!parsed) {
      const fallback = fallbackWeather("Kein Wetter aus Tavily ableitbar.");
      cache.set(cacheKey, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
      return fallback;
    }

    const value: WeatherResult = { weather: parsed, source: "tavily", cacheHit: false };
    cache.set(cacheKey, { value, expiresAt: now + ttlMinutes * 60_000 });
    return value;
  } catch {
    const fallback = fallbackWeather("Tavily Timeout oder Netzfehler.");
    cache.set(cacheKey, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
    return fallback;
  } finally {
    clearTimeout(timeoutId);
  }
}
