import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  MessageCircleHeart, 
  ClipboardList, 
  Menu,
  ShieldCheck,
  Sparkles,
  UserRound,
  Globe
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { BioCheckIn } from './components/BioCheckIn';
import { ChatBot } from './components/ChatBot';
import { Assessment } from './components/Assessment';
import { Consultation } from './components/Consultation';
import { AppView, CheckInRecord, UserState, AssessmentRecord, Language, Habit } from './types';

// Mock Initial Habits
const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', label: 'Meditate for 10 mins', completed: false },
  { id: 'h2', label: 'Drink 8 glasses of water', completed: false },
  { id: 'h3', label: 'Take a 15 min walk', completed: false },
  { id: 'h4', label: 'No screen time before bed', completed: false },
];

const INITIAL_STATE: UserState = {
  name: "Alex",
  language: 'en',
  history: [
    {
      id: "1",
      timestamp: Date.now() - 86400000 * 2,
      mood: "Anxious",
      stressLevel: 7,
      energyLevel: 4,
      analysis: "User showed signs of fatigue.",
      recommendations: ["Deep breathing", "Sleep early"],
      prediction: "Regular sleep schedule increases probability of recovery by 60%."
    },
    {
      id: "2",
      timestamp: Date.now() - 86400000,
      mood: "Calm",
      stressLevel: 3,
      energyLevel: 7,
      analysis: "Improved affect compared to previous day.",
      recommendations: ["Maintain routine"],
      prediction: "Current routine maintains stability with 85% probability."
    }
  ],
  assessments: [],
  habits: {
    [new Date().toDateString()]: [...DEFAULT_HABITS]
  }
};

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [userState, setUserState] = useState<UserState>(INITIAL_STATE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Ensure habits exist for today
  useEffect(() => {
    const today = new Date().toDateString();
    if (!userState.habits[today]) {
      setUserState(prev => ({
        ...prev,
        habits: {
          ...prev.habits,
          [today]: DEFAULT_HABITS.map(h => ({...h})) // Deep copy
        }
      }));
    }
  }, []);

  const handleCheckInComplete = (record: CheckInRecord) => {
    setUserState(prev => ({
      ...prev,
      history: [...prev.history, record]
    }));
    setCurrentView(AppView.DASHBOARD);
  };

  const handleAssessmentComplete = (record: AssessmentRecord) => {
    setUserState(prev => ({
      ...prev,
      assessments: [...prev.assessments, record]
    }));
  };

  const toggleHabit = (habitId: string) => {
    const today = new Date().toDateString();
    setUserState(prev => {
      const currentHabits = prev.habits[today] || [];
      const updatedHabits = currentHabits.map(h => 
        h.id === habitId ? { ...h, completed: !h.completed } : h
      );
      return {
        ...prev,
        habits: {
          ...prev.habits,
          [today]: updatedHabits
        }
      };
    });
  };

  const setLanguage = (lang: Language) => {
    setUserState(prev => ({ ...prev, language: lang }));
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-6 py-4 mb-2 rounded-2xl transition-all font-semibold ${
        currentView === view 
          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-900">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        <div className="h-24 flex items-center px-8 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-indigo-200">
            <Sparkles size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-extrabold text-slate-800 tracking-tight">Calmify AI</span>
        </div>

        <nav className="mt-6 px-4 flex-1 overflow-y-auto">
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem view={AppView.CHECK_IN} icon={Stethoscope} label="Bio-Check In" />
          <NavItem view={AppView.CHAT} icon={MessageCircleHeart} label="AI Therapist" />
          <NavItem view={AppView.CONSULTATION} icon={UserRound} label="Stress Doctors" />
          <NavItem view={AppView.ASSESSMENT} icon={ClipboardList} label="Assessments" />
          
          <div className="mt-8 mb-4 px-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
              <Globe size={12} className="mr-1"/> Language
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['en', 'es', 'fr', 'de', 'hi', 'zh'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`text-xs font-bold py-2 px-3 rounded-lg uppercase transition-all ${
                    userState.language === lang 
                      ? 'bg-violet-100 text-violet-700 border border-violet-200' 
                      : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6 flex-shrink-0">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex items-center text-violet-600 mb-2">
              <ShieldCheck size={18} className="mr-2" />
              <span className="text-xs font-bold uppercase tracking-wide">Privacy First</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Your session data is processed securely.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* Mobile Header */}
        <header className="h-16 lg:hidden flex items-center justify-between px-4 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white mr-3">
              <Sparkles size={20} fill="currentColor"/>
            </div>
            <span className="font-bold text-slate-800 text-lg">Calmify AI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {currentView === AppView.DASHBOARD && (
              <Dashboard 
                userState={userState} 
                onToggleHabit={toggleHabit} 
              />
            )}
            {currentView === AppView.CHECK_IN && (
              <BioCheckIn 
                onComplete={handleCheckInComplete} 
                language={userState.language}
                dailyHabits={userState.habits[new Date().toDateString()] || []}
              />
            )}
            {currentView === AppView.CHAT && (
              <ChatBot language={userState.language} />
            )}
            {currentView === AppView.CONSULTATION && (
              <Consultation />
            )}
            {currentView === AppView.ASSESSMENT && (
              <Assessment onComplete={handleAssessmentComplete} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;