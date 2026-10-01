import React from 'react';
import { useCart } from '../context/CartContext';
import { Star, Clock, Flame, Leaf, Plus, Check } from 'lucide-react';

export const FoodCard = ({ item, onSelect }) => {
  const { addToCart, cartItems } = useCart();
  
  const inCart = cartItems.find((ci) => ci.food_item_id === item.id);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group">
      {/* Image & Badges Container */}
      <div className="relative h-48 overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onSelect && onSelect(item)}>
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {item.is_vegetarian ? (
            <span className="bg-emerald-500/90 backdrop-blur-md text-slate-950 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
              <Leaf className="w-3.5 h-3.5 fill-slate-950" /> Veg
            </span>
          ) : (
            <span className="bg-rose-500/90 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
              Non-Veg
            </span>
          )}

          {item.is_spicy && (
            <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
              <Flame className="w-3.5 h-3.5 fill-slate-950" /> Spicy
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-amber-400 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{parseFloat(item.rating_avg).toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onSelect && onSelect(item)}
            className="text-lg font-bold text-slate-100 hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
          >
            {item.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Price</span>
            <span className="text-xl font-extrabold text-amber-400">
              ₹{parseFloat(item.price).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{item.prep_time_minutes}m</span>
            </div>

            <button
              onClick={() => addToCart(item)}
              disabled={!item.is_available}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                !item.is_available
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : inCart
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : 'bg-gradient-to-r from-brand-600 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/20'
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-4 h-4" /> Added ({inCart.quantity})
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
