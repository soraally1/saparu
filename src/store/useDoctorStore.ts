import { create } from 'zustand';
import api from '@/lib/axios';

export interface DoctorItem {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  latitude: number;
  longitude: number;
  distance?: string;
  distanceKm?: number;
  isAvailable?: boolean;
  image: any;
  experience?: string;
  practiceHours?: string;
}

const DOCTOR_AVATARS = {
  anna: require('@/assets/mascot/dr bunga 1.svg'),
  agung: require('@/assets/mascot/dr daffa 1.svg'),
  adam: require('@/assets/mascot/dr erland 1.svg'),
  iwan: require('@/assets/mascot/dr ibanez.svg'),
};

export const DOCTORS_BASE: DoctorItem[] = [
  {
    id: 'anna',
    name: 'dr. Anna, Sp.A\nSubsp. Respi',
    specialization: 'Dokter Anak',
    hospital: 'RSUP Dr. Kariadi',
    latitude: -6.9985,
    longitude: 110.4127,
    isAvailable: true,
    image: DOCTOR_AVATARS.anna,
    experience: '12 Tahun\nPengalaman',
    practiceHours: '08:00-16:00\nJam Praktik',
  },
  {
    id: 'agung',
    name: 'dr. Agung, Sp.A,\nSubsp. Respi',
    specialization: 'Dokter Anak',
    hospital: 'Columbia Asia Hospital',
    latitude: -6.9830,
    longitude: 110.3790,
    isAvailable: true,
    image: DOCTOR_AVATARS.agung,
    experience: '10 Tahun\nPengalaman',
    practiceHours: '09:00-17:00\nJam Praktik',
  },
  {
    id: 'adam',
    name: 'dr. Adam, Sp.A\nSubsp. Respi',
    specialization: 'Dokter Anak',
    hospital: 'RS Hermina Pandanaran',
    latitude: -6.9885,
    longitude: 110.4140,
    isAvailable: true,
    image: DOCTOR_AVATARS.adam,
    experience: '15 Tahun\nPengalaman',
    practiceHours: '09:00-20:00\nJam Praktik',
  },
  {
    id: 'iwan',
    name: 'dr. Iwan, Sp.A,\nSubsp. Respi',
    specialization: 'Dokter Anak',
    hospital: 'RS St. Elisabeth',
    latitude: -7.0090,
    longitude: 110.4220,
    isAvailable: true,
    image: DOCTOR_AVATARS.iwan,
    experience: '8 Tahun\nPengalaman',
    practiceHours: '10:00-18:00\nJam Praktik',
  },
];

interface DoctorStore {
  doctors: DoctorItem[];
  selectedDoctor: DoctorItem | null;
  isLoading: boolean;
  fetchDoctors: () => Promise<void>;
  fetchDoctorDetail: (id: string) => Promise<void>;
  setSelectedDoctor: (doctor: DoctorItem | null) => void;
}

export const useDoctorStore = create<DoctorStore>((set) => ({
  doctors: DOCTORS_BASE,
  selectedDoctor: null,
  isLoading: false,

  setSelectedDoctor: (doctor: DoctorItem | null) => set({ selectedDoctor: doctor }),

  fetchDoctors: async () => {
    try {
      set({ isLoading: true });
      // Simulate network request for smooth skeleton UX
      await new Promise((resolve) => setTimeout(resolve, 600));
      set({ doctors: DOCTORS_BASE });
    } catch {
      set({ doctors: DOCTORS_BASE });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDoctorDetail: async (id: string) => {
    try {
      set({ isLoading: true });
      await new Promise((resolve) => setTimeout(resolve, 300));
      const doc = DOCTORS_BASE.find((d) => d.id === id) || DOCTORS_BASE[0];
      set({ selectedDoctor: doc });
    } finally {
      set({ isLoading: false });
    }
  },
}));
