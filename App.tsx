import React, { useState, useEffect } from 'react';
import SettingsModal from './components/SettingsModal';
import InputSection from './components/InputSection';
import RecipeCard from './components/RecipeCard';
import { AppSettings, Recipe, GenerateParams } from './types';
import { generateRecipesAPI, getMockRecipes } from './services/volcengineService';

// Default Settings
const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  endpointId: 'ep-20250505-xxxxx', // Example format
};

function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // State for logic
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' } | null>(null);

  // View State
  const [showResults, setShowResults] = useState(false);
  const [lastParams, setLastParams] = useState<GenerateParams | null>(null);

  // Load settings from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lc_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('lc_settings', JSON.stringify(newSettings));
  };

  const showToast = (message: string, type: 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGenerate = async (text: string, tool: string, image: string | null) => {
    const params = { ingredientsText: text, selectedTool: tool, imageBase64: image };
    setLastParams(params);
    setShowResults(true); // Switch to results view
    setIsLoading(true);
    setRecipes([]); // Clear previous

    await executeGenerate(params);
  };

  const handleRegenerate = async () => {
    if (lastParams) {
      setIsLoading(true);
      setRecipes([]);
      await executeGenerate(lastParams);
    }
  };

  const executeGenerate = async (params: GenerateParams) => {
    // Check configuration - Automatically fallback to mock if no key
    if (!settings.apiKey) {
      showToast('未配置 API Key，已为您展示预览效果', 'error');
      setTimeout(() => {
        setRecipes(getMockRecipes());
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      const result = await generateRecipesAPI(params, settings);
      setRecipes(result);
    } catch (error) {
      console.error(error);
      showToast('API 调用失败，已为您展示预览效果', 'error');
      setRecipes(getMockRecipes());
    } finally {
      setIsLoading(false);
    }
  };

  const quickTags = [
    { text: '两个鸡蛋, 一把挂面', icon: '🍜' },
    { text: '剩米饭, 半个洋葱', icon: '🍚' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-gray-900">
      <div className="max-w-[480px] mx-auto min-h-screen bg-[#f3f4f6] relative shadow-2xl flex flex-col overflow-hidden">
        
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 w-[90%] max-w-[400px] ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
             <i className={`fas ${toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
             <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* ================= INPUT VIEW ================= */}
        <div className={`flex flex-col h-full overflow-y-auto no-scrollbar transition-opacity duration-300 ${showResults ? 'hidden' : 'block'}`}>
            {/* Sticky Header Wrapper */}
            <div className="sticky top-0 w-full z-50">
              {/* Top Bar */}
              <div className="bg-white px-6 pt-14 pb-4 flex justify-between items-center shadow-sm relative z-30">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-orange-200 shadow-lg">
                      <i className="fas fa-utensils"></i>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-800">剩菜大厨</h1>
                 </div>
                 <button 
                   onClick={() => setIsSettingsOpen(true)}
                   className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition text-gray-600 shadow-sm"
                 >
                   <i className="fas fa-cog text-lg"></i>
                 </button>
              </div>

              {/* Input Section */}
              <InputSection onGenerate={handleGenerate} isLoading={isLoading} />
            </div>

            {/* Scrollable Content Area */}
            {/* Changed from fixed padding-top to flex spacing so it adapts to header height */}
            <div className="flex-1 px-5 pb-32 pt-6">
              {/* Empty State with Suggestions */}
              <div className="flex flex-col items-center justify-start h-full min-h-[200px] animate-in fade-in duration-700">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-2 opacity-30 grayscale hover:grayscale-0 transition duration-500 cursor-default">🥗</div>
                    <h2 className="text-lg font-bold text-gray-400 mb-1">冰箱里还剩什么？</h2>
                    <p className="text-xs text-gray-400">输入食材，让 AI 为你变废为宝</p>
                  </div>

                  <div className="w-full">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">试试这些组合</p>
                    <div className="flex flex-col gap-2">
                      {quickTags.map((tag, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleGenerate(tag.text, '全部', null)}
                          className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md hover:border-orange-200 transition group text-left"
                        >
                          <span className="text-xl group-hover:scale-110 transition">{tag.icon}</span>
                          <span className="text-gray-600 font-medium text-sm group-hover:text-orange-600">{tag.text}</span>
                          <i className="fas fa-chevron-right ml-auto text-xs text-gray-300 group-hover:text-orange-400"></i>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
            </div>
        </div>

        {/* ================= RESULTS VIEW ================= */}
        <div className={`fixed inset-0 z-[60] bg-[#f3f4f6] flex flex-col max-w-[480px] mx-auto animate-in slide-in-from-right duration-300 ${!showResults ? 'hidden' : 'block'}`}>
            
            {/* Result Header */}
            <div className="bg-white px-6 pt-14 pb-4 flex justify-between items-center shadow-sm z-30 flex-shrink-0">
               <button 
                 onClick={() => setShowResults(false)}
                 className="w-10 h-10 -ml-2 rounded-full hover:bg-gray-100 flex items-center justify-center transition text-gray-600"
               >
                 <i className="fas fa-arrow-left text-xl"></i>
               </button>
               <h1 className="text-xl font-bold text-gray-800">创意食谱</h1>
               <div className="w-10"></div> {/* Spacer for alignment */}
            </div>

            {/* Scrollable Results */}
            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32 no-scrollbar">
                {isLoading ? (
                   <div className="space-y-6">
                      <div className="h-72 bg-gray-200 rounded-[2rem] animate-pulse"></div>
                      <div className="h-72 bg-gray-200 rounded-[2rem] animate-pulse"></div>
                   </div>
                ) : (
                  <>
                    {recipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                    <div className="h-8"></div>
                  </>
                )}
            </div>

            {/* Floating Action Bar (Bottom Box) */}
            <div className="absolute bottom-8 left-0 w-full px-5 z-40">
                <button 
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="w-full bg-white/80 backdrop-blur-md border border-white/50 p-2 rounded-2xl shadow-xl shadow-gray-300/50 flex items-center justify-between group transition-all active:scale-[0.98]"
                >
                   <div className="flex items-center gap-3 pl-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${isLoading ? 'bg-gray-400' : 'bg-gray-900 group-hover:bg-orange-500'}`}>
                         <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors">不满意？</div>
                        <div className="text-xs text-gray-500">点击重新生成灵感</div>
                      </div>
                   </div>
                   <div className="pr-4 text-gray-300 group-hover:text-orange-400 transition-colors">
                      <i className="fas fa-chevron-right"></i>
                   </div>
                </button>
            </div>
        </div>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          initialSettings={settings}
          onSave={handleSaveSettings}
        />

      </div>
    </div>
  );
}

export default App;