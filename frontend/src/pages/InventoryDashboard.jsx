import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PackageCheck, AlertTriangle, Plus, RefreshCw, Truck, History, ArrowDown, ArrowUp } from 'lucide-react';

export const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('stock'); // stock, alerts, suppliers, history
  const [ingredients, setIngredients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [history, setHistory] = useState([]);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(null); // ingredient object
  const [stockChangeVal, setStockChangeVal] = useState(10);
  const [stockNotes, setStockNotes] = useState('Stock Adjustment');

  const [newIng, setNewIng] = useState({
    name: '', unit: 'kg', current_stock: 50.0, reorder_level: 10.0, cost_per_unit: 5.0
  });

  useEffect(() => {
    fetchInventoryData();
  }, [activeTab]);

  const fetchInventoryData = async () => {
    try {
      const [ingRes, altRes, supRes, histRes] = await Promise.all([
        api.get('/inventory/ingredients'),
        api.get('/inventory/alerts'),
        api.get('/inventory/suppliers'),
        api.get('/inventory/history')
      ]);
      setIngredients(ingRes.data);
      setAlerts(altRes.data);
      setSuppliers(supRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error("Inventory fetch error:", err);
    }
  };

  const handleCreateIngredient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/ingredients', {
        ...newIng,
        current_stock: parseFloat(newIng.current_stock),
        reorder_level: parseFloat(newIng.reorder_level),
        cost_per_unit: parseFloat(newIng.cost_per_unit)
      });
      setShowAddModal(false);
      fetchInventoryData();
    } catch (err) {
      alert("Error adding ingredient");
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!showStockModal) return;

    try {
      await api.post(`/inventory/ingredients/${showStockModal.id}/stock`, {
        quantity_change: parseFloat(stockChangeVal),
        notes: stockNotes
      });
      setShowStockModal(null);
      fetchInventoryData();
    } catch (err) {
      alert(err.response?.data?.detail || "Stock update failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <PackageCheck className="w-8 h-8 text-purple-400" /> Inventory & Stock Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time raw ingredient tracking, automated recipe deductions, and supplier orders</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Ingredient
        </button>
      </div>

      {/* Low-Stock Alert Banner */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl glass-panel border border-red-500/40 bg-red-500/10 flex items-center justify-between text-red-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <span className="font-bold text-sm block">Low Stock Warning ({alerts.length} ingredients below reorder level)</span>
              <span className="text-xs text-red-300/80">
                {alerts.map(a => a.name).join(', ')} require immediate reordering.
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="px-3 py-1.5 rounded-lg bg-red-500 text-slate-950 font-bold text-xs shrink-0"
          >
            View Alerts
          </button>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stock' ? 'bg-purple-500 text-slate-950' : 'glass-panel text-slate-400'
          }`}
        >
          Ingredient Stock List ({ingredients.length})
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'alerts' ? 'bg-purple-500 text-slate-950' : 'glass-panel text-slate-400'
          }`}
        >
          Low-Stock Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'suppliers' ? 'bg-purple-500 text-slate-950' : 'glass-panel text-slate-400'
          }`}
        >
          Suppliers Directory ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history' ? 'bg-purple-500 text-slate-950' : 'glass-panel text-slate-400'
          }`}
        >
          Audit History Logs
        </button>
      </div>

      {/* Stock Table */}
      {(activeTab === 'stock' || activeTab === 'alerts') && (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="p-3">Ingredient</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Reorder Threshold</th>
                <th className="p-3">Cost / Unit</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {(activeTab === 'alerts' ? alerts : ingredients).map((ing) => {
                const isLow = parseFloat(ing.current_stock) <= parseFloat(ing.reorder_level);
                return (
                  <tr key={ing.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                      {ing.name} {isLow && <span className="text-red-400 font-bold text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded">LOW</span>}
                    </td>
                    <td className={`p-3 font-extrabold ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                      {parseFloat(ing.current_stock).toFixed(2)} {ing.unit}
                    </td>
                    <td className="p-3 text-slate-400">{parseFloat(ing.reorder_level).toFixed(2)} {ing.unit}</td>
                    <td className="p-3 text-slate-300">₹{parseFloat(ing.cost_per_unit).toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setShowStockModal(ing);
                          setStockChangeVal(10);
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 font-bold text-xs"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit History Log */}
      {activeTab === 'history' && (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Ingredient</th>
                <th className="p-3">Type</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {history.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/50">
                  <td className="p-3 text-slate-400">{new Date(tx.created_at).toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-100">{tx.ingredient_name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                      tx.transaction_type === 'IN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold">{tx.quantity} {tx.unit}</td>
                  <td className="p-3 text-slate-400 italic">{tx.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Adjust Stock for {showStockModal.name}</h3>
            <form onSubmit={handleUpdateStock} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Quantity Change (+ to Add, - to Deduct)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={stockChangeVal}
                  onChange={(e) => setStockChangeVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(null)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100">Add Raw Ingredient</h3>
            <form onSubmit={handleCreateIngredient} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ingredient Name</label>
                <input
                  type="text"
                  required
                  value={newIng.name}
                  onChange={(e) => setNewIng({ ...newIng, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newIng.unit}
                    onChange={(e) => setNewIng({ ...newIng, unit: e.target.value })}
                    placeholder="kg, liters, units"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newIng.current_stock}
                    onChange={(e) => setNewIng({ ...newIng, current_stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold"
                >
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
