
import { PizzaPlace, PizzaStyle } from '../types';

// Chicago Bounding Box (Approximate for demo density)
const BBOX = '41.85,-87.75,41.98,-87.60';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Deterministic random number generator based on string seed
const seededRandom = (seed: string) => {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
};

const PIZZA_IMAGES = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1593560708920-63984dc36f3c?auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60"
];

const STYLES_POOL = [PizzaStyle.TAVERN, PizzaStyle.DEEP_DISH, PizzaStyle.PAN, PizzaStyle.DETROIT];

const performOverpassRequest = async (query: string) => {
    try {
        const response = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `data=${encodeURIComponent(query)}`
        });

        if (!response.ok) {
            console.warn(`Overpass API error: ${response.status} ${response.statusText}`);
            return null;
        }

        const text = await response.text();
        
        if (!text || text.trim().startsWith('<')) {
            console.warn('Overpass API returned XML/HTML instead of JSON. Query might have timed out or is malformed.', text.substring(0, 100));
            return null;
        }

        return JSON.parse(text);
    } catch (error) {
        console.error("Network error fetching from Overpass API:", error);
        return null;
    }
};

export const fetchChicagoPizzaPlaces = async (bounds?: {south: number, west: number, north: number, east: number}): Promise<PizzaPlace[]> => {
  const queryBox = bounds 
    ? `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`
    : BBOX;

  const query = `
    [out:json][timeout:25];
    node["cuisine"="pizza"](${queryBox});
    out body 100; 
  `;

  const data = await performOverpassRequest(query);
  if (!data || !data.elements) return [];
  return data.elements.map((element: any) => mapOverpassElementToPizzaPlace(element));
};

export const fetchPizzaPlaceById = async (id: string): Promise<PizzaPlace | null> => {
  if (!id.startsWith('osm-')) return null;
  const numericId = id.replace('osm-', '');
  const query = `
    [out:json][timeout:25];
    node(${numericId});
    out body; 
  `;
  const data = await performOverpassRequest(query);
  if (!data || !data.elements || data.elements.length === 0) return null;
  return mapOverpassElementToPizzaPlace(data.elements[0]);
};

const mapOverpassElementToPizzaPlace = (element: any): PizzaPlace => {
    const id = element.id.toString();
    const rand1 = seededRandom(id);
    const rand2 = seededRandom(id + 'stats');
    const rand3 = seededRandom(id + 'img');
    const rand4 = seededRandom(id + 'extra');
    const rand5 = seededRandom(id + 'fresh');

    const rating = Math.floor((3.0 + (rand1 * 2.0)) * 10) / 10;
    
    const styles = [
      STYLES_POOL[Math.floor(rand1 * STYLES_POOL.length)],
      rand2 > 0.7 ? STYLES_POOL[Math.floor(rand2 * STYLES_POOL.length)] : null
    ].filter(Boolean) as PizzaStyle[];

    const name = element.tags?.name || "Unknown Pizza";
    const street = element.tags?.['addr:street'];
    const housenumber = element.tags?.['addr:housenumber'];
    const location = street ? `${housenumber || ''} ${street}` : "Chicago, IL";

    return {
      id: `osm-${id}`,
      name: name,
      location: location,
      distance: "3.2 mi",
      rating: rating,
      imageUrl: PIZZA_IMAGES[Math.floor(rand3 * PIZZA_IMAGES.length)],
      lat: element.lat,
      lng: element.lon,
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
      description: `Discovered via OpenStreetMap. A local spot serving ${styles[0].toLowerCase()}.`,
      history: "A hidden gem found in the heart of the neighborhood.",
      established: (1970 + Math.floor(rand1 * 50)).toString(),
      styles: styles
    };
};
