import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { 
  ShoppingBag, Trash2, Plus, Minus, Ticket, 
  ArrowRight, QrCode, Utensils, Bike, Package 
} from 'lucide-react';

export const CartPage = () => {
  const { 
    cartItems, updateQuantity, removeFromCart, clearCart,
    subtotal, discountAmount, taxAmount, totalAmount,
    orderType, setOrderType, selectedTable, setSelectedTable,
    appliedCoupon, setAppliedCoupon 
  } = useCart();

  const [tables, setTables] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch tables for dine-in dropdown
    const fetchTables = async () => {
      try {
        const res = await api.get('/tables');
        setTables(res.data.filter(t => t.status === 'Available' || t.status === 'Occupied'));
      } catch (err) {
        console.error("Fetch tables error:", err);
      }
    };
    fetchTables();
  }, []);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponInput.trim()) return;

    try {
      const res = await api.post(`/offers/validate/${couponInput.trim()}`, null, {
        params: { order_amount: subtotal }
      });
      setAppliedCoupon(res.data);
      setCouponSuccess(`Coupon '${res.data.code}' applied successfully! Save ₹${res.data.discount_amount.toFixed(2)}`);
    } catch (err) {
      setCouponError(err.response?.data?.detail || 'Invalid coupon code');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-200">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">Discover our handcrafted culinary menu and add delicious items to your order.</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
        >
          Browse Menu <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-amber-400" /> Shopping Cart
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Order Type Selector */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Dining Mode:
            </label>
            <div className="grid grid-cols-3 gap-3 text-xs font-bold">
              <button
                onClick={() => setOrderType('Dine-In')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  orderType === 'Dine-In'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Utensils className="w-4 h-4" /> Dine-In
              </button>

              <button
                onClick={() => setOrderType('Takeaway')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  orderType === 'Takeaway'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-4 h-4" /> Takeaway
              </button>

              <button
                onClick={() => setOrderType('Delivery')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  orderType === 'Delivery'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bike className="w-4 h-4" /> Delivery
              </button>
            </div>

            {/* Table Selection for Dine-In */}
            {orderType === 'Dine-In' && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
                <QrCode className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-400">Assigned Table Number:</label>
                  <select
                    value={selectedTable?.id || ''}
                    onChange={(e) => {
                      const t = tables.find(tbl => tbl.id === parseInt(e.target.value));
                      setSelectedTable(t || null);
                    }}
                    className="mt-1 w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Select Table Number --</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Table #{t.table_number} ({t.location} - Cap: {t.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.food_item_id}
                className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-900"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{item.name}</h4>
                    <span className="text-xs text-amber-400 font-semibold">₹{item.price.toFixed(2)} each</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity Modifier */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.food_item_id, item.quantity - 1)}
                      className="p-1 rounded-md text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-slate-100 px-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.food_item_id, item.quantity + 1)}
                      className="p-1 rounded-md text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-black text-slate-100 min-w-[60px] text-right">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.food_item_id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          
          {/* Coupon Code Card */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-400" /> Apply Coupon Code
            </h4>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Try WELCOME15 or TASTY20"
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Apply
              </button>
            </form>
            {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
            {couponSuccess && <p className="text-[11px] text-emerald-400">{couponSuccess}</p>}
          </div>

          {/* Pricing Breakdown */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="font-semibold text-slate-200">₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-200">₹{taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-black">
                <span className="text-slate-100">Total Payable</span>
                <span className="text-xl text-amber-400">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
