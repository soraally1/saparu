import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface ParuHistoryItem {
  id: string;
  date: string;
  prediction: string;
  confidence: number;
  diagnosis: string;
  recommendations: string;
}

interface ParuStore {
  history: ParuHistoryItem[];
  isLoading: boolean;
  loadHistory: () => Promise<void>;
  addHistory: (item: Omit<ParuHistoryItem, 'id'>) => Promise<void>;
  deleteHistory: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'paru_history';

export const useParuStore = create<ParuStore>((set, get) => ({
  history: [],
  isLoading: false,

  loadHistory: async () => {
    try {
      set({ isLoading: true });
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        set({ history: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load paru history', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addHistory: async (item) => {
    try {
      const newItem: ParuHistoryItem = {
        ...item,
        id: Date.now().toString(),
      };
      const currentHistory = get().history;
      const updatedHistory = [newItem, ...currentHistory];

      set({ history: updatedHistory });
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to save paru history', e);
    }
  },

  deleteHistory: async (id: string) => {
    try {
      const filtered = get().history.filter((h) => h.id !== id);
      set({ history: filtered });
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete paru history item', e);
    }
  },
}));
