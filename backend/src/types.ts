export type TimeslotMinutes = 30 | 60 | 120 | 720 | 1440;

export type ContextEvent = {
  title: string;
  url: string;
  snippet: string;
};

export type DiscoveryCategory = "food" | "events" | "markets" | "museums" | "shopping";

export type DiscoveryItem = {
  id: string;
  name: string;
  category: DiscoveryCategory;
  url: string;
  snippet: string;
};

export type WeatherMock = {
  condition: "sunny" | "cloudy" | "rain" | "cold";
  tempC: number;
  label: string;
};

export type DemandProxy = {
  level: "low" | "medium" | "high";
  score: number;
  reason: string;
};

export type ContextResponse = {
  time: string;
  location: {
    city: "Muenchen";
    region: "Balanstrasse 73";
  };
  weather: WeatherMock;
  timeslot: TimeslotMinutes;
  demandProxy: DemandProxy;
  events: ContextEvent[];
  discoveries: DiscoveryItem[];
  eventsMeta: {
    source: "tavily" | "fallback";
    cacheHit: boolean;
    note?: string;
  };
  weatherMeta: {
    source: "tavily" | "fallback";
    cacheHit: boolean;
    note?: string;
  };
};
