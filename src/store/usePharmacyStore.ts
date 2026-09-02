import { create } from 'zustand';
import api from '@/lib/axios';

export interface ApotikItem {
  id: string;
  name: string;
  distance: string;
  distanceKm?: number;
  latitude: number;
  longitude: number;
  isNearest?: boolean;
  address: string;
  description: string;
  imageSource: any;
  medicines: {
    id: string;
    name: string;
    type: string;
    imageSource?: any;
    imageUrl?: string;
  }[];
}

export function getMedicineImageSource(med: { name?: string; imageSource?: any; imageUrl?: string }) {
  if (med.imageSource) return med.imageSource;
  const nameLower = (med.name || '').toLowerCase();
  if (nameLower.includes('inhaler') || nameLower.includes('ventolin')) {
    return require('@/assets/images/ventolin_inhaler.jpg');
  }
  if (nameLower.includes('sirup') || nameLower.includes('syrup') || nameLower.includes('profilas')) {
    return require('@/assets/images/profilas_sirup.jpg');
  }
  if (nameLower.includes('tablet') || nameLower.includes('salbutamol')) {
    return require('@/assets/images/salbutamol_tablet.jpg');
  }
  if (med.imageUrl) {
    return { uri: med.imageUrl };
  }
  return require('@/assets/images/ventolin_inhaler.jpg');
}

export const APOTIK_BASE_DATA: ApotikItem[] = [
  {
    id: '1',
    name: 'Apotik Abdi Husada',
    distance: '2,1 km',
    latitude: -6.9995,
    longitude: 110.4285,
    address: 'Jl Lampersari 12, Semarang',
    description:
      'Menyediakan berbagai kebutuhan obat, vitamin, suplemen, dan produk kesehatan. Melayani pembelian obat bebas maupun obat dengan resep dokter. Menerima BPJS.',
    imageSource: require('@/assets/mascot/Apotik.svg'),
    medicines: [
      {
        id: 'm1',
        name: 'Ventolin Inhaler',
        type: 'Salbutamol 100mcg',
        imageSource: require('@/assets/images/ventolin_inhaler.jpg'),
      },
      {
        id: 'm2',
        name: 'Profilas Sirup',
        type: 'Ketotifen 1mg/5ml',
        imageSource: require('@/assets/images/profilas_sirup.jpg'),
      },
      {
        id: 'm3',
        name: 'Salbutamol Tablet',
        type: 'Tablet 4mg',
        imageSource: require('@/assets/images/salbutamol_tablet.jpg'),
      },
    ],
  },
  {
    id: '2',
    name: 'Apotik Cita Farma',
    distance: '3,8 km',
    latitude: -6.9885,
    longitude: 110.4140,
    address: 'Jl Pandanaran 45, Semarang',
    description:
      'Menyediakan obat untuk berbagai keluhan umum, vitamin, suplemen, dan produk kesehatan anak maupun dewasa. Menerima BPJS dan resep dokter.',
    imageSource: require('@/assets/mascot/Apotik2.svg'),
    medicines: [
      {
        id: 'm1',
        name: 'Ventolin Inhaler',
        type: 'Salbutamol 100mcg',
        imageSource: require('@/assets/images/ventolin_inhaler.jpg'),
      },
      {
        id: 'm2',
        name: 'Profilas Sirup',
        type: 'Ketotifen 1mg/5ml',
        imageSource: require('@/assets/images/profilas_sirup.jpg'),
      },
    ],
  },
  {
    id: '3',
    name: 'Apotik Eka Sakti',
    distance: '4,5 km',
    latitude: -7.0050,
    longitude: 110.4350,
    address: 'Jl Sompok 22, Semarang',
    description:
      'Pelayanan ramah dan cepat dengan ketersediaan obat lengkap untuk kebutuhan saluran pernapasan anak dan keluarga. Konsultasi apoteker gratis.',
    imageSource: require('@/assets/mascot/Apotik3.svg'),
    medicines: [
      {
        id: 'm1',
        name: 'Ventolin Inhaler',
        type: 'Salbutamol 100mcg',
        imageSource: require('@/assets/images/ventolin_inhaler.jpg'),
      },
      {
        id: 'm3',
        name: 'Salbutamol Tablet',
        type: 'Tablet 4mg',
        imageSource: require('@/assets/images/salbutamol_tablet.jpg'),
      },
    ],
  },
  {
    id: '4',
    name: 'Apotik Ganesha',
    distance: '5,9 km',
    latitude: -7.0120,
    longitude: 110.4420,
    address: 'Jl Kedungmundu 88, Semarang',
    description:
      'Apotik terpercaya dengan berbagai obat generik dan paten. Menyediakan nebulizer, inhaler, dan kebutuhan pernapasan lengkap.',
    imageSource: require('@/assets/mascot/Apotik4.svg'),
    medicines: [
      {
        id: 'm2',
        name: 'Profilas Sirup',
        type: 'Ketotifen 1mg/5ml',
        imageSource: require('@/assets/images/profilas_sirup.jpg'),
      },
      {
        id: 'm3',
        name: 'Salbutamol Tablet',
        type: 'Tablet 4mg',
        imageSource: require('@/assets/images/salbutamol_tablet.jpg'),
      },
    ],
  },
];

interface PharmacyStore {
  pharmacies: ApotikItem[];
  selectedPharmacy: ApotikItem | null;
  isLoading: boolean;
  fetchPharmacies: (lat: number, lng: number) => Promise<void>;
  fetchPharmacyDetail: (id: string) => Promise<void>;
}

export const usePharmacyStore = create<PharmacyStore>((set) => ({
  pharmacies: APOTIK_BASE_DATA,
  selectedPharmacy: null,
  isLoading: false,

  fetchPharmacies: async (lat: number, lng: number) => {
    try {
      set({ isLoading: true });
      const response = await api.get(`/pharmacies`, {
        params: { lat, lng, limit: 10 },
      });

      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const mapped = response.data.data.map((item: any) => {
          const localMatch = APOTIK_BASE_DATA.find(
            (b) => b.id === item.id || b.name.toLowerCase().includes((item.name || '').toLowerCase())
          );
          return {
            id: item.id || item.ID || String(Math.random()),
            name: item.name || item.Name || 'Apotik Mitra',
            address: item.address || item.Address || 'Semarang',
            latitude: item.latitude || item.Latitude || -6.99,
            longitude: item.longitude || item.Longitude || 110.42,
            distance: item.distance_formatted || (item.distance_km ? `${item.distance_km.toFixed(1).replace('.', ',')} km` : 'Terdekat'),
            isNearest: item.is_nearest ?? false,
            description: item.description || item.Description || 'Menyediakan obat pernapasan, inhaler, dan kebutuhan kesehatan anak lengkap.',
            imageSource: localMatch ? localMatch.imageSource : require('@/assets/mascot/Apotik.svg'),
            medicines: item.medicines || localMatch?.medicines || [],
          };
        });
        set({ pharmacies: mapped });
      } else {
        set({ pharmacies: APOTIK_BASE_DATA });
      }
    } catch (e) {
      console.log('Gagal fetch apotik dari backend, menggunakan data lokal/fallback.');
      set({ pharmacies: APOTIK_BASE_DATA });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPharmacyDetail: async (id: string) => {
    try {
      set({ isLoading: true });
      const response = await api.get(`/pharmacies/${id}`);
      if (response.data && response.data.data) {
        const item = response.data.data;
        const localMatch = APOTIK_BASE_DATA.find((b) => b.id === item.id);
        set({
          selectedPharmacy: {
            id: item.id,
            name: item.name,
            address: item.address,
            latitude: item.latitude,
            longitude: item.longitude,
            distance: item.distance_formatted || 'Terdekat',
            description: item.description,
            imageSource: localMatch ? localMatch.imageSource : require('@/assets/mascot/Apotik.svg'),
            medicines: item.medicines || [],
          },
        });
      }
    } catch (e) {
      const localMatch = APOTIK_BASE_DATA.find((b) => b.id === id) || APOTIK_BASE_DATA[0];
      set({ selectedPharmacy: localMatch });
    } finally {
      set({ isLoading: false });
    }
  },
}));
