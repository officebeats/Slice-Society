
import { PizzaPlace, Review, Achievement, PizzaStyle } from './types';

export const PIZZA_PLACES: PizzaPlace[] = [
  {
    id: '1', name: "Pequod's", location: "Lincoln Park", distance: "2.4 mi", rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60",
    lat: 41.9219, lng: -87.6643, coords: { x: 42, y: 45 },
    stats: { price: 2, sauce: 3, crust: 3, cheese: 2, toppingFlavor: 3, toppingAmount: 2, grease: 3, freshness: 3 },
    history: "Founded by Burt Katz, famous for the burnt cheese ring.",
    established: "1970", styles: [PizzaStyle.PAN, PizzaStyle.DEEP_DISH]
  },
  {
    id: '2', name: "Lou Malnati's", location: "River North", distance: "0.5 mi", rating: 4.2,
    imageUrl: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=500&q=60",
    lat: 41.8903, lng: -87.6337, coords: { x: 60, y: 30 },
    stats: { price: 2, sauce: 3, crust: 3, cheese: 2, toppingFlavor: 2, toppingAmount: 3, grease: 3, freshness: 2 },
    history: "Lou started at Pizzeria Uno before opening his own in 1971.",
    established: "1971", styles: [PizzaStyle.DEEP_DISH]
  },
  {
    id: '3', name: "Paisans", location: "Berwyn", distance: "8.2 mi", rating: 4.1,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60",
    lat: 41.8348, lng: -87.7918, coords: { x: 25, y: 65 },
    stats: { price: 1, sauce: 2, crust: 2, cheese: 3, toppingFlavor: 3, toppingAmount: 2, grease: 2, freshness: 2 },
    history: "Started as a small stand in a garage.",
    established: "1985", styles: [PizzaStyle.TAVERN]
  },
  {
    id: '4', name: "Pizano's", location: "The Loop", distance: "1.2 mi", rating: 4.0,
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60",
    lat: 41.8821, lng: -87.6246, coords: { x: 75, y: 55 },
    stats: { price: 2, sauce: 2, crust: 2, cheese: 2, toppingFlavor: 1, toppingAmount: 2, grease: 2, freshness: 2 },
    history: "Bridge between deep dish and thin crust worlds.",
    established: "1991", styles: [PizzaStyle.TAVERN]
  },
  {
    id: '5', name: "Pizzeria Uno", location: "River North", distance: "1.5 mi", rating: 4.4,
    imageUrl: "https://images.unsplash.com/photo-1593560708920-63984dc36f3c?auto=format&fit=crop&w=500&q=60",
    lat: 41.8928, lng: -87.6285, coords: { x: 62, y: 28 },
    stats: { price: 2, sauce: 3, crust: 3, cheese: 3, toppingFlavor: 2, toppingAmount: 3, grease: 3, freshness: 3 },
    history: "Founded in 1943 by Ike Sewell.",
    established: "1943", styles: [PizzaStyle.DEEP_DISH]
  },
  { 
    id: '6', name: "Vito & Nick's", location: "Ashburn", distance: "10.0 mi", rating: 4.7, 
    imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=500&q=60", 
    lat: 41.7425, lng: -87.7410, coords: { x: 15, y: 85 }, 
    stats: { price: 1, sauce: 2, crust: 3, cheese: 2, toppingFlavor: 3, toppingAmount: 2, grease: 1, freshness: 3 }, 
    history: "Three generations of pizza making excellence.", established: "1932", styles: [PizzaStyle.TAVERN] 
  },
  { 
    id: '7', name: "Coalfire", location: "West Loop", distance: "3.1 mi", rating: 4.5, 
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60", 
    lat: 41.8841, lng: -87.6661, coords: { x: 45, y: 40 }, 
    stats: { price: 2, sauce: 3, crust: 3, cheese: 2, toppingFlavor: 3, toppingAmount: 2, grease: 1, freshness: 3 }, 
    history: "Pioneer of the coal-fired movement in Chicago.", established: "2007", styles: [PizzaStyle.TAVERN] 
  },
  { 
    id: '8', name: "Spacca Napoli", location: "Ravenswood", distance: "5.5 mi", rating: 4.9, 
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60", 
    lat: 41.9616, lng: -87.6760, coords: { x: 38, y: 15 }, 
    stats: { price: 2, sauce: 3, crust: 3, cheese: 3, toppingFlavor: 3, toppingAmount: 2, grease: 1, freshness: 3 }, 
    history: "Jon Goldsmith traveled to Naples to master the art.", established: "2006", styles: [PizzaStyle.TAVERN] 
  },
  { 
    id: '9', name: "Piece Brewery", location: "Wicker Park", distance: "3.5 mi", rating: 4.3, 
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60", 
    lat: 41.9103, lng: -87.6743, coords: { x: 39, y: 48 }, 
    stats: { price: 2, sauce: 2, crust: 3, cheese: 2, toppingFlavor: 3, toppingAmount: 2, grease: 2, freshness: 2 }, 
    history: "Co-founded by Rick Nielsen of Cheap Trick.", established: "2001", styles: [PizzaStyle.TAVERN] 
  },
  { 
    id: '10', name: "Art of Pizza", location: "Lakeview", distance: "4.1 mi", rating: 4.6, 
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60", 
    lat: 41.9360, lng: -87.6685, coords: { x: 41, y: 25 }, 
    stats: { price: 1, sauce: 3, crust: 3, cheese: 3, toppingFlavor: 2, toppingAmount: 3, grease: 2, freshness: 3 }, 
    history: "Neighborhood staple known for quality and value.", established: "1989", styles: [PizzaStyle.PAN, PizzaStyle.TAVERN] 
  },
  { 
    id: '11', name: "Burt's Place", location: "Morton Grove", distance: "12.0 mi", rating: 4.7, 
    imageUrl: "https://images.unsplash.com/photo-1593560708920-63984dc36f3c?auto=format&fit=crop&w=500&q=60", 
    lat: 42.0405, lng: -87.7788, coords: { x: 20, y: 5 }, 
    stats: { price: 2, sauce: 3, crust: 3, cheese: 3, toppingFlavor: 3, toppingAmount: 2, grease: 2, freshness: 3 }, 
    history: "Burt Katz opened this after selling Pequod's.", established: "1989", styles: [PizzaStyle.PAN] 
  },
  { 
    id: '12', name: "Fat Chris's Pizza", location: "Andersonville", distance: "6.5 mi", rating: 4.4, 
    imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=500&q=60", 
    lat: 41.9725, lng: -87.6681, coords: { x: 35, y: 62 }, 
    stats: { price: 2, sauce: 2, crust: 3, cheese: 3, toppingFlavor: 3, toppingAmount: 2, grease: 2, freshness: 2 }, 
    history: "Andersonville's go-to for authentic Detroit style squares.", established: "2018", styles: [PizzaStyle.DETROIT] 
  },
  { 
    id: '13', name: "Pat's Pizza", location: "Lincoln Park", distance: "2.1 mi", rating: 4.4, 
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60", 
    lat: 41.9304, lng: -87.6586, coords: { x: 44, y: 32 }, 
    stats: { price: 2, sauce: 2, crust: 3, cheese: 2, toppingFlavor: 2, toppingAmount: 2, grease: 1, freshness: 3 }, 
    history: "Ultra-thin crust legends since 1950.", established: "1950", styles: [PizzaStyle.TAVERN] 
  },
  { 
    id: '14', name: "Aurelio's", location: "South Loop", distance: "1.0 mi", rating: 4.1, 
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60", 
    lat: 41.8688, lng: -87.6258, coords: { x: 70, y: 68 }, 
    stats: { price: 1, sauce: 3, crust: 2, cheese: 2, toppingFlavor: 2, toppingAmount: 2, grease: 2, freshness: 2 }, 
    history: "Classic sweet sauce and square cut since 1959.", established: "1959", styles: [PizzaStyle.TAVERN] 
  },
  { 
    id: '15', name: "Paulie Gee's", location: "Logan Square", distance: "4.8 mi", rating: 4.6, 
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60", 
    lat: 41.9288, lng: -87.7025, coords: { x: 32, y: 35 }, 
    stats: { price: 2, sauce: 3, crust: 3, cheese: 2, toppingFlavor: 3, toppingAmount: 2, grease: 1, freshness: 3 }, 
    history: "Wood-fired and Detroit-style squares expert.", established: "2016", styles: [PizzaStyle.DETROIT, PizzaStyle.TAVERN] 
  },
  { 
    id: '16', name: "Bonci", location: "West Loop", distance: "2.8 mi", rating: 4.5, 
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60", 
    lat: 41.8841, lng: -87.6496, coords: { x: 55, y: 40 }, 
    stats: { price: 3, sauce: 3, crust: 3, cheese: 2, toppingFlavor: 3, toppingAmount: 3, grease: 1, freshness: 3 }, 
    history: "Roman-style pizza al taglio cut with scissors.", established: "2017", styles: [PizzaStyle.PAN] 
  },
  { 
    id: '17', name: "George's Deep Dish", location: "Edgewater", distance: "7.1 mi", rating: 4.8, 
    imageUrl: "https://images.unsplash.com/photo-1593560708920-63984dc36f3c?auto=format&fit=crop&w=500&q=60", 
    lat: 41.9904, lng: -87.6710, coords: { x: 40, y: 5 }, 
    stats: { price: 2, sauce: 3, crust: 3, cheese: 3, toppingFlavor: 3, toppingAmount: 2, grease: 2, freshness: 3 }, 
    history: "Modern sourdough deep dish with Greek influence.", established: "2020", styles: [PizzaStyle.DEEP_DISH] 
  },
  { 
    id: '18', name: "Milly's Pizza", location: "Uptown", distance: "6.2 mi", rating: 4.7, 
    imageUrl: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=500&q=60", 
    lat: 41.9615, lng: -87.6534, coords: { x: 48, y: 15 }, 
    stats: { price: 2, sauce: 3, crust: 3, cheese: 3, toppingFlavor: 3, toppingAmount: 2, grease: 2, freshness: 3 }, 
    history: "Small-batch pan pizza inspired by Burt Katz.", established: "2020", styles: [PizzaStyle.PAN] 
  },
  { 
    id: '19', name: "Jets Pizza", location: "Wicker Park", distance: "3.4 mi", rating: 3.8, 
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60", 
    lat: 41.9103, lng: -87.6750, coords: { x: 38, y: 49 }, 
    stats: { price: 1, sauce: 2, crust: 3, cheese: 2, toppingFlavor: 2, toppingAmount: 2, grease: 2, freshness: 2 }, 
    history: "Detroit-style chain favorite.", established: "1978", styles: [PizzaStyle.DETROIT] 
  },
  { 
    id: '20', name: "Giordano's", location: "The Loop", distance: "1.3 mi", rating: 4.3, 
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60", 
    lat: 41.8850, lng: -87.6247, coords: { x: 72, y: 50 }, 
    stats: { price: 2, sauce: 2, crust: 2, cheese: 3, toppingFlavor: 2, toppingAmount: 3, grease: 2, freshness: 2 }, 
    history: "Famous for the stuffed deep dish style.", established: "1974", styles: [PizzaStyle.DEEP_DISH] 
  }
];

const generateReviews = () => {
  const reviews: Review[] = [];
  const reviewers = ["Tony S.", "Sarah W.", "DeepDishDan", "Monica_Chi", "BigMike_88", "SouthSidePride", "PizzaTourist", "LoopWalker", "CrustLover", "OldSchool", "CheesePullPro", "HeavyEater", "ThinCrustLover", "TavernTom", "Doreen_P"];
  
  PIZZA_PLACES.forEach(place => {
    const numReviews = 10 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numReviews; i++) {
      const reviewer = reviewers[i % reviewers.length];
      const style = place.styles[i % place.styles.length];
      const rating = 3 + Math.floor(Math.random() * 3);
      
      reviews.push({
        id: `r-${place.id}-${i}`,
        placeId: place.id,
        user: reviewer,
        userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${reviewer}${i}`,
        rating: rating,
        comment: `The ${style} here is ${rating >= 5 ? 'the absolute pinnacle' : 'a solid neighborhood choice'}. Perfect for a Friday night.`,
        wouldReturn: rating >= 4,
        style: style,
        timeAgo: `${i + 1}d ago`,
        isVerified: Math.random() > 0.4,
        photo: Math.random() > 0.7 ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=60" : undefined,
        upSlices: Math.floor(Math.random() * 25),
        downSlices: Math.floor(Math.random() * 5),
        stats: {
          price: place.stats.price,
          sauce: Math.min(3, Math.max(1, place.stats.sauce + (Math.random() > 0.5 ? 1 : -1))),
          crust: Math.min(3, Math.max(1, place.stats.crust + (Math.random() > 0.5 ? 1 : -1))),
          cheese: place.stats.cheese,
          toppingFlavor: place.stats.toppingFlavor,
          toppingAmount: place.stats.toppingAmount,
          grease: place.stats.grease,
          freshness: Math.min(3, Math.max(1, (place.stats.freshness || 2) + (Math.random() > 0.5 ? 1 : -1)))
        }
      });
    }
  });
  return reviews;
};

export const REVIEWS: Review[] = generateReviews();

export const ACHIEVEMENTS: Achievement[] = [
  { id: '1', name: 'Tavern King', description: 'Rate 5 Tavern Style spots', icon: 'local_pizza', color: 'bg-[#FFD700]', progress: 5, max: 5, isUnlocked: true },
  { id: '2', name: 'Deep Diver', description: 'Rate 5 Deep Dish spots', icon: 'pie_chart', color: 'bg-[#41B6E6]', progress: 3, max: 5, isUnlocked: false },
  { id: '3', name: 'City Explorer', description: 'Visit 3 different neighborhoods', icon: 'map', color: 'bg-[#FF5733]', progress: 2, max: 3, isUnlocked: false },
  { id: '4', name: 'Sauce Boss', description: 'Rate Sauce > 9 three times', icon: 'soup_kitchen', color: 'bg-[#FF3131]', progress: 1, max: 3, isUnlocked: false },
  { id: '5', name: 'Paparazzi', description: 'Upload 10 photos of slices', icon: 'photo_camera', color: 'bg-[#98FB98]', progress: 10, max: 10, isUnlocked: true },
  { id: '6', name: 'Frequent Flyer', description: 'Visit 5 different pizza places', icon: 'flight_takeoff', color: 'bg-[#E879F9]', progress: 2, max: 5, isUnlocked: false }
];
