// Abstracts city-specific assumptions so the app can expand beyond Chicago.
// Swap or extend this config to launch a new market.
export interface CityConfig {
  id: string;
  name: string;
  /** Default map center. */
  center: { lat: number; lng: number };
  defaultZoom: number;
  /** Overpass bounding box "south,west,north,east" used for the fallback data source. */
  overpassBbox: string;
  /** Rotating trivia shown on the loading screen. */
  facts: string[];
}

export const CHICAGO: CityConfig = {
  id: 'chicago',
  name: 'Chicago',
  center: { lat: 41.9, lng: -87.65 },
  defaultZoom: 13,
  overpassBbox: '41.85,-87.75,41.98,-87.60',
  facts: [
    'Deep Dish was invented at Pizzeria Uno in 1943.',
    'True Chicagoans eat Tavern Style on the weekdays.',
    "The 'Chicago Cut' means squares, not slices.",
    "Pequod's 'burnt' crust is actually caramelized cheese.",
    'There are over 2,000 pizzerias in the Chicago area.',
    'Sauce goes on top of Deep Dish to keep the cheese from burning.',
    "A 'Stuffed' pizza actually has a second thin layer of dough on top.",
    'Tavern style originated in bars to keep patrons thirsty.',
    'The first deep dish pizza was created by Ike Sewell.',
    'Chicago pizza sauce is usually uncooked tomatoes.',
    "Detroit style is welcome here, but don't tell New York.",
    "Fold it? We don't do that here.",
  ],
};

// The active market. Point this at a different CityConfig to relaunch elsewhere.
export const ACTIVE_CITY: CityConfig = CHICAGO;
