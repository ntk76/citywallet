export type ContextEvent = {
  title: string;
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
    city: "Stuttgart";
    region: "Mitte";
  };
  weather: WeatherMock;
  timeslot: 15 | 30 | 60;
  demandProxy: DemandProxy;
  events: ContextEvent[];
  eventsMeta: {
    source: "tavily" | "fallback";
    cacheHit: boolean;
    note?: string;
  };
};
