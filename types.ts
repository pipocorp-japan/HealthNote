export enum ThemeOption {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export interface UserProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  theme: ThemeOption;
  isChildMode: boolean;
  height: number; // cm
  weight: number; // kg
}

export type CategoryType = 'sleep' | 'mental' | 'exercise' | 'food' | 'mood' | 'stress' | 'body';

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  category: CategoryType;
  value: number; // Generic value for score/duration
  note?: string;
  subData?: {
    [key: string]: any; // Store specific data like 'calories', 'steps', etc.
  };
}

export interface GrowthData {
  ageInMonths: number;
  height: number;
  weight: number;
  date: string;
}
