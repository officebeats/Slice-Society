# Slice-Society Features

## Overview
**Slice-Society** is a Progressive Web App (PWA) that serves as the definitive guide to Chicago's pizza scene. It combines interactive maps, social reviews, and AI-powered storytelling to help users discover, rate, and discuss pizzerias across the city.

---

## 1. Interactive Pizza Map
- **Leaflet-powered map** with custom pizza slice markers and marker clustering
- Toggle between **map view** and **list view**
- **Search bar** to filter places by name or location
- Markers are color-coded (gold for rated, red for elite 4.5+ rated, gray for unverified/ghost entries)
- Tap a marker to see a preview card with name, rating, location, and a link to full details
- Loading screen with rotating **Chicago pizza trivia facts**

## 2. Advanced Qualitative Filters
Accessed via the filter button on the map view:
- **Pizza Style**: Tavern Style, Deep Dish, Pan Pizza, Detroit Style
- **Minimum Rating**: 3-star, 4-star, or 4.5-star cutoff
- **8 Qualitative Dimensions** (each rated 1–3):
  - **Price Value**: Budget ($), Mid-Range ($$), Premium ($$$)
  - **Sauce Profile**: Sweet/Mild, Balanced, Zesty/Spicy
  - **Crust Texture**: Soggy, Stiff, Crunchy
  - **Cheese Pull**: No Pull, Stringy, Infinite
  - **Topping Flavor**: Bland, Zesty, Rich/Explosive
  - **Topping Amount**: Scarce, Plentiful, Loaded
  - **Grease Factor**: Dry, Glistening, Deep Puddle
  - **Freshness Factor**: Moldy, Edible, Ripe
- "ANY" option on each filter to reset that dimension
- **Reset All** and **Show Results** buttons

## 3. Feed View
- Card-based feed of all 20 built-in Chicago pizza places
- Mini-map overview card showing all locations as pins
- Each card displays: image, name, location, distance, rating badge, and 6 qualitative stat tags (price, sauce, crust, freshness, cheese, grease)
- Tap to navigate to the detail page

## 4. Pizza Spot Details Page
- **Hero image** with community-averaged rating overlay
- Name, location, Directions button (opens Google Maps), and Share button (Web Share API or clipboard copy)
- **"Rate & Review This Slice"** call-to-action button
- **The Breakdown** section:
  - 8 qualitative dimensions displayed as color-coded sticker badges
  - **Consensus rating** showing the community-agreed style and its average star rating
  - **Style filtering** — when the same place has reviews for different pizza styles, you can toggle between them to see how each style scores
- **Customer Reviews** section:
  - Upvote/downvote system (pizza slice icons) with net flavor score
  - User avatar, name, verified badge, pizza style tag, "Going Back" sticker
  - Star rating and time-ago
  - Review comment (italic)
  - Optional review photo with polaroid-style border
  - Reviewer's 8 breakdown stats shown as mini badges

## 5. Rate & Review
- **Search for a restaurant** (searches local data + Google Places API)
- **Star rating** (1–5 stars)
- **"Would you return?"** toggle: "F#&% NO!" or "HELL YEAH" (sticker-style buttons)
- **Written review** — textarea for comments
- **Receipt verification** — upload a photo of your receipt to become a verified reviewer
- **Pizza Style picker** — modal with all 4 styles
- **8 qualitative sliders** — each with a 3-position range slider and descriptive label
- Slider labels change dynamically based on position (e.g., price: Budget/Mid-Range/Premium)
- **Haptic feedback** on slider interaction (mobile vibration)
- Submit saves the review to localStorage and navigates to the detail page

## 6. Pizza History Timeline
- Chronological timeline of all built-in pizza places sorted by establishment date
- Each entry shows: image, establishment year badge, name, and historical description
- **AI-powered voice narration**:
  - Uses Google Gemini API (`gemini-2.5-flash-preview-tts`) with the "Charon" voice
  - Custom PCM audio streaming player that queues and plays audio chunks in real-time
  - Play/stop toggle per timeline entry with loading spinner state
  - Audio context management with cleanup on unmount

## 7. User Profile
- **Editable profile**: avatar (click to change), display name, bio (130 char limit)
- **Flavor (Karma) score**: tracks upvotes and downvotes received on your reviews
- **Stats**: review count, saved count, friend count
- **Level progression**: XP bar with current level display
- **Recently Viewed**: horizontal scroll of last 5 viewed places
- **Passport Stamps (Achievements)**:
  - 6 badges: Tavern King, Deep Diver, City Explorer, Sauce Boss, Paparazzi, Frequent Flyer
  - Each shows progress bar, unlock status, and stamp color
  - "View All" modal showing all stamps
  - Tap a stamp for detail view with progress bar and **quest recommendations** (suggested places to visit to progress)
- **Tabs**: Reviews, Saved, Friends
  - **Reviews**: Your submitted reviews with place name, star rating, upvote count
  - **Saved**: Favorited pizza places
  - **Friends**: Add friends by username, accept/reject incoming requests, view your crew, gift a slice to friends, remove friends

## 8. Gift a Slice
- Modal accessible from the Friends tab
- Select a recipient (friend name) and a pizzeria from a dropdown
- Send confirmation with animation
- Simulated gifting feature

## 9. Orders System
- **Order placement** with support for multiple platforms: SLICE, DoorDash, Pickup, Delivery
- **Order status tracking** with simulated progression:
  - PLACED → PREPARING → BAKING → OUT_FOR_DELIVERY → COMPLETED (for delivery)
  - PLACED → PREPARING → BAKING → READY_FOR_PICKUP → COMPLETED (for pickup)
- Status advances every 10 seconds (for demo purposes)
- Order details include: items, subtotal, tax, delivery fee, service fee, tip, total, ETA
- Active orders and past orders persisted in localStorage

## 10. Data Sources & API Integration
- **20 built-in Chicago pizza places** with rich metadata (history, stats, styles, coordinates)
- **Google Places API**: nearby search, text search, and place details with caching
- **OpenStreetMap Overpass API**: fallback data source for pizza places
- Dual-layer caching: in-memory (10-min TTL) + localStorage
- Ghost markers (gray) for places from external APIs vs. curated gold/red markers

## 11. PWA Features
- **Service Worker**: cache-first strategy for offline support, caches HTML, CSS, JS, fonts, and Leaflet assets
- **Web App Manifest**: standalone display mode, custom icons, screenshots, theme color
- **Installable**: full PWA support with `apple-mobile-web-app-capable` meta tags
- **Responsive design**: mobile-first layout with bottom navigation on mobile, sidebar navigation on desktop (md+ breakpoint)

## 12. State Management
- **Favorites** — saved to localStorage
- **Reviews** — saved to localStorage, includes voting state
- **Friends** — saved to localStorage, with mock data
- **Recently Viewed** — saved to localStorage, keeps last 5
- **Orders** — saved to localStorage (active + past)
- All contexts use React Context API with providers wrapping the app

## 13. CI/CD
- **GitHub Actions workflow** for automated deployment to GitHub Pages
- Builds on push to main branch
- Uses `npm ci` for dependency installation and `vite build` for production build
- Deploys via GitHub Pages Actions

## 14. UI/UX Design
- **Chicago-inspired design language**: bold borders, card shadows, sticker-style badges, rotary-angled elements
- **Custom color palette**: Primary (pizza red), Secondary (cheese gold), Chicago (sky blue), rating colors (red/orange/green)
- **Fredoka One** display font and **Quicksand** body font
- **Material Symbols** icon library
- **Tailwind CSS** via CDN with custom theme extensions
- Loading animations with pizza-themed SVG and animated bouncing timer
- Haptic feedback on interactive elements (mobile)

## 15. Technical Stack
- **React 19** with TypeScript
- **React Router v7** (HashRouter for PWA compatibility)
- **Vite** build tool
- **Leaflet** + **Leaflet.markercluster** for interactive maps
- **Google Gemini API** for TTS narration
- **Google Maps JavaScript API** (Places library)
- **OpenStreetMap Overpass API**
- **Tailwind CSS** (CDN, no build step)
- **ESM imports** via importmap (no bundler for runtime deps)