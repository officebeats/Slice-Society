import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import { Order, OrderStatus } from '../types';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  PREPARING: 'Preparing',
  BAKING: 'In the Oven',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  READY_FOR_PICKUP: 'Ready for Pickup',
  COMPLETED: 'Completed',
};

const deliverySteps: OrderStatus[] = ['PLACED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'COMPLETED'];
const pickupSteps: OrderStatus[] = ['PLACED', 'PREPARING', 'BAKING', 'READY_FOR_PICKUP', 'COMPLETED'];

const OrderCard: React.FC<{ order: Order; onCancel?: (id: string) => void }> = ({ order, onCancel }) => {
  const steps = order.platform === 'PICKUP' ? pickupSteps : deliverySteps;
  const currentIdx = Math.max(0, steps.indexOf(order.status));
  const pct = (currentIdx / (steps.length - 1)) * 100;

  return (
    <div className="bg-white border-[4px] border-black rounded-[2rem] p-5 card-shadow">
      <div className="flex gap-4 items-center">
        <div className="w-16 h-16 rounded-2xl border-[3px] border-black overflow-hidden bg-zinc-100 shrink-0">
          <img src={order.imageUrl} alt={order.placeName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg uppercase leading-tight truncate">{order.placeName}</h3>
          <p className="text-[11px] font-bold text-zinc-500 uppercase truncate">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ${order.total.toFixed(2)} • {order.platform}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-lg text-primary leading-none">{order.eta}m</div>
          <div className="text-[10px] font-black uppercase text-zinc-400">ETA</div>
        </div>
      </div>

      {order.status !== 'COMPLETED' && (
        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            <span className="font-display text-xs uppercase text-black">{STATUS_LABEL[order.status]}</span>
            <span className="font-bold text-[10px] uppercase text-zinc-400">{currentIdx + 1}/{steps.length}</span>
          </div>
          <div className="w-full h-3 bg-zinc-100 border-[2px] border-black rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {onCancel && order.status !== 'COMPLETED' && (
        <button
          onClick={() => onCancel(order.id)}
          className="mt-4 w-full py-2.5 border-[3px] border-black rounded-xl font-display text-xs uppercase hover:bg-red-50 active:translate-y-0.5 transition-all"
        >
          Cancel Order
        </button>
      )}
    </div>
  );
};

const OrdersView: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrders, pastOrders, cancelOrder, clearPastOrders } = useOrders();

  const isEmpty = activeOrders.length === 0 && pastOrders.length === 0;

  return (
    <div className="pt-8 pb-32 md:pb-8 px-4 w-full max-w-3xl mx-auto min-h-screen bg-background-light">
      <header className="mb-6 flex justify-between items-center sticky top-0 bg-background-light z-40 py-2">
        <div>
          <h1 className="font-display text-3xl text-primary drop-shadow-[2px_2px_0_#000]">YOUR ORDERS</h1>
          <p className="font-bold text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Track the bake in real time</p>
        </div>
        {pastOrders.length > 0 && (
          <button
            onClick={clearPastOrders}
            className="w-10 h-10 bg-white border-[3px] border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0_0_#000] active:translate-y-0.5 active:shadow-none transition-all"
            aria-label="Clear order history"
          >
            <span className="material-symbols-outlined text-black">delete_sweep</span>
          </button>
        )}
      </header>

      {isEmpty ? (
        <div className="text-center py-16 bg-white border-[3px] border-black border-dashed rounded-[2rem]">
          <span className="material-symbols-outlined text-6xl text-zinc-300" aria-hidden="true">receipt_long</span>
          <p className="font-display text-xl uppercase text-zinc-400 mt-3">No orders yet</p>
          <p className="font-bold text-xs text-zinc-400 uppercase mt-1 mb-6 px-6">Find a spot and order a pie to watch it bake.</p>
          <button
            onClick={() => navigate('/feed')}
            className="sticker-base bg-primary h-14 px-8 text-lg mx-auto"
          >
            <span className="text-sticker tracking-wider">BROWSE SLICES 🍕</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {activeOrders.length > 0 && (
            <section>
              <h2 className="font-display text-lg uppercase mb-3 px-1 flex items-center gap-2 text-black dark:text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-rating-high animate-pulse" /> Active ({activeOrders.length})
              </h2>
              <div className="space-y-4">
                {activeOrders.map(o => (
                  <OrderCard key={o.id} order={o} onCancel={cancelOrder} />
                ))}
              </div>
            </section>
          )}

          {pastOrders.length > 0 && (
            <section>
              <h2 className="font-display text-lg uppercase mb-3 px-1 text-black dark:text-white">History ({pastOrders.length})</h2>
              <div className="space-y-4 opacity-90">
                {pastOrders.map(o => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersView;
