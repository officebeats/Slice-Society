import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { FavoritesProvider } from './context/FavoritesContext';
import { FriendsProvider } from './context/FriendsContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { OrdersProvider } from './context/OrdersContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { loadGoogleMaps } from './services/GooglePlacesService';

// Route-level code splitting keeps the initial bundle lean; each view loads on demand.
const MapView = lazy(() => import('./views/MapView'));
const FeedView = lazy(() => import('./views/FeedView'));
const DetailsView = lazy(() => import('./views/DetailsView'));
const RateView = lazy(() => import('./views/RateView'));
const HistoryView = lazy(() => import('./views/HistoryView'));
const ProfileView = lazy(() => import('./views/ProfileView'));
const OrdersView = lazy(() => import('./views/OrdersView'));

const RouteFallback: React.FC = () => (
  <div className="min-h-[100dvh] flex items-center justify-center bg-background-light">
    <div className="animate-pulse w-16 h-16 seal-rotate" aria-label="Loading" role="status">
      <svg viewBox="0 0 100 110" className="w-full h-full drop-shadow-[3px_3px_0_rgba(0,0,0,1)]">
        <path d="M10,15 Q50,-5 90,15 L50,105 L10,15 Z" fill="#FF5733" stroke="black" strokeWidth="6"></path>
        <circle cx="35" cy="40" fill="#EF4444" r="5" stroke="black" strokeWidth="2"></circle>
        <circle cx="65" cy="35" fill="#EF4444" r="5" stroke="black" strokeWidth="2"></circle>
      </svg>
    </div>
  </div>
);

const App: React.FC = () => {
  useEffect(() => {
    loadGoogleMaps();
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <ReviewsProvider>
          <FavoritesProvider>
            <FriendsProvider>
              <RecentlyViewedProvider>
                <OrdersProvider>
                  <HashRouter>
                    <div className="antialiased text-black dark:text-white min-h-screen bg-background-light md:pl-24 transition-colors duration-300">
                      <Suspense fallback={<RouteFallback />}>
                        <Routes>
                          <Route path="/" element={<MapView />} />
                          <Route path="/feed" element={<FeedView />} />
                          <Route path="/details/:id" element={<DetailsView />} />
                          <Route path="/rate" element={<RateView />} />
                          <Route path="/rate/:id" element={<RateView />} />
                          <Route path="/history" element={<HistoryView />} />
                          <Route path="/orders" element={<OrdersView />} />
                          <Route path="/profile" element={<ProfileView />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Suspense>
                      <BottomNav />
                    </div>
                  </HashRouter>
                </OrdersProvider>
              </RecentlyViewedProvider>
            </FriendsProvider>
          </FavoritesProvider>
        </ReviewsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
