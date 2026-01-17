import { createClient } from '@supabase/supabase-js';

// =================================================================
// ⚠️ 設定手順:
// 1. 下記の SUPABASE_ANON_KEY に、Supabase管理画面の
//    [Project Settings] > [API] > [anon public] キーを貼り付けてください。
// =================================================================

// いただいたURLを設定しました
const SUPABASE_URL = 'https://hwtpihrunvhbvadssoox.supabase.co';

// いただいた anon public キーを設定しました
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3dHBpaHJ1bnZoYnZhZHNzb294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1ODY3MTAsImV4cCI6MjA4NDE2MjcxMH0.ePz2Q2LmiQbegTdqkx-noM3LQknGDTuNMopZAO2SPtM';

const isConfigured = 
  SUPABASE_URL.startsWith('http') && 
  SUPABASE_ANON_KEY.length > 20 && 
  (SUPABASE_ANON_KEY as string) !== 'YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseEnabled = !!supabase;