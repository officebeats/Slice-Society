
import { PizzaPlace, PizzaStyle } from '../types';

declare global {
  interface Window {
    gm_authFailure?: () => void;
    google?: any;
  }
}

// --- Cache Implementation ---
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const CACHE: Record<string, CacheEntry<any>> = {};
const CACHE_TTL = 10 * 60 * 1000;
const CACHE_KEY_PREFIX = 'pizza_cache_';

const getFromCache = <T>(key: string): T | null => {
  const memEntry = CACHE[key];
  if (memEntry) {
    if (Date.now() - memEntry.timestamp > CACHE_TTL) {
      delete CACHE[key];
      return null;
    }
    return memEntry.data;
  }
  try {
      const stored = localStorage.getItem(CACHE_KEY_PREFIX + key);
      if (stored) {
          const entry = JSON.parse(stored);
          if (Date.now() - entry.timestamp > CACHE_TTL) {
              localStorage.removeItem(CACHE_KEY_PREFIX + key);
              return null;
          }
          CACHE[key] = entry; 
          return entry.data;
      }
  } catch (e) {}
  return null;
};

const setCache = <T>(key: string, data: T) => {
  const entry = { data, timestamp: Date.now() };
  CACHE[key] = entry;
  try {
      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
  } catch (e) {}
};

// --- Singleton Loader ---
let googleMapsPromise: Promise<void> | null = null;
let placesServiceInstance: any = null;
let isMapsApiAvailable = true;

export const loadGoogleMaps = (): Promise<void> => {
    if (googleMapsPromise) return googleMapsPromise;
    const apiKey = process.env.API_KEY;
    const isValidKey = apiKey && apiKey.trim().length > 20 && apiKey.startsWith('AIza');
    if (!isValidKey) {
        isMapsApiAvailable = false;
        googleMapsPromise = Promise.resolve();
        return googleMapsPromise;
    }
    if (window.google && window.google.maps) return Promise.resolve();
    googleMapsPromise = new Promise((resolve) => {
        window.gm_authFailure = () => { isMapsApiAvailable = false; };
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => { isMapsApiAvailable = false; resolve(); };
        document.head.appendChild(script);
    });
    return googleMapsPromise;
};

const getPlacesService = async (): Promise<any> => {
    if (!isMapsApiAvailable) throw new Error("Maps API Unavailable");
    await loadGoogleMaps();
    if (!isMapsApiAvailable) throw new Error("Maps API Unavailable (Auth Failed)");
    if (!window.google || !window.google.maps || !window.google.maps.places) throw new Error("Maps API not loaded correctly");
    if (!placesServiceInstance) {
        try {
            const mapDiv = document.createElement('div');
            placesServiceInstance = new window.google.maps.places.PlacesService(mapDiv);
        } catch (e) {
            isMapsApiAvailable = false;
            throw e;
        }
    }
    return placesServiceInstance;
};

// --- API Methods ---
export const searchGooglePlaces = async (center: {lat: number, lng: number}, radius: number = 5000): Promise<PizzaPlace[]> => {
    if (!isMapsApiAvailable) return [];
    const latKey = center.lat.toFixed(3);
    const lngKey = center.lng.toFixed(3);
    const cacheKey = `nearby-${latKey}-${lngKey}-${radius}`;
    const cached = getFromCache<PizzaPlace[]>(cacheKey);
    if (cached) return cached;
    try {
        const service = await getPlacesService();
        const request = { location: center, radius: radius, type: 'restaurant', keyword: 'pizza' };
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => resolve([]), 1500);
            try {
                service.nearbySearch(request, (results: any[], status: any) => {
                    clearTimeout(timeoutId);
                    if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT' || !isMapsApiAvailable) {
                        if (isMapsApiAvailable) isMapsApiAvailable = false;
                        resolve([]);
                        return;
                    }
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                        const places = results.filter((r: any) => r.business_status === 'OPERATIONAL').map((r: any) => mapGoogleResultToPizzaPlace(r));
                        setCache(cacheKey, places);
                        resolve(places);
                    } else resolve([]);
                });
            } catch (err) { clearTimeout(timeoutId); resolve([]); }
        });
    } catch (e) { return []; }
};

export const searchGooglePlacesByQuery = async (query: string): Promise<PizzaPlace[]> => {
    if (!isMapsApiAvailable) return [];
    const cacheKey = `query-${query.toLowerCase().trim()}`;
    const cached = getFromCache<PizzaPlace[]>(cacheKey);
    if (cached) return cached;
    try {
        const service = await getPlacesService();
        const request = { query: query.toLowerCase().includes('pizza') ? query : query + ' pizza', type: 'restaurant' };
        return new Promise((resolve) => {
             const timeoutId = setTimeout(() => resolve([]), 1500);
             try {
                service.textSearch(request, (results: any[], status: any) => {
                    clearTimeout(timeoutId);
                    if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT' || !isMapsApiAvailable) {
                         if (isMapsApiAvailable) isMapsApiAvailable = false;
                        resolve([]);
                        return;
                    }
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                        const places = results.filter((r: any) => r.business_status === 'OPERATIONAL').map((r: any) => mapGoogleResultToPizzaPlace(r));
                        setCache(cacheKey, places);
                        resolve(places);
                    } else resolve([]);
                });
             } catch (err) { clearTimeout(timeoutId); resolve([]); }
        });
    } catch (e) { return []; }
};

export const fetchGooglePlaceDetails = async (placeId: string): Promise<PizzaPlace | null> => {
    if (!isMapsApiAvailable) return null;
    const cleanId = placeId.replace('google-', '');
    const cacheKey = `details-${cleanId}`;
    const cached = getFromCache<PizzaPlace>(cacheKey);
    if (cached) return cached;
    try {
        const service = await getPlacesService();
        return new Promise((resolve) => {
             const timeoutId = setTimeout(() => resolve(null), 1500);
             try {
                service.getDetails({
                    placeId: cleanId,
                    fields: ['name', 'rating', 'formatted_address', 'photos', 'geometry', 'place_id', 'user_ratings_total']
                }, (place: any, status: any) => {
                    clearTimeout(timeoutId);
                    if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
                        isMapsApiAvailable = false;
                        resolve(null);
                        return;
                    }
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                        const mapped = mapGoogleResultToPizzaPlace(place);
                        setCache(cacheKey, mapped);
                        resolve(mapped);
                    } else resolve(null);
                });
             } catch (err) { clearTimeout(timeoutId); resolve(null); }
        });
    } catch (e) { return null; }
};

const seededRandom = (seed: string) => {
    let h = 0xdeadbeef;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
    }
    return ((h ^ h >>> 16) >>> 0) / 4294967296;
};

const STYLES_POOL = [PizzaStyle.TAVERN, PizzaStyle.DEEP_DISH, PizzaStyle.PAN, PizzaStyle.DETROIT];

const mapGoogleResultToPizzaPlace = (result: any): PizzaPlace => {
    const id = result.place_id;
    const rand1 = seededRandom(id);
    const rand2 = seededRandom(id + 'stats');
    const rand3 = seededRandom(id + 'vibe');
    const rand4 = seededRandom(id + 'extra');
    const rand5 = seededRandom(id + 'fresh');

    let imageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60";
    if (result.photos && result.photos.length > 0) {
        try {
            imageUrl = result.photos[0].getUrl({ maxWidth: 400 });
        } catch (e) {}
    }

    const styles = [
        STYLES_POOL[Math.floor(rand1 * STYLES_POOL.length)],
        rand2 > 0.7 ? STYLES_POOL[Math.floor(rand2 * STYLES_POOL.length)] : null
    ].filter(Boolean) as PizzaStyle[];

    const rawRating = result.rating || (3.0 + (rand1 * 2.0));
    const rating = Math.min(5, Math.floor(rawRating * 10) / 10);
    
    const location = result.vicinity || result.formatted_address || "Chicago, IL";

    return {
        id: `google-${id}`,
        name: result.name,
        location: location,
        distance: "...", 
        rating: rating,
        imageUrl: imageUrl,
        lat: result.geometry?.location?.lat() || 0,
        lng: result.geometry?.location?.lng() || 0,
        coords: { x: 50, y: 50 },
        stats: {
            price: 1 + Math.floor(rand2 * 3),
            sauce: 1 + Math.floor(rand1 * 3),
            crust: 1 + Math.floor(rand2 * 3),
            cheese: 1 + Math.floor(rand3 * 3),
            toppingFlavor: 1 + Math.floor(rand1 * 3),
            toppingAmount: 1 + Math.floor(rand4 * 3),
            grease: 1 + Math.floor(rand3 * 3),
            freshness: 1 + Math.floor(rand5 * 3),
        },
        description: `Found on Google Maps. Rated ${result.rating || 'N/A'} stars by ${result.user_ratings_total || 0} users.`,
        history: "A generic pizza joint found in the digital ether.",
        established: (1980 + Math.floor(rand1 * 40)).toString(),
        styles: styles
    };
};
