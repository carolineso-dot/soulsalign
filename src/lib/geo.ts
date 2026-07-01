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

  // ---- Africa ----
  { name: "Casablanca", country: "Morocco", lat: 33.5731, lon: -7.5898 },
  { name: "Rabat", country: "Morocco", lat: 34.0209, lon: -6.8416 },
  { name: "Marrakesh", country: "Morocco", lat: 31.6295, lon: -7.9811 },
  { name: "Tangier", country: "Morocco", lat: 35.7595, lon: -5.834 },
  { name: "Fez", country: "Morocco", lat: 34.0181, lon: -5.0078 },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219 },
  { name: "Accra", country: "Ghana", lat: 5.6037, lon: -0.187 },
  { name: "Addis Ababa", country: "Ethiopia", lat: 9.03, lon: 38.74 },
  { name: "Dar es Salaam", country: "Tanzania", lat: -6.7924, lon: 39.2083 },
  { name: "Kampala", country: "Uganda", lat: 0.3476, lon: 32.5825 },
  { name: "Dakar", country: "Senegal", lat: 14.7167, lon: -17.4677 },
  { name: "Abidjan", country: "Côte d'Ivoire", lat: 5.36, lon: -4.0083 },
  { name: "Tunis", country: "Tunisia", lat: 36.8065, lon: 10.1815 },
  { name: "Algiers", country: "Algeria", lat: 36.7538, lon: 3.0588 },
  { name: "Kigali", country: "Rwanda", lat: -1.9706, lon: 30.1044 },
  { name: "Luanda", country: "Angola", lat: -8.839, lon: 13.2894 },

  // ---- Middle East ----
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753 },
  { name: "Jeddah", country: "Saudi Arabia", lat: 21.4858, lon: 39.1925 },
  { name: "Abu Dhabi", country: "UAE", lat: 24.4539, lon: 54.3773 },
  { name: "Doha", country: "Qatar", lat: 25.2854, lon: 51.531 },
  { name: "Kuwait City", country: "Kuwait", lat: 29.3759, lon: 47.9774 },
  { name: "Manama", country: "Bahrain", lat: 26.2285, lon: 50.586 },
  { name: "Muscat", country: "Oman", lat: 23.588, lon: 58.3829 },
  { name: "Amman", country: "Jordan", lat: 31.9454, lon: 35.9284 },
  { name: "Beirut", country: "Lebanon", lat: 33.8938, lon: 35.5018 },
  { name: "Tehran", country: "Iran", lat: 35.6892, lon: 51.389 },
  { name: "Jerusalem", country: "Israel", lat: 31.7683, lon: 35.2137 },

  // ---- Asia ----
  { name: "Guangzhou", country: "China", lat: 23.1291, lon: 113.2644 },
  { name: "Shenzhen", country: "China", lat: 22.5431, lon: 114.0579 },
  { name: "Chengdu", country: "China", lat: 30.5728, lon: 104.0668 },
  { name: "Kyoto", country: "Japan", lat: 35.0116, lon: 135.7681 },
  { name: "Busan", country: "South Korea", lat: 35.1796, lon: 129.0756 },
  { name: "Hanoi", country: "Vietnam", lat: 21.0278, lon: 105.8342 },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lon: 106.6297 },
  { name: "Phnom Penh", country: "Cambodia", lat: 11.5564, lon: 104.9282 },
  { name: "Chiang Mai", country: "Thailand", lat: 18.7883, lon: 98.9853 },
  { name: "Bali", country: "Indonesia", lat: -8.4095, lon: 115.1889 },
  { name: "Chennai", country: "India", lat: 13.0827, lon: 80.2707 },
  { name: "Hyderabad", country: "India", lat: 17.385, lon: 78.4867 },
  { name: "Kolkata", country: "India", lat: 22.5726, lon: 88.3639 },
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011 },
  { name: "Lahore", country: "Pakistan", lat: 31.5204, lon: 74.3587 },
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lon: 90.4125 },
  { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lon: 79.8612 },
  { name: "Kathmandu", country: "Nepal", lat: 27.7172, lon: 85.324 },
  { name: "Almaty", country: "Kazakhstan", lat: 43.222, lon: 76.8512 },

  // ---- Europe ----
  { name: "Munich", country: "Germany", lat: 48.1351, lon: 11.582 },
  { name: "Hamburg", country: "Germany", lat: 53.5511, lon: 9.9937 },
  { name: "Frankfurt", country: "Germany", lat: 50.1109, lon: 8.6821 },
  { name: "Brussels", country: "Belgium", lat: 50.8503, lon: 4.3517 },
  { name: "Geneva", country: "Switzerland", lat: 46.2044, lon: 6.1432 },
  { name: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522 },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lon: 24.9384 },
  { name: "Reykjavik", country: "Iceland", lat: 64.1466, lon: -21.9426 },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122 },
  { name: "Prague", country: "Czechia", lat: 50.0755, lon: 14.4378 },
  { name: "Budapest", country: "Hungary", lat: 47.4979, lon: 19.0402 },
  { name: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275 },
  { name: "Bucharest", country: "Romania", lat: 44.4268, lon: 26.1025 },
  { name: "Kyiv", country: "Ukraine", lat: 50.4501, lon: 30.5234 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173 },
  { name: "Edinburgh", country: "United Kingdom", lat: 55.9533, lon: -3.1883 },
  { name: "Porto", country: "Portugal", lat: 41.1579, lon: -8.6291 },
  { name: "Valencia", country: "Spain", lat: 39.4699, lon: -0.3763 },
  { name: "Naples", country: "Italy", lat: 40.8518, lon: 14.2681 },

  // ---- North America ----
  { name: "Washington, D.C.", country: "United States", lat: 38.9072, lon: -77.0369 },
  { name: "Atlanta", country: "United States", lat: 33.749, lon: -84.388 },
  { name: "Denver", country: "United States", lat: 39.7392, lon: -104.9903 },
  { name: "Portland", country: "United States", lat: 45.5152, lon: -122.6784 },
  { name: "San Diego", country: "United States", lat: 32.7157, lon: -117.1611 },
  { name: "Nashville", country: "United States", lat: 36.1627, lon: -86.7816 },
  { name: "Montreal", country: "Canada", lat: 45.5019, lon: -73.5674 },
  { name: "Calgary", country: "Canada", lat: 51.0447, lon: -114.0719 },
  { name: "Guadalajara", country: "Mexico", lat: 20.6597, lon: -103.3496 },

  // ---- South America ----
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729 },
  { name: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428 },
  { name: "Quito", country: "Ecuador", lat: -0.1807, lon: -78.4678 },
  { name: "Montevideo", country: "Uruguay", lat: -34.9011, lon: -56.1645 },
  { name: "Caracas", country: "Venezuela", lat: 10.4806, lon: -66.9036 },
  { name: "Medellín", country: "Colombia", lat: 6.2442, lon: -75.5812 },

  // ---- Oceania ----
  { name: "Brisbane", country: "Australia", lat: -27.4698, lon: 153.0251 },
  { name: "Perth", country: "Australia", lat: -31.9505, lon: 115.8605 },
  { name: "Wellington", country: "New Zealand", lat: -41.2865, lon: 174.7762 },
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
