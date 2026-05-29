import React from 'react';
import { useApp } from '../context/AppContext';
import AnalyticsChart from '../components/AnalyticsChart';
import AgentConsole from '../components/AgentConsole';
import ReceiptScanner from '../components/ReceiptScanner';
import { Box, AlertTriangle, Calendar, ShoppingCart, Sparkles, Database } from 'lucide-react';

export default function Dashboard() {
  const { pantryItems, shoppingList, serverStatus } = useApp();

  // Compute stat counts
  const totalStocked = pantryItems.length;
  const lowStockCount = pantryItems.filter(item => item.status === 'lowstock').length;
  const expiryCount = pantryItems.filter(item => item.status === 'expired' || item.status === 'critical').length;
  const shoppingListCount = shoppingList.entries.filter(e => !e.checked).length;

  return (
    <div className="space-y-8">
      
      {/* Welcome Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Pantry Control Matrix
            <span className="bg-cyber-indigo/10 border border-cyber-indigo/30 px-2 py-0.5 text-xs font-black rounded text-cyber-indigo flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> AI Core Active
            </span>
          </h2>
          <p className="text-sm text-gray-400">Real-time depletion modeling, expiry safety logs, and autonomous restock pipelines.</p>
        </div>

        {/* Database Status indicator */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
          <Database className="h-5 w-5 text-cyber-green" />
          <div>
            <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest block">Core Storage Adapter</span>
            <span className="text-xs font-bold text-white uppercase">
              {serverStatus === 'online' ? 'MongoDB Atlas Cloud' : 'JSON Standalone Buffer'}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Stocked */}
        <div className="glass-panel rounded-2xl p-5 border border-gray-800 shadow-lg flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-cyber-indigo/5 rounded-full blur-2xl group-hover:bg-cyber-indigo/15 transition-all"></div>
          <div className="h-10 w-10 rounded-xl bg-cyber-indigo/10 border border-cyber-indigo/25 flex items-center justify-center text-cyber-indigo">
            <Box className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">Total Items Stocked</span>
            <span className="text-2xl font-black text-white mt-0.5">{totalStocked}</span>
          </div>
        </div>

        {/* Stat 2: Low Stock */}
        <div className="glass-panel rounded-2xl p-5 border border-gray-800 shadow-lg flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/15 transition-all"></div>
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400">
            <AlertTriangle className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">Restocks Required</span>
            <span className="text-2xl font-black text-white mt-0.5">{lowStockCount}</span>
          </div>
        </div>

        {/* Stat 3: Expiry Risks */}
        <div className="glass-panel rounded-2xl p-5 border border-gray-800 shadow-lg flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-cyber-rose/5 rounded-full blur-2xl group-hover:bg-cyber-rose/15 transition-all"></div>
          <div className="h-10 w-10 rounded-xl bg-cyber-rose/10 border border-cyber-rose/25 flex items-center justify-center text-cyber-rose">
            <Calendar className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">Expiry Risks Detected</span>
            <span className="text-2xl font-black text-white mt-0.5">{expiryCount}</span>
          </div>
        </div>

        {/* Stat 4: Cart Queue */}
        <div className="glass-panel rounded-2xl p-5 border border-gray-800 shadow-lg flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-cyber-green/5 rounded-full blur-2xl group-hover:bg-cyber-green/15 transition-all"></div>
          <div className="h-10 w-10 rounded-xl bg-cyber-green/10 border border-cyber-green/25 flex items-center justify-center text-cyber-green">
            <ShoppingCart className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider block">Shopping List Items</span>
            <span className="text-2xl font-black text-white mt-0.5">{shoppingListCount}</span>
          </div>
        </div>

      </div>

      {/* SVG Analytics Charts Row */}
      <AnalyticsChart />

      {/* Core Operational Tiers (Multi-Agent Panel + Receipt OCR) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Agent Console */}
        <div className="lg:col-span-5">
          <AgentConsole />
        </div>

        {/* OCR Bill Scanner */}
        <div className="lg:col-span-7">
          <ReceiptScanner />
        </div>

      </div>

    </div>
  );
}
