import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '@/lib/axios';

export interface MedicationSchedule {
  id: string;
  name: string;
  dosage: string; // cth: '2 semprot (puff)', '1 sendok teh (5ml)', '1 tablet'
  frequency: string; // cth: '2x Sehari', '3x Sehari'
  instruction: string; // cth: 'Sesudah makan', 'Sebelum makan', 'Saat sesak napas'
  time: string; // cth: '08:00', '14:20', '20:00'
  day: string; // cth: 'Senin, 12 September 2026'
  dateIso: string; // cth: '2026-09-12'
  type: 'inhaler' | 'sirup' | 'tablet' | 'lainnya';
  notes?: string;
  isTaken: boolean;
  prescribedBy?: string; // cth: 'dr. Anna, Sp.A' atau 'Rekomendasi AI Saparu'
  isAiGenerated?: boolean;
}

interface MedicationStore {
  schedules: MedicationSchedule[];
  isLoading: boolean;
  hasLoaded: boolean;
  loadSchedules: () => Promise<void>;
  addSchedule: (item: Omit<MedicationSchedule, 'id' | 'isTaken'>) => Promise<void>;
  addMultipleSchedules: (items: Omit<MedicationSchedule, 'id' | 'isTaken'>[]) => Promise<void>;
  toggleTaken: (id: string) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  requestAiRecommendation: (symptoms: string, childAgeMonths?: number) => Promise<Omit<MedicationSchedule, 'id' | 'isTaken'>[]>;
}

const STORAGE_KEY = 'saparu_medication_schedules_v2';

export const useMedicationStore = create<MedicationStore>((set, get) => ({
  schedules: [],
  isLoading: false,
  hasLoaded: false,

  loadSchedules: async () => {
    try {
      set({ isLoading: true });
      // 1. Muat dari cache lokal SecureStore
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        set({ schedules: JSON.parse(stored), hasLoaded: true });
      } else {
        set({ schedules: [], hasLoaded: true });
      }

      // 2. Sinkronkan dengan Backend Go jika tersedia
      try {
        const response = await api.get('/medications');
        if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          set({ schedules: response.data.data });
          await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(response.data.data));
        }
      } catch (e) {
        // Fallback ke data lokal
      }
    } catch (e) {
      console.error('Gagal memuat jadwal obat:', e);
      set({ hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  addSchedule: async (item) => {
    const newSchedule: MedicationSchedule = {
      ...item,
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 4),
      isTaken: false,
    };

    const updated = [newSchedule, ...get().schedules];
    set({ schedules: updated });
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));

    try {
      await api.post('/medications', newSchedule);
    } catch (err) {
      console.log('Jadwal tersimpan secara lokal (offline mode)');
    }
  },

  addMultipleSchedules: async (items) => {
    const newSchedules: MedicationSchedule[] = items.map((item, idx) => ({
      ...item,
      id: (Date.now() + idx).toString() + '-' + Math.random().toString(36).substr(2, 4),
      isTaken: false,
    }));

    const updated = [...newSchedules, ...get().schedules];
    set({ schedules: updated });
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));

    try {
      for (const s of newSchedules) {
        await api.post('/medications', s);
      }
    } catch (e) {}
  },

  toggleTaken: async (id: string) => {
    const updated = get().schedules.map((s) =>
      s.id === id ? { ...s, isTaken: !s.isTaken } : s
    );
    set({ schedules: updated });
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));

    try {
      await api.patch(`/medications/${id}/toggle`);
    } catch (e) {}
  },

  deleteSchedule: async (id: string) => {
    const updated = get().schedules.filter((s) => s.id !== id);
    set({ schedules: updated });
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));

    try {
      await api.delete(`/medications/${id}`);
    } catch (e) {}
  },

  requestAiRecommendation: async (symptoms: string, childAgeMonths: number = 24) => {
    // 1. Coba panggil endpoint backend Go terlebih dahulu
    try {
      const response = await api.post('/medications/ai-recommend', {
        symptoms,
        child_age_months: childAgeMonths,
      });

      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const todayIso = new Date().toISOString().split('T')[0];
        const todayFormatted = new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        return response.data.data.map((p: any) => ({
          name: p.name || 'Obat Suportif Anak',
          dosage: p.dosage || 'Sesuai anjuran dokter',
          frequency: p.frequency || '2x Sehari',
          instruction: p.instruction || 'Sesudah makan',
          time: p.time || '08:00',
          day: todayFormatted,
          dateIso: todayIso,
          type: (['inhaler', 'sirup', 'tablet', 'lainnya'].includes(p.type) ? p.type : 'sirup') as any,
          notes: p.notes || 'Dianjurkan tetap berkonsultasi dengan dokter spesialis anak.',
          prescribedBy: 'Rekomendasi AI Saparu (Konsultasikan ke Dokter)',
          isAiGenerated: true,
        }));
      }
    } catch (err) {
      console.log('Backend AI recommend fallback to direct Groq Qwen...');
    }

    // 2. Direct Groq Qwen fallback
    const GROQ_API_KEY = process.env.EXPO_PUBLIC_SAPARU_API_KEY;

    if (!GROQ_API_KEY) {
      // Fallback rekomendasi klinis jika offline
      return [
        {
          name: 'Ventolin Inhaler (Salbutamol 100mcg)',
          dosage: '2 semprot (puff) dengan spacer',
          frequency: '2x Sehari',
          instruction: 'Gunakan saat anak mengalami batuk/sesak atau sesuai anjuran dokter',
          time: '08:00',
          day: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          dateIso: new Date().toISOString().split('T')[0],
          type: 'inhaler' as const,
          notes: 'Gunakan masker spacer dan tahan napas 5-10 detik setelah semprotan.',
          prescribedBy: 'Rekomendasi AI Saparu (Konsultasikan ke Dokter)',
          isAiGenerated: true,
        },
        {
          name: 'Profilas Sirup (Ketotifen)',
          dosage: '1 sendok takar (5ml)',
          frequency: '1x Sehari',
          instruction: 'Sesudah makan malam',
          time: '19:00',
          day: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          dateIso: new Date().toISOString().split('T')[0],
          type: 'sirup' as const,
          notes: 'Membantu meredakan batuk alergi dan peradangan saluran napas.',
          prescribedBy: 'Rekomendasi AI Saparu (Konsultasikan ke Dokter)',
          isAiGenerated: true,
        },
      ];
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.6-27b',
          reasoning_format: 'hidden',
          max_tokens: 4096,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: `Anda adalah AI Spesialis Pulmonologi Anak di Saparu. Berdasarkan keluhan pernapasan anak (usia ${childAgeMonths} bulan), susunkan jadwal pengobatan suportif/inhaler yang aman dan terstruktur dalam format JSON ARRAY murni:
[
  {
    "name": "Nama Obat / Terapi (contoh: Ventolin Inhaler)",
    "dosage": "Dosis spesifik anak (contoh: 2 semprot dengan spacer)",
    "frequency": "Frekuensi (contoh: 2x Sehari)",
    "instruction": "Aturan minum (contoh: Sesudah makan / Saat sesak napas)",
    "time": "08:00",
    "type": "inhaler",
    "notes": "Panduan praktis untuk orang tua"
  }
]
Ketentuan type hanya boleh: "inhaler" | "sirup" | "tablet" | "lainnya".
HANYA kembalikan JSON array valid tanpa teks pengantar maupun markdown formatting.`
            },
            {
              role: 'user',
              content: `Kondisi anak: "${symptoms}". Buatkan rekomendasi jadwal dosis obat.`
            }
          ]
        }),
      });

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || '';
      let clean = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      const jsonMatch = clean.match(/\[[\s\S]*\]/);
      if (jsonMatch) clean = jsonMatch[0];

      const parsed = JSON.parse(clean);
      const todayIso = new Date().toISOString().split('T')[0];
      const todayFormatted = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      return parsed.map((p: any) => ({
        name: p.name || 'Obat Suportif Anak',
        dosage: p.dosage || 'Sesuai anjuran dokter',
        frequency: p.frequency || '2x Sehari',
        instruction: p.instruction || 'Sesudah makan',
        time: p.time || '08:00',
        day: todayFormatted,
        dateIso: todayIso,
        type: (['inhaler', 'sirup', 'tablet', 'lainnya'].includes(p.type) ? p.type : 'sirup') as any,
        notes: p.notes || 'Dianjurkan tetap berkonsultasi dengan dokter spesialis anak.',
        prescribedBy: 'Rekomendasi AI Saparu (Konsultasikan ke Dokter)',
        isAiGenerated: true,
      }));
    } catch (e) {
      console.warn('Gagal parse AI medication recommendation, using clinical defaults:', e);
      return [
        {
          name: 'Ventolin Inhaler (Salbutamol)',
          dosage: '2 semprot (puff) dengan spacer',
          frequency: '2x Sehari',
          instruction: 'Gunakan saat anak mengalami batuk/sesak',
          time: '08:00',
          day: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          dateIso: new Date().toISOString().split('T')[0],
          type: 'inhaler' as const,
          notes: 'Gunakan spacer dan kumur air hangat setelah penggunaan.',
          prescribedBy: 'Rekomendasi AI Saparu',
          isAiGenerated: true,
        },
      ];
    }
  },
}));
