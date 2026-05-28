import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PizzaPlace } from '../types';

interface RecentlyViewedContextType {
  recentlyViewed: PizzaPlace[];
  addToRecentlyViewed: (place: PizzaPlace) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export const RecentlyViewedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState<PizzaPlace[]>(() => {
    try {
      const saved = localStorage.getItem('recentlyViewed');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToRecentlyViewed = useCallback((place: PizzaPlace) => {
    setRecentlyViewed(prev => {
      // Remove existing occurrence to bump it to the top
      const filtered = prev.filter(p => p.id !== place.id);
      // Add new to front, limit to 5
      return [place, ...filtered].slice(0, 5);
    });
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addToRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  return context;
};