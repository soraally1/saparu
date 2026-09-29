import { File } from 'expo-file-system';

export interface RoentgenFindings {
  lungField?: string;
  heartAndMediastinum?: string;
  diaphragmAndSinus?: string;
  bones?: string;
}

export interface RoentgenAnalysisResult {
  diagnosisTitle: string;
  diagnosis: string;
  severity: 'Normal' | 'Ringan' | 'Sedang' | 'Perlu Tindakan Segera' | string;
  confidence: number;
  findings: RoentgenFindings;
  recommendations: string;
  redFlags: string[];
}

/**
 * Membaca file gambar dari URI lokal dan mengonversinya ke base64.
 * Menggunakan File API baru dari expo-file-system (Expo v57+).
 */
async function imageUriToBase64(uri: string): Promise<{ base64: string; mimeType: string }> {
  const localUri = uri.startsWith('file://') ? uri : `file://${uri}`;
  const file = new File(localUri);
  const base64 = await file.base64();
  const lower = uri.toLowerCase();
  let mimeType = 'image/jpeg';
  if (lower.endsWith('.png')) mimeType = 'image/png';
  else if (lower.endsWith('.webp')) mimeType = 'image/webp';
  return { base64, mimeType };
}

/**
 * Parser helper untuk mengekstrak respons JSON dari model AI
 */
function parseMedicalAiResponse(rawContent: string): RoentgenAnalysisResult {
  let clean = rawContent
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    clean = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(clean);

    let rec = parsed.recommendations;
    if (Array.isArray(rec)) {
      rec = rec.map((item: string, idx: number) => `${idx + 1}. ${item}`).join('\n\n');
    }

    const redFlagsList = Array.isArray(parsed.redFlags) ? parsed.redFlags : [];

    return {
      diagnosisTitle: parsed.diagnosisTitle ?? '',
      diagnosis: parsed.diagnosis ?? '',
      severity: parsed.severity ?? 'Sedang',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      findings: {
        lungField: parsed.findings?.lungField ?? '',
        heartAndMediastinum: parsed.findings?.heartAndMediastinum ?? '',
        diaphragmAndSinus: parsed.findings?.diaphragmAndSinus ?? '',
        bones: parsed.findings?.bones ?? '',
      },
      recommendations: rec ?? '',
      redFlags: redFlagsList,
    };
  } catch (err) {
    console.warn('Gagal parse JSON dari respons AI:', err);
    return {
      diagnosisTitle: 'Gagal Memuat Hasil',
      diagnosis: 'Respons AI tidak dapat diproses. Silakan coba kembali.',
      severity: 'Sedang',
      confidence: 0,
      findings: {},
      recommendations: 'Ulangi analisis atau konsultasikan langsung dengan dokter spesialis.',
      redFlags: [],
    };
  }
}

export const analyzeRoentgenImage = async (imageUri: string): Promise<RoentgenAnalysisResult> => {
  console.log('Menganalisis foto rontgen dada:', imageUri);

  const GROQ_API_KEY = process.env.EXPO_PUBLIC_SAPARU_API_KEY;

  if (!GROQ_API_KEY) {
    console.error('Missing EXPO_PUBLIC_SAPARU_API_KEY in .env');
    return {
      diagnosisTitle: 'Konfigurasi Belum Lengkap',
      diagnosis: 'Kunci API Groq tidak ditemukan di file .env aplikasi.',
      severity: 'Normal',
      confidence: 0,
      findings: {},
      recommendations: 'Tambahkan EXPO_PUBLIC_SAPARU_API_KEY ke file .env aplikasi.',
      redFlags: [],
    };
  }

  try {
    // 1. Baca gambar rontgen sebagai base64
    const { base64, mimeType } = await imageUriToBase64(imageUri);
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // 2. Kirim gambar + prompt ke Groq qwen/qwen3.8-27b (multimodal)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        reasoning_format: 'hidden',
        temperature: 0.2,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: dataUrl },
              },
              {
                type: 'text',
                text: `Anda adalah asisten medis dokter spesialis radiologi anak di Saparu. Analisis foto rontgen toraks anak ini secara objektif dan menyeluruh berdasarkan gambar yang diberikan.

Diagnosis TIDAK harus selalu pneumonia — pertimbangkan berbagai kemungkinan kondisi seperti asma, bronkitis akut, bronkiolitis, tuberkulosis paru (TB), efusi pleura, atelektasis, hiperinflasi paru, atau kondisi lainnya sesuai temuan yang TERLIHAT pada gambar.

Berikan hasil HANYA dalam format JSON murni, tanpa teks atau markdown tambahan:
{
  "diagnosisTitle": "Nama diagnosis utama yang paling sesuai gambar",
  "diagnosis": "Deskripsi lengkap temuan radiologis yang terlihat dan interpretasi klinis",
  "severity": "Normal | Ringan | Sedang | Perlu Tindakan Segera",
  "confidence": 85.0,
  "findings": {
    "lungField": "Deskripsi lapangan paru kanan dan kiri yang terlihat pada gambar",
    "heartAndMediastinum": "Deskripsi ukuran jantung, CTR, dan mediastinum yang terlihat",
    "diaphragmAndSinus": "Deskripsi diafragma dan sinus kostofrenikus yang terlihat",
    "bones": "Deskripsi tulang skeletal toraks yang terlihat"
  },
  "recommendations": "Saran tindakan klinis sesuai diagnosis",
  "redFlags": ["Tanda bahaya spesifik sesuai kondisi yang didiagnosis"]
}
Jawab dalam bahasa Indonesia.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Terjadi kesalahan pada Groq API');
    }

    const rawContent = data.choices?.[0]?.message?.content || '';
    console.log('Groq raw response:', rawContent.slice(0, 300));

    return parseMedicalAiResponse(rawContent);
  } catch (e: any) {
    console.error('Groq Vision API Error:', e);
    return {
      diagnosisTitle: 'Gagal Menganalisis Gambar',
      diagnosis: `Terjadi kendala saat menghubungi AI: ${e?.message || 'Koneksi gagal'}.`,
      severity: 'Sedang',
      confidence: 0,
      findings: {},
      recommendations: 'Pastikan perangkat terhubung ke internet dan ulangi analisis foto rontgen.',
      redFlags: [],
    };
  }
};

