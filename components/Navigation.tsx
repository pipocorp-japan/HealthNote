import React from 'react';
import { Home, Settings, PlusCircle } from 'lucide-react';

interface NavigationProps {
  activeTab: 'home' | 'settings' | 'entry';
  onTabChange: (tab: 'home' | 'settings' | 'entry') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none">
      <div className="bg-white/60 dark:bg-black/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-full px-6 py-3 shadow-xl pointer-events-auto flex items-center space-x-8">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center transition-colors ${
            activeTab === 'home' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        </button>

        <button
          onClick={() => onTabChange('entry')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transform transition-transform hover:-translate-y-1 active:scale-95"
        >
          <PlusCircle size={28} />
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center transition-colors ${
            activeTab === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
        </button>
      </div>
    </div>
  );
};

export default Navigation;
