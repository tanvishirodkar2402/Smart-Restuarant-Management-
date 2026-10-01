import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ShoppingBag, ArrowRight, Clock, Utensils, Bike } from 'lucide-react';

export const OrdersHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    window.addEventListener('refreshOrders', fetchOrders);
    window.addEventListener('orderUpdated', fetchOrders);

    return () => {
      window.removeEventListener('refreshOrders', fetchOrders);
      window.removeEventListener('orderUpdated', fetchOrders);
    };
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-amber-400">Loading your order history...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-amber-400" /> My Order History
        </h1>
        <Link to="/menu" className="text-xs font-bold text-amber-400 hover:underline">
          Order Fresh Dish
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No Orders Yet</h3>
          <p className="text-xs text-slate-500">Place your first order to track it live!</p>
          <Link
            to="/menu"
            className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs"
          >
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-black text-amber-400 text-base">{order.order_number}</span>
                  <span className="block text-xs text-slate-400">{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-100">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                  <span className="block text-xs font-extrabold text-emerald-400">{order.status}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{order.order_type} {order.table ? `• Table #${order.table.table_number}` : ''} • {order.items.length} items</span>
                <Link
                  to={`/orders/${order.id}/track`}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold hover:bg-slate-800 flex items-center gap-1"
                >
                  Track Live <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
