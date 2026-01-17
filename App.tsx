import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog, ThemeOption } from './types';
import * as Storage from './services/storageService';
import { supabase, isSupabaseEnabled } from './lib/supabase';
import Onboarding from './components/Onboarding';
import Navigation from './components/Navigation';
import Dashboard from './views/Dashboard';
import Settings from './views/Settings';
import EntryModal from './components/EntryModal';
import Auth from './components/Auth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'settings' | 'entry'>('home');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Session
  useEffect(() => {
    if (isSupabaseEnabled && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsLoading(false); // Session check done
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        // If logged out, clear state
        if (!session) {
            setUser(null);
            setLogs([]);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Local mode
      setIsLoading(false);
    }
  }, []);

  // Fetch Data when Session or Local Mode is ready
  useEffect(() => {
    // If Supabase enabled but no session, don't fetch yet (wait for login)
    if (isSupabaseEnabled && !session) return;

    const loadData = async () => {
      // Don't set global loading true here to avoid full screen flicker,
      // just let the data populate
      try {
        const fetchedUser = await Storage.fetchUser();
        const fetchedLogs = await Storage.fetchLogs();
        
        if (fetchedUser) setUser(fetchedUser);
        setLogs(fetchedLogs);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    };

    loadData();
  }, [session]);

  // Theme Handling
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = 
      user?.theme === ThemeOption.DARK || 
      (user?.theme === ThemeOption.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [user?.theme]);

  const handleOnboardingComplete = async (newUser: UserProfile) => {
    setUser(newUser);
    await Storage.saveUser(newUser);
  };

  const handleAddLog = async (log: DailyLog) => {
    const updatedLogs = await Storage.addLog(log);
    setLogs([...updatedLogs]); 
    
    if (log.category === 'body' && log.subData) {
       const updatedUser = { 
         ...user!, 
         height: log.subData.height || user!.height,
         weight: log.subData.weight || user!.weight
       };
       setUser(updatedUser);
       await Storage.saveUser(updatedUser);
    }
  };

  const handleUpdateUser = async (updatedUser: UserProfile) => {
    setUser(updatedUser);
    await Storage.saveUser(updatedUser);
  };

  const handleClearData = async () => {
    await Storage.clearData();
    setUser(null);
    setLogs([]);
  };
  
  const handleLogout = async () => {
    await Storage.signOut();
  };

  const handleTabChange = (tab: 'home' | 'settings' | 'entry') => {
    if (tab === 'entry') {
      setShowEntryModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
      </div>
    );
  }

  // 2. Auth State (If Supabase enabled and no session)
  if (isSupabaseEnabled && !session) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 transition-colors duration-500">
           <Auth />
        </div>
      );
  }

  // 3. Onboarding State (Authenticated but no profile)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-500">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // 4. Main App
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-500 overflow-x-hidden">
      
      {!isSupabaseEnabled && (
          <div className="absolute top-2 left-2 z-40 opacity-50 hover:opacity-100 transition-opacity">
             <div className="bg-black/20 backdrop-blur-md text-white px-2 py-1 rounded-md text-[10px] flex items-center gap-1">
                <AlertCircle size={10} /> Local Mode
             </div>
          </div>
      )}

      <main className="max-w-md mx-auto min-h-screen relative p-4 pt-8">
        {activeTab === 'home' && (
          <div className="animate-fadeIn">
            <Dashboard user={user} logs={logs} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fadeIn">
            <Settings 
              user={user} 
              onUpdateUser={handleUpdateUser} 
              onClearData={handleClearData} 
            />
            {/* Add Logout Button for Settings in Supabase Mode */}
            {isSupabaseEnabled && (
                <div className="mt-4 text-center">
                    <button onClick={handleLogout} className="text-sm text-gray-500 underline">ログアウト</button>
                </div>
            )}
          </div>
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      {showEntryModal && (
        <EntryModal 
          onClose={() => setShowEntryModal(false)}
          onSave={handleAddLog}
        />
      )}
    </div>
  );
};

export default App;
