import * as FileSystem from 'expo-file-system/legacy';

export type TargetModel = 'spr' | 'icbhi';

export interface ApiPredictionResult {
  prediction: string;
  confidence: number;
  all_probabilities: Record<string, number>;
}

/**
 * Konversi Uint8Array ke string Base64 yang aman dan cepat di React Native Hermes.
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  return btoa(binary);
}

/**
 * Menyusun header 44-byte RIFF WAVE standar untuk data PCM 16-bit,
 * lalu menulisnya ke file sistem lokal menggunakan expo-file-system.
 *
 * @param pcmBytes Buffer PCM raw int16
 * @param sampleRate Default 16000 Hz
 * @param numChannels Default 1 (Mono)
 * @param bitsPerSample Default 16 bit
 * @returns URI file .wav lokal yang siap diupload
 */
export async function saveWavFileFromPcm(
  pcmBytes: Uint8Array,
  sampleRate: number = 16000,
  numChannels: number = 1,
  bitsPerSample: number = 16
): Promise<string> {
  const dataSize = pcmBytes.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // Total file size - 8
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Copy raw PCM byte data
  const uint8View = new Uint8Array(buffer);
  uint8View.set(pcmBytes, 44);

  // Convert to Base64 and write to cacheDirectory
  const base64Wav = uint8ArrayToBase64(uint8View);
  const targetUri = `${FileSystem.cacheDirectory}saparu_recording.wav`;

  await FileSystem.writeAsStringAsync(targetUri, base64Wav, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return targetUri;
}

/**
 * Mengirim file rekaman audio paru-paru (.wav mono 16kHz) ke Vercel FastAPI backend.
 * Menggunakan FileSystem.uploadAsync native untuk menghindari error "Unsupported FormDataPart implementation" di React Native 0.76+/0.86.
 *
 * @param {string} audioFileUri - URI lokal file audio (.wav) dari sistem file React Native.
 * @param {TargetModel} targetModel - Pilihan model: 'spr' (SPR Model) atau 'icbhi' (ICBHI Model).
 * @returns {Promise<ApiPredictionResult>} Respon hasil prediksi dan probabilitas dari server.
 */
export const predictRespiratorySound = async (
  audioFileUri: string,
  targetModel: TargetModel = 'spr'
): Promise<ApiPredictionResult> => {
  const endpoint = `https://onnxsaparu.vercel.app/api/predict/${targetModel}`;

  try {
    const uploadResult = await FileSystem.uploadAsync(endpoint, audioFileUri, {
      fieldName: 'file',
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      mimeType: 'audio/wav',
      headers: {
        Accept: 'application/json',
      },
    });

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      let serverErrorMsg = uploadResult.body;
      try {
        const errorJson = JSON.parse(uploadResult.body);
        serverErrorMsg = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
      } catch {}

      if (uploadResult.status === 400) {
        throw new Error(
          `Format audio salah (HTTP 400): ${
            serverErrorMsg || 'Pastikan file berekstensi .wav dengan sample rate 16kHz mono.'
          }`
        );
      } else if (uploadResult.status === 500) {
        throw new Error(
          `Kesalahan server (HTTP 500): ${
            serverErrorMsg || 'Server backend gagal memproses ekstraksi fitur audio atau inferensi ONNX.'
          }`
        );
      } else {
        throw new Error(
          `Server Error (Status ${uploadResult.status}): ${serverErrorMsg || 'Gagal memproses rekaman audio.'}`
        );
      }
    }

    const data: ApiPredictionResult = JSON.parse(uploadResult.body);
    return data;
  } catch (error: any) {
    console.error(`[ParuAPI Error] Gagal memanggil endpoint ${endpoint}:`, error);
    throw error;
  }
};
