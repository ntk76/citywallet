import type { LatLng } from "./context";

export type Category = "food" | "events" | "markets" | "museums" | "shopping";

export const categoryMeta: Record<Category, { label: string; emoji: string }> = {
  food: { label: "Essen", emoji: "🍝" },
  events: { label: "Events", emoji: "🎤" },
  markets: { label: "Märkte", emoji: "🥬" },
  museums: { label: "Museen", emoji: "🖼️" },
  shopping: { label: "Shopping", emoji: "🛍️" },
};

export type POI = {
  id: string;
  name: string;
  category: Category;
  location: LatLng;
  // estimated walking time in minutes from the anchor location
  walkMin: number;
  distanceM: number;
  openNow: boolean;
  indoor: boolean;
  priceLevel: 1 | 2 | 3;
  tags: string[];
  // simulated demand 0..1 — low demand triggers dynamic offers
  demand: number;
  imageHue: number;
  description: string;
};

// Anchored around Munich Marienplatz (48.1374, 11.5755)
export const POIS: POI[] = [
  {
    id: "cafe-mueller",
    name: "Café Müller",
    category: "food",
    location: { lat: 48.1389, lng: 11.5732 },
    walkMin: 4,
    distanceM: 300,
    openNow: true,
    indoor: true,
    priceLevel: 2,
    tags: ["kaffee", "vegan", "frühstück"],
    demand: 0.25,
    imageHue: 22,
    description: "Spezialitätenkaffee, hausgemachtes Gebäck, ruhige Ecke zum Lesen.",
  },
  {
    id: "trattoria-lorenzo",
    name: "Trattoria Lorenzo",
    category: "food",
    location: { lat: 48.1352, lng: 11.5810 },
    walkMin: 9,
    distanceM: 720,
    openNow: true,
    indoor: true,
    priceLevel: 2,
    tags: ["pasta", "italienisch"],
    demand: 0.7,
    imageHue: 8,
    description: "Handgemachte Pasta, kleine Karte, große Stimmung.",
  },
  {
    id: "ramen-koji",
    name: "Ramen Koji",
    category: "food",
    location: { lat: 48.1402, lng: 11.5770 },
    walkMin: 6,
    distanceM: 480,
    openNow: true,
    indoor: true,
    priceLevel: 2,
    tags: ["ramen", "warm", "indoor"],
    demand: 0.3,
    imageHue: 354,
    description: "Schlürfbare Schalen, dampfend heiß — perfekt bei Regen.",
  },
  {
    id: "viktualienmarkt",
    name: "Viktualienmarkt",
    category: "markets",
    location: { lat: 48.1351, lng: 11.5763 },
    walkMin: 5,
    distanceM: 350,
    openNow: true,
    indoor: false,
    priceLevel: 1,
    tags: ["frisch", "regional"],
    demand: 0.55,
    imageHue: 95,
    description: "Münchens ältester Markt — Käse, Blumen, Brotzeit.",
  },
  {
    id: "wochenmarkt-elisabeth",
    name: "Elisabethmarkt",
    category: "markets",
    location: { lat: 48.1632, lng: 11.5756 },
    walkMin: 22,
    distanceM: 1900,
    openNow: false,
    indoor: false,
    priceLevel: 1,
    tags: ["bio", "schwabing"],
    demand: 0.4,
    imageHue: 130,
    description: "Schwabinger Klassiker — kleiner, persönlicher, regional.",
  },
  {
    id: "lenbachhaus",
    name: "Lenbachhaus",
    category: "museums",
    location: { lat: 48.1463, lng: 11.5645 },
    walkMin: 14,
    distanceM: 1100,
    openNow: true,
    indoor: true,
    priceLevel: 2,
    tags: ["blauer reiter", "indoor", "kunst"],
    demand: 0.35,
    imageHue: 220,
    description: "Blauer Reiter & moderne Kunst in glänzendem Goldbau.",
  },
  {
    id: "deutsches-museum",
    name: "Deutsches Museum",
    category: "museums",
    location: { lat: 48.1300, lng: 11.5836 },
    walkMin: 12,
    distanceM: 950,
    openNow: true,
    indoor: true,
    priceLevel: 2,
    tags: ["technik", "indoor", "familie"],
    demand: 0.6,
    imageHue: 200,
    description: "Tech & Wissenschaft zum Anfassen — Stunden vergehen wie Minuten.",
  },
  {
    id: "muffatwerk-konzert",
    name: "Muffatwerk: Indie Live",
    category: "events",
    location: { lat: 48.1316, lng: 11.5895 },
    walkMin: 16,
    distanceM: 1300,
    openNow: true,
    indoor: true,
    priceLevel: 3,
    tags: ["live", "indie", "abend"],
    demand: 0.5,
    imageHue: 280,
    description: "Heute Abend: Indie-Live mit Support — kleine Bühne, große Bands.",
  },
  {
    id: "kammerspiele-talk",
    name: "Kammerspiele: Talk & Drinks",
    category: "events",
    location: { lat: 48.1389, lng: 11.5790 },
    walkMin: 5,
    distanceM: 380,
    openNow: true,
    indoor: true,
    priceLevel: 2,
    tags: ["theater", "talk"],
    demand: 0.2,
    imageHue: 320,
    description: "Kurzformat: Gespräch mit Ensemble + Bar im Foyer.",
  },
  {
    id: "manufactum",
    name: "Manufactum",
    category: "shopping",
    location: { lat: 48.1413, lng: 11.5758 },
    walkMin: 6,
    distanceM: 460,
    openNow: true,
    indoor: true,
    priceLevel: 3,
    tags: ["design", "geschenk"],
    demand: 0.45,
    imageHue: 30,
    description: "Langlebige Dinge fürs Leben — kuratiert, hochwertig.",
  },
  {
    id: "fuenf-hoefe",
    name: "Fünf Höfe",
    category: "shopping",
    location: { lat: 48.1404, lng: 11.5740 },
    walkMin: 5,
    distanceM: 360,
    openNow: true,
    indoor: true,
    priceLevel: 2,
    tags: ["mall", "indoor"],
    demand: 0.35,
    imageHue: 50,
    description: "Architektur-Highlight mit Boutiquen, Cafés & Galerien.",
  },
];

export function fetchPois(category?: Category): POI[] {
  return category ? POIS.filter((p) => p.category === category) : POIS;
}

export function fetchPoi(id: string): POI | undefined {
  return POIS.find((p) => p.id === id);
}
