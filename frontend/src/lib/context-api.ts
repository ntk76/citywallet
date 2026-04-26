import { useEffect, useState } from "react";
import { fetchContext, type ContextSignals } from "@/mocks/context";
import { normalizeTimeslot, type TimeslotMinutes } from "@/lib/timeslot";

export type BackendContextEvent = {
  title: string;
  url: string;
  snippet: string;
  imageUrl?: string | null;
};

export type BackendEventsMeta = {
  source: string;
  cacheHit: boolean;
  note?: string | null;
  searchQuery?: string | null;
};

type BackendContextResponse = {
  time: string;
  location: { city: string; region: string };
  timeslot: number;
  events: BackendContextEvent[];
  eventsMeta: BackendEventsMeta;
  dining: BackendContextEvent[];
  diningMeta: BackendEventsMeta;
};

const STUTTGART_CENTER = { lat: 48.7758, lng: 9.1829 };
const BACKEND_BASE_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:8080";

function toPartOfDay(hour: number): ContextSignals["partOfDay"] {
  if (hour < 6) return "night";
  if (hour < 11) return "morning";
  if (hour < 14) return "midday";
  if (hour < 18) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

function normalizeCondition(raw: string): ContextSignals["weather"]["condition"] {
  if (raw === "sunny" || raw === "cloudy" || raw === "rain" || raw === "cold" || raw === "warm") {
    return raw;
  }
  return "cloudy";
}

export type BackendContextPayload = {
  context: ContextSignals;
  events: BackendContextEvent[];
  eventsMeta: BackendEventsMeta;
  dining: BackendContextEvent[];
  diningMeta: BackendEventsMeta;
};

function toTimeslotMinutes(value: number): TimeslotMinutes {
  return normalizeTimeslot(value);
}

function buildFallbackContext(timeslotMin: TimeslotMinutes): ContextSignals {
  return { ...fetchContext(timeslotMin), timeslotMin };
}

export async function fetchBackendContext(timeslotMin: TimeslotMinutes): Promise<BackendContextPayload> {
  const response = await fetch(`${BACKEND_BASE_URL}/context`, {
    method: "GET",
    headers: { "X-Timeslot": String(timeslotMin) },
  });

  if (!response.ok) {
    throw new Error(`Backend context request failed: ${response.status}`);
  }

  const data = (await response.json()) as BackendContextResponse;
  const time = new Date(data.time);
  const hour = Number.isNaN(time.getHours()) ? new Date().getHours() : time.getHours();
  const minute = Number.isNaN(time.getMinutes()) ? new Date().getMinutes() : time.getMinutes();
  const localFallback = buildFallbackContext(timeslotMin);
  const normalizedTimeslot = toTimeslotMinutes(data.timeslot);
  const eventsSource = data.eventsMeta.source === "tavily" ? "tavily" : "fallback";
  const diningSource = data.diningMeta.source === "tavily" ? "tavily" : "fallback";
  const normalizedEvents = data.events.map((event) => ({ ...event, imageUrl: event.imageUrl ?? undefined }));
  const normalizedDining = data.dining.map((event) => ({ ...event, imageUrl: event.imageUrl ?? undefined }));

  return {
    context: {
      weather: {
        condition: normalizeCondition(localFallback.weather.condition),
        temperatureC: localFallback.weather.temperatureC,
        emoji: "📡",
        label: localFallback.weather.label,
      },
      hour,
      minute,
      partOfDay: toPartOfDay(hour),
      location: STUTTGART_CENTER,
      timeslotMin: normalizedTimeslot,
      source: "backend",
      events: normalizedEvents,
      eventsSource,
      dining: normalizedDining,
      diningSource,
      livePois: [],
    },
    events: normalizedEvents,
    eventsMeta: data.eventsMeta,
    dining: normalizedDining,
    diningMeta: data.diningMeta,
  };
}

export function useBackendContext(timeslotMin: TimeslotMinutes) {
  const [ctx, setCtx] = useState<ContextSignals>(() => buildFallbackContext(timeslotMin));

  useEffect(() => {
    let cancelled = false;
    setCtx(buildFallbackContext(timeslotMin));

    fetchBackendContext(timeslotMin)
      .then((remoteCtx) => {
        if (!cancelled) setCtx(remoteCtx.context);
      })
      .catch(() => {
        // Keep mock fallback context when backend is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [timeslotMin]);

  return ctx;
}

export function useBackendContextData(timeslotMin: TimeslotMinutes) {
  const fallback = buildFallbackContext(timeslotMin);
  const [data, setData] = useState<BackendContextPayload>({
    context: fallback,
    events: [],
    eventsMeta: { source: "fallback", cacheHit: false, note: "Backend nicht erreichbar" },
    dining: [],
    diningMeta: { source: "fallback", cacheHit: false, note: "Backend nicht erreichbar" },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const localFallback = buildFallbackContext(timeslotMin);
    setIsLoading(true);
    setIsError(false);
    setData({
      context: localFallback,
      events: [],
      eventsMeta: { source: "fallback", cacheHit: false, note: "Lade Daten..." },
      dining: [],
      diningMeta: { source: "fallback", cacheHit: false, note: "Lade Daten..." },
    });

    fetchBackendContext(timeslotMin)
      .then((remoteData) => {
        if (!cancelled) {
          setData(remoteData);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsError(true);
          setIsLoading(false);
          setData((prev) => ({
            ...prev,
            eventsMeta: { source: "fallback", cacheHit: false, note: "Backend nicht erreichbar" },
            diningMeta: { source: "fallback", cacheHit: false, note: "Backend nicht erreichbar" },
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [timeslotMin]);

  return {
    ...data,
    isLoading,
    isError,
  };
}
