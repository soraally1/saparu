import { create } from 'zustand';
import { setItemAsync, getItemAsync, deleteItemAsync } from '@/lib/storage';

interface Patient {
  id: string;               // ID dokumen firestore anak
  parentId: string;         // UID User Firebase Auth
  firstName: string;
  lastName: string;
  child_name: string;       // Hasil gabungan firstName + lastName dari Backend
  dob: string;
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  kondisiPernapasan: string[];
  riwayatPernapasan: string[];
  gejalaPemicu: string[];
  perawatanSaatIni: string[];
  createdAt: string;        // Format ISO Date
  updatedAt: string;        // Format ISO Date
}

interface AuthState {
  token: string | null;
  patient: Patient | null;
  setAuth: (token: string, patient: Patient) => Promise<void>;
  logout: () => Promise<void>;
  hydrateAuth: () => Promise<void>; // To load token on startup
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  patient: null,

  setAuth: async (token, patient) => {
    try {
      set({ token, patient });
      await Promise.allSettled([
        setItemAsync('userToken', token),
        setItemAsync('patientData', JSON.stringify(patient)),
      ]);
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  },

  logout: async () => {
    try {
      // 1. Instantly clear memory state
      set({ token: null, patient: null });
      // 2. Clear stored auth data
      await Promise.allSettled([
        deleteItemAsync('userToken'),
        deleteItemAsync('patientData'),
      ]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  hydrateAuth: async () => {
    try {
      const [token, patientDataStr] = await Promise.all([
        getItemAsync('userToken'),
        getItemAsync('patientData'),
      ]);
      if (token && patientDataStr) {
        set({ token, patient: JSON.parse(patientDataStr) });
      } else {
        set({ token: null, patient: null });
      }
    } catch (error) {
      console.error('Error hydrating auth state:', error);
      set({ token: null, patient: null });
    }
  },
}));
