import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Phone, Mail, MapPin, Clock, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-100">Smart Resto</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Experience next-generation dining with AI recommendations, QR ordering, real-time kitchen tracking, and automated inventory management.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Quick Navigation</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/menu" className="hover:text-amber-400 transition-colors">Our Full Menu</Link></li>
            <li><Link to="/reservations" className="hover:text-amber-400 transition-colors">Book a Table</Link></li>
            <li><Link to="/menu?filter=veg" className="hover:text-amber-400 transition-colors">Vegetarian Specials</Link></li>
            <li><Link to="/cart" className="hover:text-amber-400 transition-colors">View Cart & Checkout</Link></li>
          </ul>
        </div>

        {/* Opening Hours */}
        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Opening Hours</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Monday - Friday: 11:00 AM - 11:00 PM</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Saturday - Sunday: 10:00 AM - 11:30 PM</span>
            </li>
            <li className="text-xs text-emerald-400 pt-1 font-medium">Kitchen operates till 30 mins before closing</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Contact & Location</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <span>Naval Base Road,Karwar</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>+1 (555) 019-2831</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>support@smartrestaurant.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 Smart Restaurant Management System. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />by Tanvi
        </p>
      </div>
    </footer>
  );
};
