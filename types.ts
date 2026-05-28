
export interface PizzaPlace {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number; // This will now represent the average star rating (1-5)
  imageUrl: string;
  lat: number;
  lng: number;
  coords: { x: number; y: number };
  stats: {
    price: number; 
    sauce: number; 
    crust: number; 
    cheese: number; 
    toppingFlavor: number; 
    toppingAmount: number; 
    grease: number; 
    freshness: number;
  };
  description?: string;
  history: string;
  popularFor?: string;
  anecdote?: string;
  established: string;
  styles: PizzaStyle[];
}

export interface Review {
  id: string;
  placeId: string;
  user: string;
  userAvatar: string;
  rating: number; // 1-5
  comment: string;
  wouldReturn?: boolean;
  style?: PizzaStyle;
  timeAgo: string;
  isVerified: boolean;
  photo?: string;
  upSlices: number;
  downSlices: number;
  stats?: {
    price: number; 
    sauce: number; 
    crust: number; 
    cheese: number; 
    toppingFlavor: number; 
    toppingAmount: number; 
    grease: number; 
    freshness: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  max: number;
  isUnlocked: boolean;
}

export enum PizzaStyle {
  TAVERN = "Tavern Style",
  DEEP_DISH = "Deep Dish",
  PAN = "Pan Pizza",
  DETROIT = "Detroit Style"
}
