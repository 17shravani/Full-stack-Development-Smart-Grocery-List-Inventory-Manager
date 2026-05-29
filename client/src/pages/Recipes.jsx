import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RecipeCart from '../components/RecipeCart';
import { ChefHat, BookOpen, Clock, Layers, Sparkles } from 'lucide-react';

export default function Recipes() {
  const { recipes } = useApp();
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <ChefHat className="text-cyber-violet h-7 w-7" />
          Sealed Culinary Planner
        </h2>
        <p className="text-sm text-gray-400">Scale target recipe servings, automatically audit active pantry stock, and cart exact ingredient gaps.</p>
      </div>

      {/* Recipes Catalog Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {recipes.map(recipe => (
          <div key={recipe._id} className="glass-panel rounded-2xl border border-gray-800 p-6 flex flex-col justify-between hover:border-cyber-violet/30 transition-all duration-300 group shadow-lg">
            
            <div>
              <div className="flex items-center justify-between border-b border-gray-900/60 pb-3 mb-4">
                <h3 className="font-extrabold text-lg text-white leading-tight group-hover:text-cyber-violet transition-colors">
                  {recipe.title}
                </h3>
                <span className="text-[10px] text-cyber-violet font-extrabold uppercase bg-cyber-violet/10 border border-cyber-violet/25 px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> {recipe.servings} Servings
                </span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed mb-4">{recipe.description}</p>

              {/* Ingredients List */}
              <div className="mb-4">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-2">Recipe Core Elements</span>
                <div className="flex flex-wrap gap-2">
                  {recipe.ingredients.map((ing, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-gray-300 bg-gray-900/60 border border-gray-850 px-2 py-1 rounded-lg">
                      {ing.qty} {ing.unit} {ing.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Instructions steps */}
              <div className="mb-6 space-y-2">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">Structural Preparation</span>
                <ul className="space-y-1 text-xs text-gray-400 font-medium list-decimal list-inside pl-1">
                  {recipe.steps.slice(0, 3).map((step, idx) => (
                    <li key={idx} className="line-clamp-1">{step}</li>
                  ))}
                  {recipe.steps.length > 3 && <li className="text-[10px] text-gray-500 font-bold list-none">+{recipe.steps.length - 3} additional steps...</li>}
                </ul>
              </div>
            </div>

            {/* Action button triggers Scaler */}
            <button
              onClick={() => setSelectedRecipe(recipe)}
              className="w-full py-3 bg-cyber-violet hover:bg-violet-600 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Scale & Analyze Shortages
            </button>

          </div>
        ))}
      </div>

      {/* Scaler difference engine modal mounting */}
      {selectedRecipe && (
        <RecipeCart 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}

    </div>
  );
}
