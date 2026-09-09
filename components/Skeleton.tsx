import React from 'react';

// Lightweight skeleton block used for loading states.
// Respects prefers-reduced-motion via the global CSS rule.
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse bg-black/10 rounded-lg ${className}`}
  />
);

// A card-shaped skeleton matching the feed/list place rows.
export const PlaceCardSkeleton: React.FC = () => (
  <div className="bg-white border-[3px] border-black rounded-2xl p-4 card-shadow flex gap-4">
    <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  </div>
);

export default Skeleton;
