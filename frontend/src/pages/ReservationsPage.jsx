import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Users, Sparkles, QrCode, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReservationsPage = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [myReservations, setMyReservations] = useState([]);

  const [formData, setFormData] = useState({
    table_id: '',
    customer_name: user?.full_name || '',
    phone: user?.phone || '',
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '19:30',
    guest_count: 2,
    special_requests: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const tabRes = await api.get('/tables');
      setTables(tabRes.data);
      if (tabRes.data.length > 0 && !formData.table_id) {
        setFormData(prev => ({ ...prev, table_id: tabRes.data[0].id }));
      }

      if (user) {
        const resRes = await api.get('/reservations/my');
        setMyReservations(resRes.data);
      }
    } catch (err) {
      console.error("Fetch reservations error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/reservations', {
        table_id: parseInt(formData.table_id),
        customer_name: formData.customer_name || user?.full_name || 'Guest',
        phone: formData.phone || user?.phone || '',
        booking_date: formData.reservation_date,
        booking_time: formData.reservation_time,
        guests: parseInt(formData.guest_count),
        guest_count: parseInt(formData.guest_count),
        special_request: formData.special_requests,
        special_requests: formData.special_requests
      });

      setMessage({ type: 'success', text: 'Table reserved successfully! Confirmation generated.' });
      fetchData();
    } catch (err) {
      const errDetail = err.response?.data?.detail;
      setMessage({
        type: 'error',
        text: typeof errDetail === 'string' ? errDetail : 'Failed to book reservation.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-100 flex items-center justify-center gap-3">
          <Calendar className="w-8 h-8 text-amber-400" /> Table Reservation & QR Booking
        </h1>
        <p className="text-xs text-slate-400">Book your table in advance or scan table QR codes directly at your table</p>
        
        <div className="pt-2">
          <Link
            to="/book-table"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs hover:bg-amber-500/20 transition-all"
          >
            <QrCode className="w-4 h-4" /> Open Table QR Code Scanner / Booking Page
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Booking Form */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-slate-100">Reserve a Table</h2>

          {message.text && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              message.type === 'error'
                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            }`}>
              {message.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Table</label>
              <select
                required
                value={formData.table_id}
                onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
              >
                <option value="">-- Choose Dining Table --</option>
                {tables.map((t) => {
                  const statusSymbol = t.status === 'Available' ? '🟢' : t.status === 'Booked' ? '🔴' : '🟡';
                  return (
                    <option key={t.id} value={t.id}>
                      Table #{t.table_number} ({t.location} • Max {t.capacity} Guests) [{statusSymbol} {t.status}]
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.reservation_date}
                  onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                <select
                  value={formData.reservation_time}
                  onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="19:00">07:00 PM</option>
                  <option value="19:30">07:30 PM</option>
                  <option value="20:00">08:00 PM</option>
                  <option value="20:30">08:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Guests</label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={formData.guest_count}
                onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Special Requests</label>
              <textarea
                rows={2}
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                placeholder="High chair needed, anniversary setup, quiet corner..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : 'Confirm Table Reservation'}
            </button>
          </form>
        </div>

        {/* Existing Reservations & Tables Status Grid */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-100">Live Table Availability Overview</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {tables.map(t => {
              const isAvail = t.status === 'Available';
              const isBooked = t.status === 'Booked' || t.status === 'Occupied';
              return (
                <div key={t.id} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-200">Table #{t.table_number}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAvail ? 'bg-emerald-500/20 text-emerald-400' : isBooked ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {isAvail ? '🟢 Available' : isBooked ? '🔴 Booked' : '🟡 Reserved'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t.location} • Max {t.capacity} Guests</p>
                  <Link
                    to={`/book-table?table=${t.id}`}
                    className="text-[11px] text-amber-400 font-bold hover:underline block pt-1"
                  >
                    Scan / Book Table →
                  </Link>
                </div>
              );
            })}
          </div>

          {user && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-100">My Reservations History</h3>
              {myReservations.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No previous reservations.</p>
              ) : (
                <div className="space-y-2">
                  {myReservations.map((res) => (
                    <div key={res.id} className="glass-panel p-4 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-amber-400 block">Table #{res.table?.table_number || res.table_id}</span>
                        <span className="text-slate-400">{res.reservation_date || res.booking_date} at {res.reservation_time || res.booking_time}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                        {res.status || res.booking_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
