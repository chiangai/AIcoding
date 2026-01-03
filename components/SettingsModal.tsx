import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialSettings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>(initialSettings);

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      setFormData(initialSettings);
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-orange-500 p-4 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold"><i className="fas fa-cogs mr-2"></i>API 设置 (火山引擎)</h2>
          <button onClick={onClose} className="hover:text-orange-200 transition">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
              placeholder="sk-..."
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint ID (Model)</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none transition"
              placeholder="ep-..."
              value={formData.endpointId}
              onChange={(e) => setFormData(prev => ({ ...prev, endpointId: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl mt-4 hover:bg-gray-800 transition active:scale-95"
          >
            保存配置
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;