import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Box, Layers, Calendar, ChevronRight, Activity, Trash2, Plus, Minus, AlertTriangle } from 'lucide-react';

export default function DigitalTwin() {
  const { pantryItems, consumeStock, addLot, deleteItem, addItemToShoppingList } = useApp();
  const [selectedItem, setSelectedItem] = useState(null);
  const [consumeQty, setConsumeQty] = useState(1);
  
  // Lot adding state
  const [lotQty, setLotQty] = useState('');
  const [lotPrice, setLotPrice] = useState('');
  const [lotExpiry, setLotExpiry] = useState('');
  const [lotStore, setLotStore] = useState('');

  // Group pantry items by category
  const categories = ['Dairy', 'Produce', 'Bakery', 'Grains', 'Pantry', 'Beverages', 'Snacks', 'Household'];
  const groupedItems = pantryItems.reduce((acc, item) => {
    const cat = item.category || 'Pantry';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const handleConsume = async (lotId, maxQty) => {
    const qtyToConsume = Math.min(Number(consumeQty), maxQty);
    if (qtyToConsume <= 0) return;
    try {
      await consumeStock(lotId, qtyToConsume);
      setConsumeQty(1);
      // Update selected item detail modal
      setSelectedItem(prev => {
        const item = pantryItems.find(i => i._id === prev._id);
        return item;
      });
    } catch (e) {
      alert("Stock consumption failed.");
    }
  };

  const handleAddLot = async (e) => {
    e.preventDefault();
    if (!lotQty || Number(lotQty) <= 0) return;
    try {
      await addLot({
        itemId: selectedItem._id,
        qty: Number(lotQty),
        unit: selectedItem.defaultUnit,
        expiryAt: lotExpiry || undefined,
        price: lotPrice ? Number(lotPrice) : undefined,
        store: lotStore || undefined
      });
      setLotQty('');
      setLotPrice('');
      setLotExpiry('');
      setLotStore('');
    } catch (err) {
      alert("Failed to record new lot.");
    }
  };

  const daysLeft = (expiryString) => {
    if (!expiryString) return null;
    const diff = new Date(expiryString).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'expired': return 'border-red-500 bg-red-950/40 text-red-400 glow-rose animate-pulse-slow';
      case 'critical': return 'border-amber-500 bg-amber-950/40 text-amber-300 glow-amber';
      case 'lowstock': return 'border-orange-500 bg-orange-950/40 text-orange-400';
      default: return 'border-emerald-500 bg-emerald-950/40 text-emerald-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Visual Pantry Shelves header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="text-cyber-indigo h-6 w-6" />
            Pantry Digital Twin
          </h2>
          <p className="text-sm text-gray-400">Interactive live 3D shelf visualizer of physical pantry inventories.</p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-medium bg-gray-900/50 p-2.5 rounded-lg border border-gray-800">
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> Safe</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-orange-400"></span> Low Stock</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span> Expiring Soon</div>
          <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></span> Expired</div>
        </div>
      </div>

      {/* Tiers/Shelves Grid */}
      <div className="space-y-6">
        {categories.map(category => {
          const itemsOnShelf = groupedItems[category] || [];
          return (
            <div key={category} className="relative bg-gray-900/40 rounded-xl p-4 border border-gray-800/80 shadow-inner grid-gridlines">
              {/* Shelf wooden/glass premium border top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-t-xl opacity-90 shadow-md"></div>
              
              <div className="flex items-center justify-between mb-4 mt-1">
                <span className="text-sm font-semibold tracking-wider text-cyber-indigo uppercase bg-cyber-indigo/10 px-2.5 py-1 rounded border border-cyber-indigo/25">
                  {category} Tier
                </span>
                <span className="text-xs text-gray-500 font-medium">{itemsOnShelf.length} items loaded</span>
              </div>

              {/* Items standing on shelf */}
              {itemsOnShelf.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-xs text-gray-500 italic">
                  Shelf layer empty. Add items or scan receipt to stock.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {itemsOnShelf.map(item => {
                    const dl = daysLeft(item.expiryDate);
                    return (
                      <button
                        key={item._id}
                        onClick={() => setSelectedItem(item)}
                        className={`text-left p-3.5 rounded-xl border glass-panel transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden flex flex-col justify-between h-36 ${getStatusStyle(item.status)}`}
                      >
                        {/* Capacity background meter bar */}
                        <div 
                          className="absolute bottom-0 left-0 h-1 bg-white/20 transition-all duration-500"
                          style={{ width: `${Math.min(100, (item.stock / (item.minStockLevel * 2)) * 100)}%` }}
                        ></div>

                        <div>
                          <div className="text-xs opacity-75 font-semibold uppercase tracking-wider mb-1">{item.preferredAisle.split(':')[0]}</div>
                          <div className="font-bold text-sm tracking-tight text-white leading-tight group-hover:text-cyber-indigo transition-colors duration-200 line-clamp-2">
                            {item.name}
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xl font-extrabold flex items-baseline gap-1">
                            {item.stock}
                            <span className="text-[10px] font-medium opacity-80">{item.defaultUnit}</span>
                          </div>

                          <div className="flex items-center justify-between mt-1 opacity-90 text-[10px] font-semibold">
                            {dl === null ? (
                              <span className="text-gray-400">No Expiry</span>
                            ) : dl < 0 ? (
                              <span className="text-red-400 animate-pulse">EXPIRED</span>
                            ) : dl <= 3 ? (
                              <span className="text-amber-300">{dl}d left</span>
                            ) : (
                              <span className="text-emerald-400">{dl}d left</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Shelf platform plank visual foundation */}
              <div className="mt-4 h-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded border-t border-gray-700/50 shadow-md"></div>
            </div>
          );
        })}
      </div>

      {/* Item Detail & Manipulation Glass Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 flex flex-col md:flex-row">
            
            {/* Left side: Item info & stock consumption */}
            <div className="p-6 md:w-1/2 border-r border-gray-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyber-indigo bg-cyber-indigo/10 px-2 py-0.5 rounded">
                    {selectedItem.category}
                  </span>
                  <button 
                    onClick={() => {
                      if (confirm("Delete this catalog item completely?")) {
                        deleteItem(selectedItem._id);
                        setSelectedItem(null);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Delete Catalog Item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-white mt-3 tracking-tight">{selectedItem.name}</h3>
                <p className="text-xs text-gray-400 mt-1">Preferred Location: <span className="font-semibold text-gray-300">{selectedItem.preferredAisle}</span></p>

                {/* Quantitative statistics */}
                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current Stock</span>
                    <div className="text-2xl font-black text-white mt-0.5">{selectedItem.stock} <span className="text-xs font-normal text-gray-400">{selectedItem.defaultUnit}</span></div>
                  </div>
                  <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Min Threshold</span>
                    <div className="text-2xl font-black text-white mt-0.5">{selectedItem.minStockLevel} <span className="text-xs font-normal text-gray-400">{selectedItem.defaultUnit}</span></div>
                  </div>
                </div>

                {/* Expiry alerts */}
                {selectedItem.expiryDate && (
                  <div className="mt-4 flex items-center gap-2 bg-gray-900/35 border border-gray-800 p-3 rounded-lg">
                    <Calendar className="h-5 w-5 text-cyber-violet" />
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Nearest Lot Expiry</span>
                      <span className="text-xs text-gray-200 font-semibold">{new Date(selectedItem.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {/* Lot consumption selection block */}
                {selectedItem.lots && selectedItem.lots.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Stock Consumption Drawer</label>
                    <div className="space-y-3">
                      {selectedItem.lots.map(lot => {
                        const dl = daysLeft(lot.expiryAt);
                        return (
                          <div key={lot._id} className="p-3 bg-gray-950/60 rounded-xl border border-gray-800/80 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-gray-400 font-medium">Lot: {lot.store} • INR {lot.price}</div>
                              <div className="text-xs font-extrabold text-white">{lot.qty - lot.consumedQty} {lot.unit} remaining</div>
                              {dl !== null && (
                                <div className={`text-[10px] font-bold ${dl < 0 ? 'text-red-400' : dl <= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {dl < 0 ? 'Expired' : `${dl} days to expiry`}
                                </div>
                              )}
                            </div>

                            {/* Consume controls */}
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                min="0.1" 
                                step="0.1"
                                max={lot.qty - lot.consumedQty}
                                value={consumeQty}
                                onChange={e => setConsumeQty(parseFloat(e.target.value) || 0)}
                                className="w-14 bg-gray-900 border border-gray-700 text-white rounded p-1 text-xs text-center font-bold"
                              />
                              <button
                                onClick={() => handleConsume(lot._id, lot.qty - lot.consumedQty)}
                                className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/90 text-red-400 hover:text-white rounded border border-red-500/25 transition-all text-xs font-black"
                              >
                                Consume
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-orange-950/20 rounded-xl border border-orange-500/25 text-center flex flex-col items-center">
                    <AlertTriangle className="h-6 w-6 text-orange-400 mb-1" />
                    <p className="text-xs text-orange-300 font-bold">Pantry Out of Stock</p>
                    <button 
                      onClick={() => {
                        addItemToShoppingList({ itemId: selectedItem._id, qty: selectedItem.minStockLevel, unit: selectedItem.defaultUnit, source: 'lowstock' });
                        alert("Added to shopping list!");
                      }}
                      className="mt-3 text-xs bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white py-1.5 px-3 rounded-lg border border-orange-500/30 transition-all font-bold"
                    >
                      Add Restock To Shopping List
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="mt-6 w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs font-black rounded-lg transition-colors border border-gray-800"
              >
                Close Shelf View
              </button>
            </div>

            {/* Right side: Stock-In addition form */}
            <div className="p-6 md:w-1/2 bg-gray-950/40">
              <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 mb-4">
                <Plus className="text-cyber-green h-4 w-4" />
                Record Purchase Lot (Stock-In)
              </h4>

              <form onSubmit={handleAddLot} className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Purchase Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="0.1"
                      placeholder="e.g. 2"
                      value={lotQty}
                      onChange={e => setLotQty(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyber-green font-bold"
                    />
                    <span className="bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-gray-400 font-bold self-center">
                      {selectedItem.defaultUnit}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Purchase Price (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 68"
                    value={lotPrice}
                    onChange={e => setLotPrice(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyber-green font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={lotExpiry}
                    onChange={e => setLotExpiry(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyber-green font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block mb-1">Purchase Supermarket / Store</label>
                  <input
                    type="text"
                    placeholder="e.g. D-Mart"
                    value={lotStore}
                    onChange={e => setLotStore(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyber-green font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-cyber-green hover:bg-emerald-600 text-cyber-bg text-xs font-extrabold rounded-lg tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                >
                  Log Purchase Batch
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
