import React from 'react';

interface MapPinProps {
  score?: number;
  isActive?: boolean;
  onClick?: () => void;
  color?: string;
  showScore?: boolean;
}

const MapPin: React.FC<MapPinProps> = ({ score, isActive = false, onClick, color = "#FF5733", showScore = true }) => {
  return (
    <div 
      className={`cursor-pointer transition-transform hover:scale-110 active:scale-95 flex flex-col items-center z-10 ${isActive ? 'z-20 scale-125' : ''}`}
      onClick={onClick}
    >
      {showScore && score && (
        <div className={`bg-secondary border-[3px] border-black px-2 py-0.5 rounded-lg bubble-shadow mb-1 ${isActive ? 'bg-white' : ''}`}>
          <span className="font-display text-xs text-black">{score}</span>
        </div>
      )}
      <svg className={`w-10 h-10 pizza-pin drop-shadow-[3px_3px_0_rgba(0,0,0,1)] ${isActive ? 'w-12 h-12' : ''}`} viewBox="0 0 100 110">
        <path d="M10,15 Q50,-5 90,15 L50,105 L10,15 Z" fill={color} stroke="black" strokeWidth="8"></path>
        <circle cx="35" cy="40" fill="#EF4444" r="5" stroke="black" strokeWidth="3"></circle>
        <circle cx="65" cy="35" fill="#EF4444" r="5" stroke="black" strokeWidth="3"></circle>
      </svg>
    </div>
  );
};

export default MapPin;
