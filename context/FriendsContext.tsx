import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: 'incoming' | 'accepted';
}

interface FriendsContextType {
  friends: Friend[];
  addFriend: (name: string) => void;
  acceptRequest: (id: string) => void;
  removeFriend: (id: string) => void;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [friends, setFriends] = useState<Friend[]>(() => {
    try {
      const saved = localStorage.getItem('friends');
      if (saved) return JSON.parse(saved);
      // Default mock data if empty
      return [
        { 
            id: 'f1', 
            name: 'Sarah J.', 
            handle: '@deepdish_diva', 
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 
            status: 'accepted' 
        },
        { 
            id: 'f2', 
            name: 'Pizza Rat', 
            handle: '@pizzarat_chi', 
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rat', 
            status: 'incoming' 
        }
      ] as Friend[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  const addFriend = (username: string) => {
    // Simulate finding a user
    const name = username.replace('@', '');
    const newFriend: Friend = {
      id: Date.now().toString(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      handle: `@${name.toLowerCase()}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      status: 'accepted' // Auto-accept for demo purposes
    };
    setFriends(prev => [...prev, newFriend]);
  };

  const acceptRequest = (id: string) => {
    setFriends(prev => prev.map(f => f.id === id ? { ...f, status: 'accepted' } : f));
  };

  const removeFriend = (id: string) => {
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  return (
    <FriendsContext.Provider value={{ friends, addFriend, acceptRequest, removeFriend }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) throw new Error('useFriends must be used within FriendsProvider');
  return context;
};