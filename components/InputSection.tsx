import React, { useState, useRef, useEffect } from 'react';
import { TOOLS } from '../types';

interface InputSectionProps {
  onGenerate: (text: string, tool: string, image: string | null) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');
  const [selectedTool, setSelectedTool] = useState(TOOLS[0]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert("您的浏览器不支持语音识别");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="bg-white px-6 pb-8 pt-4 rounded-b-[2.5rem] shadow-lg shadow-gray-200/50 relative z-20">
      
      {/* Image Preview Area */}
      {imagePreview && (
        <div className="relative mb-4 animate-in fade-in zoom-in duration-300">
          <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-2xl border border-gray-100 shadow-sm" />
          <button 
            onClick={() => setImagePreview(null)}
            className="absolute top-2 right-2 bg-white/90 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white shadow-sm backdrop-blur-sm"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
      )}

      {/* Text Area */}
      <div className="relative group">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入冰箱里的剩菜&#10;例如：半个洋葱、三个鸡蛋..."
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-400 focus:outline-none resize-none h-32 text-lg leading-relaxed transition-all"
        />
        
        {/* Multimodal Toolbar */}
        <div className="absolute bottom-4 right-4 flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-orange-500 hover:border-orange-500 hover:shadow-md transition flex items-center justify-center"
            title="拍照上传"
          >
            <i className="fas fa-camera"></i>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload} 
          />
          
          <button 
            onClick={toggleSpeech}
            className={`w-10 h-10 border rounded-full transition flex items-center justify-center ${
              isListening 
                ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-red-200 shadow-lg' 
                : 'bg-white border-gray-200 text-gray-500 hover:text-orange-500 hover:border-orange-500 hover:shadow-md'
            }`}
            title="语音输入"
          >
            <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          </button>
        </div>
      </div>

      {/* Tools Filter - Changed to wrap layout */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-2.5">
          {TOOLS.map((tool) => (
            <button
              key={tool}
              onClick={() => setSelectedTool(tool)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 flex-grow text-center ${
                selectedTool === tool
                  ? 'bg-gray-800 text-white shadow-lg shadow-gray-300 scale-105 z-10'
                  : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      {/* Main Action */}
      <button
        onClick={() => onGenerate(text, selectedTool, imagePreview)}
        disabled={isLoading || (!text && !imagePreview)}
        className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${
          isLoading || (!text && !imagePreview)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-orange-300 hover:-translate-y-0.5'
        }`}
      >
        {isLoading ? (
          <>
            <i className="fas fa-circle-notch fa-spin"></i> 正在思考创意...
          </>
        ) : (
          <>
            <i className="fas fa-wand-magic-sparkles"></i> 生成创意食谱
          </>
        )}
      </button>
    </div>
  );
};

export default InputSection;