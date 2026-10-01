import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  CheckCircle2, Clock, ChefHat, Sparkles, PackageCheck, 
  MapPin, Utensils, Star, RefreshCw, ArrowLeft 
} from 'lucide-react';

export const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error("Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const handleOrderUpdate = (e) => {
      if (e.detail && (String(e.detail.id) === String(orderId) || e.detail.order_number?.toLowerCase() === order?.order_number?.toLowerCase())) {
        setOrder(e.detail);
      } else {
        fetchOrder();
      }
    };

    window.addEventListener('orderUpdated', handleOrderUpdate);
    window.addEventListener('refreshOrders', fetchOrder);

    // Auto-poll every 5 seconds for live status updates from the kitchen
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdate);
      window.removeEventListener('refreshOrders', fetchOrder);
      clearInterval(interval);
    };
  }, [orderId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        order_id: order.id,
        food_item_id: order.items[0]?.food_item_id || null,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSubmitted(true);
    } catch (err) {
      console.error("Review submit error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-amber-400 gap-3">
        <Sparkles className="w-6 h-6 animate-spin" />
        <span className="text-base font-medium">Fetching order status...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-200">Order Not Found</h2>
        <Link to="/orders" className="text-amber-400 underline text-sm">
          Return to My Orders
        </Link>
      </div>
    );
  }

  // Normalize status for timeline indexing
  const normalizeStatus = (statusStr) => {
    if (!statusStr) return 0;
    const s = statusStr.toLowerCase();
    if (s.includes('received')) return 0;
    if (s.includes('confirm') || s.includes('accept')) return 1;
    if (s.includes('prepar')) return 2;
    if (s.includes('ready')) return 3;
    if (s.includes('serv') || s.includes('out')) return 4;
    if (s.includes('deliver') || s.includes('complet')) return 5;
    return 0;
  };

  const timelineSteps = [
    { key: 'received', title: 'Order Received' },
    { key: 'confirmed', title: 'Order Confirmed' },
    { key: 'preparing', title: 'Preparing' },
    { key: 'ready', title: 'Ready' },
    { key: 'serving', title: order.order_type === 'Dine-In' ? 'Serving' : 'Out for Delivery' },
    { key: 'served', title: order.order_type === 'Dine-In' ? 'Served' : 'Delivered' },
  ];

  const currentStepIndex = normalizeStatus(order.status);

  // Calculate formatted expected ready time
  const getExpectedReadyTimeString = () => {
    if (order.expected_ready_time) {
      try {
        return new Date(order.expected_ready_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        // fallback
      }
    }
    const created = new Date(order.created_at || Date.now());
    const estMins = order.estimated_minutes || 20;
    const readyDate = new Date(created.getTime() + estMins * 60000);
    return readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFoodIcon = (name) => {
    if (!name) return '🍽️';
    const n = name.toLowerCase();
    if (n.includes('pizza')) return '🍕';
    if (n.includes('burger')) return '🍔';
    if (n.includes('biryani') || n.includes('rice')) return '🍲';
    if (n.includes('chai') || n.includes('tea') || n.includes('coffee')) return '☕';
    if (n.includes('juice') || n.includes('drink') || n.includes('lime')) return '🥤';
    if (n.includes('soup')) return '🥣';
    if (n.includes('ice') || n.includes('dessert') || n.includes('cake')) return '🍨';
    if (n.includes('paneer') || n.includes('tikka') || n.includes('starter')) return '🍢';
    return '🍽️';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/orders" className="text-xs font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> All Orders
        </Link>
        <button
          onClick={fetchOrder}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Live Sync Active
        </button>
      </div>

      {/* Main Customer Order Tracking Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Order Tracking Card
            </div>
            <h1 className="text-3xl font-black text-slate-100">{order.order_number}</h1>
            <p className="text-xs text-slate-400 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>

          <div className="text-left sm:text-right bg-slate-900/80 p-4 rounded-2xl border border-slate-800 min-w-[160px]">
            <span className="text-xs text-slate-400 font-medium block">Total Amount</span>
            <span className="text-2xl font-black text-amber-400">₹{parseFloat(order.total_amount).toFixed(2)}</span>
            <span className="block text-[11px] text-emerald-400 font-extrabold mt-0.5">
              🟢 {order.payment_status} ({order.payment_method})
            </span>
          </div>
        </div>

        {/* Live Status Header Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-brand-500/10 to-emerald-500/15 border border-amber-500/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <ChefHat className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block">Current Order Status</span>
              <h2 className="text-xl font-black text-slate-100">
                {order.status || 'Order Received'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Estimated Time</span>
              <span className="font-extrabold text-amber-400 text-sm">
                {order.estimated_minutes || 20}–{(order.estimated_minutes || 20) + 5} mins
              </span>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-400 block text-[10px] font-semibold">Expected Ready</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                {getExpectedReadyTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Stepper */}
        <div className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {timelineSteps.map((stepObj, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div 
                  key={stepObj.key}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                      : isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-slate-900/50 border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="text-sm font-extrabold">
                    {isCurrent ? '🔵' : (isCompleted ? '✓' : '○')}
                  </div>
                  <span className="text-[11px] font-extrabold leading-tight">
                    {stepObj.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dine-In / Delivery Info */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Order Mode</span>
            <span className="font-bold text-slate-100">{order.order_type}</span>
          </div>
          {order.table && (
            <div>
              <span className="text-slate-400 block font-medium">Seated Table</span>
              <span className="font-extrabold text-amber-400">Table #{order.table.table_number} ({order.table.location})</span>
            </div>
          )}
          <div>
            <span className="text-slate-400 block font-medium">Live Order Refresh</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Auto-Sync (5s)
            </span>
          </div>
        </div>

      </div>

      {/* Customer Order Items Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-base font-black text-slate-100 border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>Order Details</span>
          <span className="text-xs text-slate-400 font-normal">{order.items?.length || 0} Items</span>
        </h3>

        <div className="divide-y divide-slate-800/80">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs py-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                  {getFoodIcon(item.food_item?.name)}
                </span>
                <div>
                  <span className="font-bold text-slate-100 text-sm block">
                    {item.food_item?.name || 'Dish'} <span className="text-amber-400 text-xs font-black ml-1">× {item.quantity}</span>
                  </span>
                  {item.special_instructions && (
                    <span className="text-[11px] text-amber-300 italic block mt-0.5">Note: {item.special_instructions}</span>
                  )}
                </div>
              </div>

              <span className="font-mono font-extrabold text-slate-100 text-sm">₹{parseFloat(item.subtotal).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-bold">Subtotal</span>
          <span className="text-slate-200 font-bold font-mono">₹{parseFloat(order.subtotal || order.total_amount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm font-black pt-1">
          <span className="text-slate-100">Grand Total</span>
          <span className="text-amber-400 font-mono">₹{parseFloat(order.total_amount).toFixed(2)}</span>
        </div>
      </div>

      {/* Ratings & Review Section for Completed Orders */}
      {order.status === 'Completed' && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Rate Your Culinary Experience
          </h3>

          {reviewSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              Thank you! Your rating and feedback have been submitted successfully.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-2 rounded-xl text-lg ${
                        star <= reviewRating ? 'text-amber-400' : 'text-slate-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Feedback Comments</label>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us what you loved about the food and service..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
};
