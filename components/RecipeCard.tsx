import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/60 overflow-hidden border border-gray-100 mb-8 last:mb-24 animate-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-white p-7 flex items-start gap-5 border-b border-orange-50/50">
        <div className="text-6xl drop-shadow-sm filter hover:brightness-110 transition">{recipe.emoji}</div>
        <div className="pt-1">
          <h3 className="text-2xl font-black text-gray-800 leading-tight mb-2 tracking-tight">{recipe.name}</h3>
          <span className="inline-flex items-center text-xs font-bold text-orange-700 bg-orange-100/80 px-3 py-1.5 rounded-full">
            <i className="far fa-clock mr-1.5"></i> {recipe.time}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-7">
        
        {/* Ingredients */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">所需食材</h4>
          <ul className="flex flex-wrap gap-2">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="bg-gray-50 text-gray-700 font-medium text-sm px-4 py-2 rounded-xl border border-gray-100">
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">烹饪步骤</h4>
          <div className="space-y-4">
            {recipe.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 group">
                <span className="flex-shrink-0 w-7 h-7 bg-orange-100 text-orange-600 text-sm font-bold rounded-full flex items-center justify-center mt-0.5 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  {idx + 1}
                </span>
                <p className="text-gray-600 text-[15px] leading-relaxed font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          <button className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition active:scale-95 flex items-center justify-center gap-2">
            <i className="far fa-heart text-lg"></i> 收藏
          </button>
          <button className="flex-1 py-3.5 rounded-2xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition active:scale-95 flex items-center justify-center gap-2">
            <i className="fas fa-redo-alt"></i> 重做
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;