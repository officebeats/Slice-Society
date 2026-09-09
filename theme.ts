// Single source of truth for brand design tokens.
// Kept in sync with the CSS custom properties in index.css and the
// Tailwind theme in tailwind.config.js. Import these in JS/SVG code
// (e.g. Leaflet marker rendering) instead of hardcoding hex values.
export const COLORS = {
  primary: '#FF5733', // pizza red
  secondary: '#FFD700', // cheese gold
  chicago: '#41B6E6', // sky blue
  ratingLow: '#FF3131',
  ratingMid: '#FFA500',
  ratingHigh: '#22C55E',
  pepperoni: '#EF4444',
  ghost: '#E5E7EB',
  ghostAccent: '#A1A1AA',
  ink: '#000000',
} as const;

export type BrandColors = typeof COLORS;
