import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MapView from './views/MapView';
import FeedView from './views/FeedView';
import DetailsView from './views/DetailsView';
import RateView from './views/RateView';
import HistoryView from './views/HistoryView';
import ProfileView from './views/ProfileView';
import BottomNav from './components/BottomNav';
import { FavoritesProvider } from './context/FavoritesContext';
import { FriendsProvider } from './context/FriendsContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { loadGoogleMaps } from './services/GooglePlacesService';

const App: React.FC = () => {
  useEffect(() => {
    loadGoogleMaps();
  }, []);

  return (
    <ReviewsProvider>
      <FavoritesProvider>
        <FriendsProvider>
          <RecentlyViewedProvider>
            <HashRouter>
              <div className="antialiased text-black min-h-screen bg-background-light md:pl-24 transition-all duration-300">
                <Routes>
                  <Route path="/" element={<MapView />} />
                  <Route path="/feed" element={<FeedView />} />
                  <Route path="/details/:id" element={<DetailsView />} />
                  <Route path="/rate" element={<RateView />} />
                  <Route path="/rate/:id" element={<RateView />} />
                  <Route path="/history" element={<HistoryView />} />
                  <Route path="/profile" element={<ProfileView />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <BottomNav />
              </div>
            </HashRouter>
          </RecentlyViewedProvider>
        </FriendsProvider>
      </FavoritesProvider>
    </ReviewsProvider>
  );
};

export default App;