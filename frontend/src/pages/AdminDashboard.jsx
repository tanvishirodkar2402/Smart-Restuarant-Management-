import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { 
  DollarSign, ShoppingBag, Clock, CheckCircle2, 
  Utensils, AlertTriangle, TrendingUp, Users, Plus, 
  Trash2, Edit, ToggleLeft, ToggleRight, Sparkles, BarChart3, Star, Ticket,
  QrCode, Printer, Download, RefreshCw, XCircle, Calendar, Phone, User
} from 'lucide-react';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend
);

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, food, categories, tables, users, orders, offers
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab specific data states
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [offersList, setOffersList] = useState([]);

  // Food Modal
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [newFoodData, setNewFoodData] = useState({
    name: '', category_id: 1, price: 149.0, description: '', image_url: '', is_vegetarian: false, is_spicy: false
  });

  // Table Modals State
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableData, setNewTableData] = useState({
    table_number: '', capacity: 4, location: 'Main Dining', status: 'Available'
  });

  const [showEditTableModal, setShowEditTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRTable, setSelectedQRTable] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.error("Fetch analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    try {
      if (activeTab === 'food') {
        const res = await api.get('/food-items');
        setFoodItems(res.data);
      } else if (activeTab === 'categories') {
        const res = await api.get('/categories');
        setCategories(res.data);
      } else if (activeTab === 'tables') {
        const [tabRes, resRes] = await Promise.all([
          api.get('/tables'),
          api.get('/reservations')
        ]);
        setTables(tabRes.data);
        setReservations(resRes.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/users');
        setUsersList(res.data);
      } else if (activeTab === 'orders') {
        const res = await api.get('/orders');
        setOrdersList(res.data);
      } else if (activeTab === 'offers') {
        const res = await api.get('/offers');
        setOffersList(res.data);
      }
    } catch (err) {
      console.error("Fetch tab data error:", err);
    }
  };

  // --- Table Operations ---
  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tables', {
        table_number: newTableData.table_number.trim(),
        capacity: parseInt(newTableData.capacity),
        location: newTableData.location.trim(),
        status: newTableData.status
      });
      setShowAddTableModal(false);
      setNewTableData({ table_number: '', capacity: 4, location: 'Main Dining', status: 'Available' });
      fetchTabData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create table");
    }
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    if (!editingTable) return;
    try {
      await api.put(`/tables/${editingTable.id}`, {
        table_number: editingTable.table_number,
        capacity: parseInt(editingTable.capacity),
        location: editingTable.location,
        status: editingTable.status
      });
      setShowEditTableModal(false);
      setEditingTable(null);
      fetchTabData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update table");
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm("Are you sure you want to remove this table?")) {
      try {
        await api.delete(`/tables/${id}`);
        fetchTabData();
      } catch (err) {
        alert("Failed to delete table.");
      }
    }
  };

  const handleUpdateTableStatus = async (id, status) => {
    try {
      await api.patch(`/tables/${id}/status?status=${status}`);
      fetchTabData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleRegenerateQR = async (id) => {
    try {
      const res = await api.post(`/tables/${id}/generate-qr`);
      fetchTabData();
      if (selectedQRTable && selectedQRTable.id === id) {
        setSelectedQRTable(res.data);
      }
      alert("QR code regenerated successfully!");
    } catch (err) {
      alert("Failed to regenerate QR code.");
    }
  };

  const getQRBookingURL = (table) => {
    const tableId = table?.id || table?.table_number || 1;
    const envUrl = import.meta.env.VITE_FRONTEND_URL;
    let base = envUrl && envUrl.trim() ? envUrl.trim() : window.location.origin;
    if (base.includes('localhost') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      base = `http://${window.location.hostname}:5173`;
    }
    return `${base.replace(/\/$/, '')}/book/table/${tableId}`;
  };

  const getQRElementHtml = (table) => {
    const url = getQRBookingURL(table);
    const svgElem = document.querySelector(`#qr-code-box-${table.id} svg`);
    if (svgElem) {
      const clonedSvg = svgElem.cloneNode(true);
      clonedSvg.setAttribute('width', '220');
      clonedSvg.setAttribute('height', '220');
      clonedSvg.style.margin = '0 auto';
      clonedSvg.style.display = 'block';
      return clonedSvg.outerHTML;
    }
    return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}" style="width:200px;height:200px;margin:0 auto;display:block;" />`;
  };

  const handlePrintAllQRs = () => {
    if (tables.length === 0) {
      alert("No tables available to print.");
      return;
    }
    const printWindow = window.open('about:blank', 'Print_All_QRs', 'left=100,top=100,width=900,height=700');
    
    const qrCardsHtml = tables.map((t) => {
      const qrImg = getQRElementHtml(t);
      return `
        <div style="border: 3px solid #000; border-radius: 20px; padding: 25px; margin: 15px; display: inline-block; width: 280px; text-align: center; page-break-inside: avoid; vertical-align: top; background: #fff;">
          <div style="font-size: 18px; font-weight: 900; letter-spacing: 1px; color: #000; margin-bottom: 8px;">SMART RESTAURANT</div>
          <div style="font-size: 26px; font-weight: 900; background: #000; color: #fff; padding: 8px 18px; border-radius: 12px; margin-bottom: 12px; display: inline-block;">TABLE ${t.table_number}</div>
          <div style="margin: 12px 0; display: flex; justify-content: center;">${qrImg}</div>
          <div style="font-size: 13px; font-weight: 800; margin-top: 12px; color: #000; letter-spacing: 0.5px;">Scan to Book This Table</div>
          <div style="font-size: 11px; font-weight: 600; margin-top: 6px; color: #555;">Capacity: ${t.capacity} Guests</div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print All Restaurant Table QR Codes</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 20px; background: #fff; color: #000; }
            h1 { font-size: 22px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <h1>SMART RESTAURANT - ALL TABLE QR CODES</h1>
          <div>${qrCardsHtml}</div>
          <script>
            window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadQR = (table) => {
    const url = getQRBookingURL(table);
    const svgElem = document.querySelector(`#qr-code-box-${table.id} svg`);
    if (svgElem) {
      const svgData = new XMLSerializer().serializeToString(svgElem);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = 500;
        canvas.height = 500;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 500, 500);
        ctx.drawImage(img, 25, 25, 450, 450);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Table_${table.table_number}_QR.png`;
        link.href = pngUrl;
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } else {
      const link = document.createElement('a');
      link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
      link.download = `Table_${table.table_number}_QR.png`;
      link.target = '_blank';
      link.click();
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Cancel this table booking?")) {
      try {
        await api.patch(`/reservations/${bookingId}/status?status=Cancelled`);
        fetchTabData();
      } catch (err) {
        alert("Failed to cancel booking.");
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status?status=${encodeURIComponent(newStatus)}`);
      fetchTabData();
      window.dispatchEvent(new CustomEvent('refreshOrders'));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update order status");
    }
  };

  // Printable QR view trigger
  const handlePrintQR = (tableToPrint) => {
    const targetTable = tableToPrint || selectedQRTable;
    if (!targetTable) return;
    const qrImg = getQRElementHtml(targetTable);
    const windowUrl = 'about:blank';
    const uniqueName = 'Print_QR_Window';
    const printWindow = window.open(windowUrl, uniqueName, 'left=100,top=100,width=800,height=600');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - Table ${targetTable.table_number}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; background: #fff; color: #000; }
            .card { border: 4px solid #000; border-radius: 24px; padding: 35px; display: inline-block; width: 320px; background: #fff; }
            .logo { font-size: 22px; font-weight: 900; letter-spacing: 1px; margin-bottom: 12px; }
            .table-num { font-size: 32px; font-weight: 900; background: #000; color: #fff; padding: 10px 22px; border-radius: 14px; margin-bottom: 20px; display: inline-block; }
            .qr-wrapper { margin: 15px 0; display: flex; justify-content: center; }
            .scan-text { font-size: 15px; font-weight: 900; margin-top: 15px; color: #000; letter-spacing: 0.5px; }
            .capacity-text { font-size: 12px; font-weight: bold; margin-top: 8px; color: #555; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">SMART RESTAURANT</div>
            <div class="table-num">TABLE ${targetTable.table_number}</div>
            <div class="qr-wrapper">${qrImg}</div>
            <div class="scan-text">Scan to Book This Table</div>
            <div class="capacity-text">Capacity: ${targetTable.capacity} Guests</div>
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- Food Operations ---
  const handleToggleFoodAvailability = async (id) => {
    try {
      await api.patch(`/food-items/${id}/toggle-availability`);
      fetchTabData();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleCreateFoodItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/food-items', {
        ...newFoodData,
        category_id: parseInt(newFoodData.category_id),
        price: parseFloat(newFoodData.price)
      });
      setShowAddFoodModal(false);
      fetchTabData();
    } catch (err) {
      alert("Error creating food item");
    }
  };

  const handleDeleteFood = async (id) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      try {
        await api.delete(`/food-items/${id}`);
        fetchTabData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Charts Config
  const lineChartData = {
    labels: stats?.sales_chart?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats?.sales_chart?.map(d => d.revenue) || [],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        tension: 0.4,
      }
    ]
  };

  const barChartData = {
    labels: stats?.category_sales?.map(c => c.category) || [],
    datasets: [
      {
        label: 'Sales Revenue (₹)',
        data: stats?.category_sales?.map(c => c.revenue) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 8,
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100">Executive Admin Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Manage restaurant operations, orders, food items, QR table booking, staff, and revenue</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Dashboard & Charts', icon: BarChart3 },
          { id: 'tables', label: 'Table Management & QRs', icon: QrCode },
          { id: 'food', label: 'Food Items Menu', icon: Utensils },
          { id: 'categories', label: 'Categories', icon: Sparkles },
          { id: 'users', label: 'Users & Staff', icon: Users },
          { id: 'orders', label: 'All Orders', icon: ShoppingBag },
          { id: 'offers', label: 'Offers & Coupons', icon: Ticket },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'glass-panel text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & CHARTS TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Total Revenue</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-black text-amber-400">₹{stats?.total_revenue?.toFixed(2) || '0.00'}</span>
              <span className="block text-[11px] text-emerald-400 font-medium">↑ Accumulated sales</span>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Today's Orders</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-black text-slate-100">{stats?.todays_orders || 0}</span>
              <span className="block text-[11px] text-slate-400">Total orders received today</span>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Pending Kitchen Orders</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-black text-amber-400">{stats?.pending_orders || 0}</span>
              <span className="block text-[11px] text-amber-300 font-medium">In preparation / received</span>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Available Dining Tables</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Utensils className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-black text-emerald-400">
                {stats?.available_tables} / {stats?.total_tables}
              </span>
              <span className="block text-[11px] text-slate-400">Ready for guests</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Revenue Sales Trend (Last 7 Days)</h3>
              <div className="h-64">
                <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Sales Breakdown by Category</h3>
              <div className="h-64">
                <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADMIN TABLE MANAGEMENT TAB */}
      {activeTab === 'tables' && (
        <div className="space-y-8">
          
          {/* Header & Quick Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-amber-400" /> Restaurant Table & QR Code Management
              </h2>
              <p className="text-xs text-slate-400">Generate printable QR codes, add/remove tables, manage table capacity & view customer bookings</p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={handlePrintAllQRs}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shrink-0 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" /> Print All QR Codes
              </button>

              <button
                onClick={() => setShowAddTableModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Table
              </button>
            </div>
          </div>

          {/* Table Status Counter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">🟢 Available Tables</span>
                <span className="text-2xl font-black text-emerald-400">
                  {tables.filter(t => t.status === 'Available').length}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">Available</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">🔴 Booked Tables</span>
                <span className="text-2xl font-black text-rose-400">
                  {tables.filter(t => t.status === 'Booked' || t.status === 'Occupied').length}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold">Booked</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">🟡 Reserved Tables</span>
                <span className="text-2xl font-black text-amber-400">
                  {tables.filter(t => t.status === 'Reserved').length}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">Reserved</span>
            </div>
          </div>

          {/* Requirement 4: Table | Capacity | QR Code | Status | Actions Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-400" /> QR Code Management Directory
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{tables.length} Total Tables</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Table</th>
                    <th className="p-3.5">Capacity</th>
                    <th className="p-3.5">QR Code</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {tables.map((t) => {
                    const qrUrl = getQRBookingURL(t);
                    return (
                      <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3.5 font-extrabold text-slate-100 text-sm">
                          Table #{t.table_number} <span className="text-slate-500 text-xs font-normal">({t.location})</span>
                        </td>
                        <td className="p-3.5 font-bold text-amber-400">{t.capacity} Guests</td>
                        <td className="p-3.5">
                          <div id={`qr-code-box-${t.id}`} className="flex items-center gap-2 bg-white p-1.5 rounded-xl w-fit shadow-md border border-slate-200">
                            <QRCodeSVG
                              value={qrUrl}
                              size={44}
                              bgColor="#ffffff"
                              fgColor="#000000"
                              level="L"
                            />
                            <div className="text-[10px] text-slate-900 font-mono pr-1">
                              <span className="font-bold block">Scannable</span>
                              <span className="text-slate-600 block text-[9px]">ID: {t.qr_code_token || `T-${t.id}`}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={t.status}
                            onChange={(e) => handleUpdateTableStatus(t.id, e.target.value)}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer focus:outline-none ${
                              t.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                              t.status === 'Booked' || t.status === 'Occupied' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                              'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            }`}
                          >
                            <option value="Available" className="bg-slate-900 text-slate-200">🟢 Available</option>
                            <option value="Booked" className="bg-slate-900 text-slate-200">🔴 Booked</option>
                            <option value="Reserved" className="bg-slate-900 text-slate-200">🟡 Reserved</option>
                            <option value="Occupied" className="bg-slate-900 text-slate-200">🔴 Occupied</option>
                            <option value="Maintenance" className="bg-slate-900 text-slate-200">⚪ Maintenance</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedQRTable(t);
                                setShowQRModal(true);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="View Printable QR Stand"
                            >
                              <QrCode className="w-3.5 h-3.5" /> View QR
                            </button>

                            <button
                              onClick={() => handleRegenerateQR(t.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Regenerate QR Code Token"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                            </button>

                            <button
                              onClick={() => handleDownloadQR(t)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Download High-Res QR PNG"
                            >
                              <Download className="w-3.5 h-3.5" /> Download
                            </button>

                            <button
                              onClick={() => {
                                setSelectedQRTable(t);
                                setTimeout(handlePrintQR, 100);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] flex items-center gap-1 cursor-pointer shadow-md"
                              title="Print Table QR Card"
                            >
                              <Printer className="w-3.5 h-3.5" /> Print
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Table Bookings Directory */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" /> Active Table Bookings Log
            </h3>

            {reservations.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No active table bookings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Table #</th>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Guests</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-mono font-bold text-amber-400">#BK-{res.id}</td>
                        <td className="p-3 font-extrabold text-slate-100">
                          Table #{res.table?.table_number || res.table_id}
                        </td>
                        <td className="p-3 font-bold">{res.customer_name || res.user?.full_name || 'Guest'}</td>
                        <td className="p-3 text-slate-400">{res.phone || res.user?.phone || 'N/A'}</td>
                        <td className="p-3 font-semibold text-amber-300">
                          {res.reservation_date || res.booking_date} @ {res.reservation_time || res.booking_time}
                        </td>
                        <td className="p-3 font-bold">{res.guest_count || res.guests} Guests</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            res.status === 'Cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {res.status || res.booking_status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {res.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancelBooking(res.id)}
                              className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px]"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" /> Add New Dining Table
            </h3>
            <form onSubmit={handleCreateTable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Table Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-06 or 6"
                  value={newTableData.table_number}
                  onChange={(e) => setNewTableData({ ...newTableData, table_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Guest Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={newTableData.capacity}
                    onChange={(e) => setNewTableData({ ...newTableData, capacity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location Area</label>
                  <input
                    type="text"
                    value={newTableData.location}
                    onChange={(e) => setNewTableData({ ...newTableData, location: e.target.value })}
                    placeholder="Main Dining, Terrace, VIP..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                <select
                  value={newTableData.status}
                  onChange={(e) => setNewTableData({ ...newTableData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 cursor-pointer"
                >
                  <option value="Available">🟢 Available</option>
                  <option value="Booked">🔴 Booked</option>
                  <option value="Reserved">🟡 Reserved</option>
                  <option value="Maintenance">⚪ Maintenance</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {showEditTableModal && editingTable && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Edit className="w-5 h-5 text-amber-400" /> Edit Table #{editingTable.table_number}
            </h3>
            <form onSubmit={handleUpdateTable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Table Number</label>
                <input
                  type="text"
                  required
                  value={editingTable.table_number}
                  onChange={(e) => setEditingTable({ ...editingTable, table_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={editingTable.capacity}
                    onChange={(e) => setEditingTable({ ...editingTable, capacity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingTable.location}
                    onChange={(e) => setEditingTable({ ...editingTable, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Table Status</label>
                <select
                  value={editingTable.status}
                  onChange={(e) => setEditingTable({ ...editingTable, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100 cursor-pointer"
                >
                  <option value="Available">🟢 Available</option>
                  <option value="Booked">🔴 Booked</option>
                  <option value="Reserved">🟡 Reserved</option>
                  <option value="Occupied">🔴 Occupied</option>
                  <option value="Maintenance">⚪ Maintenance</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditTableModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal & Printable QR View */}
      {showQRModal && selectedQRTable && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 text-center">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" /> Table #{selectedQRTable.table_number} QR Code
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Scannable QR Code Render Container */}
            <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl border border-slate-200" id="printable-qr-area">
              <QRCodeSVG
                value={`${window.location.origin}/book-table?table=${selectedQRTable.id}`}
                size={220}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-300 font-bold">Scanning URL:</p>
              <p className="font-mono text-amber-400 text-[11px] break-all bg-slate-950 p-2 rounded-xl border border-slate-800">
                {`${window.location.origin}/book-table?table=${selectedQRTable.id}`}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handlePrintQR}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-brand-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Table QR Stand
              </button>

              <button
                onClick={() => handleRegenerateQR(selectedQRTable.id)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate QR Code Token
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. FOOD ITEMS MANAGEMENT TAB */}
      {activeTab === 'food' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Manage Menu Food Items</h2>
            <button
              onClick={() => setShowAddFoodModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Food Item
            </button>
          </div>

          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Availability</th>
                  <th className="p-3">Dietary</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {foodItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50">
                    <td className="p-3 flex items-center gap-3">
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-950" />
                      <span className="font-bold text-slate-100">{item.name}</span>
                    </td>
                    <td className="p-3 font-extrabold text-amber-400">₹{parseFloat(item.price).toFixed(2)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleFoodAvailability(item.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.is_available ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="p-3 font-medium text-slate-400">
                      {item.is_vegetarian ? 'Veg' : 'Non-Veg'} {item.is_spicy ? '🌶️' : ''}
                    </td>
                    <td className="p-3 font-bold text-amber-400">{item.rating_avg} ★</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteFood(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Food Modal */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Add New Food Item</h3>
            <form onSubmit={handleCreateFoodItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newFoodData.name}
                  onChange={(e) => setNewFoodData({ ...newFoodData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={newFoodData.price}
                    onChange={(e) => setNewFoodData({ ...newFoodData, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newFoodData.category_id}
                    onChange={(e) => setNewFoodData({ ...newFoodData, category_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                  >
                    <option value={1}>Tea & Coffee</option>
                    <option value={2}>Starters & Soups</option>
                    <option value={3}>South Indian</option>
                    <option value={4}>North Indian</option>
                    <option value={5}>Biriyani</option>
                    <option value={6}>Indo-Chinese</option>
                    <option value={7}>Pizzas & Burgers</option>
                    <option value={8}>Desserts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={newFoodData.image_url}
                  onChange={(e) => setNewFoodData({ ...newFoodData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newFoodData.description}
                  onChange={(e) => setNewFoodData({ ...newFoodData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFoodData.is_vegetarian}
                    onChange={(e) => setNewFoodData({ ...newFoodData, is_vegetarian: e.target.checked })}
                  /> Vegetarian
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFoodData.is_spicy}
                    onChange={(e) => setNewFoodData({ ...newFoodData, is_spicy: e.target.checked })}
                  /> Spicy
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddFoodModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Create Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100">User & Staff Accounts Directory</h2>
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Assigned Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold">{u.full_name}</td>
                    <td className="p-3">{u.username}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 font-extrabold text-amber-400">{u.role?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

  /* 5. ORDERS TAB - Requirement 9: ADMIN ORDER MANAGEMENT */
  {activeTab === 'orders' && (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-400" /> Admin & Staff Order Management Dashboard
          </h2>
          <p className="text-xs text-slate-400">Live order status progression, table assignments, preparation estimates & ready times</p>
        </div>
        <button
          onClick={fetchTabData}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400 font-bold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Table #</th>
                <th className="p-3.5">Ordered Dishes & Qty</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Order Time</th>
                <th className="p-3.5">Est. Prep Time</th>
                <th className="p-3.5">Expected Ready</th>
                <th className="p-3.5">Current Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {ordersList.map((o) => {
                const readyTimeStr = o.expected_ready_time
                  ? new Date(o.expected_ready_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : new Date(new Date(o.created_at).getTime() + (o.estimated_minutes || 20) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={o.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-400 text-sm">
                      {o.order_number}
                    </td>
                    <td className="p-3.5 font-bold text-slate-100">
                      {o.user?.full_name || o.customer_name || 'Guest Customer'}
                    </td>
                    <td className="p-3.5 font-extrabold text-amber-400">
                      {o.table ? `Table #${o.table.table_number}` : (o.table_id ? `Table #${o.table_id}` : 'Takeaway')}
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="space-y-1">
                        {o.items?.map((item) => (
                          <div key={item.id} className="flex items-center gap-1.5 text-[11px]">
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold">
                              {item.quantity}x
                            </span>
                            <span className="text-slate-200 font-medium truncate">
                              {item.food_item?.name || 'Dish'}
                            </span>
                            <span className="text-slate-500 font-mono">
                              (₹{parseFloat(item.unit_price || item.price || 0).toFixed(0)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-black text-emerald-400 text-sm">
                      ₹{parseFloat(o.total_amount).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 font-bold text-slate-300">
                      ⏱️ {o.estimated_minutes || 20} mins
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400">
                      🔔 {readyTimeStr}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer focus:outline-none ${
                          o.status === 'Order Received' || o.status === 'Received' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                          o.status === 'Order Confirmed' || o.status === 'Confirmed' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' :
                          o.status === 'Preparing' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                          o.status === 'Ready' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                          'bg-slate-800 text-slate-200 border-slate-700'
                        }`}
                      >
                        <option value="Order Received" className="bg-slate-900 text-slate-200">Order Received</option>
                        <option value="Order Confirmed" className="bg-slate-900 text-slate-200">Order Confirmed</option>
                        <option value="Preparing" className="bg-slate-900 text-slate-200">Preparing</option>
                        <option value="Ready" className="bg-slate-900 text-slate-200">Ready</option>
                        <option value="Serving" className="bg-slate-900 text-slate-200">Serving / Out for Delivery</option>
                        <option value="Served" className="bg-slate-900 text-slate-200">Served / Completed</option>
                        <option value="Cancelled" className="bg-slate-900 text-rose-400">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* 6. OFFERS TAB */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Coupons & Promotional Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offersList.map((off) => (
              <div key={off.id} className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-2">
                <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs inline-block">
                  {off.code}
                </span>
                <h4 className="text-sm font-bold text-slate-100">{off.title}</h4>
                <p className="text-xs text-slate-400">{off.description}</p>
                <span className="block text-xs font-bold text-emerald-400">Min Order: ₹{off.min_order_amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
