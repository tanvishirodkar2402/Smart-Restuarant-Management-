import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, Star, Heart, Frown, Meh, Download, FileText } from 'lucide-react';

export const ReportsPage = () => {
  const [sentiment, setSentiment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [sentRes, revRes] = await Promise.all([
        api.get('/analytics/feedback-sentiment'),
        api.get('/reviews')
      ]);
      setSentiment(sentRes.data);
      setReviews(revRes.data);
    } catch (err) {
      console.error("Fetch reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-amber-400" /> Sales & Customer Feedback Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">AI-driven feedback sentiment analysis and customer review audit</p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400 hover:bg-slate-800 flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Print / Save Report
        </button>
      </div>

      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400 font-semibold">Average Rating</span>
          <span className="text-3xl font-black text-amber-400 block">{sentiment?.average_rating || '0.0'} ★</span>
          <span className="text-[11px] text-slate-500">From {sentiment?.total_reviews || 0} reviews</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold">Positive Sentiment</span>
            <Heart className="w-4 h-4" />
          </div>
          <span className="text-3xl font-black text-emerald-400 block">{sentiment?.positive_percent || 0}%</span>
          <span className="text-[11px] text-slate-500">4 & 5 Star ratings</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold">Neutral Sentiment</span>
            <Meh className="w-4 h-4" />
          </div>
          <span className="text-3xl font-black text-amber-400 block">{sentiment?.neutral_percent || 0}%</span>
          <span className="text-[11px] text-slate-500">3 Star ratings</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold">Negative Sentiment</span>
            <Frown className="w-4 h-4" />
          </div>
          <span className="text-3xl font-black text-rose-400 block">{sentiment?.negative_percent || 0}%</span>
          <span className="text-[11px] text-slate-500">1 & 2 Star ratings</span>
        </div>
      </div>

      {/* Customer Reviews Feed */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Customer Feedback & Reviews Audit</h3>

        <div className="space-y-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-200">{rev.user?.full_name || 'Guest User'}</span>
                <span className="text-xs font-black text-amber-400">{rev.rating} ★</span>
              </div>
              <p className="text-xs text-slate-400">{rev.comment}</p>
              <span className="text-[10px] text-slate-600 block">{new Date(rev.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
