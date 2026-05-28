
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PIZZA_PLACES } from '../constants';

// Use the global Leaflet instance
declare const L: any;

const getQualitativeTag = (val: number, label: string): string => {
  const v = Math.round(val);
  if (label === '💰') return v === 1 ? '$' : v === 2 ? '$$' : '$$$';
  if (label === '🍅') return v === 1 ? 'SWEET' : v === 2 ? 'BAL.' : 'ZESTY';
  if (label === '🥨') return v === 1 ? 'SOGGY' : v === 2 ? 'STIFF' : 'CRISP';
  if (label === '🧀') return v === 1 ? 'NONE' : v === 2 ? 'PULL' : 'INF.';
  if (label === '🔴') return v === 1 ? 'SCARCE' : v === 2 ? 'PLENT.' : 'LOADED';
  if (label === '🥓') return v === 1 ? 'DRY' : v === 2 ? 'GLIST.' : 'WET';
  if (label === '🌿') return v === 1 ? 'MOLDY' : v === 2 ? 'EDIBLE' : 'RIPE';
  return val.toString().toUpperCase();
};

const FeedView: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
        zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false
    }).setView([41.8781, -87.6298], 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    
    PIZZA_PLACES.forEach(place => {
       const color = place.rating > 4.5 ? '#FF5733' : '#FFD700';
       const icon = L.divIcon({ 
         className: 'bg-transparent', 
         html: `
           <svg viewBox="0 0 100 110" style="width: 14px; height: 14px; filter: drop-shadow(1px 1px 0 rgba(0,0,0,0.5));">
             <path d="M10,15 Q50,-5 90,15 L50,105 L10,15 Z" fill="${color}" stroke="black" stroke-width="12"></path>
           </svg>
         `, 
         iconSize: [14, 14],
         iconAnchor: [7, 7]
       });
       L.marker([place.lat, place.lng], { icon }).addTo(map);
    });
    mapRef.current = map;
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  return (
    <div className="pt-8 pb-32 md:pb-8 px-4 w-full max-w-7xl mx-auto min-h-screen">
      <header className="mb-8 flex justify-between items-center sticky top-0 bg-background-light z-40 py-2">
        <div>
          <h1 className="font-display text-5xl text-primary drop-shadow-[3px_3px_0_#000]">SLICE-SOCIETY</h1>
          <p className="font-bold text-xs uppercase tracking-[0.2em] text-zinc-500 mt-1">CHICAGO'S PIZZA DOUGHMOCRACY</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Map Hero Card */}
          <div className="w-full relative aspect-[16/9] md:aspect-auto md:min-h-[300px] bg-white border-[6px] border-black rounded-[3rem] card-shadow overflow-hidden group active:translate-y-0.5 cursor-pointer md:col-span-2" onClick={() => navigate('/')}>
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 opacity-80 transition-opacity grayscale group-hover:grayscale-0 duration-500" />
              <div className="absolute bottom-6 left-6 bg-white border-[4px] border-black px-6 py-3 rounded-2xl flex items-center gap-3 shadow-[5px_5px_0_0_#000] z-[1000] group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-2xl font-black">map</span>
                <span className="font-display text-sm uppercase tracking-wider font-bold">Launch Tracker</span>
              </div>
          </div>

          {PIZZA_PLACES.map((place) => (
            <div 
              key={place.id} 
              onClick={() => navigate(`/details/${place.id}`, { state: { place } })} 
              className="bg-white border-[6px] border-black rounded-[3rem] p-6 card-shadow active:translate-y-1 hover:-translate-y-1 transition-all cursor-pointer group flex items-center gap-8"
            >
                {/* Left: Smaller Picture centered vertically */}
                <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-[2rem] border-[4px] border-black overflow-hidden relative bg-zinc-100 shadow-sm">
                    <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-1.5 right-1.5 w-10 h-10 bg-black rounded-full flex items-center justify-center border-[2.5px] border-white shadow-xl z-20">
                        <span className="font-display text-[10px] text-white leading-none">{place.rating}</span>
                    </div>
                </div>

                {/* Right: Title & Stats Grid */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="mb-4">
                        <h2 className="font-display text-3xl uppercase leading-none text-black tracking-tight mb-1 group-hover:text-primary transition-colors">{place.name}</h2>
                        <p className="font-bold text-[10px] text-zinc-500 uppercase tracking-widest">{place.location} • {place.distance}</p>
                    </div>
                    
                    {/* Breakdown Grid - 2 rows x 3 columns as per screenshot layout */}
                    <div className="grid grid-cols-3 gap-3">
                        <FeedTag icon="💰" label={getQualitativeTag(place.stats.price, '💰')} />
                        <FeedTag icon="🍅" label={getQualitativeTag(place.stats.sauce, '🍅')} />
                        <FeedTag icon="🥨" label={getQualitativeTag(place.stats.crust, '🥨')} />
                        <FeedTag icon="🌿" label={getQualitativeTag(place.stats.freshness || 2, '🌿')} />
                        <FeedTag icon="🧀" label={getQualitativeTag(place.stats.cheese, '🧀')} />
                        <FeedTag icon="🥓" label={getQualitativeTag(place.stats.grease, '🥓')} />
                    </div>
                </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const FeedTag = ({ icon, label }: { icon: string, label: string }) => (
    <div className="flex flex-col items-center justify-center bg-white border-[3px] border-black rounded-xl py-2 px-1 shadow-[3px_3px_0_0_#000] group-hover:bg-zinc-50 transition-all">
        <span className="text-sm mb-1">{icon}</span>
        <span className="text-[9px] font-black uppercase text-black truncate w-full text-center tracking-tighter">
          {label}
        </span>
    </div>
);

export default FeedView;
