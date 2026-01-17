import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import GlassCard from './GlassCard';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // If email confirmation is disabled in Supabase, session might be created immediately.
        // If session is null but no error, it means email verification is required.
        if (data.user && !data.session) {
           setVerificationSent(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || '認証エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // View: Email Verification Sent
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-8 animate-slideUp text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 text-green-500 p-4 rounded-full">
               <Mail size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">メールを確認してください</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <span className="font-semibold">{email}</span> 宛に確認メールを送信しました。<br/>
            メール内のリンクをクリックして登録を完了してください。
          </p>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-800 dark:text-blue-200 mb-6">
             リンクをクリックすると、自動的にログイン状態になります。
          </div>

          <button
            onClick={() => {
              setVerificationSent(false);
              setIsSignUp(false); // Switch to login mode
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} /> ログイン画面に戻る
          </button>
        </GlassCard>
      </div>
    );
  }

  // View: Login / Sign Up Form
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8 animate-slideUp">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">HealthNote</h1>
          <p className="text-gray-500 dark:text-gray-300">
            {isSignUp ? 'アカウントを作成' : 'おかえりなさい'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100/80 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">メールアドレス</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">パスワード</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:text-white"
                placeholder="••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isSignUp ? (
              <>
                <UserPlus size={20} /> 新規登録
              </>
            ) : (
              <>
                <LogIn size={20} /> ログイン
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isSignUp
              ? 'すでにアカウントをお持ちの方はこちら'
              : 'アカウントをお持ちでない方はこちら'}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-white/10 text-center">
          <p className="text-xs text-gray-400">
             安全なクラウド同期で、どの端末からでもデータにアクセスできます。
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Auth;
