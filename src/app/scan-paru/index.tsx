import { useParuStore } from '@/store/useParuStore';
import {
  ApiPredictionResult,
  predictRespiratorySound,
  saveWavFileFromPcm,
  TargetModel,
} from '@/utils/api';
import { analyzeParuSoundResult, ParuAnalysisResult } from '@/utils/paruApi';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioStream,
} from 'expo-audio';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const MAX_RECORDING_SECONDS = 5.0;

export default function ScanParuScreen() {
  const router = useRouter();

  // Selected Model State ('spr' -> Pernafasan, 'icbhi' -> Batuk)
  const [selectedModel, setSelectedModel] = useState<TargetModel>('spr');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [result, setResult] = useState<ApiPredictionResult | null>(null);
  const [llmResult, setLlmResult] = useState<ParuAnalysisResult | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const addHistory = useParuStore((state) => state.addHistory);

  // PCM Chunk buffers for assembling pure 16kHz mono RIFF WAV
  const pcmChunksRef = useRef<Uint8Array[]>([]);
  const isCapturingRef = useRef<boolean>(false);

  // Audio Stream setup with 16kHz, mono (1 channel), 16-bit PCM
  const { stream } = useAudioStream({
    sampleRate: 16000,
    channels: 1,
    encoding: 'int16',
    onBuffer: (buffer) => {
      if (isCapturingRef.current && buffer?.data && buffer.data.byteLength > 0) {
        pcmChunksRef.current.push(new Uint8Array(buffer.data));
      }
    },
  });

  // Timers & refs
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const isStoppingRef = useRef<boolean>(false);

  // Reanimated Shared Values for Mascot & Sparks
  const detectorTilt = useSharedValue(0);
  const detectorScale = useSharedValue(1);
  const detectorFloat = useSharedValue(0);

  const sparksOpacity = useSharedValue(0);
  const sparksScale = useSharedValue(0.7);
  const sparksAnim1 = useSharedValue(1); // Top-Left pulse
  const sparksAnim2 = useSharedValue(1); // Bottom-Right pulse
  const sparksFlicker = useSharedValue(1); // Electric micro-flicker

  const pointerAnimY = useSharedValue(100);
  const pointerScale = useSharedValue(1);
  const pointerOpacity = useSharedValue(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
      isCapturingRef.current = false;
      try {
        stream?.stop();
      } catch { }
    };
  }, [stream]);

  const clearAllTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Check tutorial status
  useEffect(() => {
    const checkTutorial = async () => {
      try {
        const hasSeen = await SecureStore.getItemAsync('hasSeenScanTutorial2');
        if (!hasSeen) {
          setShowTutorial(true);
        }
      } catch {
        setShowTutorial(true);
      }
    };
    checkTutorial();
  }, []);

  // Tutorial pointer animation loop
  useEffect(() => {
    if (showTutorial && !isRecording && !isProcessing && !result) {
      pointerAnimY.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 400 }),
          withTiming(100, { duration: 500, easing: Easing.in(Easing.ease) }),
          withTiming(100, { duration: 500 })
        ),
        -1,
        false
      );
      pointerScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.8, { duration: 200 }),
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
      pointerOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(1, { duration: 800 }),
          withTiming(0, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pointerOpacity.value = withTiming(0);
    }
  }, [showTutorial, isRecording, isProcessing, result]);

  const pointerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: pointerAnimY.value },
      { scale: pointerScale.value },
    ],
    opacity: pointerOpacity.value,
  }));

  const detectorAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${detectorTilt.value}deg` },
      { scale: detectorScale.value },
      { translateY: detectorFloat.value },
    ],
  }));

  const topLeftSparksStyle = useAnimatedStyle(() => ({
    opacity: sparksOpacity.value * sparksFlicker.value,
    transform: [
      { scale: sparksScale.value * sparksAnim1.value },
    ],
  }));

  const bottomRightSparksStyle = useAnimatedStyle(() => ({
    opacity: sparksOpacity.value * sparksFlicker.value,
    transform: [
      { scale: sparksScale.value * sparksAnim2.value },
      { rotate: '145deg' },
    ],
  }));

  /**
   * Memulai proses perekaman audio PCM murni
   */
  const startRecording = async () => {
    try {
      if (showTutorial) {
        setShowTutorial(false);
        try {
          await SecureStore.setItemAsync('hasSeenScanTutorial2', 'true');
        } catch { }
      }

      setResult(null);
      setLlmResult(null);
      setRecordingSeconds(0.0);
      pcmChunksRef.current = [];
      isStoppingRef.current = false;

      // 1. Request microphone permission
      const permission = await requestRecordingPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Izin Mikrofon Ditolak',
          'Aplikasi membutuhkan izin akses mikrofon untuk mendeteksi dan menganalisis suara pernapasan.'
        );
        return;
      }

      // 2. Set audio mode for recording
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // 3. Start audio stream
      isCapturingRef.current = true;
      await stream.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // 4. Start Sparks entrance & pulsating animations
      sparksOpacity.value = withTiming(1, { duration: 250 });
      sparksScale.value = withSequence(
        withTiming(1.12, { duration: 220, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1.0, { duration: 150 })
      );

      // Top-Left Sparks pulse / electric rhythm
      sparksAnim1.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 280, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.94, { duration: 240, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.04, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 180, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Bottom-Right Sparks pulse / electric rhythm (counter-phase)
      sparksAnim2.value = withRepeat(
        withSequence(
          withTiming(0.94, { duration: 240, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.1, { duration: 280, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.98, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 180, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Micro electric flicker
      sparksFlicker.value = withRepeat(
        withSequence(
          withTiming(0.85, { duration: 80 }),
          withTiming(1.0, { duration: 60 }),
          withTiming(0.92, { duration: 90 }),
          withTiming(1.0, { duration: 120 })
        ),
        -1,
        true
      );

      // Mascot acoustic breathing & wobble
      detectorTilt.value = withRepeat(
        withSequence(
          withTiming(-1.2, { duration: 180, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.2, { duration: 180, easing: Easing.inOut(Easing.sin) }),
          withTiming(-0.8, { duration: 180, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.8, { duration: 180, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 120, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      detectorScale.value = withRepeat(
        withSequence(
          withTiming(1.025, { duration: 450, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 450, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      detectorFloat.value = withRepeat(
        withSequence(
          withTiming(-3.5, { duration: 500, easing: Easing.inOut(Easing.quad) }),
          withTiming(2, { duration: 500, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );

      // 5. Visual Timer Interval
      clearAllTimers();
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        if (elapsed >= MAX_RECORDING_SECONDS) {
          setRecordingSeconds(MAX_RECORDING_SECONDS);
          stopRecordingAndProcess();
        } else {
          setRecordingSeconds(Math.min(elapsed, MAX_RECORDING_SECONDS));
        }
      }, 100);

      // 6. Strict 5-Second Hard Timeout
      timeoutRef.current = setTimeout(() => {
        stopRecordingAndProcess();
      }, MAX_RECORDING_SECONDS * 1000);

    } catch (err: any) {
      console.error('Gagal memulai rekaman audio:', err);
      clearAllTimers();
      isCapturingRef.current = false;
      setIsRecording(false);
      Alert.alert('Gagal Merekam', 'Terjadi kesalahan saat memulai rekaman audio. Silakan coba lagi.');
    }
  };

  /**
   * Menghentikan perekaman, menyusun file RIFF WAV, dan mengirim ke Vercel FastAPI backend
   */
  const stopRecordingAndProcess = async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    clearAllTimers();
    setIsRecording(false);

    // Smoothly settle animations back to rest
    sparksOpacity.value = withTiming(0, { duration: 200 });
    sparksScale.value = withTiming(0.7, { duration: 200 });
    sparksAnim1.value = withTiming(1, { duration: 200 });
    sparksAnim2.value = withTiming(1, { duration: 200 });
    sparksFlicker.value = withTiming(1, { duration: 150 });
    detectorTilt.value = withTiming(0, { duration: 250 });
    detectorScale.value = withTiming(1, { duration: 250 });
    detectorFloat.value = withTiming(0, { duration: 250 });

    try {
      isCapturingRef.current = false;
      try {
        stream.stop();
      } catch (e) {
        console.warn('Peringatan saat menghentikan stream:', e);
      }

      // Combine collected PCM chunks into a single byte array
      const chunks = pcmChunksRef.current;
      const totalBytes = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

      if (totalBytes === 0) {
        throw new Error('Data rekaman audio kosong.');
      }

      const combinedPcm = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        combinedPcm.set(chunk, offset);
        offset += chunk.length;
      }

      // Save a 100% compliant 16kHz mono 16-bit RIFF WAV file locally
      const wavUri = await saveWavFileFromPcm(combinedPcm, 16000, 1, 16);
      console.log(`WAV file berhasil disimpan di: ${wavUri}`);

      setIsProcessing(true);
      const modelLabel = selectedModel === 'spr' ? 'Pernafasan' : 'Batuk';
      setProcessingStage(`Mengirim audio ke Backend (${modelLabel})...`);

      // 1. Upload ke Vercel FastAPI Backend
      const predictionResponse = await predictRespiratorySound(wavUri, selectedModel);
      setResult(predictionResponse);

      // 2. Analisis Medis dengan LLM (Groq)
      setProcessingStage('Menganalisis Hasil Medis...');
      const analysis = await analyzeParuSoundResult(predictionResponse.prediction);
      setLlmResult(analysis);

    } catch (error: any) {
      console.error('Error proses klasifikasi suara paru:', error);
      const errorMessage = error?.message || 'Terjadi kesalahan tidak terduga saat memproses audio.';

      if (errorMessage.includes('HTTP 400') || errorMessage.includes('Format audio salah')) {
        Alert.alert(
          'Format Audio Salah (HTTP 400)',
          'File audio tidak sesuai dengan parameter yang dibutuhkan backend (WAV 16kHz Mono).'
        );
      } else if (errorMessage.includes('HTTP 500') || errorMessage.includes('Kesalahan server')) {
        Alert.alert(
          'Kesalahan Server AI (HTTP 500)',
          `Server gagal memproses audio:\n${errorMessage}`
        );
      } else {
        Alert.alert(
          'Koneksi / Jaringan Gagal',
          `Gagal menghubungi server backend: ${errorMessage}\n\nPastikan koneksi internet stabil.`
        );
      }
    } finally {
      setIsRecording(false);
      setIsProcessing(false);
      setProcessingStage('');
      isStoppingRef.current = false;
    }
  };

  /**
   * Simpan hasil deteksi ke riwayat lokal
   */
  const handleSave = async () => {
    if (result && llmResult) {
      await addHistory({
        date: new Date().toISOString(),
        prediction: result.prediction,
        confidence: result.confidence,
        diagnosis: llmResult.diagnosis,
        recommendations: llmResult.recommendations,
      });
      router.replace('/scan-paru/history');
    }
  };

  const getPredictionColor = (prediction: string) => {
    const p = prediction.toLowerCase();
    if (p.includes('normal')) return '#4CAF50';
    if (p.includes('wheeze') || p.includes('mengi')) return '#FF9800';
    if (p.includes('crackle') || p.includes('ronki')) return '#E91E63';
    return '#FF6B6B';
  };

  return (
    <View className="flex-1 bg-[#8DC5B8]">
      {/* Header with Back & History Buttons */}
      <View className="flex-row items-center justify-between pt-14 px-5 pb-2.5 bg-transparent z-10">
        <Pressable
          onPress={() => router.back()}
          className="p-2 rounded-2xl bg-white/30 items-center justify-center active:opacity-75"
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xl text-white">
          Deteksi Suara Paru
        </Text>
        <Pressable
          onPress={() => router.push('/scan-paru/history')}
          className="p-2 rounded-2xl bg-white/30 items-center justify-center active:opacity-75"
        >
          <Feather name="clock" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-5 pb-6">
        {/* Model Selector Tabs */}
        {!result && !isProcessing && (
          <View className="items-center mb-2.5 w-full">
            <Text
              style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
              className="text-xs text-[#E8F5F2] mb-2"
            >
              Pilih Kategori Deteksi:
            </Text>
            <View className="flex-row bg-white/30 rounded-full p-1 gap-2">
              <Pressable
                className={`flex-row items-center py-2 px-4 rounded-full gap-1.5 ${
                  selectedModel === 'spr' ? 'bg-[#32605E] shadow-sm elevation-3' : ''
                }`}
                disabled={isRecording}
                onPress={() => setSelectedModel('spr')}
              >
                <MaterialCommunityIcons
                  name="waveform"
                  size={18}
                  color={selectedModel === 'spr' ? '#FFFFFF' : '#2C5A56'}
                />
                <Text
                  style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                  className={`text-xs ${
                    selectedModel === 'spr' ? 'text-white' : 'text-[#2C5A56]'
                  }`}
                >
                  Pernafasan
                </Text>
              </Pressable>

              <Pressable
                className={`flex-row items-center py-2 px-4 rounded-full gap-1.5 ${
                  selectedModel === 'icbhi' ? 'bg-[#32605E] shadow-sm elevation-3' : ''
                }`}
                disabled={isRecording}
                onPress={() => setSelectedModel('icbhi')}
              >
                <MaterialCommunityIcons
                  name="database-outline"
                  size={18}
                  color={selectedModel === 'icbhi' ? '#FFFFFF' : '#2C5A56'}
                />
                <Text
                  style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                  className={`text-xs ${
                    selectedModel === 'icbhi' ? 'text-white' : 'text-[#2C5A56]'
                  }`}
                >
                  Batuk
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {result ? (
          /* RESULT SCREEN */
          <View
            className="w-full flex-1 bg-white rounded-3xl shadow-lg elevation-6"
            style={{ maxHeight: height * 0.78 }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', padding: 22, paddingBottom: 36 }}
            >
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-3 shadow-sm elevation-3"
                style={{ backgroundColor: getPredictionColor(result.prediction) }}
              >
                <Feather name="activity" size={28} color="#FFFFFF" />
              </View>

              <View className="bg-[#E8F1F5] px-3 py-1 rounded-xl mb-2">
                <Text
                  style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                  className="text-xs text-[#6CA8C2]"
                >
                  Kategori: {selectedModel === 'spr' ? 'Suara Pernafasan (SPR)' : 'Suara Batuk (ICBHI)'}
                </Text>
              </View>

              <Text
                style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
                className="text-sm text-gray-500 mb-1"
              >
                Hasil Deteksi
              </Text>

              <Text
                style={{
                  fontFamily: 'FuzzyBubbles_700Bold',
                  color: getPredictionColor(result.prediction),
                }}
                className="text-2xl mb-1.5 text-center"
              >
                {result.prediction}
              </Text>

              <Text
                style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                className="text-sm text-[#6CA8C2] mb-5"
              >
                Tingkat Keyakinan: {result.confidence.toFixed(1)}%
              </Text>

              {/* Probabilities Breakdown */}
              {result.all_probabilities && Object.keys(result.all_probabilities).length > 0 && (
                <View className="w-full bg-[#F9FCFB] rounded-2xl p-3.5 mb-5 border border-[#E8F1F5]">
                  <Text
                    style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                    className="text-xs text-gray-600 mb-2.5"
                  >
                    Distribusi Probabilitas:
                  </Text>
                  {Object.entries(result.all_probabilities).map(([className, scoreValue], idx) => {
                    const pct = typeof scoreValue === 'number' ? scoreValue : 0;
                    return (
                      <View key={idx} className="flex-row items-center my-1">
                        <Text
                          style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
                          className="w-[70px] text-xs text-gray-600"
                          numberOfLines={1}
                        >
                          {className}
                        </Text>
                        <View className="flex-1 h-2 bg-[#E8F1F5] rounded-full mx-2.5 overflow-hidden">
                          <View
                            className="h-full bg-[#FFAE9D] rounded-full"
                            style={{ width: `${Math.min(Math.max(pct, 2), 100)}%` }}
                          />
                        </View>
                        <Text
                          style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                          className="w-[38px] text-xs text-[#FFAE9D] text-right"
                        >
                          {pct.toFixed(0)}%
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* LLM Clinical Insights */}
              {llmResult && (
                <View className="w-full bg-[#F7FBFA] p-4 rounded-2xl mb-5 border border-[#E8F1F5]">
                  <View className="flex-row items-center mb-1.5 gap-1.5">
                    <MaterialCommunityIcons name="stethoscope" size={20} color="#6CA8C2" />
                    <Text
                      style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                      className="text-sm text-[#3D7371]"
                    >
                      Analisis Medis AI
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
                    className="text-xs text-gray-600 leading-5 mb-2"
                  >
                    {llmResult.diagnosis}
                  </Text>

                  <View className="flex-row items-center mb-1.5 mt-3 gap-1.5">
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#F0A080" />
                    <Text
                      style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                      className="text-sm text-[#3D7371]"
                    >
                      Rekomendasi Tindakan
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
                    className="text-xs text-gray-600 leading-5"
                  >
                    {llmResult.recommendations}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-3 w-full mt-1">
                <Pressable
                  className="flex-1 flex-row bg-[#E8F1F5] py-3.5 rounded-full items-center justify-center active:opacity-75"
                  onPress={() => {
                    setResult(null);
                    setLlmResult(null);
                    setRecordingSeconds(0);
                  }}
                >
                  <Feather name="refresh-cw" size={18} color="#6CA8C2" style={{ marginRight: 6 }} />
                  <Text
                    style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                    className="text-sm text-[#6CA8C2]"
                  >
                    Rekam Ulang
                  </Text>
                </Pressable>

                {llmResult && (
                  <Pressable
                    className="flex-1 flex-row bg-[#FFAE9D] py-3.5 rounded-full items-center justify-center active:opacity-75 shadow-sm elevation-2"
                    onPress={handleSave}
                  >
                    <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text
                      style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                      className="text-sm text-white"
                    >
                      Simpan Hasil
                    </Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          </View>
        ) : (
          /* DETECTOR SCREEN */
          <View className="items-center justify-center w-full">
            {/* Visual Countdown & Progress Bar */}
            {isRecording && (
              <View className="w-full items-center mb-2.5">
                <View className="flex-row items-center bg-black/30 px-4 py-1.5 rounded-full mb-2">
                  <View className="w-2.5 h-2.5 rounded-full bg-[#FF4D4D] mr-2" />
                  <Text
                    style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                    className="text-sm text-white"
                  >
                    {recordingSeconds.toFixed(1)}s / {MAX_RECORDING_SECONDS.toFixed(1)}s
                  </Text>
                </View>

                {/* Progress bar countdown */}
                <View className="w-[68%] h-1.5 bg-white/35 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-[#FFAE9D] rounded-full"
                    style={{ width: `${(recordingSeconds / MAX_RECORDING_SECONDS) * 100}%` }}
                  />
                </View>
              </View>
            )}

            {/* Mascot Detector Illustration with Sparks */}
            <View
              className="items-center justify-center relative my-2 overflow-visible"
              style={{
                width: Math.min(width * 0.74, 285),
                height: Math.min(width * 0.74, 285) * 1.30,
              }}
            >
              {/* Central Detector Mascot (Base Layer) */}
              <Animated.View
                style={[
                  detectorAnimStyle,
                  { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 2 }
                ]}
              >
                <Image
                  source={require('@/assets/mascot/Detector.svg')}
                  style={{ width: '100%', height: '100%' }}
                  className="w-full h-full"
                  contentFit="contain"
                />
              </Animated.View>

              {/* Top-Left Sparks Cluster (ON TOP of radio) */}
              <Animated.View
                style={[
                  topLeftSparksStyle,
                  {
                    position: 'absolute',
                    top: -28,
                    left: -32,
                    width: 155,
                    height: 125,
                    zIndex: 10,
                    elevation: 10,
                  },
                ]}
                pointerEvents="none"
              >
                <Image
                  source={require('@/assets/images/Effect.svg')}
                  style={{ width: '100%', height: '100%' }}
                  className="w-full h-full"
                  contentFit="contain"
                />
              </Animated.View>

              {/* Bottom-Right Sparks Cluster (ON TOP of radio) */}
              <Animated.View
                style={[
                  bottomRightSparksStyle,
                  {
                    position: 'absolute',
                    bottom: -20,
                    right: -25,
                    width: 150,
                    height: 120,
                    zIndex: 10,
                    elevation: 10,
                  },
                ]}
                pointerEvents="none"
              >
                <Image
                  source={require('@/assets/images/Effect.svg')}
                  style={{ width: '100%', height: '100%' }}
                  className="w-full h-full"
                  contentFit="contain"
                />
              </Animated.View>
            </View>

            {/* Processing Loading Spinner */}
            {isProcessing ? (
              <View className="items-center py-4 mt-2.5">
                <ActivityIndicator size="large" color="#FFFFFF" className="mb-2.5" />
                <Text
                  style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                  className="text-base text-white mb-1"
                >
                  {processingStage || 'Memproses Suara Paru...'}
                </Text>
                <Text
                  style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
                  className="text-xs text-white/85"
                >
                  Menghubungi server FastAPI...
                </Text>
              </View>
            ) : (
              /* Recording Button (Start / Stop) */
              <View className="relative items-center justify-center w-full mt-3.5">
                <Pressable
                  className={`flex-row items-center justify-center py-4 px-9 rounded-full shadow-md elevation-6 min-w-[230px] ${
                    isRecording ? 'bg-[#FF5C5C]' : 'bg-[#FFAE9D]'
                  }`}
                  onPress={isRecording ? stopRecordingAndProcess : startRecording}
                >
                  <Feather
                    name={isRecording ? 'square' : 'mic'}
                    size={24}
                    color="#FFFFFF"
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                    className="text-lg text-white"
                  >
                    {isRecording ? `Hentikan Rekam (${recordingSeconds.toFixed(1)}s)` : 'Mulai Rekam'}
                  </Text>
                </Pressable>

                {/* Animated Pointer Tutorial Hand */}
                {showTutorial && !isRecording && (
                  <Animated.View
                    style={[pointerStyle, { position: 'absolute', bottom: -65, right: 15, zIndex: 20 }]}
                    pointerEvents="none"
                  >
                    <Image
                      source={require('@/assets/mascot/finger.svg')}
                      style={{ width: 140, height: 140 }}
                      contentFit="contain"
                    />
                  </Animated.View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
