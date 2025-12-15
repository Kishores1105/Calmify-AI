import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { CheckInRecord, UserState, Habit } from '../types';
import { Activity, Zap, Brain, Calendar, ArrowUpRight, TrendingDown, CheckSquare, BarChart2 } from 'lucide-react';

interface DashboardProps {
  userState: UserState;
  onToggleHabit: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userState, onToggleHabit }) => {
  const [viewMode, setViewMode] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');

  // Filter data based on view mode
  const daysToShow = viewMode === 'WEEKLY' ? 7 : 30;
  const historyData = userState.history.slice(-daysToShow).map(entry => ({
    date: new Date(entry.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    stress: entry.stressLevel,
    energy: entry.energyLevel,
    mood: entry.mood
  }));

  const latest = userState.history[userState.history.length - 1];
  const todayKey = new Date().toDateString();
  const todaysHabits = userState.habits[todayKey] || [];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between">
        <div>
           <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            Hi, {userState.name} <span className="text-3xl">👋</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {viewMode === 'WEEKLY' ? 'Your weekly wellness overview.' : 'Your monthly progress report.'}
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
            <button 
              onClick={() => setViewMode('WEEKLY')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'WEEKLY' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setViewMode('MONTHLY')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'MONTHLY' ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly Report
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stress Card */}
        <div className="relative overflow-hidden p-6 rounded-3xl shadow-xl shadow-indigo-100 transition-transform hover:scale-[1.02] bg-gradient-to-br from-violet-500 to-indigo-600 text-white group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Activity size={24} className="text-white" />
            </div>
            {latest && latest.stressLevel > 5 ? 
              <span className="flex items-center text-xs font-bold bg-white/20 px-2 py-1 rounded-full"><TrendingDown size={12} className="mr-1"/> High</span> : 
              <span className="flex items-center text-xs font-bold bg-white/20 px-2 py-1 rounded-full"><ArrowUpRight size={12} className="mr-1"/> Stable</span>
            }
          </div>
          <p className="text-indigo-100 font-medium">Stress Level</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-4xl font-bold">
              {latest ? latest.stressLevel : '-'}
            </h3>
            <span className="text-indigo-200">/ 10</span>
          </div>
        </div>

        {/* Energy Card */}
        <div className="relative overflow-hidden p-6 rounded-3xl shadow-xl shadow-orange-100 transition-transform hover:scale-[1.02] bg-gradient-to-br from-orange-400 to-pink-500 text-white group">
          <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Zap size={24} className="text-white" />
            </div>
          </div>
          <p className="text-orange-100 font-medium">Energy Level</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-4xl font-bold">
              {latest ? latest.energyLevel : '-'}
            </h3>
            <span className="text-orange-200">/ 10</span>
          </div>
        </div>

        {/* Mood Card */}
        <div className="relative overflow-hidden p-6 rounded-3xl shadow-xl shadow-teal-100 transition-transform hover:scale-[1.02] bg-gradient-to-br from-emerald-400 to-teal-600 text-white group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Brain size={24} className="text-white" />
            </div>
          </div>
          <p className="text-teal-100 font-medium">Current Mood</p>
          <h3 className="text-3xl font-bold capitalize truncate">
            {latest ? latest.mood : 'No Data'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section - Takes up 2 cols */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                {viewMode === 'WEEKLY' ? 'Weekly Stress Trend' : 'Monthly Stress Report'}
              </h3>
              <div className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                {viewMode === 'WEEKLY' ? 'Last 7 Days' : 'Last 30 Days'}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} minTickGap={30} />
                    <YAxis hide domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.95)'}} 
                      cursor={{stroke: '#cbd5e1', strokeWidth: 1}}
                    />
                    <Area type="monotone" dataKey="stress" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" />
                  </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Energy Rhythm</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} minTickGap={30}/>
                    <YAxis hide domain={[0, 10]} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.95)'}} 
                    />
                    <Line type="monotone" dataKey="energy" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff'}} />
                  </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Habits & Probability */}
        <div className="space-y-6">
          
          {/* Daily Habits */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100/50">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <CheckSquare className="mr-2 text-teal-500" size={20} />
              Daily Habits
            </h3>
            <div className="space-y-3">
              {todaysHabits.length > 0 ? todaysHabits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => onToggleHabit(habit.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    habit.completed 
                      ? 'bg-teal-50 border-teal-200 text-teal-700' 
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-medium">{habit.label}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    habit.completed ? 'bg-teal-500 border-teal-500' : 'border-slate-300'
                  }`}>
                    {habit.completed && <CheckSquare size={12} className="text-white" />}
                  </div>
                </button>
              )) : (
                <p className="text-slate-400 text-sm">No habits set for today.</p>
              )}
            </div>
          </div>

          {/* Probability Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl text-white shadow-lg">
            <h3 className="text-lg font-bold mb-3 flex items-center text-indigo-300">
              <BarChart2 className="mr-2" size={20} />
              Probability Insight
            </h3>
            {latest && latest.prediction ? (
              <div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {latest.prediction}
                </p>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-indigo-400 to-purple-400 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <p className="text-right text-xs text-indigo-300 mt-2">75% Confidence Score</p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                Complete a check-in to get AI-driven probability predictions for stress reduction.
              </p>
            )}
          </div>

          {/* AI Insight Snippet */}
          {latest && (
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center uppercase tracking-wider">
                 Latest Analysis
              </h3>
              <p className="text-indigo-800 text-sm leading-relaxed">{latest.analysis}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
