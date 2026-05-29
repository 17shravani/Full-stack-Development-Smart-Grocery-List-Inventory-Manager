import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import DigitalTwin from '../components/DigitalTwin';
import { Plus, X, Layers, Box } from 'lucide-react';

export default function Pantry() {
  const { addGroceryItem } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dairy');
  const [defaultUnit, setDefaultUnit] = useState('pieces');
  const [minStockLevel, setMinStockLevel] = useState(2);
  const [preferredAisle, setPreferredAisle] = useState('');
  const [barcode, setBarcode] = useState('');

  const categories = ['Dairy', 'Produce', 'Bakery', 'Grains', 'Pantry', 'Beverages', 'Snacks', 'Household'];
  const units = ['pieces', 'kg', 'g', 'L', 'ml', 'packs', 'cartons'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const aisle = preferredAisle || `Aisle ${category.charAt(0)}: ${category} Sections`;
      await addGroceryItem({
        name,
        category,
        defaultUnit,
        minStockLevel: Number(minStockLevel),
        preferredAisle: aisle,
        barcode
      });
      // Clear
      setName('');
      setPreferredAisle('');
      setBarcode('');
      setShowAddForm(false);
    } catch (err) {
      alert("Failed to add catalog item.");
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Visual shelves */}
      <DigitalTwin />

      {/* Floating Add Trigger Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-cyber-indigo hover:bg-indigo-600 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.55)] transition-transform duration-300 hover:scale-110 z-40"
        title="Register New Catalog Item"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Item Sliding Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-800 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-850 pb-3">
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Box className="text-cyber-indigo h-5 w-5" />
                Register New Grocery Item
              </h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Paneer Block"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-indigo font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Pantry Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-indigo font-semibold"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Default Purchase Unit</label>
                  <select
                    value={defaultUnit}
                    onChange={e => setDefaultUnit(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-indigo font-semibold"
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Min Alert Stock Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={minStockLevel}
                    onChange={e => setMinStockLevel(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-indigo font-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">EAN/UPC Barcode (Optional)</label>
                  <input
                    type="text"
                    placeholder="890123456789"
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-indigo font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Supermarket Preferred Aisle (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Aisle A: Cold Dairy Items"
                  value={preferredAisle}
                  onChange={e => setPreferredAisle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-indigo font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyber-indigo hover:bg-indigo-600 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(99,102,241,0.3)]"
              >
                Register Catalog Entry
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
