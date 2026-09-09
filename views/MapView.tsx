
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PIZZA_PLACES } from '../constants';
import { PizzaPlace, PizzaStyle } from '../types';
import { searchGooglePlaces, loadGoogleMaps } from '../services/GooglePlacesService';
import { fetchChicagoPizzaPlaces } from '../services/OverpassService';
import { ACTIVE_CITY } from '../cityConfig';
import { COLORS } from '../theme';
import { PlaceCardSkeleton } from '../components/Skeleton';

// Use the global Leaflet instance
declare const L: any;

interface FilterState {
  styles: PizzaStyle[];
  minRating: number;
  price: number | null;
  sauce: number | null;
  crust: number | null;
  cheese: number | null;
  toppingFlavor: number | null;
  toppingAmount: number | null;
  grease: number | null;
  freshness: number | null;
}

const INITIAL_FILTERS: FilterState = {
  styles: [],
  minRating: 0,
  price: null,
  sauce: null,
  crust: null,
  cheese: null,
  toppingFlavor: null,
  toppingAmount: null,
  grease: null,
  freshness: null
};

type SortKey = 'rating' | 'distance' | 'name';

const SORT_LABELS: Record<SortKey, string> = {
  rating: 'TOP RATED',
  distance: 'NEAREST',
  name: 'A–Z'
};

const parseDistance = (d: string): number => {
  const n = parseFloat(d);
  return isNaN(n) ? Number.POSITIVE_INFINITY : n;
};

const MapView: React.FC = () => {
  const navigate = useNavigate();

  // Data State
  const [places, setPlaces] = useState<PizzaPlace[]>(PIZZA_PLACES);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFact, setLoadingFact] = useState(ACTIVE_CITY.facts[0]);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('rating');

  // Filter State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<any>(null);

  // Rotate fact when loading starts
  useEffect(() => {
    if (isLoading) {
      setLoadingFact(ACTIVE_CITY.facts[Math.floor(Math.random() * ACTIVE_CITY.facts.length)]);
    }
  }, [isLoading]);

  const loadData = async (center: {lat: number, lng: number}) => {
    setIsLoading(true);
    try {
      let newPlaces = await searchGooglePlaces(center);
      if (newPlaces.length === 0) {
          const b = mapRef.current?.getBounds();
          const bounds = b ? { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() } : undefined;
          newPlaces = await fetchChicagoPizzaPlaces(bounds);
      }
      setPlaces(prev => {
          const unique = new Map([...prev, ...newPlaces].map(p => [p.id, p]));
          return Array.from(unique.values());
      });
    } catch (e) {
      console.error("Error loading map data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoogleMaps().then(() => {
        loadData(ACTIVE_CITY.center);
    }).catch(() => loadData(ACTIVE_CITY.center));
  }, []);

  const filteredPlaces = useMemo(() => {
    const matched = places.filter(place => {
      const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            place.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStyle = filters.styles.length === 0 ||
                           place.styles.some(s => filters.styles.includes(s));

      const matchesRating = place.rating >= filters.minRating;

      const matchesPrice = filters.price === null || place.stats.price === filters.price;
      const matchesSauce = filters.sauce === null || place.stats.sauce === filters.sauce;
      const matchesCrust = filters.crust === null || place.stats.crust === filters.crust;
      const matchesCheese = filters.cheese === null || place.stats.cheese === filters.cheese;
      const matchesToppingFlavor = filters.toppingFlavor === null || place.stats.toppingFlavor === filters.toppingFlavor;
      const matchesToppingAmount = filters.toppingAmount === null || place.stats.toppingAmount === filters.toppingAmount;
      const matchesGrease = filters.grease === null || place.stats.grease === filters.grease;
      const matchesFreshness = filters.freshness === null || (place.stats.freshness || 2) === filters.freshness;

      return matchesSearch && matchesStyle && matchesRating &&
             matchesPrice && matchesSauce && matchesCrust &&
             matchesCheese && matchesToppingFlavor &&
             matchesToppingAmount && matchesGrease && matchesFreshness;
    });

    const sorted = [...matched];
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'distance') sorted.sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));
    else sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [places, searchQuery, filters, sortBy]);

  // Typeahead suggestions (name/location matches), capped for scannability.
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return filteredPlaces.slice(0, 6);
  }, [searchQuery, filteredPlaces]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: true })
      .setView([ACTIVE_CITY.center.lat, ACTIVE_CITY.center.lng], ACTIVE_CITY.defaultZoom);
    // Free, watermark-free OpenStreetMap tiles; visually desaturated via CSS
    // (.map-desaturate on the container) to match the muted comic palette.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    map.attributionControl.setPrefix('');
    const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 50,
        iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            return L.divIcon({
                html: `<div class="relative w-14 h-14 flex items-center justify-center"><svg viewBox="0 0 100 100" class="absolute inset-0 w-full h-full drop-shadow-[3px_3px_0_#000]"><circle cx="50" cy="50" r="45" fill="${COLORS.secondary}" stroke="black" stroke-width="6" /><line x1="50" y1="5" x2="50" y2="95" stroke="black" stroke-width="4" /><line x1="5" y1="50" x2="95" y2="50" stroke="black" stroke-width="4" /><line x1="18" y1="18" x2="82" y2="82" stroke="black" stroke-width="4" /><line x1="18" y1="82" x2="82" y2="18" stroke="black" stroke-width="4" /><circle cx="30" cy="30" r="4" fill="${COLORS.pepperoni}" stroke="black" stroke-width="1" /><circle cx="70" cy="40" r="4" fill="${COLORS.pepperoni}" stroke="black" stroke-width="1" /><circle cx="40" cy="70" r="4" fill="${COLORS.pepperoni}" stroke="black" stroke-width="1" /><circle cx="60" cy="80" r="4" fill="${COLORS.pepperoni}" stroke="black" stroke-width="1" /></svg><div class="relative z-10 bg-white border-[3px] border-black px-2 py-0.5 rounded-lg shadow-[2px_2px_0_#000] font-display text-sm text-black">${count}</div></div>`,
                className: 'custom-cluster-icon',
                iconSize: [56, 56], iconAnchor: [28, 28]
            });
        }
    });
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    mapRef.current = map;
    map.on('click', () => setActivePlaceId(null));
    // Ensure correct sizing once the flex layout (and desktop rail) settle.
    setTimeout(() => map.invalidateSize(), 50);
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // Keep the map correctly sized when toggling between map/list on mobile.
  useEffect(() => {
    if (viewMode === 'map' && mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 50);
    }
  }, [viewMode]);

  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;
    clusterGroupRef.current.clearLayers();
    const markers = filteredPlaces.map(place => {
        const isActive = activePlaceId === place.id;
        const color = place.rating > 4.5 ? COLORS.primary : COLORS.secondary;
        const isGhost = place.id.startsWith('google-') || place.id.startsWith('osm-');
        const icon = L.divIcon({
            className: 'custom-pin',
            html: `<div style="position: relative; width: ${isActive ? 65 : 45}px; height: ${isActive ? 65 : 45}px; transition: all 0.2s ease-out;"><svg viewBox="0 0 100 110" style="width: 100%; height: 100%; filter: drop-shadow(${isActive ? '4px 4px' : '3px 3px'} 0 rgba(0,0,0,1));"><path d="M10,15 Q50,-5 90,15 L50,105 L10,15 Z" fill="${isGhost ? COLORS.ghost : color}" stroke="black" stroke-width="${isActive ? 10 : 8}"></path><circle cx="35" cy="40" fill="${isGhost ? COLORS.ghostAccent : COLORS.pepperoni}" r="6" stroke="black" stroke-width="3"></circle><circle cx="65" cy="35" fill="${isGhost ? COLORS.ghostAccent : COLORS.pepperoni}" r="6" stroke="black" stroke-width="3"></circle></svg>${isActive ? `<div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); background: white; border: 3px solid black; padding: 2px 8px; border-radius: 8px; font-family: 'Fredoka One'; font-size: 12px; white-space: nowrap; box-shadow: 3px 3px 0 #000;">★ ${place.rating}</div>` : ''}</div>`,
            iconSize: [isActive ? 65 : 45, isActive ? 65 : 45], iconAnchor: [isActive ? 32.5 : 22.5, isActive ? 65 : 45]
        });
        const marker = L.marker([place.lat, place.lng], { icon, placeId: place.id });
        marker.on('click', (e: any) => { L.DomEvent.stopPropagation(e); setActivePlaceId(place.id); mapRef.current?.flyTo([place.lat, place.lng], mapRef.current.getZoom() < 14 ? 14 : mapRef.current.getZoom(), { duration: 0.5 }); });
        return marker;
    });
    clusterGroupRef.current.addLayers(markers);
  }, [filteredPlaces, activePlaceId]);

  const toggleStyleFilter = (style: PizzaStyle) => {
    setFilters(prev => ({ ...prev, styles: prev.styles.includes(style) ? prev.styles.filter(s => s !== style) : [...prev.styles, style] }));
  };

  const focusPlaceOnMap = (place: PizzaPlace) => {
    setActivePlaceId(place.id);
    setViewMode('map');
    setShowSuggestions(false);
    setTimeout(() => {
      mapRef.current?.flyTo([place.lat, place.lng], 15, { duration: 0.6 });
    }, 60);
  };

  const hasActiveFilters = filters.styles.length > 0 || filters.minRating > 0 || filters.price !== null || filters.sauce !== null || filters.crust !== null || filters.cheese !== null || filters.toppingFlavor !== null || filters.toppingAmount !== null || filters.grease !== null || filters.freshness !== null;

  const cycleSort = () => {
    setSortBy(prev => (prev === 'rating' ? 'distance' : prev === 'distance' ? 'name' : 'rating'));
  };

  const FilterSection = ({ label, field, options }: { label: string, field: keyof FilterState, options: { label: string, val: any }[] }) => (
    <div className="space-y-2">
        <label className="font-display text-[11px] uppercase text-zinc-500 block px-1">{label}</label>
        <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilters(f => ({ ...f, [field]: null }))} className={`px-3 py-1.5 rounded-lg border-[2px] border-black font-display text-[11px] uppercase transition-all shadow-[1.5px_1.5px_0_0_#000] active:translate-y-0.5 active:shadow-none ${filters[field] === null ? 'bg-black text-white' : 'bg-white text-black'}`}>ANY</button>
            {options.map(opt => (
                <button key={opt.label} onClick={() => setFilters(f => ({ ...f, [field]: opt.val }))} className={`px-3 py-1.5 rounded-lg border-[2px] border-black font-display text-[11px] uppercase transition-all shadow-[1.5px_1.5px_0_0_#000] active:translate-y-0.5 active:shadow-none ${filters[field] === opt.val ? 'bg-secondary text-black' : 'bg-white text-black'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
  );

  const PlaceRow = ({ p, compact = false }: { p: PizzaPlace, compact?: boolean }) => (
    <div
      onClick={() => navigate(`/details/${p.id}`, { state: { place: p } })}
      className="bg-white border-[3px] border-black rounded-2xl p-3 card-shadow flex gap-3 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <img src={p.imageUrl} className="w-16 h-16 rounded-xl border-2 border-black object-cover bg-zinc-100 shrink-0" alt={p.name} />
      <div className="flex-1 min-w-0">
        <h3 className="font-display uppercase text-black text-base leading-tight truncate">{p.name}</h3>
        <p className="text-[11px] font-bold text-zinc-500 uppercase truncate">{p.location}{!compact && p.distance && p.distance !== '...' ? ` • ${p.distance}` : ''}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border border-black ${p.rating > 4.5 ? 'bg-primary text-white' : 'bg-secondary text-black'}`}>★ {p.rating}</span>
          <span className="text-[10px] font-black text-black/50 uppercase truncate">{p.styles[0]}</span>
          <span className="text-[10px] font-black text-black/60 uppercase">{'$'.repeat(p.stats.price)}</span>
        </div>
      </div>
      <div className="self-center shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); focusPlaceOnMap(p); }}
          aria-label={`Show ${p.name} on the map`}
          className="w-9 h-9 bg-white border-[2px] border-black rounded-lg flex items-center justify-center active:scale-95 transition-transform hover:bg-secondary"
        >
          <span className="material-symbols-outlined text-black text-lg">location_on</span>
        </button>
      </div>
    </div>
  );

  const resultCountLabel = `${filteredPlaces.length} ${filteredPlaces.length === 1 ? 'SLICE' : 'SLICES'}`;

  return (
    <div className="w-full h-[100dvh] relative bg-background-light overflow-hidden flex">
      {/* Map + floating controls column */}
      <div className="relative flex-1 h-full min-w-0">
        <div className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-[2000] flex flex-col gap-2 pointer-events-none">
          <div className="flex gap-2">
            <div className="flex-1 h-12 bg-white border-[3px] border-black rounded-xl shadow-[4px_4px_0_0_#000] flex items-center px-4 pointer-events-auto relative">
              <span className="material-symbols-outlined text-black mr-2" aria-hidden="true">search</span>
              <input
                aria-label="Search pizza places by name or neighborhood"
                className="bg-transparent border-none focus:ring-0 w-full font-display text-sm placeholder:text-zinc-400 outline-none text-black h-full uppercase"
                placeholder="SEARCH SLICE-SOCIETY..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                  aria-label="Clear search"
                  className="ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-100"
                >
                  <span className="material-symbols-outlined text-zinc-500 text-lg">close</span>
                </button>
              )}
              {/* Typeahead suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border-[3px] border-black rounded-xl shadow-[4px_4px_0_0_#000] overflow-hidden z-[2100]">
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      onMouseDown={(e) => { e.preventDefault(); focusPlaceOnMap(s); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary/30 transition-colors text-left border-b-2 border-black/5 last:border-0"
                    >
                      <img src={s.imageUrl} alt="" className="w-8 h-8 rounded-lg border-2 border-black object-cover shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block font-display text-xs uppercase text-black truncate">{s.name}</span>
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase truncate">{s.location}</span>
                      </span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded border border-black bg-secondary text-black shrink-0">★ {s.rating}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowFilters(true)}
              aria-label={hasActiveFilters ? 'Edit active filters' : 'Open filters'}
              className={`w-12 h-12 border-[3px] border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all pointer-events-auto ${hasActiveFilters ? 'bg-primary text-white' : 'bg-white text-black'}`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">{hasActiveFilters ? 'tune' : 'filter_list'}</span>
            </button>
            <button
              onClick={() => setViewMode(v => v === 'map' ? 'list' : 'map')}
              aria-label={viewMode === 'map' ? 'Switch to list view' : 'Switch to map view'}
              className="w-12 h-12 bg-white border-[3px] border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-all pointer-events-auto lg:hidden"
            >
              <span className="material-symbols-outlined text-black" aria-hidden="true">{viewMode === 'map' ? 'list_alt' : 'map'}</span>
            </button>
          </div>
          {/* Result count + sort pill (over the map) */}
          <div className="flex items-center gap-2 pointer-events-auto self-start">
            <span className="bg-black text-white font-display text-[11px] uppercase px-3 py-1.5 rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">{resultCountLabel}</span>
            <button
              onClick={cycleSort}
              aria-label={`Sort order: ${SORT_LABELS[sortBy]}. Tap to change.`}
              className="bg-white border-[2px] border-black font-display text-[11px] uppercase px-3 py-1.5 rounded-lg shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 text-black"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">swap_vert</span>
              {SORT_LABELS[sortBy]}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
            <div className="bg-white border-[5px] border-black rounded-[2rem] w-full max-w-md max-h-[85vh] flex flex-col relative z-10 card-shadow animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center p-6 border-b-[3px] border-black/10 shrink-0">
                    <h2 className="font-display text-2xl uppercase">Qualitative Filters</h2>
                    <button onClick={() => setShowFilters(false)} aria-label="Close filters" className="w-8 h-8 bg-zinc-100 border-2 border-black rounded-full flex items-center justify-center active:scale-95"><span className="material-symbols-outlined text-sm" aria-hidden="true">close</span></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
                    <div className="space-y-2">
                        <label className="font-display text-[11px] uppercase text-zinc-500 block px-1">Sort By</label>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(SORT_LABELS) as SortKey[]).map(key => (
                            <button key={key} onClick={() => setSortBy(key)} className={`px-3 py-1.5 rounded-lg border-[2px] border-black font-display text-[11px] uppercase transition-all shadow-[1.5px_1.5px_0_0_#000] active:translate-y-0.5 active:shadow-none ${sortBy === key ? 'bg-chicago text-white' : 'bg-white text-black'}`}>{SORT_LABELS[key]}</button>
                          ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="font-display text-[11px] uppercase text-zinc-500 block px-1">Pizza Style</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(PizzaStyle).map(style => (
                                <button key={style} onClick={() => toggleStyleFilter(style)} className={`px-3 py-1.5 rounded-lg border-[2px] border-black font-display text-[11px] uppercase transition-all shadow-[1.5px_1.5px_0_0_#000] active:translate-y-0.5 active:shadow-none ${filters.styles.includes(style) ? 'bg-primary text-white' : 'bg-white text-black'}`}>{style}</button>
                            ))}
                        </div>
                    </div>
                    <FilterSection label="Minimum Rating" field="minRating" options={[{label: '3★+', val: 3}, {label: '4★+', val: 4}, {label: '4.5★+', val: 4.5}]} />
                    <FilterSection label="Freshness Factor" field="freshness" options={[{label: 'MOLDY', val: 1}, {label: 'EDIBLE', val: 2}, {label: 'RIPE', val: 3}]} />
                    <FilterSection label="Price Value" field="price" options={[{label: '$', val: 1}, {label: '$$', val: 2}, {label: '$$$', val: 3}]} />
                    <FilterSection label="Sauce Profile" field="sauce" options={[{label: 'SWEET', val: 1}, {label: 'BALANCED', val: 2}, {label: 'ZESTY', val: 3}]} />
                    <FilterSection label="Crust Texture" field="crust" options={[{label: 'SOGGY', val: 1}, {label: 'STIFF', val: 2}, {label: 'CRUNCHY', val: 3}]} />
                    <FilterSection label="Cheese Pull" field="cheese" options={[{label: 'NONE', val: 1}, {label: 'STRINGY', val: 2}, {label: 'INFINITE', val: 3}]} />
                    <FilterSection label="Topping Flavor" field="toppingFlavor" options={[{label: 'BLAND', val: 1}, {label: 'ZESTY', val: 2}, {label: 'EXPLOSIVE', val: 3}]} />
                    <FilterSection label="Topping Amount" field="toppingAmount" options={[{label: 'SCARCE', val: 1}, {label: 'PLENTIFUL', val: 2}, {label: 'LOADED', val: 3}]} />
                    <FilterSection label="Grease Factor" field="grease" options={[{label: 'DRY', val: 1}, {label: 'GLISTEN', val: 2}, {label: 'PUDDLE', val: 3}]} />
                </div>
                <div className="p-6 border-t-[3px] border-black/10 flex gap-2 shrink-0">
                    <button onClick={() => setFilters(INITIAL_FILTERS)} className="flex-1 py-3 border-[3px] border-black rounded-xl font-display text-sm uppercase hover:bg-zinc-50">Reset All</button>
                    <button onClick={() => setShowFilters(false)} className="flex-1 py-3 bg-black text-white border-[3px] border-black rounded-xl font-display text-sm uppercase shadow-[3px_3px_0_0_#444] active:translate-y-0.5 active:shadow-none transition-all">Show {resultCountLabel}</button>
                </div>
            </div>
          </div>
        )}

        <div className="relative w-full h-full">
          <div ref={mapContainerRef} className={`map-desaturate absolute inset-0 w-full h-full transition-opacity duration-300 z-0 ${viewMode === 'map' ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none lg:opacity-100 lg:visible lg:pointer-events-auto'}`} />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-[1500] flex flex-col items-center justify-center bg-background-light/90 backdrop-blur-sm transition-all duration-300">
               <div className="animate-pulse relative w-24 h-24 mb-6">
                  <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                     <path d="M10,15 Q50,-5 90,15 L50,105 L10,15 Z" fill="#FF5733" stroke="black" strokeWidth="6"></path>
                     <circle cx="35" cy="40" fill="#EF4444" r="5" stroke="black" strokeWidth="2"></circle>
                     <circle cx="65" cy="35" fill="#EF4444" r="5" stroke="black" strokeWidth="2"></circle>
                     <circle cx="50" cy="70" fill="#EF4444" r="4" stroke="black" strokeWidth="2"></circle>
                  </svg>
                  <div className="absolute -top-2 -right-2 bg-secondary border-[3px] border-black rounded-full p-1.5 animate-bounce">
                    <span className="material-symbols-outlined text-black font-black text-xl" aria-hidden="true">timer</span>
                  </div>
               </div>
               <div className="sticker-base bg-white max-w-[80%] p-4 -rotate-1 animate-in zoom-in-95 duration-500">
                  <p className="font-display text-lg uppercase text-black leading-tight text-center">
                    "{loadingFact}"
                  </p>
               </div>
               <p className="mt-4 font-black text-xs uppercase tracking-[0.2em] text-zinc-400 animate-pulse">Heating up the oven...</p>
            </div>
          )}

          {/* Mobile list overlay (desktop uses the persistent rail instead) */}
          <div className={`absolute inset-0 w-full h-full bg-background-light overflow-y-auto transition-opacity duration-300 z-10 lg:hidden ${viewMode === 'list' ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
              <div className="pt-28 px-4 pb-32 w-full max-w-md mx-auto">
                  <div className="space-y-4">
                      {isLoading ? (
                          Array.from({ length: 5 }).map((_, i) => <PlaceCardSkeleton key={i} />)
                      ) : filteredPlaces.length > 0 ? filteredPlaces.map(p => (
                          <PlaceRow key={p.id} p={p} />
                      )) : (
                          <div className="text-center py-20"><span className="material-symbols-outlined text-5xl text-zinc-200" aria-hidden="true">local_pizza</span><p className="font-display text-zinc-400 mt-2 uppercase">No slices matching your hunt.</p></div>
                      )}
                  </div>
              </div>
          </div>
        </div>

        {activePlaceId && viewMode === 'map' && (
          <div className="fixed bottom-28 left-4 right-4 lg:right-[26rem] z-[2001] animate-in slide-in-from-bottom-6 duration-300 pointer-events-none">
              {filteredPlaces.filter(p => p.id === activePlaceId).map(p => (
                  <div key={p.id} onClick={() => navigate(`/details/${p.id}`, { state: { place: p } })} className="relative w-full max-w-sm mx-auto bg-white border-[4px] border-black rounded-[1.5rem] card-shadow p-3 cursor-pointer active:scale-[0.99] transition-transform group pointer-events-auto"><div className="absolute -bottom-3 -right-2 sticker-base bg-primary h-7 px-3 text-[10px] text-sticker rotate-2 border-2 shadow-sm z-[2002]">TAP FOR FULL SCOOP →</div><div className="flex gap-4 items-center"><div className="w-16 h-16 rounded-xl border-2 border-black overflow-hidden bg-zinc-100 shrink-0"><img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} /></div><div className="flex-1"><h2 className="font-display text-base uppercase text-black leading-tight line-clamp-1">{p.name}</h2><p className="text-[11px] font-bold text-zinc-500 uppercase">{p.location}</p><div className="flex items-center gap-2 mt-1"><span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-black shadow-sm">★ {p.rating}</span><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter line-clamp-1">{p.styles[0]}</span></div></div></div></div>
              ))}
          </div>
        )}
      </div>

      {/* Persistent desktop results rail */}
      <aside className="hidden lg:flex flex-col w-[25rem] shrink-0 h-full border-l-[5px] border-black bg-background-light">
        <div className="px-5 pt-8 pb-4 border-b-[3px] border-black/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl uppercase text-black dark:text-white leading-none">Slices</h2>
            <p className="font-bold text-[11px] uppercase tracking-widest text-zinc-500 mt-1">{resultCountLabel} • {SORT_LABELS[sortBy]}</p>
          </div>
          <button
            onClick={cycleSort}
            aria-label={`Sort order: ${SORT_LABELS[sortBy]}. Tap to change.`}
            className="bg-white border-[2px] border-black font-display text-[11px] uppercase px-3 py-2 rounded-lg shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 text-black"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">swap_vert</span>
            {SORT_LABELS[sortBy]}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <PlaceCardSkeleton key={i} />)
          ) : filteredPlaces.length > 0 ? filteredPlaces.map(p => (
            <PlaceRow key={p.id} p={p} compact />
          )) : (
            <div className="text-center py-20"><span className="material-symbols-outlined text-5xl text-zinc-200" aria-hidden="true">local_pizza</span><p className="font-display text-zinc-400 mt-2 uppercase">No slices matching your hunt.</p></div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default MapView;
