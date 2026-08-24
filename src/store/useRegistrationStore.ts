import { create } from 'zustand';

interface RegistrationState {
  // Auth Creds
  email?: string;
  password?: string;
  full_name?: string;

  // Patient Info
  firstName?: string;
  lastName?: string;
  dob?: string;
  age?: number;
  gender?: 'male' | 'female';
  height?: number;
  weight?: number;

  // Health Arrays
  kondisiPernapasan?: string[];
  riwayatPernapasan?: string[];
  gejalaPemicu?: string[];
  perawatanSaatIni?: string[];

  // Actions
  updateData: (data: Partial<RegistrationState>) => void;
  resetRegistration: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  // initial values are all undefined

  updateData: (data) => set((state) => ({ ...state, ...data })),
  resetRegistration: () => set({
    email: undefined,
    password: undefined,
    full_name: undefined,
    firstName: undefined,
    lastName: undefined,
    dob: undefined,
    age: undefined,
    gender: undefined,
    height: undefined,
    weight: undefined,
    kondisiPernapasan: undefined,
    riwayatPernapasan: undefined,
    gejalaPemicu: undefined,
    perawatanSaatIni: undefined,
  })
}));
