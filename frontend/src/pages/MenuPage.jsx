import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { FoodCard } from '../components/FoodCard';
import { useCart } from '../context/CartContext';
import { 
  Search, Filter, QrCode, Sparkles, Leaf, Flame, 
  ArrowUpDown, X, Star, Clock, Plus, Check, Camera, RefreshCw
} from 'lucide-react';

export const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const qrToken = searchParams.get('qr');

  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // rating, price_asc, price_desc, name

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState(null);

  // QR Modal & Table Selection State
  const [showQRModal, setShowQRModal] = useState(false);
  const [allTables, setAllTables] = useState([]);
  const [customQRInput, setCustomQRInput] = useState('');
  const [qrScanning, setQrScanning] = useState(false);
  const [qrStatusMsg, setQrStatusMsg] = useState(null);

  const { selectedTable, setSelectedTable, addToCart } = useCart();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setAllTables(res.data);
    } catch (err) {
      console.error("Error fetching tables:", err);
    }
  };

  useEffect(() => {
    // Handle QR table code if present in URL
    if (qrToken) {
      handleValidateQR(qrToken);
    }
  }, [qrToken]);

  const handleValidateQR = async (token) => {
    try {
      const res = await api.get(`/tables/qr/${token}`);
      setSelectedTable(res.data);
      setQrStatusMsg({ type: 'success', text: `Successfully linked to Table #${res.data.table_number} (${res.data.location})` });
    } catch (err) {
      console.error("QR Code invalid:", err);
      setQrStatusMsg({ type: 'error', text: 'Invalid QR Code token. Please check and try again.' });
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, vegOnly, spicyOnly, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { sort_by: sortBy };
      if (selectedCategory) params.category_id = selectedCategory;
      if (vegOnly) params.is_vegetarian = true;
      if (spicyOnly) params.is_spicy = true;

      const [foodRes, catRes] = await Promise.all([
        api.get('/food-items', { params }),
        api.get('/categories')
      ]);

      setFoodItems(foodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Error fetching menu items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTableByQR = (table) => {
    setSelectedTable(table);
    setSearchParams({ qr: table.qr_code_token });
    setQrStatusMsg({ type: 'success', text: `Linked to Table #${table.table_number}` });
    setShowQRModal(false);
  };

  const handleSimulateScan = (token) => {
    setQrScanning(true);
    setTimeout(() => {
      handleValidateQR(token);
      setSearchParams({ qr: token });
      setQrScanning(false);
      setShowQRModal(false);
    }, 800);
  };

  // Client-side search filtering
  const filteredItems = foodItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Table QR Banner */}
      <div className="p-4 rounded-2xl glass-panel border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            {selectedTable ? (
              <>
                <span className="block font-bold text-sm text-slate-100">
                  Dine-In Mode Active: <span className="text-amber-400">Table #{selectedTable.table_number}</span> ({selectedTable.location})
                </span>
                <span className="text-xs text-amber-200/80">
                  QR Token: <code className="font-mono bg-slate-950/60 px-1.5 py-0.5 rounded text-amber-300">{selectedTable.qr_code_token}</code> • Orders will be served directly to your table.
                </span>
              </>
            ) : (
              <>
                <span className="block font-bold text-sm text-slate-100">Table QR Code Scan & Ordering</span>
                <span className="text-xs text-slate-400">
                  Scan your table's QR Code or select your dining table to link your live order.
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowQRModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all w-full sm:w-auto"
          >
            <QrCode className="w-4 h-4" />
            {selectedTable ? 'Switch Table QR' : 'Scan / Select Table QR'}
          </button>
          {selectedTable && (
            <button
              onClick={() => {
                setSelectedTable(null);
                setSearchParams({});
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold"
              title="Clear Table"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Artisanal Food Menu
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Handcrafted with organic ingredients, prepared fresh on order (Prices in ₹ INR)
          </p>
        </div>

        {/* Search Input & Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="rating">Sort by Rating ★</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Sort Alphabetically</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedCategory === null
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'glass-panel text-slate-400 hover:text-slate-200'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'glass-panel text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Dietary Toggles */}
      <div className="flex items-center gap-4 text-xs font-semibold">
        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
            vegOnly
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Leaf className="w-3.5 h-3.5" /> Veg Only
        </button>

        <button
          onClick={() => setSpicyOnly(!spicyOnly)}
          className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
            spicyOnly
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Spicy Only
        </button>
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className="py-20 text-center text-amber-400 flex items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Fetching culinary delights...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl p-8 space-y-3">
          <h3 className="text-lg font-bold text-slate-300">No dishes match your filters</h3>
          <p className="text-xs text-slate-500">Try clearing search terms or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} onSelect={(item) => setSelectedItem(item)} />
          ))}
        </div>
      )}

      {/* Food Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="relative h-56 bg-slate-950">
              <img
                src={selectedItem.image_url}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/70 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-100">{selectedItem.name}</h3>
                <span className="text-2xl font-black text-amber-400">₹{selectedItem.price}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" /> {selectedItem.rating_avg} Rating
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-500" /> {selectedItem.prep_time_minutes} mins prep
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedItem.description}
              </p>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    addToCart(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition-all"
                >
                  Add to Cart (₹{selectedItem.price})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table QR Selector & Camera Simulator Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Table QR Scanner</h3>
                  <p className="text-xs text-slate-400">Link your dine-in table for instant serving</p>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Select Table Cards */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Select Your Dining Table:
              </label>
              <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {allTables.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSimulateScan(t.qr_code_token)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedTable?.id === t.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-sm">
                        #{t.table_number}
                      </div>
                      <div>
                        <span className="block font-bold text-xs">{t.location} • {t.capacity} Guests</span>
                        <span className="text-[11px] font-mono text-slate-400">{t.qr_code_token}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-[11px]">
                      {qrScanning ? 'Scanning...' : 'Scan Table'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom QR Code Token Input */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Or Enter Custom QR Token:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQRInput}
                  onChange={(e) => setCustomQRInput(e.target.value)}
                  placeholder="e.g. QR-T01-7891"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => {
                    if (customQRInput.trim()) {
                      handleSimulateScan(customQRInput.trim());
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

