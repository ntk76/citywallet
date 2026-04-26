import { useEffect, useState } from "react";
import { fetchContext, type ContextSignals } from "@/mocks/context";

export type BackendContextEvent = {
  title: string;
  url: string;
  snippet: string;
};

export type BackendEventsMeta = {
  source: string;
  cacheHit: boolean;
  note?: string | null;
};

type BackendContextResponse = {
  time: string;
  location: { city: string; region: string };
  timeslot: number;
  events: BackendContextEvent[];
  eventsMeta: BackendEventsMeta;
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
};

export async function fetchBackendContext(timeslotMin: 15 | 30 | 60): Promise<BackendContextPayload> {
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
  const localFallback = fetchContext(timeslotMin);

  return {
    context: {
      weather: {
        condition: normalizeCondition(localFallback.weather.condition),
        temperatureC: localFallback.weather.temperatureC,
        emoji: "📡",
        label: localFallback.weather.label,
      },
      hour,
      partOfDay: toPartOfDay(hour),
      location: STUTTGART_CENTER,
      timeslotMin: data.timeslot === 15 || data.timeslot === 30 || data.timeslot === 60 ? data.timeslot : timeslotMin,
    },
    events: data.events,
    eventsMeta: data.eventsMeta,
  };
}

export function useBackendContext(timeslotMin: 15 | 30 | 60) {
  const [ctx, setCtx] = useState<ContextSignals>(() => ({ ...fetchContext(timeslotMin), timeslotMin }));

  useEffect(() => {
    let cancelled = false;
    setCtx({ ...fetchContext(timeslotMin), timeslotMin });

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

export function useBackendContextData(timeslotMin: 15 | 30 | 60) {
  const fallback = fetchContext(timeslotMin);
  const [data, setData] = useState<BackendContextPayload>({
    context: { ...fallback, timeslotMin },
    events: [],
    eventsMeta: { source: "fallback", cacheHit: false, note: "Backend nicht erreichbar" },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const localFallback = fetchContext(timeslotMin);
    setIsLoading(true);
    setIsError(false);
    setData({
      context: { ...localFallback, timeslotMin },
      events: [],
      eventsMeta: { source: "fallback", cacheHit: false, note: "Lade Daten..." },
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
