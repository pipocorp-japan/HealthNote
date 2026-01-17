import React, { useState, useEffect } from 'react';
import { UserProfile, ThemeOption } from '../types';
import GlassCard from './GlassCard';
import { ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (user: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isChildMode, setIsChildMode] = useState(false);
  const [suggestChildMode, setSuggestChildMode] = useState(false);

  // Initial Check for Age when date changes
  useEffect(() => {
    if (birthDate) {
      const today = new Date();
      const dob = new Date(birthDate);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      if (age < 18) {
        setSuggestChildMode(true);
        setIsChildMode(true);
      } else {
        setSuggestChildMode(false);
        setIsChildMode(false);
      }
    }
  }, [birthDate]);

  const handleFinish = () => {
    if (!name || !birthDate) return;
    
    const newUser: UserProfile = {
      name,
      birthDate,
      theme: ThemeOption.SYSTEM,
      isChildMode,
      height: 0,
      weight: 0
    };
    onComplete(newUser);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white text-center">HealthNote</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">あなたの健康管理パートナー</p>
        
        <GlassCard className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">お名前（ニックネーム）</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: たろう"
                  className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">生年月日</label>
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
                />
              </div>
              
              <button 
                onClick={() => setStep(2)}
                disabled={!name || !birthDate}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                次へ <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">プロフィール設定</h2>
              
              {suggestChildMode && (
                <div className="p-4 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    18歳未満のようです。<strong>子供モード</strong>を有効にしますか？ 
                    発育曲線や成長偏差などを確認できます。
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-black/30 rounded-xl">
                <span className="font-medium text-gray-700 dark:text-gray-200">子供モード</span>
                <button 
                  onClick={() => setIsChildMode(!isChildMode)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isChildMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`bg-white w-6 h-6 rounded-full shadow-sm transform transition-transform duration-300 ${isChildMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                設定は後から変更可能です。
              </div>

              <button 
                onClick={handleFinish}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                はじめる <Check size={18} />
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default Onboarding;
