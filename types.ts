export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh';

export interface Habit {
  id: string;
  label: string;
  completed: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  image: string;
  available: boolean;
}

export interface UserState {
  name: string;
  language: Language;
  history: CheckInRecord[];
  assessments: AssessmentRecord[];
  habits: Record<string, Habit[]>; // Date string -> Habits
}

export interface CheckInRecord {
  id: string;
  timestamp: number;
  mood: string;
  stressLevel: number; // 0-10
  energyLevel: number; // 0-10
  analysis: string;
  recommendations: string[];
  habitsCompleted?: string[];
  prediction?: string; // Probability based insight
}

export interface AssessmentRecord {
  id: string;
  type: 'PHQ-9' | 'GAD-7';
  score: number;
  severity: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHECK_IN = 'CHECK_IN',
  CHAT = 'CHAT',
  ASSESSMENT = 'ASSESSMENT',
  CONSULTATION = 'CONSULTATION',
  RESOURCES = 'RESOURCES',
}

export interface AnalysisResponse {
  stressLevel: number;
  mood: string;
  energyLevel: number;
  summary: string;
  recommendations: string[];
  prediction: string;
}
