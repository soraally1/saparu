export interface ParuAnalysisResult {
  diagnosis: string;
  recommendations: string;
}

/**
 * Parser helper untuk mengekstrak JSON dari output AI
 */
function parseMedicalAiResponse(rawContent: string): { diagnosis: string; recommendations: string } {
  // 1. Bersihkan tag <think> jika ada
  let clean = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Ekstrak blok JSON menggunakan regex
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

    return {
      diagnosis: parsed.diagnosis || 'Pemeriksaan suara pernapasan selesai dianalisis.',
      recommendations:
        rec ||
        'Konsultasikan hasil ini dengan dokter anak atau spesialis paru untuk penanganan lebih lanjut.',
    };
  } catch {
    return {
      diagnosis: clean.slice(0, 300) || 'Pemeriksaan suara pernapasan selesai.',
      recommendations:
        'Konsultasikan hasil analisis ini dengan dokter spesialis untuk evaluasi lebih lanjut.',
    };
  }
}

export const analyzeParuSoundResult = async (prediction: string): Promise<ParuAnalysisResult> => {
  const GROQ_API_KEY = process.env.EXPO_PUBLIC_SAPARU_API_KEY;

  if (!GROQ_API_KEY) {
    console.error('Missing EXPO_PUBLIC_SAPARU_API_KEY in .env');
    return {
      diagnosis: 'Gagal Menganalisis',
      recommendations: 'Kunci API Groq tidak ditemukan. Harap tambahkan di file .env',
    };
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
        max_tokens: 2048,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              "Anda adalah asisten medis dokter spesialis pernapasan anak yang ramah, profesional, dan empatik. Analisis hasil deteksi suara paru (auskultasi/batuk) berikut. Selalu jawab dalam bahasa Indonesia. Format respon HANYA menggunakan JSON valid yang memiliki key 'diagnosis' dan 'recommendations' tanpa teks pembuka atau markdown tambahan.",
          },
          {
            role: 'user',
            content: `Hasil deteksi suara paru dari AI: "${prediction}". Berikan hasil analisis yang menenangkan namun informatif untuk orang tua pasien di key 'diagnosis', dan saran tindakan praktis di key 'recommendations'. Format respon JSON murni.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Terjadi kesalahan pada Groq API');
    }

    const rawContent = data.choices?.[0]?.message?.content || '';
    const parsed = parseMedicalAiResponse(rawContent);

    return {
      diagnosis: parsed.diagnosis,
      recommendations: parsed.recommendations,
    };
  } catch (e: any) {
    console.error('Groq API Error:', e);
    return {
      diagnosis: 'Terjadi Kendala Analisis',
      recommendations:
        'Maaf, sistem tidak dapat menganalisis hasil saat ini. Silakan coba lagi nanti atau hubungi dokter langsung.',
    };
  }
};
