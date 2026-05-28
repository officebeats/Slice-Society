
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import RatingSlider from '../components/RatingSlider';
import { PizzaStyle, PizzaPlace } from '../types';
import { PIZZA_PLACES } from '../constants';
import { useReviews } from '../context/ReviewsContext';
import { fetchGooglePlaceDetails, searchGooglePlacesByQuery } from '../services/GooglePlacesService';
import { fetchPizzaPlaceById } from '../services/OverpassService';

const RateView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { addReview } = useReviews();
  
  const [place, setPlace] = useState<PizzaPlace | null>(location.state?.place || null);
  const [style, setStyle] = useState<PizzaStyle>(PizzaStyle.TAVERN);
  const [showDropdown, setShowDropdown] = useState(false);
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);
  
  // Qualitative Stats (1-3)
  const [price, setPrice] = useState(2);
  const [sauce, setSauce] = useState(2);
  const [crust, setCrust] = useState(2);
  const [toppingFlavor, setToppingFlavor] = useState(2);
  const [toppingAmount, setToppingAmount] = useState(2);
  const [grease, setGrease] = useState(2);
  const [cheese, setCheese] = useState(2);
  const [freshness, setFreshness] = useState(2);

  // Review Fields
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PizzaPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const vibrate = (ms: number = 5) => {
    if (navigator.vibrate) navigator.vibrate(ms);
  };

  const handleSliderChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    setter(value);
    vibrate(10);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewPhoto(reader.result as string);
        setIsVerified(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!place || !reviewComment) return;
    
    addReview({
      placeId: place.id,
      user: "You",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      rating: reviewRating,
      comment: reviewComment,
      wouldReturn: wouldReturn !== null ? wouldReturn : undefined,
      style: style,
      isVerified,
      photo: reviewPhoto || undefined,
      stats: {
        price, sauce, crust, cheese, toppingFlavor, toppingAmount, grease, freshness
      }
    });

    vibrate(20);
    navigate(`/details/${place.id}`, { replace: true });
  };

  useEffect(() => {
    const loadPlace = async () => {
        if (!place && id) {
             const constantPlace = PIZZA_PLACES.find(p => p.id === id);
             if (constantPlace) {
                 setPlace(constantPlace);
                 if(constantPlace.styles.length > 0) setStyle(constantPlace.styles[0]);
             } else if (id.startsWith('google-')) {
                 const fetched = await fetchGooglePlaceDetails(id);
                 if (fetched) {
                    setPlace(fetched);
                    if(fetched.styles.length > 0) setStyle(fetched.styles[0]);
                 }
             } else if (id.startsWith('osm-')) {
                 const fetched = await fetchPizzaPlaceById(id);
                 if (fetched) {
                     setPlace(fetched);
                     if (fetched.styles.length > 0) setStyle(fetched.styles[0]);
                 }
             }
        }
    };
    loadPlace();
  }, [id, place]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
        const localResults = PIZZA_PLACES.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
        let googleResults: PizzaPlace[] = [];
        try { googleResults = await searchGooglePlacesByQuery(searchQuery); } catch (err) {}
        const allResults = [...localResults, ...googleResults];
        const unique = Array.from(new Map(allResults.map(item => [item.id, item])).values());
        setSearchResults(unique);
    } catch (e) {} finally { setIsSearching(false); }
  };

  if (!id) {
      return (
        <div className="min-h-screen bg-background-light pb-32">
             <header className="px-6 py-6 bg-background-light sticky top-0 z-50">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border-[3px] border-black rounded-xl flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-black">arrow_back</span>
                    </button>
                    <h1 className="font-display text-3xl uppercase">Rate a Slice</h1>
                </div>
            </header>
            <main className="px-6 max-w-lg mx-auto">
                <div className="relative mb-6">
                    <input type="text" placeholder="SEARCH RESTAURANT..." className="w-full h-14 pl-12 pr-16 rounded-2xl border-[3px] border-black shadow-[4px_4px_0_0_#000] outline-none font-bold uppercase placeholder:text-zinc-400 focus:ring-4 ring-primary/20 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-black">search</span>
                </div>
                <div className="space-y-4">
                    {isSearching && <div className="text-center py-8 animate-pulse font-display text-zinc-400 uppercase">Hunting...</div>}
                    {searchResults.map(p => (
                        <div key={p.id} onClick={() => navigate(`/rate/${p.id}`, { state: { place: p } })} className="bg-white border-[3px] border-black rounded-2xl p-3 flex gap-4 cursor-pointer active:scale-[0.98] transition-transform">
                             <div className="w-16 h-16 rounded-xl border-[2px] border-black overflow-hidden shrink-0"><img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /></div>
                             <div className="flex-1 flex flex-col justify-center">
                                 <h4 className="font-display text-sm uppercase leading-tight">{p.name}</h4>
                                 <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">{p.location}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
      );
  }

  const displayPlace = place || { name: "Loading...", location: "Chicago, IL", imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60" };

  return (
    <div className="pb-32 bg-background-light min-h-screen">
      <main className="max-w-md mx-auto px-4 mt-6">
        <div className="relative mb-3">
          <button onClick={() => navigate('/rate')} className="absolute top-4 left-4 z-10 w-10 h-10 bg-white bold-border rounded-full flex items-center justify-center card-shadow active:translate-y-0.5 active:shadow-none transition-all">
            <span className="material-symbols-outlined text-xl text-black">arrow_back</span>
          </button>
          <div className="w-full h-48 overflow-hidden rounded-[2.5rem] bold-border card-shadow bg-zinc-200">
            <img src={displayPlace.imageUrl} alt="Pizza" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="mb-4 mt-8 px-2 text-center">
          <h1 className="font-display text-3xl leading-tight uppercase line-clamp-2">{displayPlace.name}</h1>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
            <span className="font-bold text-xs text-zinc-600 uppercase tracking-wide">{displayPlace.location}</span>
          </div>
        </div>

        <div className="bg-white border-[6px] border-black rounded-[2.5rem] p-6 card-shadow mb-8 space-y-8">
          
          <section className="space-y-6 border-b-[3px] border-black border-dashed pb-8">
            <h3 className="font-display text-xl uppercase text-center text-primary">YOUR VERDICT</h3>
            
            <div className="flex flex-col items-center">
                <label className="font-display text-xs uppercase text-zinc-400 mb-2">Overall Quality (1-5 Stars)</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          key={s} 
                          onClick={() => setReviewRating(s)}
                          className="transition-transform active:scale-90"
                        >
                            <span className={`material-symbols-outlined text-4xl ${s <= reviewRating ? 'text-secondary' : 'text-zinc-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                star
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="font-display text-xs uppercase text-zinc-400 block ml-1">Would you return?</label>
                <div className="flex gap-4">
                    <button onClick={() => { setWouldReturn(false); vibrate(10); }} className={`sticker-base flex-1 h-[60px] ${wouldReturn === false ? 'bg-rating-low rotate-1' : 'bg-white !text-black grayscale opacity-50'}`}>
                        <span className={`font-display uppercase tracking-wider text-sm ${wouldReturn === false ? 'text-sticker' : ''}`}>F#&% NO!</span>
                    </button>
                    <button onClick={() => { setWouldReturn(true); vibrate(10); }} className={`sticker-base flex-1 h-[60px] ${wouldReturn === true ? 'bg-rating-high -rotate-1' : 'bg-white !text-black grayscale opacity-50'}`}>
                        <span className={`font-display uppercase tracking-wider text-sm ${wouldReturn === true ? 'text-sticker' : ''}`}>HELL YEAH</span>
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="font-display text-xs uppercase text-zinc-400 block ml-1">Your thoughts</label>
                <textarea 
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us about the fold, the flop, and the flavor..."
                  className="w-full bg-zinc-50 border-[3px] border-black rounded-2xl p-4 font-semibold text-sm focus:ring-2 focus:ring-primary outline-none"
                />
            </div>

            <div className="space-y-2">
                <label className="font-display text-xs uppercase text-zinc-400 block ml-1">Verify with Receipt</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-[3px] border-black border-dashed rounded-2xl h-16 flex items-center justify-center gap-2 transition-all ${isVerified ? 'bg-green-50 border-green-500 text-green-700' : 'bg-zinc-50 hover:bg-zinc-100'}`}
                >
                    <span className="material-symbols-outlined">{isVerified ? 'check_circle' : 'receipt_long'}</span>
                    <span className="font-display text-xs uppercase tracking-widest">{isVerified ? 'VERIFIED' : 'UPLOAD RECEIPT'}</span>
                </button>
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="font-display text-xl uppercase text-center text-primary">THE BREAKDOWN</h3>
            
            <div className="relative">
                <label className="font-display text-sm uppercase tracking-wider text-black flex items-center gap-2 mb-3 px-1">
                <span className="text-xl filter drop-shadow-[1.5px_1.5px_0_#000]">🍕</span> <span className="font-black">PIZZA STYLE</span>
                </label>
                <button className="sticker-base w-full bg-secondary h-[60px] px-6 rotate-1" onClick={() => setShowDropdown(!showDropdown)}>
                <span className="font-display text-lg uppercase text-sticker tracking-widest">{style}</span>
                <span className="material-symbols-outlined text-black text-2xl font-black ml-4">expand_more</span>
                </button>
                {showDropdown && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowDropdown(false)}>
                    <div className="bg-white w-full max-w-xs border-[6px] border-black rounded-[2rem] p-6 card-shadow flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                        <h3 className="font-display text-xl uppercase text-black text-center mb-2">PICK A STYLE</h3>
                        {Object.values(PizzaStyle).map((s) => (
                            <button key={s} className={`sticker-base w-full h-[54px] text-lg ${style === s ? 'bg-chicago text-sticker' : 'bg-white !text-black'}`} onClick={() => { setStyle(s); setShowDropdown(false); vibrate(10); }}>
                            <span className={style === s ? 'text-sticker' : ''}>{s}</span>
                            </button>
                        ))}
                    </div>
                </div>
                )}
            </div>

            <div className="space-y-6">
                <RatingSlider label="PRICE POINT" icon="💰" value={price} onChange={(v) => handleSliderChange(setPrice, v)} mode="price" />
                <RatingSlider label="SAUCE PROFILE" icon="🍅" value={sauce} onChange={(v) => handleSliderChange(setSauce, v)} mode="sauce" />
                <RatingSlider label="CRUST TEXTURE" icon="🥨" value={crust} onChange={(v) => handleSliderChange(setCrust, v)} mode="crust" />
                <RatingSlider label="FRESHNESS FACTOR" icon="🌿" value={freshness} onChange={(v) => handleSliderChange(setFreshness, v)} mode="freshness" />
                <RatingSlider label="TOPPING FLAVOR" icon="🔥" value={toppingFlavor} onChange={(v) => handleSliderChange(setToppingFlavor, v)} mode="toppingFlavor" />
                <RatingSlider label="TOPPING AMOUNT" icon="🔴" value={toppingAmount} onChange={(v) => handleSliderChange(setToppingAmount, v)} mode="toppingAmount" />
                <RatingSlider label="GREASE LEVEL" icon="🥓" value={grease} onChange={(v) => handleSliderChange(setGrease, v)} mode="grease" />
                <RatingSlider label="CHEESE PULL" icon="🧀" value={cheese} onChange={(v) => handleSliderChange(setCheese, v)} mode="cheese" />
            </div>
          </section>

          <button 
            disabled={!reviewComment}
            className="sticker-base w-full bg-primary h-[80px] text-2xl mt-10 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:grayscale" 
            onClick={handleSubmit}
          >
            <span className="text-sticker tracking-widest">SUBMIT FEEDBACK 🍕</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default RateView;
