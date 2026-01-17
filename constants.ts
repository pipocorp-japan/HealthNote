import { CategoryType } from './types';
import { 
  Moon, 
  Brain, 
  Dumbbell, 
  Utensils, 
  Smile, 
  Zap, 
  Ruler 
} from 'lucide-react';

export const CATEGORIES: { id: CategoryType; label: string; icon: any; color: string }[] = [
  { id: 'sleep', label: '睡眠', icon: Moon, color: 'text-indigo-500' },
  { id: 'mental', label: 'メンタル', icon: Brain, color: 'text-purple-500' },
  { id: 'exercise', label: '運動', icon: Dumbbell, color: 'text-emerald-500' },
  { id: 'food', label: '食事', icon: Utensils, color: 'text-orange-500' },
  { id: 'mood', label: '気分', icon: Smile, color: 'text-yellow-500' },
  { id: 'stress', label: 'ストレス', icon: Zap, color: 'text-red-500' },
  { id: 'body', label: '身体測定', icon: Ruler, color: 'text-blue-500' },
];

export const MOOD_LEVELS = [
  { value: 1, label: '最悪', emoji: '😫' },
  { value: 2, label: '悪い', emoji: '🙁' },
  { value: 3, label: '普通', emoji: '😐' },
  { value: 4, label: '良い', emoji: '🙂' },
  { value: 5, label: '最高', emoji: '😄' },
];

// Simplified WHO-like standard data for visualization purposes only
export const GROWTH_STANDARD = [
  { age: 0, height: 50, weight: 3.3 },
  { age: 12, height: 75, weight: 9.6 },
  { age: 24, height: 87, weight: 12.2 },
  { age: 36, height: 96, weight: 14.3 },
  { age: 48, height: 103, weight: 16.3 },
  { age: 60, height: 110, weight: 18.3 },
  { age: 72, height: 116, weight: 20.5 },
  { age: 84, height: 122, weight: 22.9 },
  { age: 96, height: 128, weight: 25.4 },
  { age: 108, height: 133, weight: 28.1 },
  { age: 120, height: 138, weight: 31.2 },
  { age: 132, height: 143, weight: 34.5 },
  { age: 144, height: 149, weight: 38.5 },
];
