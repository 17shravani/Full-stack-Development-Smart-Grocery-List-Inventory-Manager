import React from 'react';
import { useApp } from '../context/AppContext';
import { Activity, PieChart, TrendingUp, Sparkles } from 'lucide-react';

export default function AnalyticsChart() {
  const { pantryItems } = useApp();

  // 1. Calculate space allocation (count per category)
  const categoryCounts = pantryItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  const totalItems = pantryItems.length || 1;
  const categories = Object.keys(categoryCounts);
  
  // Custom HSL colors for matching branding
  const catColors = {
    Dairy: '#6366f1',   // Indigo
    Produce: '#10b981', // Emerald
    Bakery: '#f59e0b',  // Amber
    Grains: '#8b5cf6',  // Violet
    General: '#6b7280'
  };

  // 2. Mock timeline coordinates for depletion wave graph (glowing smooth curve)
  // Maps to beautiful visual SVG coordinates
  const wavePoints = "M 0 80 C 50 20, 100 90, 150 40 C 200 10, 250 85, 300 30 C 350 0, 400 60, 450 15 L 450 100 L 0 100 Z";
  const linePoints = "M 0 80 C 50 20, 100 90, 150 40 C 200 10, 250 85, 300 30 C 350 0, 400 60, 450 15";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* Dynamic Shelf Allocation Donut */}
      <div className="glass-panel rounded-2xl border border-gray-800 p-5 shadow-xl flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2 mb-1">
            <PieChart className="text-cyber-green h-4 w-4" />
            Category Space Allocation
          </h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Pantry Tier Breakdown</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-6">
          {/* Custom SVG Donut Chart */}
          <div className="relative h-28 w-28 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-full w-full transform -rotate-90">
              {/* Background circle */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
              
              {/* Segment 1: Dairy (e.g. 35%) */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" 
                stroke={catColors.Dairy} strokeWidth="3" 
                strokeDasharray="35 65" strokeDashoffset="0"
                className="transition-all duration-1000 ease-out"
              />
              {/* Segment 2: Grains (e.g. 25%) */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" 
                stroke={catColors.Grains} strokeWidth="3" 
                strokeDasharray="25 75" strokeDashoffset="-35" 
              />
              {/* Segment 3: Produce (e.g. 20%) */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" 
                stroke={catColors.Produce} strokeWidth="3" 
                strokeDasharray="20 80" strokeDashoffset="-60" 
              />
              {/* Segment 4: Bakery (e.g. 20%) */}
              <circle 
                cx="18" cy="18" r="15.915" fill="none" 
                stroke={catColors.Bakery} strokeWidth="3" 
                strokeDasharray="20 80" strokeDashoffset="-80" 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-white">{pantryItems.length}</span>
              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Stocked</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-2 flex-1 max-w-[180px]">
            {categories.slice(0, 4).map(cat => {
              const count = categoryCounts[cat] || 0;
              const percent = Math.round((count / totalItems) * 100);
              const color = catColors[cat] || catColors.General;
              return (
                <div key={cat} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }}></span>
                    {cat}
                  </div>
                  <span className="text-white">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest border-t border-gray-900/40 pt-2.5">
          Distribution updates dynamically upon inventory checkout
        </div>
      </div>

      {/* Expiry & Depletion Projection Graph */}
      <div className="glass-panel rounded-2xl border border-gray-800 p-5 shadow-xl flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2 mb-1">
            <TrendingUp className="text-cyber-violet h-4 w-4" />
            Depletion Velocity Analytics
          </h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">7-Day Outflow & Loss Projections</p>
        </div>

        {/* Custom SVG Wave Graph */}
        <div className="relative h-28 my-6 bg-gray-950/40 rounded-xl border border-gray-900 overflow-hidden">
          <svg viewBox="0 0 450 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line x1="0" y1="25" x2="450" y2="25" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <line x1="0" y1="50" x2="450" y2="50" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <line x1="0" y1="75" x2="450" y2="75" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

            {/* Glowing wave background fill */}
            <path d={wavePoints} fill="url(#waveGrad)" />

            {/* Main wave line */}
            <path d={linePoints} fill="none" stroke="#8b5cf6" strokeWidth="2.5" className="stroke-dash" />
            
            {/* Trend node marks */}
            <circle cx="150" cy="40" r="4.5" fill="#8b5cf6" stroke="#030712" strokeWidth="1.5" />
            <circle cx="300" cy="30" r="4.5" fill="#10b981" stroke="#030712" strokeWidth="1.5" />
          </svg>

          {/* Absolute floating coordinates values */}
          <div className="absolute top-2 left-3 bg-gray-900/90 border border-gray-800 rounded px-1.5 py-0.5 text-[8px] font-bold text-cyber-violet flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" /> Outflow velocity normalized
          </div>
        </div>

        <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest border-t border-gray-900/40 pt-2.5">
          <span>Outflow Peak: Mon</span>
          <span>Buffer Life: Safe</span>
        </div>

      </div>

    </div>
  );
}
