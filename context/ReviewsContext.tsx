
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Review } from '../types';
import { REVIEWS as DEFAULT_REVIEWS } from '../constants';

interface UserVotes {
  [reviewId: string]: 'up' | 'down' | null;
}

interface ReviewsContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'timeAgo' | 'upSlices' | 'downSlices'>) => void;
  getReviewsForPlace: (placeId: string) => Review[];
  getAverageRating: (placeId: string, initialRating: number) => number;
  voteReview: (reviewId: string, type: 'up' | 'down') => void;
  getUserVote: (reviewId: string) => 'up' | 'down' | null;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('pizza_reviews_v1');
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch (e) {
      return DEFAULT_REVIEWS;
    }
  });

  const [userVotes, setUserVotes] = useState<UserVotes>(() => {
    try {
      const saved = localStorage.getItem('pizza_user_votes_v1');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('pizza_reviews_v1', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('pizza_user_votes_v1', JSON.stringify(userVotes));
  }, [userVotes]);

  const addReview = useCallback((reviewData: Omit<Review, 'id' | 'timeAgo' | 'upSlices' | 'downSlices'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      timeAgo: 'Just now',
      upSlices: 0,
      downSlices: 0
    };
    setReviews(prev => [newReview, ...prev]);
  }, []);

  const voteReview = useCallback((reviewId: string, type: 'up' | 'down') => {
    const currentVote = userVotes[reviewId];

    setReviews(prev => prev.map(rev => {
      if (rev.id !== reviewId) return rev;

      let newUpSlices = rev.upSlices;
      let newDownSlices = rev.downSlices;

      // Logic to handle existing votes
      if (currentVote === type) {
        // Toggle off
        if (type === 'up') newUpSlices--;
        else newDownSlices--;
      } else if (currentVote) {
        // Switch votes
        if (type === 'up') {
          newUpSlices++;
          newDownSlices--;
        } else {
          newDownSlices++;
          newUpSlices--;
        }
      } else {
        // First time vote
        if (type === 'up') newUpSlices++;
        else newDownSlices++;
      }

      return { ...rev, upSlices: newUpSlices, downSlices: newDownSlices };
    }));

    setUserVotes(prev => ({
      ...prev,
      [reviewId]: currentVote === type ? null : type
    }));
  }, [userVotes]);

  const getUserVote = useCallback((reviewId: string) => {
    return userVotes[reviewId] || null;
  }, [userVotes]);

  const getReviewsForPlace = useCallback((placeId: string) => {
    return reviews.filter(r => r.placeId === placeId);
  }, [reviews]);

  const getAverageRating = useCallback((placeId: string, initialRating: number) => {
    const placeReviews = reviews.filter(r => r.placeId === placeId);
    if (placeReviews.length === 0) {
      return initialRating > 5 ? initialRating / 2 : initialRating;
    }
    const sum = placeReviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / placeReviews.length).toFixed(1));
  }, [reviews]);

  return (
    <ReviewsContext.Provider value={{ reviews, addReview, getReviewsForPlace, getAverageRating, voteReview, getUserVote }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error('useReviews must be used within ReviewsProvider');
  return context;
};
