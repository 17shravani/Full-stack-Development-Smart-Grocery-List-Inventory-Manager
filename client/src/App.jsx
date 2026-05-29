import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pantry from './pages/Pantry';
import Recipes from './pages/Recipes';
import GroceryList from './pages/GroceryList';
import { Sparkles, Layers, ShoppingBag, ChefHat, LayoutDashboard, LogOut, ShieldCheck, Heart } from 'lucide-react';

function AppContent() {
  const { user, activePage, setActivePage, logout, serverStatus } = useApp();

  // Route protection gate
  if (!user) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'pantry': return <Pantry />;
      case 'recipes': return <Recipes />;
      case 'list': return <GroceryList />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Matrix Control', icon: LayoutDashboard },
    { id: 'pantry', label: 'Shelf Digital Twin', icon: Layers },
    { id: 'list', label: 'Grocery Plan', icon: ShoppingBag },
    { id: 'recipes', label: 'Culinary Planner', icon: ChefHat },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Premium Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/80 px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo brand */}
          <button 
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-2.5 hover:opacity-95 transition-opacity"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyber-indigo to-cyber-violet flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.45)]">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="text-left select-none">
              <h1 className="text-lg font-black tracking-tight text-white leading-none">AetherGro</h1>
              <span className="text-[8px] text-cyber-violet font-extrabold tracking-widest uppercase block mt-0.5">Supply Engine v1.0</span>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-950/65 p-1 rounded-xl border border-gray-900">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all select-none ${
                    isActive 
                      ? 'bg-cyber-indigo text-white shadow-[0_0_10px_rgba(99,102,241,0.25)] border-t border-white/5' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User controls & Profile */}
          <div className="flex items-center gap-3">
            
            {/* Server Online/Simulation badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/40 text-[9px] font-bold uppercase tracking-wider text-gray-400">
              <ShieldCheck className={`h-3.5 w-3.5 ${serverStatus === 'online' ? 'text-cyber-green' : 'text-cyber-amber animate-pulse'}`} />
              {serverStatus === 'online' ? 'Sync Secured' : 'Offline Buffer'}
            </div>

            <div className="flex items-center gap-2 border-l border-gray-800 pl-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-extrabold text-white leading-none">{user.name}</div>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Operator</span>
              </div>
              
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10"
                title="Sign Out Operator"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Mobile navigation tabbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-gray-800/80 px-4 py-2 flex justify-around shadow-2xl">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                isActive ? 'text-cyber-indigo' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label.split(' ')[0]}
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 pb-24 md:pb-8">
        {renderActivePage()}
      </main>

      {/* Futuristic footer */}
      <footer className="py-6 border-t border-gray-900/60 bg-gray-950/20 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest max-w-7xl w-full mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="flex items-center gap-1 justify-center">
            Designed for proof of work with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> by AetherGro Innovation Lab
          </p>
          <p>Full-Stack MERN Portfolio Hub © 2026</p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
