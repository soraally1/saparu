import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '@/lib/axios';

export interface RoentgenHistoryItem {
  id: string;
  date: string;
  imageUri: string;
  imageUrl?: string;
  imageBase64?: string;
  diagnosisTitle?: string;
  diagnosis: string;
  recommendations: string;
  severity?: string;
  confidence?: number;
  findings?: {
    lungField?: string;
    heartAndMediastinum?: string;
    diaphragmAndSinus?: string;
    bones?: string;
  };
  redFlags?: string[];
  patientId?: string;
  createdAt?: string;
}

interface RoentgenStore {
  history: RoentgenHistoryItem[];
  isLoading: boolean;
  loadHistory: () => Promise<void>;
  addHistory: (item: Omit<RoentgenHistoryItem, 'id'>) => Promise<void>;
  deleteHistory: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'roentgen_history_v2';

export const useRoentgenStore = create<RoentgenStore>((set, get) => ({
  history: [],
  isLoading: false,

  loadHistory: async () => {
    // 1. Muat instan dari local storage cache (Offline-First)
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        set({ history: JSON.parse(stored) });
      }
    } catch (e) {
      console.warn('Gagal memuat riwayat rontgen dari cache lokal:', e);
    }

    // 2. Sinkronisasi dengan Backend Go & Cloud Firestore
    try {
      set({ isLoading: true });
      const response = await api.get('/roentgen/screenings');
      if (response.data && Array.isArray(response.data.data)) {
        const backendItems: RoentgenHistoryItem[] = response.data.data.map((item: any) => {
          const createdDate = item.created_at ? new Date(item.created_at) : new Date();
          const dateFormatted = createdDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return {
            id: item.id,
            date: dateFormatted,
            imageUri: item.image_url || '',
            imageUrl: item.image_url || '',
            diagnosisTitle: item.diagnosis_title,
            diagnosis: item.diagnosis,
            severity: item.severity,
            confidence: item.confidence,
            findings: {
              lungField: item.findings?.lung_field,
              heartAndMediastinum: item.findings?.heart_and_mediastinum,
              diaphragmAndSinus: item.findings?.diaphragm_and_sinus,
              bones: item.findings?.bones,
            },
            recommendations: item.recommendations,
            redFlags: item.red_flags,
            patientId: item.patient_id,
            createdAt: item.created_at,
          };
        });

        if (backendItems.length > 0) {
          set({ history: backendItems });
          await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(backendItems));
        }
      }
    } catch (apiErr: any) {
      console.log('Sinkronisasi backend sedang offline/menggunakan data lokal:', apiErr?.message || apiErr);
    } finally {
      set({ isLoading: false });
    }
  },

  addHistory: async (item) => {
    const tempId = Date.now().toString();
    const localItem: RoentgenHistoryItem = {
      ...item,
      id: tempId,
    };

    // 1. Simpan langsung ke cache lokal agar UX instan
    const currentHistory = get().history;
    const updatedHistory = [localItem, ...currentHistory];
    set({ history: updatedHistory });
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Gagal menyimpan cache lokal:', e);
    }

    // 2. Unggah ke Backend Go -> Firestore & Firebase Storage
    try {
      const payload = {
        patient_id: item.patientId || undefined,
        image_base64: item.imageBase64 || item.imageUri,
        diagnosis_title: item.diagnosisTitle || 'Hasil Analisis Rontgen',
        diagnosis: item.diagnosis,
        severity: item.severity || 'Ringan',
        confidence: item.confidence || 88.5,
        findings: {
          lung_field: item.findings?.lungField || '',
          heart_and_mediastinum: item.findings?.heartAndMediastinum || '',
          diaphragm_and_sinus: item.findings?.diaphragmAndSinus || '',
          bones: item.findings?.bones || '',
        },
        recommendations: item.recommendations,
        red_flags: item.redFlags || [],
      };

      const response = await api.post('/roentgen/screenings', payload);
      if (response.data && response.data.data) {
        const savedData = response.data.data;
        // Perbarui item lokal dengan Firestore Document ID dan Firebase Storage URL resmi
        const finalizedHistory = get().history.map((h) =>
          h.id === tempId
            ? {
                ...h,
                id: savedData.id || h.id,
                imageUrl: savedData.image_url || h.imageUrl,
              }
            : h
        );
        set({ history: finalizedHistory });
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(finalizedHistory));
      }
    } catch (err: any) {
      console.warn('Peringatan: Gagal sinkronisasi screening ke Firestore backend:', err?.message || err);
      // Item tetap aman tersimpan di HP berkat arsitektur offline-first
    }
  },

  deleteHistory: async (id: string) => {
    try {
      const filtered = get().history.filter((h) => h.id !== id);
      set({ history: filtered });
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Gagal menghapus riwayat rontgen:', e);
    }
  },
}));
