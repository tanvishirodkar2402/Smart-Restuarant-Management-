import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CreditCard, Smartphone, Banknote, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const CheckoutPage = () => {
  const { cartItems, orderType, selectedTable, appliedCoupon, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        table_id: orderType === 'Dine-In' ? (selectedTable?.id || null) : null,
        order_type: orderType,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        notes: notes + (orderType === 'Delivery' ? ` | Delivery Address: ${address}` : ''),
        items: cartItems.map((item) => ({
          food_item_id: item.food_item_id,
          quantity: item.quantity,
          special_instructions: item.special_instructions || '',
        })),
      };

      const res = await api.post('/orders', payload);
      clearCart();
      navigate(`/orders/${res.data.id}/track`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-100">Secure Order Checkout</h1>
        <p className="text-xs text-slate-400">Review payment details and place your order directly with the kitchen</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Payment & Delivery Options */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Dining Details Summary */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              1. Dining & Order Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block">Order Mode</span>
                <span className="font-extrabold text-amber-400">{orderType}</span>
              </div>
              {orderType === 'Dine-In' && (
                <div>
                  <span className="text-slate-500 block">Table Number</span>
                  <span className="font-extrabold text-slate-200">
                    {selectedTable ? `Table #${selectedTable.table_number}` : 'Unassigned (Counter Order)'}
                  </span>
                </div>
              )}
            </div>

            {orderType === 'Delivery' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter street address, apartment, city..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              2. Select Payment Method
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'Card'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-5 h-5" /> Credit/Debit Card
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-5 h-5" /> Instant UPI / Wallet
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'Cash'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Banknote className="w-5 h-5" /> Cash at Counter
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Special Instructions / Chef Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Less spicy, extra napkins, cutlery required..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

        </div>

        {/* Right Column: Total & Pay */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3">
              Payment Total
            </h3>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Items Ordered</span>
                <span className="font-bold text-slate-200">{cartItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="text-2xl font-black text-amber-400">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>256-bit encrypted simulated instant checkout</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Transmitting to Kitchen...
                </>
              ) : (
                <>
                  Place Order (₹{totalAmount.toFixed(2)}) <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
