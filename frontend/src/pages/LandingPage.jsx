import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FoodCard } from '../components/FoodCard';
import { 
  UtensilsCrossed, Sparkles, QrCode, Bot, ChefHat, 
  TrendingUp, ShieldCheck, Star, ArrowRight, Clock, Award
} from 'lucide-react';

export const LandingPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, catRes] = await Promise.all([
          api.get('/food-items/recommendations'),
          api.get('/categories')
        ]);
        setRecommendations(recRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Landing page fetch error:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-amber-400 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-4 h-4" /> Next-Gen Smart Dining Experience
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-slate-100 leading-tight tracking-tight">
              Culinary Artistry <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-brand-500 bg-clip-text text-transparent">
                Powered by Intelligence
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Scan table QR codes, get AI dish recommendations, track live kitchen preparation status, and savor handcrafted gourmet flavors seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/menu"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-500 text-slate-950 font-extrabold text-base shadow-lg shadow-amber-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Explore Full Menu <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/reservations"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel text-slate-200 hover:text-amber-400 font-bold text-base hover:border-amber-500/40 transition-all text-center"
              >
                Reserve a Table
              </Link>
            </div>

            {/* Quick Stats Banner */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-800/80">
              <div>
                <span className="block text-2xl font-black text-amber-400">100%</span>
                <span className="text-xs text-slate-400 font-medium">Organic & Fresh</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-amber-400">15 min</span>
                <span className="text-xs text-slate-400 font-medium">Avg Prep Time</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-amber-400">4.9 ★</span>
                <span className="text-xs text-slate-400 font-medium">Guest Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-brand-600/20 rounded-3xl blur-2xl opacity-60"></div>
            <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
                alt="Smart Restaurant Ambiance"
                className="w-full h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              
              {/* Floating Highlight Card */}
              <div className="absolute bottom-6 left-6 right-6 glass-panel p-4 rounded-2xl flex items-center justify-between border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-100">Scan QR at Table</span>
                    <span className="text-xs text-slate-400">Instant contactless table ordering</span>
                  </div>
                </div>
                <Link to="/menu?qr=QR-T02-4512" className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400">
                  Try Demo
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Smart Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-100">Smart Restaurant Architecture</h2>
          <p className="text-slate-400 text-sm mt-2">Designed for guests, kitchen chefs, restaurant staff, and management.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">AI Concierge & Voice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent menu answers, dietary recommendation filtering, and voice-activated handsfree ordering.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Kitchen Display (KDS)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time ticket routing with prep priorities: Received → Preparing → Ready → Completed.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Inventory Automation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-deducts raw ingredient quantities on order creation with real-time low-stock alerts.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">QR Table Ordering</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan table QR codes for instant order placement directly linked to physical dining tables.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Chef Recommendations */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" /> Chef's Top Recommended Dishes
              </h2>
              <p className="text-xs text-slate-400 mt-1">Based on highest guest ratings and order popularity</p>
            </div>
            <Link to="/menu" className="text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Role Portal Quick Access Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Multi-Role Support</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Are you an Admin, Chef, or Restaurant Staff?
            </h3>
            <p className="text-sm text-slate-400 max-w-lg">
              Log in with role credentials to access executive revenue dashboards, kitchen display systems, or inventory reorder controls.
            </p>
          </div>
          <Link
            to="/login"
            className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition-all shrink-0"
          >
            Access Role Dashboards
          </Link>
        </div>
      </section>

    </div>
  );
};
