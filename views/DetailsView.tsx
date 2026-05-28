
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PIZZA_PLACES } from '../constants';
import { useFavorites } from '../context/FavoritesContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useReviews } from '../context/ReviewsContext';
import { PizzaPlace, PizzaStyle, Review } from '../types';
import { fetchGooglePlaceDetails } from '../services/GooglePlacesService';
import { fetchPizzaPlaceById } from '../services/OverpassService';
import { RatingMode } from '../components/RatingSlider';

const getQualitativeLabel = (val: number, mode: RatingMode): string => {
  const v = Math.round(val);
  if (mode === 'price') {
    if (v === 1) return '$ BUDGET';
    if (v === 2) return '$$ MID-RANGE';
    return '$$$ PREMIUM';
  }
  if (mode === 'crust') {
    if (v === 1) return 'SOGGY';
    if (v === 2) return 'STIFF';
    return 'CRUNCHY';
  }
  if (mode === 'cheese') {
    if (v === 1) return 'NO PULL';
    if (v === 2) return 'STRINGY';
    return 'INFINITE';
  }
  if (mode === 'sauce') {
    if (v === 1) return 'MILD/SWEET';
    if (v === 2) return 'BALANCED';
    return 'ZESTY/SPICY';
  }
  if (mode === 'grease') {
    if (v === 1) return 'DRY';
    if (v === 2) return 'GLISTENING';
    return 'DEEP PUDDLE';
  }
  if (mode === 'freshness') {
    if (v === 1) return 'MOLDY';
    if (v === 2) return 'EDIBLE';
    return 'RIPE';
  }
  if (mode === 'toppingFlavor') {
    if (v === 1) return 'BLAND';
    if (v === 2) return 'ZESTY';
    return 'RICH/EXPLOSIVE';
  }
  if (mode === 'toppingAmount') {
    if (v === 1) return 'SCARCE';
    if (v === 2) return 'PLENTIFUL';
    return 'LOADED';
  }
  return val.toString().toUpperCase();
};

const getBadgeStyle = (val: number, mode: RatingMode): string => {
  const v = Math.round(val);
  let bg = '';
  
  if (mode === 'price' || mode === 'grease') {
    if (v === 3) bg = 'bg-rating-low'; // Red
    else if (v === 2) bg = 'bg-rating-mid'; // Orange
    else bg = 'bg-rating-high'; // Green
  } else {
    if (v === 1) bg = 'bg-rating-low';
    else if (v === 2) bg = 'bg-rating-mid';
    else bg = 'bg-rating-high';
  }

  let rotation = 'rotate-0';
  switch (mode) {
    case 'price': rotation = 'rotate-1'; break;
    case 'sauce': rotation = '-rotate-1'; break;
    case 'crust': rotation = 'rotate-1'; break;
    case 'toppingFlavor': rotation = '-rotate-1'; break;
    case 'toppingAmount': rotation = 'rotate-1'; break;
    case 'cheese': rotation = 'rotate-1'; break;
    case 'grease': rotation = 'rotate-1'; break;
    case 'freshness': rotation = '-rotate-1'; break;
  }

  return `sticker-base ${bg} ${rotation} min-w-[115px] h-[40px] px-1 shrink-0 text-white`;
};

const MiniStatBadge = ({ icon, label, score, mode }: { icon: string, label: string, score: number, mode: RatingMode }) => {
    const v = Math.round(score);
    let bg = '';
    
    if (mode === 'price' || mode === 'grease') {
      if (v === 3) bg = 'bg-rating-low';
      else if (v === 2) bg = 'bg-rating-mid';
      else bg = 'bg-rating-high';
    } else {
      if (v === 1) bg = 'bg-rating-low';
      else if (v === 2) bg = 'bg-rating-mid';
      else bg = 'bg-rating-high';
    }

    return (
        <div className={`${bg} border-[2px] border-black rounded-lg px-2 py-0.5 flex items-center gap-1 shadow-[1.5px_1.5px_0_0_#000] rotate-1`}>
            <span className="text-[10px]">{icon}</span>
            <span className="text-[8px] font-black uppercase text-white leading-none whitespace-nowrap">{label}</span>
        </div>
    );
};

const StarRating = ({ rating, size = "md", color = "secondary" }: { rating: number, size?: "xs" | "sm" | "md" | "lg", color?: "secondary" | "white" }) => {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass = size === "xs" ? "text-[10px]" : size === "sm" ? "text-sm" : size === "md" ? "text-xl" : "text-3xl";
  const activeColor = color === "secondary" ? "text-secondary" : "text-white";
  const inactiveColor = color === "secondary" ? "text-zinc-300" : "text-white/20";
  
  return (
    <div className="flex gap-0.5">
      {stars.map(s => (
        <span key={s} className={`material-symbols-outlined ${sizeClass} ${s <= Math.round(rating) ? activeColor : inactiveColor} select-none`} style={{ fontVariationSettings: "'FILL' 1" }}>
          star
        </span>
      ))}
    </div>
  );
};

const DetailsView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [place, setPlace] = useState<PizzaPlace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<PizzaStyle | 'ALL'>('ALL');
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const { getReviewsForPlace, getAverageRating, voteReview, getUserVote } = useReviews();

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadPlace = async () => {
      setIsLoading(true);
      if (location.state?.place) { setPlace(location.state.place); setIsLoading(false); return; }
      const constantPlace = PIZZA_PLACES.find(p => p.id === id);
      if (constantPlace) { setPlace(constantPlace); setIsLoading(false); return; }
      if (id && id.startsWith('google-')) {
        const fetchedPlace = await fetchGooglePlaceDetails(id);
        if (fetchedPlace) setPlace(fetchedPlace);
      } else if (id && id.startsWith('osm-')) {
        const fetchedPlace = await fetchPizzaPlaceById(id);
        if (fetchedPlace) setPlace(fetchedPlace);
      }
      setIsLoading(false);
    };
    loadPlace();
  }, [id, location.state]);

  useEffect(() => { if (place) addToRecentlyViewed(place); }, [place, addToRecentlyViewed]);

  const handleShare = async () => {
    if (place) {
      try {
        if (navigator.share) await navigator.share({ title: place.name, text: `Check out ${place.name}!`, url: window.location.href });
        else { await navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
      } catch (error) {}
    }
  };

  const reviews = useMemo(() => place ? getReviewsForPlace(place.id) : [], [place, getReviewsForPlace]);
  const overallAvgRating = useMemo(() => place ? Math.min(5, getAverageRating(place.id, place.rating)) : 0, [place, getAverageRating]);

  const reviewedStyles = useMemo(() => {
    const styles = new Set<PizzaStyle>();
    reviews.forEach(r => { if (r.style) styles.add(r.style); });
    return Array.from(styles);
  }, [reviews]);

  const breakdownStats = useMemo(() => {
    if (!place) return null;
    
    const filteredReviews = selectedStyleFilter === 'ALL' 
      ? reviews 
      : reviews.filter(r => r.style === selectedStyleFilter);
      
    const reviewStats = filteredReviews.filter(r => r.stats).map(r => r.stats!);
    
    const styleAvgStarRating = filteredReviews.length > 0 
      ? parseFloat((filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1))
      : 0;

    let activeStyleLabel = place.styles[0];
    if (selectedStyleFilter !== 'ALL') {
        activeStyleLabel = selectedStyleFilter as PizzaStyle;
    } else if (reviewedStyles.length > 0) {
        const styleCounts: Record<string, number> = {};
        reviews.forEach(r => { if (r.style) styleCounts[r.style] = (styleCounts[r.style] || 0) + 1; });
        const consensus = Object.entries(styleCounts).sort((a,b) => b[1] - a[1])[0]?.[0] as PizzaStyle | undefined;
        if (consensus) activeStyleLabel = consensus;
    }

    if (reviewStats.length === 0) return { ...place.stats, source: 'baseline', style: activeStyleLabel, count: 0, styleRating: 0 };
    
    const count = reviewStats.length;
    return {
      price: Math.round(reviewStats.reduce((a, b) => a + b.price, 0) / count),
      sauce: Math.round(reviewStats.reduce((a, b) => a + b.sauce, 0) / count),
      crust: Math.round(reviewStats.reduce((a, b) => a + b.crust, 0) / count),
      cheese: Math.round(reviewStats.reduce((a, b) => a + b.cheese, 0) / count),
      toppingFlavor: Math.round(reviewStats.reduce((a, b) => a + b.toppingFlavor, 0) / count),
      toppingAmount: Math.round(reviewStats.reduce((a, b) => a + b.toppingAmount, 0) / count),
      grease: Math.round(reviewStats.reduce((a, b) => a + b.grease, 0) / count),
      freshness: Math.round(reviewStats.reduce((a, b) => a + (b.freshness || 2), 0) / count),
      source: 'community',
      count: count,
      style: activeStyleLabel,
      styleRating: styleAvgStarRating
    };
  }, [place, reviews, selectedStyleFilter, reviewedStyles]);

  if (isLoading) return <div className="min-h-screen bg-background-light flex items-center justify-center font-display text-xl animate-pulse">Hunting...</div>;
  if (!place || !breakdownStats) return <div className="min-h-screen bg-background-light flex items-center justify-center font-display">Pizza not found!</div>;

  return (
    <div className="pb-32 bg-background-light min-h-screen">
      <header className="px-6 py-4 sticky top-0 bg-background-light/95 backdrop-blur-sm z-[55] flex items-center justify-between">
        <button 
            onClick={() => navigate(-1)} 
            className="w-11 h-11 bg-white border-[3px] border-black rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
            <span className="material-symbols-outlined text-black font-black">arrow_back</span>
        </button>
        <h1 className="font-display text-2xl text-primary drop-shadow-[1px_1px_0_#000] uppercase tracking-tighter">SPOT DETAILS</h1>
        <button 
            onClick={() => toggleFavorite(place.id)} 
            className={`w-11 h-11 border-[3px] border-black rounded-full flex items-center justify-center active:scale-95 transition-transform ${isFavorite(place.id) ? 'bg-primary' : 'bg-white'}`}
        >
            <span className={`material-symbols-outlined font-black ${isFavorite(place.id) ? 'text-white' : 'text-primary'}`}>favorite</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-4 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 aspect-square rounded-[2rem] bold-border overflow-hidden card-shadow relative bg-zinc-200">
                <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
                <div className="absolute -bottom-3 -right-2 bg-secondary bold-border rounded-full p-4 flex flex-col items-center justify-center shadow-sm rotate-6 min-w-[100px] min-h-[100px]">
                    <span className="font-display text-4xl">{overallAvgRating}</span>
                    <StarRating rating={overallAvgRating} size="sm" />
                    <span className="font-black text-[8px] uppercase tracking-tighter mt-1">{reviews.length} REVIEWS</span>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                <h2 className="font-display text-4xl uppercase leading-none mb-2">{place.name}</h2>
                <p className="font-bold text-sm text-zinc-500 uppercase flex items-center justify-center md:justify-start gap-1"><span className="material-symbols-outlined text-primary text-sm">location_on</span>{place.location}</p>
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`)} className="bg-secondary text-black bold-border h-12 rounded-xl font-display text-xs uppercase shadow-sm active:translate-y-0.5">Directions</button>
                    <button onClick={handleShare} className="bg-white text-black bold-border h-12 rounded-xl font-display text-xs uppercase shadow-sm active:translate-y-0.5">Share</button>
                </div>
            </div>
        </div>

        <button 
          onClick={() => navigate(`/rate/${place.id}`, { state: { place } })}
          className="sticker-base w-full bg-primary h-[80px] text-xl sm:text-2xl active:translate-y-1 active:shadow-none hover:-translate-y-1 hover:shadow-lg transition-all"
        >
          <span className="text-sticker tracking-widest flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-3xl">rate_review</span>
            RATE & REVIEW THIS SLICE 🍕
          </span>
        </button>

        <section className="bg-white border-[6px] border-black rounded-[2rem] card-shadow overflow-hidden">
            <div className="bg-black py-4 px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl uppercase text-white tracking-widest">THE BREAKDOWN</h3>
                    <div className="bg-chicago text-white px-3 py-1.5 rounded-xl border border-white/20 rotate-1 flex items-center gap-2 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">
                        <span className="text-[8px] font-black uppercase whitespace-nowrap">
                            {selectedStyleFilter === 'ALL' ? 'CONSENSUS' : selectedStyleFilter}:
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="font-display text-sm leading-none">{(breakdownStats as any).styleRating || '—'}</span>
                            <StarRating rating={(breakdownStats as any).styleRating} size="xs" color="white" />
                        </div>
                    </div>
                </div>
                
                {reviewedStyles.length > 1 && (
                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
                    <button 
                      onClick={() => setSelectedStyleFilter('ALL')}
                      className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border-[2px] border-white transition-all ${selectedStyleFilter === 'ALL' ? 'bg-white text-black' : 'text-white border-white/20 hover:border-white/40'}`}
                    >
                      ALL
                    </button>
                    {reviewedStyles.map(s => (
                      <button 
                        key={s}
                        onClick={() => setSelectedStyleFilter(s)}
                        className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border-[2px] border-white transition-all whitespace-nowrap ${selectedStyleFilter === s ? 'bg-white text-black' : 'text-white border-white/20 hover:border-white/40'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                <StatRow icon="🍅" label="Sauce Profile" value={getQualitativeLabel(breakdownStats.sauce, 'sauce')} score={breakdownStats.sauce} mode="sauce" />
                <StatRow icon="🥨" label="Crust Texture" value={getQualitativeLabel(breakdownStats.crust, 'crust')} score={breakdownStats.crust} mode="crust" />
                <StatRow icon="🧀" label="Cheese Pull" value={getQualitativeLabel(breakdownStats.cheese, 'cheese')} score={breakdownStats.cheese} mode="cheese" />
                <StatRow icon="🔥" label="Topping Flavor" value={getQualitativeLabel(breakdownStats.toppingFlavor, 'toppingFlavor')} score={breakdownStats.toppingFlavor} mode="toppingFlavor" />
                <StatRow icon="🔴" label="Topping Amount" value={getQualitativeLabel(breakdownStats.toppingAmount, 'toppingAmount')} score={breakdownStats.toppingAmount} mode="toppingAmount" />
                <StatRow icon="💰" label="Price Value" value={getQualitativeLabel(breakdownStats.price, 'price')} score={breakdownStats.price} mode="price" />
                <StatRow icon="🥓" label="Grease Factor" value={getQualitativeLabel(breakdownStats.grease, 'grease')} score={breakdownStats.grease} mode="grease" />
                <StatRow icon="🌿" label="Freshness Factor" value={getQualitativeLabel(breakdownStats.freshness, 'freshness')} score={breakdownStats.freshness} mode="freshness" />
            </div>
        </section>

        <section className="bg-white border-[6px] border-black rounded-[2rem] card-shadow overflow-hidden">
            <div className="bg-black py-4 px-6 flex justify-between items-center">
                <h3 className="font-display text-xl uppercase text-white tracking-widest">CUSTOMER REVIEWS</h3>
            </div>
            <div className="p-6 space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((rev) => {
                    const userVote = getUserVote(rev.id);
                    const netFlavor = rev.upSlices - rev.downSlices;
                    
                    return (
                      <div key={rev.id} className="border-b-[3px] border-zinc-100 last:border-0 pb-6 flex gap-4">
                          <div className="flex flex-col items-center gap-2 pt-2 shrink-0">
                              <button 
                                onClick={() => voteReview(rev.id, 'up')}
                                className={`w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center transition-all active:scale-90 ${userVote === 'up' ? 'bg-primary text-white shadow-[2px_2px_0_0_#000]' : 'bg-white text-zinc-400 hover:text-primary'}`}
                              >
                                <span className="material-symbols-outlined text-xl inline-block" style={{ transform: 'rotate(180deg)' }}>local_pizza</span>
                              </button>
                              <span className={`font-display text-base font-black ${netFlavor > 0 ? 'text-primary' : netFlavor < 0 ? 'text-zinc-400' : 'text-zinc-300'}`}>
                                {netFlavor > 0 ? `+${netFlavor}` : netFlavor}
                              </span>
                              <button 
                                onClick={() => voteReview(rev.id, 'down')}
                                className={`w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center transition-all active:scale-90 ${userVote === 'down' ? 'bg-zinc-800 text-white shadow-[2px_2px_0_0_#000]' : 'bg-white text-zinc-400 hover:text-zinc-800'}`}
                              >
                                <span className="material-symbols-outlined text-xl inline-block" style={{ transform: 'rotate(0deg)' }}>local_pizza</span>
                              </button>
                          </div>

                          <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-zinc-100">
                                      <img src={rev.userAvatar} alt={rev.user} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <div className="flex items-center flex-wrap gap-2">
                                          <h4 className="font-display text-sm uppercase text-black truncate">{rev.user}</h4>
                                          {rev.isVerified && <div className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-green-200">VERIFIED</div>}
                                          {rev.style && <div className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-zinc-200">{rev.style}</div>}
                                          {rev.wouldReturn !== undefined && (
                                              <div className={`px-2 py-0.5 rounded border-2 border-black text-[8px] font-black uppercase shadow-[1.5px_1.5px_0_0_#000] rotate-1 ${rev.wouldReturn ? 'bg-rating-high text-white' : 'bg-rating-low text-white'}`}>
                                                GOING BACK: {rev.wouldReturn ? 'HELL YEAH' : 'F#&% NO!'}
                                              </div>
                                          )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <StarRating rating={rev.rating} size="sm" />
                                          <span className="text-[10px] font-bold text-zinc-400">{rev.timeAgo}</span>
                                      </div>
                                  </div>
                              </div>
                              <p className="text-sm font-semibold text-zinc-700 leading-relaxed italic mb-3">"{rev.comment}"</p>
                              {rev.photo && (
                                <div className="mt-3 w-48 aspect-video rounded-xl border-[3px] border-black overflow-hidden card-shadow rotate-1 bg-zinc-100">
                                    <img src={rev.photo} className="w-full h-full object-cover" alt="User review" />
                                </div>
                              )}
                              {rev.stats && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <MiniStatBadge icon="💰" label={getQualitativeLabel(rev.stats.price, 'price')} score={rev.stats.price} mode="price" />
                                    <MiniStatBadge icon="🍅" label={getQualitativeLabel(rev.stats.sauce, 'sauce')} score={rev.stats.sauce} mode="sauce" />
                                    <MiniStatBadge icon="🥨" label={getQualitativeLabel(rev.stats.crust, 'crust')} score={rev.stats.crust} mode="crust" />
                                    <MiniStatBadge icon="🧀" label={getQualitativeLabel(rev.stats.cheese, 'cheese')} score={rev.stats.cheese} mode="cheese" />
                                    <MiniStatBadge icon="🔥" label={getQualitativeLabel(rev.stats.toppingFlavor, 'toppingFlavor')} score={rev.stats.toppingFlavor} mode="toppingFlavor" />
                                    <MiniStatBadge icon="🔴" label={getQualitativeLabel(rev.stats.toppingAmount, 'toppingAmount')} score={rev.stats.toppingAmount} mode="toppingAmount" />
                                    <MiniStatBadge icon="🥓" label={getQualitativeLabel(rev.stats.grease, 'grease')} score={rev.stats.grease} mode="grease" />
                                    <MiniStatBadge icon="🌿" label={getQualitativeLabel(rev.stats.freshness || 2, 'freshness')} score={rev.stats.freshness || 2} mode="freshness" />
                                </div>
                              )}
                          </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 opacity-40 uppercase font-display">No reviews yet.</div>
                )}
            </div>
        </section>
      </main>
    </div>
  );
};

const StatRow = ({ icon, label, value, score, mode }: { icon: string, label: string, value: string, score: number, mode: RatingMode }) => (
    <div className="flex items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-[1.5px_1.5px_0_#000]">{icon}</span>
            <span className="font-display text-sm md:text-base uppercase text-black leading-tight tracking-tight">{label}</span>
        </div>
        <div className={getBadgeStyle(score, mode)}>
            <span className="font-black tracking-tight text-[11px] text-sticker whitespace-nowrap leading-none">{value}</span>
        </div>
    </div>
);

export default DetailsView;
