import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getButtonClass = (path: string) => {
    const isActive = location.pathname === path;
    const base = "flex flex-col items-center justify-center w-10 h-10 rounded-xl border-[3px] border-black shadow-[2px_2px_0_0_#000] mb-1 transition-all group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0_0_#000] group-active:translate-y-0 group-active:shadow-none";
    return isActive 
      ? `${base} bg-primary text-white border-black` 
      : `${base} bg-white text-black border-black`;
  };

  const getLabelClass = (path: string) => {
     const isActive = location.pathname === path;
     return isActive 
       ? "text-[9px] font-black uppercase tracking-tighter text-primary"
       : "text-[9px] font-black uppercase tracking-tighter text-black";
  };

  const getIconClass = (path: string) => {
     const isActive = location.pathname === path;
     return isActive ? "text-2xl text-white" : "text-2xl text-black";
  };

  return (
    <nav className="
      fixed z-[100] bg-white nav-border shadow-none
      bottom-0 left-0 right-0 h-24 px-4 pb-6 pt-2 flex justify-between items-center
      md:top-0 md:left-0 md:bottom-0 md:w-24 md:h-screen md:flex-col md:justify-start md:gap-8 md:pt-8 md:border-t-0 md:border-r-[5px] md:border-black
    ">
      
      {/* Brand Icon for Desktop */}
      <div className="hidden md:flex mb-4 w-12 h-12 bg-black rounded-full items-center justify-center border-2 border-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)]">
         <span className="material-symbols-outlined text-white text-2xl">local_pizza</span>
      </div>

      <button className="flex flex-col items-center w-14 group" onClick={() => navigate('/')}>
        <div className={getButtonClass('/')}>
          <span className={`material-symbols-outlined ${getIconClass('/')}`}>map</span>
        </div>
        <span className={getLabelClass('/')}>Map</span>
      </button>

      <button className="flex flex-col items-center w-14 group" onClick={() => navigate('/feed')}>
        <div className={getButtonClass('/feed')}>
          <span className={`material-symbols-outlined ${getIconClass('/feed')}`}>article</span>
        </div>
        <span className={getLabelClass('/feed')}>Feed</span>
      </button>

      {/* FAB - Adjusted for Desktop */}
      <div className="relative -mt-12 md:mt-0 md:order-last md:mb-8">
        <button 
          className="w-20 h-24 relative flex flex-col items-center justify-center group active:scale-95 transition-transform" 
          onClick={() => navigate('/rate')}
          aria-label="Rate a Pizza"
        >
          <div className="relative w-20 h-24 filter drop-shadow-[4px_4px_0_rgba(0,0,0,1)] group-active:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all">
             <svg viewBox="0 0 100 110" className="w-full h-full">
                {/* Crust & Slice */}
                <path d="M10,15 Q50,-5 90,15 L50,105 L10,15 Z" fill="#FFD700" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                {/* Inner Cheese Detail */}
                <path d="M20,22 Q50,10 80,22 L50,90 L20,22" fill="#FDE047" stroke="none" opacity="0.5" />
                {/* Pepperoni Decors */}
                <circle cx="30" cy="35" r="4" fill="#EF4444" stroke="black" strokeWidth="1.5" />
                <circle cx="70" cy="35" r="4" fill="#EF4444" stroke="black" strokeWidth="1.5" />
                <circle cx="50" cy="80" r="3" fill="#EF4444" stroke="black" strokeWidth="1.5" />
             </svg>
             {/* Icon Overlay */}
             <div className="absolute inset-0 flex items-center justify-center pb-2">
                <div className="bg-white border-[3px] border-black rounded-lg w-9 h-9 flex items-center justify-center shadow-sm">
                   <span className="material-symbols-outlined text-xl text-black font-black">rate_review</span>
                </div>
             </div>
          </div>
        </button>
      </div>

      <button className="flex flex-col items-center w-14 group" onClick={() => navigate('/history')}>
        <div className={getButtonClass('/history')}>
          <span className={`material-symbols-outlined ${getIconClass('/history')}`}>auto_stories</span>
        </div>
        <span className={getLabelClass('/history')}>History</span>
      </button>

      <button className="flex flex-col items-center w-14 group" onClick={() => navigate('/profile')}>
        <div className={getButtonClass('/profile')}>
          <span className={`material-symbols-outlined ${getIconClass('/profile')}`}>account_circle</span>
        </div>
        <span className={getLabelClass('/profile')}>Profile</span>
      </button>
    </nav>
  );
};

export default BottomNav;