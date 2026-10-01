import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIChatWidget } from './components/AIChatWidget';
import { ProtectedRoute } from './components/ProtectedRoutes';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersHistoryPage } from './pages/OrdersHistoryPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { QRBookingPage } from './pages/QRBookingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { KitchenDashboard } from './pages/KitchenDashboard';
import { InventoryDashboard } from './pages/InventoryDashboard';
import { ReportsPage } from './pages/ReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
            
            {/* Header Navigation */}
            <Navbar />

            {/* Main Content Body */}
            <main className="flex-1">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/reservations" element={<ReservationsPage />} />
                <Route path="/book-table" element={<QRBookingPage />} />
                <Route path="/book/table/:tableId" element={<QRBookingPage />} />
                <Route path="/book/table" element={<QRBookingPage />} />
                <Route path="/qr-booking" element={<QRBookingPage />} />

                {/* Customer / Authenticated Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersHistoryPage />} />
                  <Route path="/orders/:orderId/track" element={<OrderTrackingPage />} />
                </Route>

                {/* Admin & Staff Role Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['Admin', 'Restaurant Staff']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/reports" element={<ReportsPage />} />
                </Route>

                {/* Kitchen Role Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['Kitchen Staff', 'Admin', 'Restaurant Staff']} />}>
                  <Route path="/kitchen" element={<KitchenDashboard />} />
                  <Route path="/inventory" element={<InventoryDashboard />} />
                </Route>
              </Routes>
            </main>

            {/* AI Assistant Floating Concierge */}
            <AIChatWidget />

            {/* Footer */}
            <Footer />

          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
