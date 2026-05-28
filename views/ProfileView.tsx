
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACHIEVEMENTS, PIZZA_PLACES } from '../constants';
import { Achievement, PizzaStyle } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { useFriends } from '../context/FriendsContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useReviews } from '../context/ReviewsContext';

const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { favorites } = useFavorites();
  const { friends, addFriend, acceptRequest, removeFriend } = useFriends();
  const { recentlyViewed } = useRecentlyViewed();
  const { reviews } = useReviews();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [activeTab, setActiveTab] = useState<'reviews' | 'saved' | 'friends'>('reviews');
  const [newFriendName, setNewFriendName] = useState("");

  // Gift Modal State
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [selectedGiftPlaceId, setSelectedGiftPlaceId] = useState<string>('');
  const [isGiftSent, setIsGiftSent] = useState(false);

  // Stamp Modal State
  const [showAllStamps, setShowAllStamps] = useState(false);
  const [activeStamp, setActiveStamp] = useState<Achievement | null>(null);

  // Mock User Identity (User's reviews are tagged as "You" in RateView)
  const [user, setUser] = useState({
    name: "Mike D.",
    handle: "@chi_pizza_king",
    bio: "Deep dish in the streets, tavern style in the sheets. 🍕 Verified Chicago local.",
    level: 7,
    xp: 75,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_S8LZrWJgiOSVb0dvqPTDJWnAp_JB8IJIHoNkjQy1BtiiSstLacFrkqDXneCZq2soifAxwbe9RVGkU6PFlFvG7Dr9xEN6L0uKVoJqlawa6mD0P3ar0bFIXXSepdXBWGNi-cua-R43xU1IAKeSTKG784-kroyPKO2kU2cKK3Adz-N25LxE2hoOgbFXyv1CNu0-BFNinRupH05OiV0LP-FO6Mhp_8GAlA0b5lpKoEVACmex5kuQjc4SSkiUdVUnkN2VYmXCaFuYN1U"
  });

  // Calculate stats from actual review data
  const userReviews = useMemo(() => reviews.filter(r => r.user === "You"), [reviews]);
  
  const flavorStats = useMemo(() => {
    return userReviews.reduce((acc, r) => {
      acc.up += r.upSlices || 0;
      acc.down += r.downSlices || 0;
      return acc;
    }, { up: 0, down: 0 });
  }, [userReviews]);

  const netFlavor = flavorStats.up - flavorStats.down;

  const savedPlaces = PIZZA_PLACES.filter(p => favorites.includes(p.id));
  const incomingRequests = friends.filter(f => f.status === 'incoming');
  const acceptedFriends = friends.filter(f => f.status === 'accepted');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = () => {
    setEditName(user.name);
    setEditBio(user.bio);
    setIsEditing(true);
  };

  const saveProfile = () => {
    setUser(prev => ({ ...prev, name: editName, bio: editBio }));
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  // Gift Handlers
  const openGiftModal = (recipientName?: string) => {
    setIsGiftSent(false);
    setGiftRecipient(recipientName || '');
    setSelectedGiftPlaceId('');
    setShowGiftModal(true);
  };

  const sendGift = () => {
    if (!giftRecipient || !selectedGiftPlaceId) return;
    setTimeout(() => {
        setIsGiftSent(true);
    }, 500);
  };

  const handleAddFriend = () => {
    if (newFriendName.trim()) {
        addFriend(newFriendName.trim());
        setNewFriendName("");
    }
  };

  const getStampRecommendations = (stamp: Achievement) => {
    switch(stamp.id) {
        case '1': // Tavern King
            return PIZZA_PLACES.filter(p => p.styles.includes(PizzaStyle.TAVERN)).slice(0, 2);
        case '2': // Deep Diver
            return PIZZA_PLACES.filter(p => p.styles.includes(PizzaStyle.DEEP_DISH)).slice(0, 2);
        case '3': // City Explorer
             const uniqueNeighborhoods = new Set<string>();
             return PIZZA_PLACES.filter(p => {
                 if(uniqueNeighborhoods.has(p.location)) return false;
                 uniqueNeighborhoods.add(p.location);
                 return true;
             }).slice(0, 3);
        case '4': // Sauce Boss
            return PIZZA_PLACES.filter(p => p.stats.sauce >= 3).slice(0, 2);
        default: 
            return PIZZA_PLACES.sort((a,b) => b.rating - a.rating).slice(0, 2);
    }
  };

  const BIO_LIMIT = 130;

  return (
    <div className="pt-8 pb-32 md:pb-8 px-4 w-full max-w-7xl mx-auto min-h-screen bg-background-light">
       {/* Header */}
      <header className="mb-6 flex justify-between items-center sticky top-0 bg-background-light z-40 py-2">
        <div>
          <h1 className="font-display text-3xl text-primary drop-shadow-[2px_2px_0_#000]">YOUR PROFILE</h1>
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-500">Member since '19</p>
        </div>
        <button className="w-10 h-10 bg-white border-[3px] border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all">
          <span className="material-symbols-outlined text-black">settings</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Info) */}
        <div className="space-y-6">
            {/* Hero Card */}
            <div className="bg-white border-[4px] border-black rounded-[2.5rem] p-6 card-shadow relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-chicago border-b-[4px] border-black opacity-20"></div>
                
                {!isEditing && (
                    <button 
                        onClick={startEditing}
                        className="absolute top-4 right-4 z-20 w-8 h-8 bg-white border-[2px] border-black rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined text-sm text-black">edit</span>
                    </button>
                )}

                <div className="relative z-10 flex flex-col items-center">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                    
                    <div 
                        className="w-28 h-28 rounded-full border-[4px] border-black overflow-hidden bg-zinc-200 mb-4 shadow-[4px_4px_0_0_#000] cursor-pointer relative group"
                        onClick={handleAvatarClick}
                    >
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover group-hover:brightness-90 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">photo_camera</span>
                        </div>
                    </div>
                    
                    {isEditing ? (
                        <div className="w-full space-y-3 mb-6">
                            <div>
                                <label className="font-bold text-[9px] uppercase tracking-wider ml-1 mb-1 block">Display Name</label>
                                <input 
                                    type="text" 
                                    value={editName} 
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-zinc-50 border-[3px] border-black rounded-xl px-3 py-2 font-display text-lg text-center uppercase focus:ring-2 focus:ring-primary focus:border-black outline-none"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between ml-1 mb-1">
                                    <label className="font-bold text-[9px] uppercase tracking-wider block">Bio</label>
                                    <span className={`font-bold text-[9px] ${editBio.length > BIO_LIMIT ? 'text-red-500' : 'text-zinc-400'}`}>
                                        {editBio.length}/{BIO_LIMIT}
                                    </span>
                                </div>
                                <textarea 
                                    value={editBio}
                                    onChange={(e) => {
                                        if (e.target.value.length <= BIO_LIMIT) {
                                            setEditBio(e.target.value);
                                        }
                                    }}
                                    rows={3}
                                    className="w-full bg-zinc-50 border-[3px] border-black rounded-xl px-3 py-2 text-sm font-semibold text-center focus:ring-2 focus:ring-primary focus:border-black outline-none resize-none"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button 
                                    onClick={cancelEditing}
                                    className="flex-1 bg-white border-[3px] border-black rounded-xl py-2 font-display text-sm uppercase hover:bg-zinc-100"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={saveProfile}
                                    className="flex-1 bg-primary text-white border-[3px] border-black rounded-xl py-2 font-display text-sm uppercase shadow-[2px_2px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="font-display text-2xl uppercase leading-none mb-1">{user.name}</h2>
                            <p className="font-bold text-sm text-zinc-500 mb-3">{user.handle}</p>
                            <p className="text-center text-sm font-semibold italic leading-tight max-w-[80%] mb-4">
                                "{user.bio}"
                            </p>

                            {/* Flavor (Karma) Display */}
                            <div className="flex items-center gap-3 mb-6 bg-zinc-50 px-4 py-2 rounded-2xl border-2 border-black border-dashed">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-primary text-xl" style={{ transform: 'rotate(180deg)' }}>local_pizza</span>
                                    <span className="font-display text-base text-primary">+{flavorStats.up}</span>
                                </div>
                                <div className="w-[2px] h-4 bg-zinc-300"></div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-zinc-800 text-xl" style={{ transform: 'rotate(0deg)' }}>local_pizza</span>
                                    <span className="font-display text-base text-zinc-800">-{flavorStats.down}</span>
                                </div>
                                <div className="ml-2 px-2 py-0.5 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm">
                                    Flavor: {netFlavor}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Stats */}
                    <div className="flex w-full justify-between px-4">
                        <div className="flex flex-col items-center">
                            <span className="font-display text-2xl text-primary">{userReviews.length}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Reviews</span>
                        </div>
                        <div className="w-[3px] h-full bg-zinc-200"></div>
                        <div className="flex flex-col items-center">
                            <span className="font-display text-2xl text-black">{favorites.length}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Saved</span>
                        </div>
                        <div className="w-[3px] h-full bg-zinc-200"></div>
                        <div className="flex flex-col items-center">
                            <span className="font-display text-2xl text-secondary">{acceptedFriends.length}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Friends</span>
                        </div>
                    </div>
                </div>
            </div>

             {/* Level Progress */}
             <div className="bg-secondary border-[4px] border-black rounded-2xl p-4 card-shadow flex items-center gap-4">
                <div className="w-12 h-12 bg-white border-[3px] border-black rounded-full flex items-center justify-center shrink-0">
                    <span className="font-display text-xl">{user.level}</span>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="font-display text-xs uppercase text-black">Slice Master</span>
                        <span className="font-bold text-[10px] uppercase text-black">750 / 1000 XP</span>
                    </div>
                    <div className="w-full h-3 bg-white border-[2px] border-black rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${user.xp}%` }}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column (Content) */}
        <div className="lg:col-span-2 space-y-6">

            {/* Recently Viewed Section */}
            {recentlyViewed.length > 0 && (
                <section>
                    <h3 className="font-display text-lg uppercase mb-3 px-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span> Freshly Viewed
                    </h3>
                    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 px-1 snap-x">
                        {recentlyViewed.map(place => (
                             <div 
                                key={place.id}
                                onClick={() => navigate(`/details/${place.id}`, { state: { place } })}
                                className="shrink-0 w-40 bg-white border-[3px] border-black rounded-2xl p-3 card-shadow cursor-pointer active:scale-95 transition-transform group snap-center"
                            >
                                <div className="w-full h-24 rounded-xl border-[2px] border-black overflow-hidden mb-2 relative bg-zinc-100">
                                    <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                    <div className={`absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded border border-black ${place.rating > 4.2 ? 'bg-primary text-white' : 'bg-secondary text-black'}`}>
                                        {place.rating}
                                    </div>
                                </div>
                                <h4 className="font-display text-xs uppercase leading-tight text-black truncate">{place.name}</h4>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-primary text-[10px]">location_on</span>
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase truncate max-w-[100px]">{place.location}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
            {/* Trophies/Badges */}
            <section>
                <div className="flex justify-between items-center mb-3 px-2">
                    <h3 className="font-display text-lg uppercase">Passport Stamps</h3>
                    <span 
                        onClick={() => setShowAllStamps(true)}
                        className="text-[10px] font-black uppercase underline cursor-pointer hover:text-primary active:scale-95 transition-transform"
                    >
                        View All
                    </span>
                </div>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 px-1">
                {ACHIEVEMENTS.map((badge) => (
                    <div 
                        key={badge.id} 
                        onClick={() => setActiveStamp(badge)}
                        className={`shrink-0 w-36 relative group cursor-pointer active:scale-95 transition-transform`}
                    >
                        <div className={`
                            h-48 border-[3px] border-black rounded-2xl p-3 flex flex-col items-center text-center justify-between transition-all
                            ${badge.isUnlocked ? badge.color : 'bg-zinc-100'}
                            ${badge.isUnlocked ? 'card-shadow' : 'border-dashed opacity-80'}
                        `}>
                            <div className={`w-14 h-14 rounded-full border-[3px] border-black flex items-center justify-center mb-1 relative z-10 ${badge.isUnlocked ? 'bg-white' : 'bg-zinc-200'}`}>
                                <span className={`material-symbols-outlined text-2xl ${badge.isUnlocked ? 'text-black' : 'text-zinc-400'}`}>{badge.icon}</span>
                                {badge.isUnlocked && (
                                    <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                                        <span className="material-symbols-outlined text-[10px]">check</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-center w-full z-10">
                                <h4 className={`font-display text-sm uppercase leading-tight mb-1 ${badge.isUnlocked ? 'text-black' : 'text-zinc-500'}`}>{badge.name}</h4>
                                <p className={`font-bold text-[9px] leading-tight mb-2 ${badge.isUnlocked ? 'text-black/70' : 'text-zinc-400'}`}>{badge.description}</p>
                                <div className="w-full bg-white/50 h-2 rounded-full border-[2px] border-black/10 overflow-hidden relative">
                                    <div 
                                        className={`absolute left-0 top-0 bottom-0 ${badge.isUnlocked ? 'bg-black' : 'bg-zinc-400'}`} 
                                        style={{ width: `${(badge.progress / badge.max) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="font-display text-[9px] mt-1 text-black/60">{badge.progress} / {badge.max}</span>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </section>

             {/* Tabs & Content */}
             <div>
                <div className="mb-4 flex gap-2">
                    {['reviews', 'saved', 'friends'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-3 border-[3px] border-black rounded-xl font-display uppercase text-xs sm:text-sm shadow-[2px_2px_0_0_rgba(0,0,0,0.2)] transition-all ${activeTab === tab ? 'bg-black text-white' : 'bg-white text-black'}`}
                        >
                            {tab === 'saved' ? `Saved (${favorites.length})` : tab === 'reviews' ? `Reviews (${userReviews.length})` : tab}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                     {activeTab === 'reviews' && (
                        userReviews.length > 0 ? (
                            userReviews.map((review, idx) => {
                                const place = PIZZA_PLACES.find(p => p.id === review.placeId);
                                return (
                                    <div key={idx} className="bg-white border-[3px] border-black p-4 rounded-2xl card-shadow">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-lg border-[3px] border-black overflow-hidden flex-shrink-0 bg-zinc-100">
                                                <img src={place?.imageUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=100&q=60"} alt="Pizza" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div>
                                                        <h4 className="font-display text-sm uppercase">{place?.name || "Unknown Spot"}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex gap-0.5">
                                                                {[1,2,3,4,5].map(s => (
                                                                    <span key={s} className={`material-symbols-outlined text-[10px] ${s <= review.rating ? 'text-secondary' : 'text-zinc-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-zinc-400">{review.timeAgo}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded border border-black/10">
                                                        <span className="material-symbols-outlined text-primary text-xs" style={{ transform: 'rotate(180deg)' }}>local_pizza</span>
                                                        <span className="text-[10px] font-black">{review.upSlices}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-semibold leading-tight mt-2 italic">"{review.comment}"</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 opacity-40 uppercase font-display bg-white border-[3px] border-black rounded-2xl border-dashed">No reviews yet.</div>
                        )
                    )}
                    
                    {activeTab === 'saved' && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {savedPlaces.length > 0 ? (
                                savedPlaces.map((place) => (
                                <div 
                                    key={place.id}
                                    onClick={() => navigate(`/details/${place.id}`)}
                                    className="relative bg-white border-[3px] border-black rounded-[1.5rem] card-shadow p-3 active:translate-y-1 active:shadow-none transition-all cursor-pointer h-full"
                                >
                                    <div className="flex gap-3">
                                    <div className="w-16 h-16 shrink-0 rounded-[1rem] border-2 border-black overflow-hidden relative bg-zinc-100">
                                        <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h2 className="font-display text-xs uppercase leading-tight line-clamp-1">{place.name}</h2>
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-primary text-[10px]">location_on</span>
                                                <span className="font-bold text-[9px] text-zinc-500 uppercase line-clamp-1">{place.location}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded border border-black uppercase truncate max-w-[80px]">
                                                {place.styles[0]}
                                            </span>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center p-8 bg-white border-[3px] border-black rounded-2xl border-dashed">
                                    <span className="material-symbols-outlined text-4xl text-zinc-300 mb-2">favorite_border</span>
                                    <p className="font-display text-zinc-400">No saved slices yet.</p>
                                </div>
                            )}
                         </div>
                    )}

                    {activeTab === 'friends' && (
                        <div className="space-y-6">
                            {/* Add Friend */}
                            <div className="bg-white border-[3px] border-black rounded-2xl p-4 card-shadow">
                                <h4 className="font-display text-sm uppercase mb-3">Add to Squad</h4>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="FIND @USERNAME" 
                                        value={newFriendName}
                                        onChange={(e) => setNewFriendName(e.target.value)}
                                        className="flex-1 bg-zinc-50 border-[3px] border-black rounded-xl px-3 py-2 font-display text-xs uppercase focus:ring-2 focus:ring-primary outline-none"
                                    />
                                    <button 
                                        onClick={handleAddFriend}
                                        className="bg-black text-white px-4 rounded-xl font-display text-xs uppercase hover:bg-zinc-800"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Friend Requests */}
                            {incomingRequests.length > 0 && (
                                <div>
                                    <h4 className="font-display text-sm uppercase mb-3 px-1 text-primary">Requests ({incomingRequests.length})</h4>
                                    <div className="space-y-3">
                                        {incomingRequests.map(req => (
                                            <div key={req.id} className="bg-white border-[3px] border-black rounded-xl p-3 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full border-[2px] border-black overflow-hidden bg-zinc-200">
                                                        <img src={req.avatar} alt={req.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-display text-xs uppercase">{req.name}</div>
                                                        <div className="text-[10px] font-bold text-zinc-500">{req.handle}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => removeFriend(req.id)} className="w-8 h-8 rounded-full border-[2px] border-black flex items-center justify-center hover:bg-red-100">
                                                        <span className="material-symbols-outlined text-red-500 text-sm">close</span>
                                                    </button>
                                                    <button onClick={() => acceptRequest(req.id)} className="w-8 h-8 rounded-full border-[2px] border-black bg-black flex items-center justify-center hover:bg-zinc-800">
                                                        <span className="material-symbols-outlined text-white text-sm">check</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Friends List */}
                            <div>
                                <h4 className="font-display text-sm uppercase mb-3 px-1">Your Crew ({acceptedFriends.length})</h4>
                                {acceptedFriends.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {acceptedFriends.map(friend => (
                                            <div key={friend.id} className="bg-white border-[3px] border-black rounded-2xl p-3 flex items-center justify-between card-shadow">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full border-[3px] border-black overflow-hidden bg-zinc-200">
                                                        <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="font-display text-sm uppercase">{friend.name}</div>
                                                        <div className="text-[10px] font-bold text-zinc-500">{friend.handle}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openGiftModal(friend.name)} className="w-9 h-9 bg-secondary border-[2px] border-black rounded-lg flex items-center justify-center active:scale-95 transition-transform">
                                                        <span className="material-symbols-outlined text-black text-sm">card_giftcard</span>
                                                    </button>
                                                    <button onClick={() => removeFriend(friend.id)} className="w-9 h-9 bg-white border-[2px] border-black rounded-lg flex items-center justify-center active:scale-95 transition-transform hover:bg-red-50">
                                                        <span className="material-symbols-outlined text-black text-sm">person_remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 bg-zinc-50 border-[3px] border-black border-dashed rounded-2xl">
                                        <span className="material-symbols-outlined text-3xl text-zinc-400 mb-2">groups</span>
                                        <p className="font-display text-xs text-zinc-500">Pizza tastes better with friends.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
             </div>

        </div>
      </div>

      {/* Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowGiftModal(false)}></div>
            <div className="bg-white border-[5px] border-black rounded-[2.5rem] w-full max-w-sm p-6 relative z-10 card-shadow animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowGiftModal(false)}
                    className="absolute top-4 right-4 w-8 h-8 bg-zinc-100 border-2 border-black rounded-full flex items-center justify-center hover:bg-zinc-200 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-sm text-black">close</span>
                </button>

                {!isGiftSent ? (
                    <div className="flex flex-col gap-4">
                        <div className="text-center mb-2">
                            <div className="w-16 h-16 bg-secondary border-[3px] border-black rounded-full flex items-center justify-center mx-auto mb-2 shadow-[3px_3px_0_0_#000]">
                                <span className="material-symbols-outlined text-3xl text-black">card_giftcard</span>
                            </div>
                            <h3 className="font-display text-2xl uppercase leading-none">Gift a Slice</h3>
                            <p className="text-xs font-bold text-zinc-500 uppercase mt-1">Treat a friend to the best deep dish</p>
                        </div>

                        <div>
                            <label className="font-display text-sm uppercase mb-1 block ml-1 text-black">For Who?</label>
                            <input 
                                type="text" 
                                placeholder="@USERNAME OR NAME"
                                value={giftRecipient}
                                onChange={(e) => setGiftRecipient(e.target.value)}
                                className="w-full bg-zinc-50 border-[3px] border-black rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-primary outline-none text-black"
                            />
                        </div>

                        <div>
                            <label className="font-display text-sm uppercase mb-1 block ml-1 text-black">Which Spot?</label>
                            <div className="relative">
                                <select 
                                    value={selectedGiftPlaceId}
                                    onChange={(e) => setSelectedGiftPlaceId(e.target.value)}
                                    className="w-full bg-zinc-50 border-[3px] border-black rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-primary outline-none appearance-none text-black pr-10"
                                >
                                    <option value="">Select a Pizzeria...</option>
                                    {PIZZA_PLACES.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black">expand_more</span>
                            </div>
                        </div>

                        <button 
                            onClick={sendGift}
                            disabled={!giftRecipient || !selectedGiftPlaceId}
                            className="mt-2 bg-black text-white border-[3px] border-black rounded-xl py-4 font-display text-lg uppercase shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800"
                        >
                            Send Gift 🎁
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="w-24 h-24 bg-green-400 border-[4px] border-black rounded-full flex items-center justify-center mb-4 bubble-shadow animate-bounce">
                            <span className="material-symbols-outlined text-5xl text-black">check</span>
                        </div>
                        <h3 className="font-display text-3xl uppercase leading-none mb-2 text-black">Sent!</h3>
                        <p className="font-bold text-sm text-zinc-600 mb-6 px-4">
                            You just made <span className="text-black">{giftRecipient}</span>'s day way better. You're a legend.
                        </p>
                        <button 
                            onClick={() => setShowGiftModal(false)}
                            className="w-full bg-white text-black border-[3px] border-black rounded-xl py-3 font-display text-lg uppercase shadow-[3px_3px_0_0_#000] hover:bg-zinc-50 active:translate-y-0.5 active:shadow-none transition-all"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* View All Stamps Modal */}
      {showAllStamps && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center pointer-events-none">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowAllStamps(false)}></div>
             <div className="bg-white border-[5px] border-black rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 w-full max-w-md max-h-[85vh] flex flex-col pointer-events-auto relative shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h2 className="font-display text-2xl uppercase">All Stamps</h2>
                    <button onClick={() => setShowAllStamps(false)} className="w-10 h-10 bg-zinc-100 border-[3px] border-black rounded-full flex items-center justify-center active:scale-90 transition-transform">
                        <span className="material-symbols-outlined text-black">close</span>
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-6 px-1">
                    {ACHIEVEMENTS.map((badge) => (
                        <div 
                            key={badge.id}
                            onClick={() => setActiveStamp(badge)}
                            className={`
                                h-40 border-[3px] border-black rounded-2xl p-3 flex flex-col items-center text-center justify-between transition-all cursor-pointer active:scale-95
                                ${badge.isUnlocked ? badge.color : 'bg-zinc-50'}
                                ${badge.isUnlocked ? 'card-shadow' : 'border-dashed opacity-70'}
                            `}
                        >
                             <div className={`w-12 h-12 rounded-full border-[3px] border-black flex items-center justify-center ${badge.isUnlocked ? 'bg-white' : 'bg-zinc-200'}`}>
                                <span className="material-symbols-outlined text-2xl text-black">{badge.icon}</span>
                             </div>
                             <div>
                                 <h4 className="font-display text-xs uppercase leading-tight mb-0.5 text-black">{badge.name}</h4>
                                 <p className="font-bold text-[8px] text-black/60">{badge.progress} / {badge.max}</p>
                             </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
      )}

      {/* Individual Stamp Detail Modal */}
      {activeStamp && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveStamp(null)}></div>
            <div className="bg-white border-[5px] border-black rounded-[2.5rem] w-full max-w-sm p-6 relative z-10 card-shadow animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setActiveStamp(null)}
                    className="absolute top-4 right-4 w-8 h-8 bg-zinc-100 border-2 border-black rounded-full flex items-center justify-center hover:bg-zinc-200 active:scale-95 transition-all z-20"
                >
                    <span className="material-symbols-outlined text-sm text-black">close</span>
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-28 h-28 rounded-full border-[4px] border-black flex items-center justify-center mb-4 bubble-shadow ${activeStamp.isUnlocked ? activeStamp.color : 'bg-zinc-200'}`}>
                        <span className={`material-symbols-outlined text-5xl ${activeStamp.isUnlocked ? 'text-black' : 'text-zinc-400'}`}>{activeStamp.icon}</span>
                    </div>
                    
                    <h2 className="font-display text-3xl uppercase leading-none mb-2 text-black">{activeStamp.name}</h2>
                    <p className="font-bold text-sm text-zinc-600 mb-6 px-2">{activeStamp.description}</p>
                    
                    {/* Big Progress Bar */}
                    <div className="w-full bg-zinc-100 h-6 rounded-full border-[3px] border-black overflow-hidden relative mb-6">
                        <div 
                            className={`absolute left-0 top-0 bottom-0 ${activeStamp.isUnlocked ? 'bg-black' : 'bg-primary'}`} 
                            style={{ width: `${(activeStamp.progress / activeStamp.max) * 100}%` }}
                        ></div>
                         <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-white drop-shadow-md z-10">
                            {activeStamp.progress} / {activeStamp.max} Completed
                         </span>
                    </div>

                    {!activeStamp.isUnlocked && (
                        <div className="w-full">
                            <h3 className="font-display text-lg uppercase mb-3 border-b-2 border-black pb-1 inline-block">Quest Targets</h3>
                            <div className="space-y-3 w-full">
                                {getStampRecommendations(activeStamp).map(place => (
                                    <div 
                                        key={place.id}
                                        onClick={() => navigate(`/details/${place.id}`)}
                                        className="bg-zinc-50 border-[3px] border-black rounded-xl p-3 flex items-center gap-3 text-left cursor-pointer hover:bg-white active:translate-y-0.5 active:shadow-none transition-all shadow-[2px_2px_0_0_#000]"
                                    >
                                        <div className="w-10 h-10 rounded-lg border-2 border-black overflow-hidden shrink-0">
                                            <img src={place.imageUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-display text-sm uppercase leading-none text-black">{place.name}</h4>
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">Start Quest →</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ProfileView;
