import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TestResult {
  id: string;
  topicId: string | 'mixed';
  score: number;
  totalQuestions: number;
  date: string;
}

export interface UserProgress {
  topicId: string;
  completed: boolean;
  bestScore: number;
  timeSpentSeconds: number;
}

interface AppState {
  xp: number;
  streak: number;
  lastLoginDate: string | null;
  progress: Record<string, UserProgress>;
  testHistory: TestResult[];
  achievements: string[];
  addXp: (amount: number) => void;
  updateStreak: () => void;
  markTopicComplete: (topicId: string, score?: number) => void;
  updateTopicTime: (topicId: string, seconds: number) => void;
  addTestResult: (result: Omit<TestResult, 'id' | 'date'>) => void;
  unlockAchievement: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      lastLoginDate: null,
      progress: {},
      testHistory: [],
      achievements: [],
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      updateStreak: () => {
        const today = new Date().toDateString();
        const { lastLoginDate, streak } = get();
        if (lastLoginDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastLoginDate === yesterday.toDateString()) {
            set({ streak: streak + 1, lastLoginDate: today });
          } else {
            set({ streak: 1, lastLoginDate: today });
          }
        }
      },
      markTopicComplete: (topicId, score = 100) => {
        set((state) => {
          const prev = state.progress[topicId] || { topicId, completed: false, bestScore: 0, timeSpentSeconds: 0 };
          const bestScore = Math.max(prev.bestScore, score);
          return {
            progress: {
              ...state.progress,
              [topicId]: { ...prev, completed: true, bestScore }
            }
          };
        });
      },
      updateTopicTime: (topicId, seconds) => {
        set((state) => {
          const prev = state.progress[topicId] || { topicId, completed: false, bestScore: 0, timeSpentSeconds: 0 };
          return {
            progress: {
              ...state.progress,
              [topicId]: { ...prev, timeSpentSeconds: prev.timeSpentSeconds + seconds }
            }
          };
        });
      },
      addTestResult: (result) => {
        set((state) => {
          const newResult: TestResult = {
            ...result,
            id: Math.random().toString(36).substring(7),
            date: new Date().toISOString()
          };
          
          let xpEarned = Math.round((result.score / result.totalQuestions) * 100);
          
          return {
            testHistory: [...state.testHistory, newResult],
            xp: state.xp + xpEarned
          };
        });
      },
      unlockAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.includes(id) ? state.achievements : [...state.achievements, id]
        })),
    }),
    {
      name: 'ochem-hub-storage-v2',
    }
  )
);

