import { create } from 'zustand';
import { setItemAsync, getItemAsync, deleteItemAsync } from '@/lib/storage';

interface Patient {
  patient_id: string;
  user_id: string;
  child_name?: string;
  parent_name: string;
  // Add other fields as needed
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
      await setItemAsync('userToken', token);
      await setItemAsync('patientData', JSON.stringify(patient));
      set({ token, patient });
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  },

  logout: async () => {
    try {
      await deleteItemAsync('userToken');
      await deleteItemAsync('patientData');
      set({ token: null, patient: null });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  hydrateAuth: async () => {
    try {
      const token = await getItemAsync('userToken');
      const patientDataStr = await getItemAsync('patientData');
      if (token && patientDataStr) {
        set({ token, patient: JSON.parse(patientDataStr) });
      }
    } catch (error) {
      console.error('Error hydrating auth state:', error);
    }
  },
}));
