import React, { useState, useRef } from 'react';
import { UserProfile, ThemeOption } from '../types';
import GlassCard from '../components/GlassCard';
import { User, Calendar, Moon, Sun, Baby, Monitor, Trash2, Download, Upload, Cloud } from 'lucide-react';
import * as Storage from '../services/storageService';

interface SettingsProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onClearData }) => {
  const [name, setName] = useState(user.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Age calculation for logic
  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(user.birthDate);

  const handleChildModeToggle = () => {
    const newState = !user.isChildMode;
    onUpdateUser({ ...user, isChildMode: newState });
  };

  const handleThemeChange = (theme: ThemeOption) => {
    onUpdateUser({ ...user, theme });
  };

  const handleNameBlur = () => {
    if (name !== user.name) {
      onUpdateUser({ ...user, name });
    }
  };

  const handleExport = () => {
    const dataStr = Storage.getExportData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `healthnote_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = Storage.importData(content);
        if (success) {
          alert("データのインポートに成功しました。ページをリロードします。");
          window.location.reload();
        } else {
          alert("インポートに失敗しました。ファイル形式を確認してください。");
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white px-2">設定</h1>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/20 dark:border-white/5">
           <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
               {user.name.charAt(0).toUpperCase()}
             </div>
             <div className="flex-1">
               <label className="text-xs text-gray-500 uppercase">表示名</label>
               <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleNameBlur}
                  className="w-full bg-transparent text-xl font-bold text-gray-800 dark:text-white focus:outline-none border-b border-transparent focus:border-blue-400"
               />
             </div>
           </div>
        </div>
        <div className="p-6 flex items-center gap-3 text-gray-600 dark:text-gray-300">
           <Calendar size={20} />
           <span>誕生日: {user.birthDate} ({age}歳)</span>
        </div>
      </GlassCard>

      {/* Child Mode Section */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${user.isChildMode ? 'bg-pink-100 text-pink-500' : 'bg-gray-100 text-gray-500'}`}>
              <Baby size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">子供モード</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">発育曲線と成長ステータスを表示</p>
            </div>
          </div>
          
          <button 
            onClick={handleChildModeToggle}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${user.isChildMode ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${user.isChildMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {age >= 18 && user.isChildMode && (
          <div className="mt-2 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              ⚠️ 18歳以上のため、標準のBMI計算を使用する通常モードへの切り替えをお勧めします。
            </p>
          </div>
        )}
      </GlassCard>

      {/* Theme */}
      <GlassCard className="p-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">外観テーマ</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: ThemeOption.LIGHT, icon: Sun, label: 'ライト' },
            { id: ThemeOption.DARK, icon: Moon, label: 'ダーク' },
            { id: ThemeOption.SYSTEM, icon: Monitor, label: '端末設定' },
          ].map((option) => (
             <button
               key={option.id}
               onClick={() => handleThemeChange(option.id)}
               className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                 user.theme === option.id 
                 ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-600 dark:text-blue-300' 
                 : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500'
               }`}
             >
               <option.icon size={20} className="mb-2" />
               <span className="text-xs font-medium">{option.label}</span>
             </button>
          ))}
        </div>
      </GlassCard>

      {/* Data Sync / Backup */}
      <GlassCard className="p-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
           <Cloud size={20} className="text-blue-500"/> データ引き継ぎ・バックアップ
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          データをJSONファイルとして保存し、他の端末やブラウザに移行できます。
        </p>
        <div className="grid grid-cols-2 gap-3">
           <button 
             onClick={handleExport}
             className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
           >
             <Download size={20} className="mb-2 text-gray-600 dark:text-gray-300"/>
             <span className="text-xs font-medium text-gray-600 dark:text-gray-300">エクスポート</span>
           </button>
           <button 
             onClick={handleImportClick}
             className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
           >
             <Upload size={20} className="mb-2 text-gray-600 dark:text-gray-300"/>
             <span className="text-xs font-medium text-gray-600 dark:text-gray-300">インポート</span>
           </button>
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden" 
        />
      </GlassCard>

      {/* Danger Zone */}
      <GlassCard className="p-6 border-red-200 dark:border-red-900/30">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">データ管理</h3>
        <button 
          onClick={() => {
            if(confirm("本当に全てのデータを削除しますか？この操作は取り消せません。")) {
              onClearData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-200 dark:border-red-800 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 size={18} />
          全データを削除・初期化
        </button>
      </GlassCard>
    </div>
  );
};

export default Settings;
