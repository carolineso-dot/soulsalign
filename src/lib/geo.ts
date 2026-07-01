/**
 * Place → latitude/longitude, from a bundled city dataset so birth-place
 * lookup works fully offline (no external geocoding dependency).
 *
 * Matching is forgiving: case-insensitive substring against city or
 * "city, country". Good enough for sun/moon/rising, which only need an
 * approximate location.
 */

export type City = {
  name: string;
  country: string;
  lat: number;
  lon: number;
};

export const CITIES: City[] = [
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lon: 101.6869 },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Manila", country: "Philippines", lat: 14.5995, lon: 120.9842 },
  { name: "Hong Kong", country: "China", lat: 22.3193, lon: 114.1694 },
  { name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737 },
  { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
  { name: "Taipei", country: "Taiwan", lat: 25.033, lon: 121.5654 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Osaka", country: "Japan", lat: 34.6937, lon: 135.5023 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.978 },
  { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
  { name: "Delhi", country: "India", lat: 28.7041, lon: 77.1025 },
  { name: "Bangalore", country: "India", lat: 12.9716, lon: 77.5946 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lon: 144.9631 },
  { name: "Auckland", country: "New Zealand", lat: -36.8485, lon: 174.7633 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Manchester", country: "United Kingdom", lat: 53.4808, lon: -2.2426 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038 },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lon: 2.1734 },
  { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964 },
  { name: "Milan", country: "Italy", lat: 45.4642, lon: 9.19 },
  { name: "Zurich", country: "Switzerland", lat: 47.3769, lon: 8.5417 },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686 },
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lon: 12.5683 },
  { name: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603 },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393 },
  { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784 },
  { name: "Tel Aviv", country: "Israel", lat: 32.0853, lon: 34.7818 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473 },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  { name: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437 },
  { name: "San Francisco", country: "United States", lat: 37.7749, lon: -122.4194 },
  { name: "Chicago", country: "United States", lat: 41.8781, lon: -87.6298 },
  { name: "Seattle", country: "United States", lat: 47.6062, lon: -122.3321 },
  { name: "Boston", country: "United States", lat: 42.3601, lon: -71.0589 },
  { name: "Austin", country: "United States", lat: 30.2672, lon: -97.7431 },
  { name: "Miami", country: "United States", lat: 25.7617, lon: -80.1918 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832 },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lon: -123.1207 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816 },
  { name: "Santiago", country: "Chile", lat: -33.4489, lon: -70.6693 },
  { name: "Bogotá", country: "Colombia", lat: 4.711, lon: -74.0721 },
];

export type GeoResult = {
  label: string;
  lat: number;
  lon: number;
};

/** Best-effort lookup of a free-text place. Returns null if nothing matches. */
export function lookupPlace(query: string): GeoResult | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // Try exact city name first, then substring on "city, country".
  const exact = CITIES.find((c) => c.name.toLowerCase() === q);
  const hit =
    exact ??
    CITIES.find((c) => `${c.name}, ${c.country}`.toLowerCase().includes(q)) ??
    CITIES.find((c) => c.name.toLowerCase().includes(q)) ??
    CITIES.find((c) => c.country.toLowerCase().includes(q));

  if (!hit) return null;
  return { label: `${hit.name}, ${hit.country}`, lat: hit.lat, lon: hit.lon };
}

/** City names for an autocomplete datalist. */
export function cityOptions(): string[] {
  return CITIES.map((c) => `${c.name}, ${c.country}`);
}

/** Great-circle distance in kilometres between two lat/long points. */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius (km)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
