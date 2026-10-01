import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  QrCode, Calendar, Clock, Users, User, Phone, 
  FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Utensils
} from 'lucide-react';

export const QRBookingPage = () => {
  const [searchParams] = useSearchParams();
  const { tableId } = useParams();
  const navigate = useNavigate();

  // Extract table identifier from URL path params (/book/table/1) or query parameter (?table=1)
  const tableParam = tableId || searchParams.get('table') || searchParams.get('table_id') || searchParams.get('table_number');

  const [table, setTable] = useState(null);
  const [tablesList, setTablesList] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState('');

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    booking_date: new Date().toISOString().split('T')[0],
    booking_time: '19:30',
    guests: 2,
    special_request: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchingTable, setFetchingTable] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [tableParam]);

  const fetchInitialData = async () => {
    setFetchingTable(true);
    setErrorMsg('');
    try {
      const allTablesRes = await api.get('/tables');
      setTablesList(allTablesRes.data);

      if (tableParam) {
        // Try finding table by ID or by table_number
        let matched = allTablesRes.data.find(
          t => String(t.id) === String(tableParam) || String(t.table_number).toLowerCase() === String(tableParam).toLowerCase()
        );

        if (!matched && !isNaN(tableParam)) {
          try {
            const singleRes = await api.get(`/tables/${tableParam}`);
            matched = singleRes.data;
          } catch (e) {
            console.error("Table lookup failed", e);
          }
        }

        if (matched) {
          setTable(matched);
          setSelectedTableId(matched.id);
        } else if (allTablesRes.data.length > 0) {
          setTable(allTablesRes.data[0]);
          setSelectedTableId(allTablesRes.data[0].id);
        }
      } else if (allTablesRes.data.length > 0) {
        setTable(allTablesRes.data[0]);
        setSelectedTableId(allTablesRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch tables:", err);
      setErrorMsg("Failed to load restaurant tables. Please try again.");
    } finally {
      setFetchingTable(false);
    }
  };

  const handleTableChange = (tableId) => {
    setSelectedTableId(tableId);
    const matched = tablesList.find(t => String(t.id) === String(tableId));
    if (matched) setTable(matched);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTableId) {
      setErrorMsg("Please select a table to book.");
      return;
    }
    if (!formData.customer_name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg("Please enter your mobile phone number.");
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        table_id: parseInt(selectedTableId),
        customer_name: formData.customer_name.trim(),
        phone: formData.phone.trim(),
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        guests: parseInt(formData.guests),
        special_request: formData.special_request.trim()
      };

      const res = await api.post('/reservations', payload);
      setBookingSuccess(res.data);
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      if (typeof errorDetail === 'string') {
        setErrorMsg(errorDetail);
      } else if (Array.isArray(errorDetail)) {
        setErrorMsg(errorDetail.map(d => d.msg || d).join(', '));
      } else {
        setErrorMsg('Failed to process table booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      
      <div className="max-w-xl w-full space-y-6">
        
        {/* Brand & QR Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-brand-500/20 border border-amber-500/30 text-amber-400 mb-1">
            <QrCode className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">Smart Gourmet Restaurant</h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wide uppercase">Contactless Table Booking System</p>
        </div>

        {/* Successful Booking View */}
        {bookingSuccess ? (
          <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 space-y-6 text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-emerald-400">Table Booked Successfully!</h2>
              <p className="text-xs text-slate-400">Your reservation is confirmed. We look forward to serving you!</p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-medium">Booking ID</span>
                <span className="font-mono font-extrabold text-amber-400 text-sm">#TB{1000 + bookingSuccess.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Table</span>
                <span className="font-extrabold text-slate-100 text-sm">
                  {bookingSuccess.table?.table_number || table?.table_number || selectedTableId}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Customer Name</span>
                <span className="font-bold text-slate-200">{bookingSuccess.customer_name || formData.customer_name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Mobile Number</span>
                <span className="font-bold text-slate-200">{bookingSuccess.phone || formData.phone}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Date</span>
                <span className="font-bold text-slate-200">
                  {bookingSuccess.booking_date || bookingSuccess.reservation_date}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Time</span>
                <span className="font-bold text-amber-400">
                  {bookingSuccess.booking_time || bookingSuccess.reservation_time}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Guests</span>
                <span className="font-bold text-slate-200">{bookingSuccess.guests || bookingSuccess.guest_count}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-medium">Status</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to={`/menu?table=${table?.id || selectedTableId}`}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-brand-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4" /> Order Food Now
              </Link>
              <button
                onClick={() => {
                  setBookingSuccess(null);
                  setErrorMsg('');
                }}
                className="py-3.5 px-5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all"
              >
                Book Another Table
              </button>
            </div>
          </div>
        ) : (
          /* Main Booking Form Card */
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
            
            {/* Auto-detected Table Badge Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
                  #{table ? table.table_number : '00'}
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Detected Table Number</span>
                  <h3 className="text-sm font-extrabold text-slate-100">
                    Table #{table ? table.table_number : selectedTableId} {table?.location ? `(${table.location})` : ''}
                  </h3>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                Capacity: {table ? table.capacity : 4} Seats
              </span>
            </div>

            {/* Error Banner (Double Booking Warning / Validation) */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Assigned Table Display (Automatic from QR URL) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Table Number</label>
                {tableParam ? (
                  <div className="w-full bg-slate-900/90 border border-amber-500/40 rounded-xl px-4 py-3 text-xs font-black text-amber-400 flex items-center justify-between">
                    <span>Table {table ? table.table_number : tableParam}</span>
                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                      Auto-detected from QR Code
                    </span>
                  </div>
                ) : (
                  <select
                    required
                    value={selectedTableId}
                    onChange={(e) => handleTableChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
                  >
                    {tablesList.map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.table_number} ({t.location} • Max {t.capacity} Guests)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Booking Date *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.booking_date}
                      onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Time *</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <select
                      required
                      value={formData.booking_time}
                      onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="12:00">12:00 PM (Lunch)</option>
                      <option value="12:30">12:30 PM (Lunch)</option>
                      <option value="13:00">01:00 PM (Lunch)</option>
                      <option value="13:30">01:30 PM (Lunch)</option>
                      <option value="14:00">02:00 PM (Lunch)</option>
                      <option value="19:00">07:00 PM (Dinner)</option>
                      <option value="19:30">07:30 PM (Dinner)</option>
                      <option value="20:00">08:00 PM (Dinner)</option>
                      <option value="20:30">08:30 PM (Dinner)</option>
                      <option value="21:00">09:00 PM (Dinner)</option>
                      <option value="21:30">09:30 PM (Dinner)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guests Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Guests *</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    min={1}
                    max={table?.capacity || 20}
                    required
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Recommended capacity for this table: {table?.capacity || 4} guests</p>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Special Request / Notes (Optional)</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    placeholder="Candlelight arrangement, high chair for infant, corner table..."
                    value={formData.special_request}
                    onChange={(e) => setFormData({ ...formData, special_request: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-brand-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <Sparkles className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Confirm Booking <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

          </div>
        )}

      </div>

    </div>
  );
};
