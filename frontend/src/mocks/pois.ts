import type { LatLng } from "./context";

export type Category = "food" | "events" | "markets" | "museums" | "shopping";

export const categoryMeta: Record<Category, { label: string; emoji: string }> = {
  food: { label: "Food", emoji: "🍝" },
  events: { label: "Events", emoji: "🎤" },
  markets: { label: "Markets", emoji: "🥬" },
  museums: { label: "Museums", emoji: "🖼️" },
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
  imageUrl?: string;
  description: string;
};

// Anchored around Munich Marienplatz (48.1374, 11.5755)
export const POIS: POI[] = [
  {
    id: "cafe-mueller",
    name: "Mueller Cafe",
    category: "food",
    location: { lat: 48.1389, lng: 11.5732 },
    walkMin: 4,
    distanceM: 300,
    openNow: true,
    indoor: true,
    priceLevel: 2,
    tags: ["coffee", "vegan", "breakfast"],
    demand: 0.25,
    imageHue: 22,
    description: "Specialty coffee, house-made pastries, a quiet corner to read.",
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
    tags: ["pasta", "italian"],
    demand: 0.7,
    imageHue: 8,
    description: "Handmade pasta, short menu, big atmosphere.",
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
    description: "Slurpable bowls, steaming hot — perfect when it rains.",
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
    tags: ["fresh", "regional"],
    demand: 0.55,
    imageHue: 95,
    description: "Munich’s oldest market — cheese, flowers, snacks.",
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
    tags: ["organic", "schwabing"],
    demand: 0.4,
    imageHue: 130,
    description: "Schwabing classic — small, personal, regional.",
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
    tags: ["blauer reiter", "indoor", "art"],
    demand: 0.35,
    imageHue: 220,
    description: "Blue Rider & modern art in a gleaming golden building.",
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
    tags: ["science", "indoor", "family"],
    demand: 0.6,
    imageHue: 200,
    description: "Hands-on tech & science — hours fly by.",
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
    tags: ["live", "indie", "evening"],
    demand: 0.5,
    imageHue: 280,
    imageUrl: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=80",
    description: "Tonight: indie live with support act — small stage, big sound.",
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
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
    description: "Short format: talk with the ensemble + bar in the foyer.",
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
    tags: ["design", "gifts"],
    demand: 0.45,
    imageHue: 30,
    description: "Long-lasting goods for life — curated, high quality.",
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
    description: "Architectural highlight with boutiques, cafés & galleries.",
  },
];

export function fetchPois(category?: Category): POI[] {
  return category ? POIS.filter((p) => p.category === category) : POIS;
}

export function fetchPoi(id: string): POI | undefined {
  return POIS.find((p) => p.id === id);
}
