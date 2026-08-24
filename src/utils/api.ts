export interface ApiPredictionResult {
  prediction: string;
  confidence: number;
  all_probabilities: Record<string, number>;
}

/**
 * Melakukan pengiriman file rekaman paru-paru ke server AI Vercel.
 * @param {string} audioFileUri - URI lokal file audio (.wav) dari sistem file React Native.
 * @param {string} targetModel - Pilihan model: 'spr' atau 'icbhi'.
 * @returns {Promise<ApiPredictionResult>} Respon prediksi dari server.
 */
export const predictRespiratorySound = async (audioFileUri: string, targetModel: 'spr' | 'icbhi' = 'spr'): Promise<ApiPredictionResult> => {
  const endpoint = `https://onnxsaparu.vercel.app/api/predict/${targetModel}`;
  const formData = new FormData();
  
  // @ts-ignore
  formData.append('file', {
    uri: audioFileUri,
    type: 'audio/wav',
    name: 'recording.wav'
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server API Error: Status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Kesalahan saat menghubungi API Klasifikasi Suara:", error);
    throw error;
  }
};
