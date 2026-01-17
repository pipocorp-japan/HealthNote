import React, { useState } from 'react';
import { X, Ruler, Weight } from 'lucide-react';
import { CategoryType, DailyLog } from '../types';
import { CATEGORIES, MOOD_LEVELS } from '../constants';
import GlassCard from './GlassCard';

interface EntryModalProps {
  onClose: () => void;
  onSave: (log: DailyLog) => void;
  preselectedCategory?: CategoryType;
}

const EntryModal: React.FC<EntryModalProps> = ({ onClose, onSave, preselectedCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(preselectedCategory || 'mood');
  const [value, setValue] = useState<number>(3); // Default middle value
  const [note, setNote] = useState('');
  
  // Specific states for Body stats
  const [heightInput, setHeightInput] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>('');

  const currentCategoryDef = CATEGORIES.find(c => c.id === selectedCategory);

  const handleSave = () => {
    let finalValue = value;
    let subData = {};

    if (selectedCategory === 'body') {
       if (!heightInput && !weightInput) return;
       // Special handling for body stats
       subData = {
         height: heightInput ? parseFloat(heightInput) : undefined,
         weight: weightInput ? parseFloat(weightInput) : undefined,
       };
       finalValue = 0; // Not used for body stats in the main graph
    }

    const newLog: DailyLog = {
      id: '', // Set by service
      date: new Date().toISOString().split('T')[0],
      category: selectedCategory,
      value: finalValue,
      note,
      subData
    };
    onSave(newLog);
    onClose();
  };

  const renderInput = () => {
    switch (selectedCategory) {
      case 'mood':
        return (
          <div className="flex justify-between gap-2 py-4">
            {MOOD_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setValue(level.value)}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                  value === level.value 
                    ? 'bg-yellow-200/50 dark:bg-yellow-900/50 scale-110 border-2 border-yellow-400' 
                    : 'bg-white/20 dark:bg-black/20 hover:bg-white/30'
                }`}
              >
                <span className="text-3xl mb-1">{level.emoji}</span>
                <span className="text-xs font-medium dark:text-white">{level.label}</span>
              </button>
            ))}
          </div>
        );
      case 'sleep':
      case 'stress':
      case 'exercise':
        return (
          <div className="py-6 px-2">
             <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>低</span>
                <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{value}</span>
                <span>高</span>
             </div>
             <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
            />
             <p className="text-center mt-2 text-sm text-gray-500">
               {selectedCategory === 'sleep' ? '時間' : '強度・レベル'}
             </p>
          </div>
        );
      case 'body':
        return (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-4 bg-white/30 dark:bg-black/30 p-4 rounded-xl">
              <Ruler className="text-blue-500" />
              <div className="flex-1">
                <label className="text-xs text-gray-500 uppercase">身長 (cm)</label>
                <input 
                  type="number" 
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  placeholder="例: 170"
                  className="w-full bg-transparent border-none focus:outline-none text-xl font-bold dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/30 dark:bg-black/30 p-4 rounded-xl">
              <Weight className="text-green-500" />
              <div className="flex-1">
                <label className="text-xs text-gray-500 uppercase">体重 (kg)</label>
                <input 
                  type="number" 
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="例: 65"
                  className="w-full bg-transparent border-none focus:outline-none text-xl font-bold dark:text-white"
                />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-6">
            <input
              type="range"
              min="1"
              max="5"
              value={value}
              onChange={(e) => setValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>1</span>
              <span>5</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-0">
      <GlassCard className="w-full max-w-lg p-6 animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">記録を追加</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <X size={24} className="text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* Category Selector */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center min-w-[70px] p-2 rounded-xl transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-400' 
                  : 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
              }`}
            >
              <div className={`p-2 rounded-full ${selectedCategory === cat.id ? 'bg-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <cat.icon size={20} className={cat.color} />
              </div>
              <span className="text-xs mt-1 font-medium dark:text-gray-300 whitespace-nowrap">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Input Area */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {currentCategoryDef?.label} 入力
          </h3>
          {renderInput()}
        </div>

        {/* Note */}
        <div className="mb-6">
           <textarea
             value={note}
             onChange={(e) => setNote(e.target.value)}
             placeholder="ひとことメモ..."
             className="w-full bg-white/40 dark:bg-black/40 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none dark:text-white"
             rows={2}
           />
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          保存
        </button>
      </GlassCard>
    </div>
  );
};

export default EntryModal;
