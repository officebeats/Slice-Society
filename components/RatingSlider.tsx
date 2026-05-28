
import React from 'react';

export type RatingMode = 'sauce' | 'crust' | 'cheese' | 'toppingFlavor' | 'toppingAmount' | 'price' | 'grease' | 'freshness';

interface RatingSliderProps {
  label: string;
  icon: string;
  value: number;
  onChange: (val: number) => void;
  mode: RatingMode;
}

const RatingSlider: React.FC<RatingSliderProps> = ({ label, icon, value, onChange, mode }) => {
  
  const getDynamicLabel = (val: number, currentMode: RatingMode): string => {
    if (currentMode === 'price') {
      if (val === 1) return '$ BUDGET';
      if (val === 2) return '$$ MID-RANGE';
      return '$$$ PREMIUM';
    }
    
    if (currentMode === 'crust') {
      if (val === 1) return 'SOGGY';
      if (val === 2) return 'STIFF';
      return 'CRUNCHY';
    }

    if (currentMode === 'cheese') {
      if (val === 1) return 'NO PULL';
      if (val === 2) return 'STRINGY';
      return 'INFINITE';
    }

    if (currentMode === 'sauce') {
      if (val === 1) return 'MILD/SWEET';
      if (val === 2) return 'BALANCED';
      return 'ZESTY/SPICY';
    }

    if (currentMode === 'grease') {
      if (val === 1) return 'DRY';
      if (val === 2) return 'GLISTENING';
      return 'DEEP PUDDLE';
    }

    if (currentMode === 'freshness') {
      if (val === 1) return 'MOLDY';
      if (val === 2) return 'EDIBLE';
      return 'RIPE';
    }

    if (currentMode === 'toppingFlavor') {
      if (val === 1) return 'BLAND';
      if (val === 2) return 'ZESTY';
      return 'RICH/EXPLOSIVE';
    }

    if (currentMode === 'toppingAmount') {
      if (val === 1) return 'SCARCE';
      if (val === 2) return 'PLENTIFUL';
      return 'LOADED';
    }

    return val.toString().toUpperCase();
  };

  const getTrackClass = () => {
    // For price and grease, high value (3) is "bad" or "heavy" -> Red
    // For freshness, low value (1) is "bad" (moldy) -> Red
    if (mode === 'price' || mode === 'grease') {
      if (value === 3) return 'track-low'; // CSS track-low is Red
      if (value === 1) return 'track-high'; // CSS track-high is Green
      return 'track-mid'; // CSS track-mid is Orange
    }
    // For others, high value is "better" quality -> Green
    if (value === 1) return 'track-low';
    if (value === 3) return 'track-high';
    return 'track-mid';
  };

  const getScoreBg = () => {
    if (mode === 'price' || mode === 'grease') {
      if (value === 3) return 'bg-rating-low rotate-1'; // Red
      if (value === 2) return 'bg-rating-mid -rotate-1'; // Orange
      return 'bg-rating-high rotate-1'; // Green
    }
    if (value === 1) return 'bg-rating-low -rotate-1';
    if (value === 3) return 'bg-rating-high rotate-1';
    return 'bg-rating-mid -rotate-1';
  };

  const dynamicLabel = getDynamicLabel(value, mode);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center px-1">
        <label className="font-display text-sm uppercase tracking-wider text-black flex items-center gap-2">
          <span className="text-xl filter drop-shadow-[1.5px_1.5px_0_#000]">{icon}</span> 
          <span className="font-black">{label}</span>
        </label>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-grow relative">
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="1" 
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className={`w-full ${getTrackClass()}`}
          />
          <div className="flex justify-between mt-1 px-1">
             <div className="w-0.5 h-0.5 bg-black/20 rounded-full"></div>
             <div className="w-0.5 h-0.5 bg-black/20 rounded-full"></div>
             <div className="w-0.5 h-0.5 bg-black/20 rounded-full"></div>
          </div>
        </div>
        <div className={`sticker-base ${getScoreBg()} min-w-[115px] h-[48px] px-2`}>
          <span className="font-black tracking-tight text-[11px] text-sticker leading-none whitespace-nowrap">
            {dynamicLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RatingSlider;
