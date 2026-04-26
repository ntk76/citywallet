import { FALLBACK_EVENTS } from "./fallback-events.js";
import type { ContextEvent } from "./types.js";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
};

type TavilyResponse = {
  results?: TavilyResult[];
};

type EventsResult = {
  events: ContextEvent[];
  source: "tavily" | "fallback";
  cacheHit: boolean;
  note?: string;
};

type CacheEntry = {
  value: EventsResult;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

function clampCacheMinutes(value: number): number {
  return Math.max(10, Math.min(30, value));
}

function toEvent(result: TavilyResult): ContextEvent | null {
  if (!result.title || !result.url) return null;
  return {
    title: result.title.trim(),
    url: result.url,
    snippet: (result.content ?? "").trim().slice(0, 220) || "Weitere Details direkt auf der Quelle.",
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
  const query = "Stuttgart Mitte heute events highlights";
  const ttlMinutes = clampCacheMinutes(options.cacheMinutes ?? 20);
  const now = Date.now();
  const cached = cache.get(query);
  if (cached && cached.expiresAt > now) {
    return { ...cached.value, cacheHit: true };
  }

  if (!options.apiKey) {
    const fallback = withFallback("TAVILY_API_KEY fehlt.");
    cache.set(query, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
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
      cache.set(query, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
      return fallback;
    }

    const json = (await response.json()) as TavilyResponse;
    const events = (json.results ?? []).map(toEvent).filter((entry): entry is ContextEvent => entry !== null);

    if (events.length < 3) {
      const fallback = withFallback("Zu wenige Tavily-Treffer.");
      cache.set(query, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
      return fallback;
    }

    const value: EventsResult = {
      events: events.slice(0, 5),
      source: "tavily",
      cacheHit: false,
    };
    cache.set(query, { value, expiresAt: now + ttlMinutes * 60_000 });
    return value;
  } catch {
    const fallback = withFallback("Tavily Timeout oder Netzfehler.");
    cache.set(query, { value: fallback, expiresAt: now + ttlMinutes * 60_000 });
    return fallback;
  } finally {
    clearTimeout(timeoutId);
  }
}
