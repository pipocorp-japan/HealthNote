import { DailyLog, UserProfile } from '../types';
import { supabase, isSupabaseEnabled } from '../lib/supabase';

const USER_KEY = 'healthnote_user';
const LOGS_KEY = 'healthnote_logs';
const DEVICE_ID_KEY = 'healthnote_uuid';

// Helper to get the correct User ID
// 1. If logged into Supabase, use Auth User ID
// 2. If not (Local Mode), use a random Device ID
const getUserId = async (): Promise<string> => {
  if (isSupabaseEnabled && supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return data.user.id;
    }
  }
  
  // Fallback for local mode
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

// --- Async Data Fetching ---

export const fetchUser = async (): Promise<UserProfile | null> => {
  const userId = await getUserId();

  // 1. Try Supabase
  if (isSupabaseEnabled && supabase) {
    // Only fetch from DB if we have a real user session, 
    // otherwise we might be mixing local device data with auth logic
    const { data: authData } = await supabase.auth.getUser();
    
    if (authData.user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (data && !error) {
        const user: UserProfile = {
          name: data.name,
          birthDate: data.birth_date,
          theme: data.theme as any,
          isChildMode: data.is_child_mode,
          height: data.height,
          weight: data.weight
        };
        // Cache locally
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      } else {
        // If logged in but no profile, return null (triggers Onboarding)
        return null;
      }
    }
  }

  // 2. Fallback to LocalStorage (Offline or Local Mode)
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const fetchLogs = async (): Promise<DailyLog[]> => {
  const userId = await getUserId();

  if (isSupabaseEnabled && supabase) {
     const { data: authData } = await supabase.auth.getUser();
     if (authData.user) {
        const { data, error } = await supabase
          .from('logs')
          .select('*')
          .eq('user_id', userId);

        if (data && !error) {
          const logs = data.map((item: any) => ({
            id: item.id,
            date: item.date,
            category: item.category,
            value: item.value,
            note: item.note,
            subData: item.sub_data
          }));
          localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
          return logs;
        }
     }
  }

  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

// --- Async Data Saving ---

export const saveUser = async (user: UserProfile) => {
  // Always save locally immediately
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  if (isSupabaseEnabled && supabase) {
    const userId = await getUserId();
    const { data: authData } = await supabase.auth.getUser();
    
    if (authData.user) {
        await supabase.from('profiles').upsert({
          user_id: userId,
          name: user.name,
          birth_date: user.birthDate,
          theme: user.theme,
          is_child_mode: user.isChildMode,
          height: user.height,
          weight: user.weight,
          updated_at: new Date().toISOString()
        });
    }
  }
};

export const addLog = async (log: DailyLog): Promise<DailyLog[]> => {
  // 1. Optimistic Update (Local)
  const localLogs = getLogsLocal();
  log.id = log.id || crypto.randomUUID(); // Ensure UUID
  localLogs.push(log);
  localStorage.setItem(LOGS_KEY, JSON.stringify(localLogs));

  // 2. Sync to Supabase
  if (isSupabaseEnabled && supabase) {
    const userId = await getUserId();
    const { data: authData } = await supabase.auth.getUser();

    if (authData.user) {
        await supabase.from('logs').insert({
          id: log.id,
          user_id: userId,
          date: log.date,
          category: log.category,
          value: log.value,
          note: log.note,
          sub_data: log.subData
        });
    }
  }

  return localLogs;
};

export const clearData = async () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LOGS_KEY);
  
  // NOTE: We generally don't delete from Supabase on "Clear Data" unless it's account deletion.
  // But if the user requested it:
  if (isSupabaseEnabled && supabase) {
    const userId = await getUserId();
    const { data: authData } = await supabase.auth.getUser();
    
    if (authData.user) {
        await supabase.from('logs').delete().eq('user_id', userId);
        await supabase.from('profiles').delete().eq('user_id', userId);
    }
  }
};

export const signOut = async () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LOGS_KEY);
    if (isSupabaseEnabled && supabase) {
        await supabase.auth.signOut();
    }
    window.location.reload();
};

// --- Synchronous Helpers for UI Speed (Cache) ---

export const getLogsLocal = (): DailyLog[] => {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getUserLocal = (): UserProfile | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

// --- Manual Export Helper ---
export const getExportData = (): string => {
  const data = {
    user: getUserLocal(),
    logs: getLogsLocal(),
    exportDate: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (!data.user) return false;
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    if (Array.isArray(data.logs)) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs));
    }
    return true;
  } catch (error) {
    console.error("Import failed", error);
    return false;
  }
};
