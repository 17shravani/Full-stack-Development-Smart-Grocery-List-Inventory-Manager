import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChefHat, ShoppingCart, Users, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function RecipeCart({ recipe, onClose }) {
  const { analyzeRecipeIngredients, bulkAddRecipeIngredients } = useApp();
  const [servings, setServings] = useState(recipe.servings);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const data = await analyzeRecipeIngredients(recipe._id, servings);
      setAnalysis(data);
      setIsAnalyzing(false);
    } catch (e) {
      setIsAnalyzing(false);
      alert("Failed to analyze recipe stock differences.");
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [servings]);

  const handleCartAdd = async () => {
    if (!analysis) return;
    const missingItems = analysis.analysis.filter(item => item.netNeed > 0);
    
    if (missingItems.length === 0) {
      alert("Pantry already has 100% of ingredients needed for this recipe!");
      return;
    }

    try {
      await bulkAddRecipeIngredients(missingItems);
      setCartSuccess(true);
      setTimeout(() => {
        setCartSuccess(false);
        onClose();
      }, 1500);
    } catch (e) {
      alert("Failed to bulk cart missing ingredients.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ChefHat className="text-cyber-violet h-5.5 w-5.5" />
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight leading-tight">{recipe.title}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Net-Need Difference Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xs font-bold uppercase">Close</button>
        </div>

        {/* Scaler Panel */}
        <div className="p-5 bg-gray-900/20 border-b border-gray-850 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="text-gray-400 h-4 w-4" />
            <span className="text-xs font-bold text-gray-300">Target Serving Size:</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setServings(prev => Math.max(1, prev - 1))}
              className="h-8 w-8 bg-gray-950 border border-gray-800 hover:bg-gray-800 text-white rounded-lg flex items-center justify-center font-bold text-lg select-none"
            >
              -
            </button>
            <span className="text-base font-extrabold text-white w-6 text-center">{servings}</span>
            <button
              onClick={() => setServings(prev => prev + 1)}
              className="h-8 w-8 bg-gray-950 border border-gray-800 hover:bg-gray-800 text-white rounded-lg flex items-center justify-center font-bold text-lg select-none"
            >
              +
            </button>
          </div>
        </div>

        {/* Scaled Ingredients Comparison Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RefreshCw className="h-6 w-6 text-cyber-violet animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Scanning Pantry Reserves...</span>
            </div>
          ) : analysis ? (
            analysis.analysis.map((ing, idx) => (
              <div key={idx} className="p-3 bg-gray-950/60 rounded-xl border border-gray-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold text-white">{ing.name}</div>
                  <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Needed: {ing.requiredQty} {ing.unit} • Got: {ing.stockQty} {ing.unit}</div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {ing.hasEnough ? (
                    <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                      <Check className="h-3 w-3" /> Sufficient
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                        <AlertCircle className="h-3 w-3" /> Buy: {ing.netNeed} {ing.unit}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : null}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-850 bg-gray-950/60 flex items-center justify-between">
          <div className="text-left">
            {analysis && (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Total Shortage: {analysis.analysis.filter(i => i.netNeed > 0).length} Ingredients
              </p>
            )}
          </div>

          <button
            onClick={handleCartAdd}
            disabled={cartSuccess || isAnalyzing || !analysis}
            className={`py-3 px-5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 ${
              cartSuccess
                ? 'bg-cyber-green text-cyber-bg'
                : 'bg-cyber-violet hover:bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
            }`}
          >
            {cartSuccess ? (
              <>
                <Check className="h-4 w-4" /> Scaled Needs Added!
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> Ingest Missing Elements
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
