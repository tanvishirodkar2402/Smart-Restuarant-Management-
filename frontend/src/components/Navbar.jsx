import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  UtensilsCrossed, ShoppingBag, User, LogOut, LayoutDashboard, 
  ChefHat, PackageCheck, Calendar, Sparkles, QrCode, Menu as MenuIcon, X
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const role = user?.role?.name || 'Customer';

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-brand-500 bg-clip-text text-transparent">
                Smart Resto
              </span>
              <span className="block text-xs text-slate-400 tracking-wider">MANAGEMENT SUITE</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/menu" 
              className={`text-sm font-medium transition-colors hover:text-amber-400 ${isActive('/menu') ? 'text-amber-400' : 'text-slate-300'}`}
            >
              Menu
            </Link>
            
            <Link 
              to="/reservations" 
              className={`text-sm font-medium transition-colors hover:text-amber-400 ${isActive('/reservations') ? 'text-amber-400' : 'text-slate-300'}`}
            >
              Table Reservation
            </Link>

            {user && (
              <Link 
                to="/orders" 
                className={`text-sm font-medium transition-colors hover:text-amber-400 ${isActive('/orders') ? 'text-amber-400' : 'text-slate-300'}`}
              >
                My Orders
              </Link>
            )}

            {/* Role-Specific Dashboard Links */}
            {user && (role === 'Admin' || role === 'Restaurant Staff') && (
              <Link 
                to="/admin" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" /> Admin Portal
              </Link>
            )}

            {user && (role === 'Kitchen Staff' || role === 'Admin') && (
              <Link 
                to="/kitchen" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all"
              >
                <ChefHat className="w-4 h-4" /> Kitchen Display
              </Link>
            )}

            {user && (role === 'Admin' || role === 'Restaurant Staff') && (
              <Link 
                to="/inventory" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-all"
              >
                <PackageCheck className="w-4 h-4" /> Inventory
              </Link>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            
            {/* Table QR Simulation Button */}
            <Link 
              to="/menu?qr=QR-T02-4512" 
              title="Simulate Table QR Code Scan" 
              className="p-2.5 rounded-xl bg-slate-800/80 text-amber-400 hover:bg-slate-700 transition-colors border border-slate-700 hidden sm:flex items-center gap-2 text-xs font-semibold"
            >
              <QrCode className="w-4 h-4" /> QR Table Ordering
            </Link>

            {/* Cart Link */}
            <Link 
              to="/cart" 
              className="relative p-2.5 rounded-xl bg-slate-800/80 text-slate-200 hover:text-amber-400 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-brand-600 text-slate-950 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Auth Profile / Login */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:block text-right">
                  <span className="block text-sm font-semibold text-slate-200">{user.full_name}</span>
                  <span className="text-xs text-amber-400 font-medium">{role}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Sign Out"
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-amber-500 text-slate-950 font-semibold text-sm shadow-md shadow-amber-500/20 hover:brightness-110 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link 
            to="/menu" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-amber-400 py-2 font-medium"
          >
            Browse Menu
          </Link>
          <Link 
            to="/reservations" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-amber-400 py-2 font-medium"
          >
            Table Reservation
          </Link>
          {user && (
            <Link 
              to="/orders" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-300 hover:text-amber-400 py-2 font-medium"
            >
              My Orders
            </Link>
          )}
          {user && (role === 'Admin' || role === 'Restaurant Staff') && (
            <Link 
              to="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-amber-400 py-2 font-medium"
            >
              Admin Dashboard
            </Link>
          )}
          {user && (role === 'Kitchen Staff' || role === 'Admin') && (
            <Link 
              to="/kitchen" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-emerald-400 py-2 font-medium"
            >
              Kitchen Display
            </Link>
          )}
          {user && (role === 'Admin' || role === 'Restaurant Staff') && (
            <Link 
              to="/inventory" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-purple-400 py-2 font-medium"
            >
              Inventory Management
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
