import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingList, Trash2, Plus, Sparkles, CheckSquare, Square, RefreshCcw, Layers } from 'lucide-react';

export default function GroceryList() {
  const { shoppingList, addItemToShoppingList, toggleListEntry, deleteListEntry, clearCheckedItems, autoPopulateRestocks, pantryItems } = useApp();
  const [manualText, setManualText] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [manualUnit, setManualUnit] = useState('pieces');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [isPopulating, setIsPopulating] = useState(false);

  // Group list entries by preferred aisle (Aisle A, Aisle B, etc.)
  const entriesByAisle = shoppingList.entries.reduce((acc, entry) => {
    const aisle = entry.preferredAisle || 'General Aisle';
    if (!acc[aisle]) acc[aisle] = [];
    acc[aisle].push(entry);
    return acc;
  }, {});

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manualText.trim() && !selectedItemId) return;

    let payload = {
      qty: Number(manualQty),
      unit: manualUnit,
      source: 'manual'
    };

    if (selectedItemId) {
      payload.itemId = selectedItemId;
      const matched = pantryItems.find(p => p._id === selectedItemId);
      payload.customText = matched ? matched.name : '';
    } else {
      payload.customText = manualText;
    }

    try {
      await addItemToShoppingList(payload);
      setManualText('');
      setSelectedItemId('');
      setManualQty(1);
    } catch (err) {
      alert("Failed to add shopping entry.");
    }
  };

  const triggerAutoRestock = async () => {
    setIsPopulating(true);
    try {
      const msg = await autoPopulateRestocks();
      alert(msg);
    } catch (e) {
      alert("Auto populate routine failed.");
    } finally {
      setIsPopulating(false);
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'lowstock': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'expiry': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'recipe': return 'bg-cyber-violet/10 text-cyber-violet border-cyber-violet/20';
      default: return 'bg-gray-800 text-gray-400 border-gray-700/50';
    }
  };

  return (
    <div className="grid md:grid-cols-12 gap-8 items-start">
      
      {/* List Display & Interactive Actions */}
      <div className="md:col-span-8 space-y-6">
        <div className="glass-panel rounded-2xl border border-gray-800 p-6 shadow-xl relative">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-gray-850 pb-4 mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <ShoppingList className="text-cyber-green h-5 w-5" />
                Active Grocery Shopping List
              </h3>
              <p className="text-xs text-gray-400">Items sorted automatically by physical supermarket store aisle.</p>
            </div>

            {/* Smart restock and clear controls */}
            <div className="flex gap-2">
              <button
                onClick={triggerAutoRestock}
                disabled={isPopulating}
                className="py-2.5 px-4 bg-cyber-violet hover:bg-violet-600 disabled:bg-gray-850 text-white text-xs font-black rounded-lg uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(139,92,246,0.3)] flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isPopulating ? 'Scanning...' : 'AI Auto-Restock'}
              </button>

              <button
                onClick={clearCheckedItems}
                className="py-2.5 px-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
              >
                Clear Checked
              </button>
            </div>
          </div>

          {/* Core items render grouped by aisle */}
          {shoppingList.entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
              <Layers className="h-10 w-10 text-gray-700 animate-pulse" />
              <p className="text-xs text-gray-500 italic uppercase tracking-wider font-semibold">Your shopping list is clear. Trigger AI Auto-Restock to audit pantries!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(entriesByAisle).map(aisle => {
                const entries = entriesByAisle[aisle];
                return (
                  <div key={aisle} className="space-y-3">
                    {/* Aisle section marker */}
                    <div className="text-[10px] font-extrabold tracking-wider text-cyber-green uppercase bg-cyber-green/10 border border-cyber-green/20 px-2.5 py-1 rounded inline-block">
                      {aisle}
                    </div>

                    {/* Entries list inside this aisle */}
                    <div className="space-y-2">
                      {entries.map(entry => (
                        <div 
                          key={entry._id} 
                          className={`p-3.5 rounded-xl border glass-panel flex items-center justify-between transition-all duration-200 ${
                            entry.checked 
                              ? 'border-gray-900 bg-gray-950/20 opacity-40' 
                              : 'border-gray-850 hover:border-cyber-green/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox Icon Toggler */}
                            <button 
                              onClick={() => toggleListEntry(entry._id, !entry.checked)}
                              className="text-gray-400 hover:text-cyber-green transition-colors"
                            >
                              {entry.checked ? (
                                <CheckSquare className="h-5 w-5 text-cyber-green" />
                              ) : (
                                <Square className="h-5 w-5" />
                              )}
                            </button>

                            <div>
                              <div className={`text-xs font-bold text-white ${entry.checked ? 'line-through text-gray-600' : ''}`}>
                                {entry.name || entry.customText}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-gray-500 font-semibold">{entry.qty} {entry.unit}</span>
                                
                                {/* Source Label badge */}
                                {entry.source && (
                                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getSourceBadge(entry.source)}`}>
                                    {entry.source}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => deleteListEntry(entry._id)}
                            className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Manual Stock Replenishment Side Form */}
      <div className="md:col-span-4">
        <div className="glass-panel rounded-2xl border border-gray-800 p-6 shadow-xl">
          
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-gray-850 pb-2.5">
            <Plus className="text-cyber-green h-4.5 w-4.5" />
            Append Shopping Entry
          </h4>

          <form onSubmit={handleManualAdd} className="space-y-4">
            
            {/* Catalog select dropdown */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Pick From Pantry Catalog</label>
              <select
                value={selectedItemId}
                onChange={e => {
                  setSelectedItemId(e.target.value);
                  const matched = pantryItems.find(p => p._id === e.target.value);
                  if (matched) {
                    setManualText('');
                    setManualUnit(matched.defaultUnit);
                  }
                }}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-green font-semibold"
              >
                <option value="">-- Manual Text Entry --</option>
                {pantryItems.map(item => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </div>

            {/* Manual custom name field if select is empty */}
            {!selectedItemId && (
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Custom Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Avocado"
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-green font-semibold"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  value={manualQty}
                  onChange={e => setManualQty(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-green font-black"
                />
              </div>
              
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Unit</label>
                <select
                  value={manualUnit}
                  onChange={e => setManualUnit(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-green font-semibold"
                >
                  <option value="pieces">pieces</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="L">L</option>
                  <option value="packs">packs</option>
                  <option value="cartons">cartons</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyber-green hover:bg-emerald-600 text-cyber-bg text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              Add To Cart
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
