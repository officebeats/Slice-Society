import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderItem, OrderPlatform, OrderStatus, PizzaStyle } from '../types';

interface OrdersContextType {
  activeOrders: Order[];
  pastOrders: Order[];
  placeOrder: (
    platform: OrderPlatform,
    placeId: string,
    placeName: string,
    placeAddress: string,
    imageUrl: string,
    items: OrderItem[],
    subtotal: number,
    tax: number,
    deliveryFee: number | undefined,
    serviceFee: number,
    dasherTip: number | undefined,
    total: number
  ) => Order;
  cancelOrder: (orderId: string) => void;
  clearPastOrders: () => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);

  // Load orders from localStorage
  useEffect(() => {
    try {
      const savedActive = localStorage.getItem('slice_society_active_orders');
      const savedPast = localStorage.getItem('slice_society_past_orders');
      if (savedActive) setActiveOrders(JSON.parse(savedActive));
      if (savedPast) setPastOrders(JSON.parse(savedPast));
    } catch (e) {
      console.error('Failed to load orders from cache', e);
    }
  }, []);

  // Save orders to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('slice_society_active_orders', JSON.stringify(activeOrders));
    } catch (e) {}
  }, [activeOrders]);

  useEffect(() => {
    try {
      localStorage.setItem('slice_society_past_orders', JSON.stringify(pastOrders));
    } catch (e) {}
  }, [pastOrders]);

  // Order status advancement simulation
  useEffect(() => {
    if (activeOrders.length === 0) return;

    const interval = setInterval(() => {
      setActiveOrders((prevActive) => {
        const updatedActive: Order[] = [];
        const completed: Order[] = [];

        prevActive.forEach((order) => {
          let nextStatus: OrderStatus = order.status;
          let nextEta = Math.max(0, order.eta - 2);

          if (order.status === 'PLACED') {
            nextStatus = 'PREPARING';
            nextEta = 15;
          } else if (order.status === 'PREPARING') {
            nextStatus = 'BAKING';
            nextEta = 10;
          } else if (order.status === 'BAKING') {
            if (order.platform === 'PICKUP') {
              nextStatus = 'READY_FOR_PICKUP';
              nextEta = 5;
            } else {
              nextStatus = 'OUT_FOR_DELIVERY';
              nextEta = 8;
            }
          } else if (order.status === 'OUT_FOR_DELIVERY' || order.status === 'READY_FOR_PICKUP') {
            nextStatus = 'COMPLETED';
            nextEta = 0;
          }

          const updatedOrder = {
            ...order,
            status: nextStatus,
            eta: nextEta,
          };

          if (nextStatus === 'COMPLETED') {
            completed.push(updatedOrder);
          } else {
            updatedActive.push(updatedOrder);
          }
        });

        if (completed.length > 0) {
          setPastOrders((prevPast) => [...completed, ...prevPast]);
        }

        return updatedActive;
      });
    }, 10000); // Advance status every 10 seconds for testing simulation speed

    return () => clearInterval(interval);
  }, [activeOrders]);

  const placeOrder = (
    platform: OrderPlatform,
    placeId: string,
    placeName: string,
    placeAddress: string,
    imageUrl: string,
    items: OrderItem[],
    subtotal: number,
    tax: number,
    deliveryFee: number | undefined,
    serviceFee: number,
    dasherTip: number | undefined,
    total: number
  ): Order => {
    const initialEta = platform === 'PICKUP' ? 20 : 35; // 20 mins for pickup, 35 mins for delivery
    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      placeId,
      placeName,
      placeAddress,
      imageUrl,
      items,
      subtotal,
      tax,
      deliveryFee,
      serviceFee,
      dasherTip,
      total,
      status: 'PLACED',
      platform,
      timestamp: new Date().toISOString(),
      eta: initialEta,
    };

    setActiveOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const clearPastOrders = () => {
    setPastOrders([]);
  };

  return (
    <OrdersContext.Provider
      value={{
        activeOrders,
        pastOrders,
        placeOrder,
        cancelOrder,
        clearPastOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
