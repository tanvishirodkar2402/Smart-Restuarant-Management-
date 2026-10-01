import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ChefHat, Clock, CheckCircle2, Play, AlertCircle, RefreshCw, Flame, Utensils } from 'lucide-react';

export const KitchenDashboard = () => {
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKitchenOrders = async () => {
    try {
      const res = await api.get('/kitchen/orders');
      setKitchenOrders(res.data);
    } catch (err) {
      console.error("Fetch kitchen orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    // Auto refresh kitchen display every 5 seconds
    const interval = setInterval(() => {
      fetchKitchenOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/kitchen/orders/${orderId}/update-status`, null, {
        params: { new_status: newStatus }
      });
      fetchKitchenOrders();
    } catch (err) {
      console.error("Kitchen status update error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-emerald-400" /> Kitchen Display System (KDS)
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time incoming orders, prep time priority tickets & status controls</p>
        </div>

        <button
          onClick={fetchKitchenOrders}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-400 hover:bg-slate-800 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 animate-spin" /> Refresh Tickets
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-emerald-400">Loading KDS tickets...</div>
      ) : kitchenOrders.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl p-8 space-y-3">
          <ChefHat className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">All Kitchen Orders Clear!</h3>
          <p className="text-xs text-slate-500">No active orders pending in the preparation pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenOrders.map((order) => {
            let statusColor = 'border-amber-500/40 bg-amber-500/5';
            if (order.status === 'Preparing') statusColor = 'border-blue-500/40 bg-blue-500/5';
            if (order.status === 'Ready') statusColor = 'border-emerald-500/40 bg-emerald-500/5';

            return (
              <div
                key={order.id}
                className={`glass-panel p-6 rounded-3xl border ${statusColor} space-y-4 flex flex-col justify-between shadow-xl`}
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-sm font-black text-amber-400">{order.order_number}</span>
                      <span className="block text-xs text-slate-400">
                        {order.order_type} {order.table ? `• Table #${order.table.table_number}` : ''}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-900 border border-slate-800 text-slate-200">
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between text-xs py-1">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                            {item.quantity}
                          </span>
                          <div>
                            <span className="font-bold text-slate-100">{item.food_item?.name}</span>
                            {item.special_instructions && (
                              <p className="text-[11px] text-amber-300 font-medium italic mt-0.5">
                                ⚠️ Note: {item.special_instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-900/90 text-[11px] text-slate-400 border border-slate-800">
                      <strong className="text-amber-400">General Note:</strong> {order.notes}
                    </div>
                  )}
                </div>

                {/* Status Advancement Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  {order.status === 'Received' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Accepted')}
                      className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold text-xs transition-all"
                    >
                      Accept Order
                    </button>
                  )}

                  {order.status === 'Accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <Flame className="w-4 h-4" /> Start Preparing
                    </button>
                  )}

                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Ready')}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Ready
                    </button>
                  )}

                  {order.status === 'Ready' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Completed')}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition-all"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
