import React, { useMemo } from 'react';
import { UserProfile, DailyLog } from '../types';
import GlassCard from '../components/GlassCard';
import { CATEGORIES, GROWTH_STANDARD } from '../constants';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Cake, Info, ArrowUp, ArrowDown } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  logs: DailyLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, logs }) => {
  const today = new Date();
  
  // Birthday Logic
  const isBirthday = useMemo(() => {
    const dob = new Date(user.birthDate);
    return dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
  }, [user.birthDate, today]);

  // BMI / Body Stats Calculation
  const latestBodyLog = [...logs]
    .filter(l => l.category === 'body')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const currentHeight = latestBodyLog?.subData?.height || user.height;
  const currentWeight = latestBodyLog?.subData?.weight || user.weight;

  const bmi = useMemo(() => {
    if (!currentHeight || !currentWeight) return null;
    const hM = currentHeight / 100;
    return (currentWeight / (hM * hM)).toFixed(1);
  }, [currentHeight, currentWeight]);

  // Child Mode Calculations (Mock SD)
  const childStats = useMemo(() => {
    if (!user.isChildMode || !currentHeight || !currentWeight) return null;
    // Simple Deviation Mock: Compare roughly to standard
    // Find closest standard age
    const dob = new Date(user.birthDate);
    const ageMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    
    const standard = GROWTH_STANDARD.reduce((prev, curr) => {
      return (Math.abs(curr.age - ageMonths) < Math.abs(prev.age - ageMonths) ? curr : prev);
    });

    const heightDiff = ((currentHeight - standard.height) / standard.height) * 100; // % diff
    const sdLabel = heightDiff > 5 ? '+1 SD' : heightDiff < -5 ? '-1 SD' : '標準';
    
    return { ageMonths, sdLabel, standard };
  }, [user.isChildMode, currentHeight, currentWeight, user.birthDate]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Aggregate mood/stress for chart
      const dayLogs = logs.filter(l => l.date === dateStr);
      const moodLog = dayLogs.find(l => l.category === 'mood');
      const stressLog = dayLogs.find(l => l.category === 'stress');

      days.push({
        name: d.toLocaleDateString('ja-JP', { weekday: 'short' }),
        mood: moodLog ? moodLog.value : null,
        stress: stressLog ? stressLog.value : null,
      });
    }
    return days;
  }, [logs]);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="px-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          こんにちは、{user.name}さん
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {today.toLocaleDateString('ja-JP', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Birthday Banner */}
      {isBirthday && (
        <GlassCard className="bg-gradient-to-r from-pink-400/80 to-purple-400/80 text-white p-4 flex items-center gap-4 animate-bounce-slow">
          <Cake size={32} />
          <div>
            <h3 className="font-bold text-lg">Happy Birthday! 🎉</h3>
            <p className="text-sm opacity-90">素晴らしい1年になりますように！</p>
          </div>
        </GlassCard>
      )}

      {/* Body Stats Card */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
           身体データ
           {user.isChildMode && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">子供モード</span>}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
           <div className="bg-white/40 dark:bg-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-500 uppercase">身長</span>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                 {currentHeight ? `${currentHeight} cm` : '--'}
              </div>
           </div>
           <div className="bg-white/40 dark:bg-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-500 uppercase">体重</span>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                 {currentWeight ? `${currentWeight} kg` : '--'}
              </div>
           </div>
        </div>

        {user.isChildMode ? (
          // Child Mode View
          <div className="space-y-3">
             <div className="flex justify-between items-center bg-white/40 dark:bg-white/5 p-3 rounded-xl">
                <span className="text-sm text-gray-600 dark:text-gray-300">成長偏差</span>
                <span className={`font-bold ${
                  childStats?.sdLabel === '標準' ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {childStats ? childStats.sdLabel : '--'}
                </span>
             </div>
             
             {/* Simple visual bar for SD */}
             <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 h-full"></div>
                {/* Mock Indicator */}
                {childStats && (
                  <div 
                    className="absolute top-0 bottom-0 w-2 bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ 
                      left: childStats.sdLabel === '標準' ? '50%' : childStats.sdLabel.includes('+') ? '70%' : '30%' 
                    }} 
                  />
                )}
             </div>
             <div className="flex justify-between text-xs text-gray-400">
                <span>-2 SD</span>
                <span>平均</span>
                <span>+2 SD</span>
             </div>
          </div>
        ) : (
          // Adult Mode BMI
          <div className="bg-white/40 dark:bg-white/5 p-4 rounded-xl">
             <div className="flex justify-between items-end">
                <div>
                   <span className="text-xs text-gray-500 uppercase">BMI スコア</span>
                   <div className="text-3xl font-bold text-gray-800 dark:text-white">
                      {bmi || '--'}
                   </div>
                </div>
                <div className="text-right">
                   <div className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                      !bmi ? 'bg-gray-200 text-gray-500' :
                      parseFloat(bmi) < 18.5 ? 'bg-blue-100 text-blue-600' :
                      parseFloat(bmi) < 25 ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                   }`}>
                      {!bmi ? '---' : 
                       parseFloat(bmi) < 18.5 ? '痩せ気味' :
                       parseFloat(bmi) < 25 ? '適正' : '肥満気味'}
                   </div>
                </div>
             </div>
          </div>
        )}
      </GlassCard>

      {/* Main Analysis Chart */}
      <GlassCard className="p-6 min-h-[300px] flex flex-col">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">週間トレンド</h2>
        <p className="text-xs text-gray-500 mb-6">過去7日間の気分とストレス</p>
        
        <div className="flex-1 w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
              <YAxis hide domain={[0, 6]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }} 
              />
              <Area type="monotone" dataKey="mood" stroke="#EAB308" fillOpacity={1} fill="url(#colorMood)" strokeWidth={3} />
              <Area type="monotone" dataKey="stress" stroke="#EF4444" fillOpacity={1} fill="url(#colorStress)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Recent Activity / Simple List */}
      <div>
         <h2 className="text-lg font-semibold text-gray-800 dark:text-white px-2 mb-3">最近の記録</h2>
         <div className="space-y-3">
            {logs.length === 0 && (
               <div className="text-center py-8 text-gray-400 italic">記録はまだありません。「+」ボタンから追加しましょう。</div>
            )}
            {logs.slice().reverse().slice(0, 5).map((log) => {
               const catDef = CATEGORIES.find(c => c.id === log.category);
               return (
                  <GlassCard key={log.id} className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-white/50 dark:bg-white/10 ${catDef?.color}`}>
                           {catDef && <catDef.icon size={18} />}
                        </div>
                        <div>
                           <p className="text-sm font-semibold text-gray-800 dark:text-white capitalize">{catDef?.label || log.category}</p>
                           <p className="text-xs text-gray-500">{log.date}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="font-bold text-gray-700 dark:text-gray-200">
                           {log.category === 'mood' ? ['','最悪','悪い','普通','良い','最高'][log.value] : log.value}
                        </span>
                        {log.note && <div className="text-[10px] text-gray-400 max-w-[100px] truncate">{log.note}</div>}
                     </div>
                  </GlassCard>
               );
            })}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
