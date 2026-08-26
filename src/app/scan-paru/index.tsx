import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useAudioStream,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import {
  predictRespiratorySound,
  saveWavFileFromPcm,
  ApiPredictionResult,
  TargetModel,
} from '@/utils/api';
import { analyzeParuSoundResult, ParuAnalysisResult } from '@/utils/paruApi';
import { useParuStore } from '@/store/useParuStore';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';

const { height } = Dimensions.get('window');
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

  // Reanimated Shared Values
  const shakeAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);
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
      } catch {}
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

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${shakeAnim.value}deg` },
      { scale: pulseAnim.value },
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
        } catch {}
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

      // 4. Mascot shake & pulse animation
      shakeAnim.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 80, easing: Easing.linear }),
          withTiming(6, { duration: 80, easing: Easing.linear }),
          withTiming(0, { duration: 80, easing: Easing.linear })
        ),
        -1,
        true
      );

      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 400 }),
          withTiming(1.0, { duration: 400 })
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
    shakeAnim.value = withTiming(0);
    pulseAnim.value = withTiming(1);

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
    <View style={styles.container}>
      {/* Header with Back & History Buttons */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={26} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Deteksi Suara Paru</Text>
        <Pressable
          onPress={() => router.push('/scan-paru/history')}
          style={styles.historyButton}
        >
          <Feather name="clock" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Model Selector Tabs */}
        {!result && !isProcessing && (
          <View style={styles.modelSelectorContainer}>
            <Text style={styles.modelSelectorLabel}>Pilih Kategori Deteksi:</Text>
            <View style={styles.modelButtonsRow}>
              <Pressable
                style={[
                  styles.modelTab,
                  selectedModel === 'spr' && styles.modelTabActive,
                ]}
                disabled={isRecording}
                onPress={() => setSelectedModel('spr')}
              >
                <MaterialCommunityIcons
                  name="waveform"
                  size={18}
                  color={selectedModel === 'spr' ? '#FFFFFF' : '#3D7371'}
                />
                <Text
                  style={[
                    styles.modelTabText,
                    selectedModel === 'spr' && styles.modelTabTextActive,
                  ]}
                >
                  Pernafasan
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modelTab,
                  selectedModel === 'icbhi' && styles.modelTabActive,
                ]}
                disabled={isRecording}
                onPress={() => setSelectedModel('icbhi')}
              >
                <MaterialCommunityIcons
                  name="database-outline"
                  size={18}
                  color={selectedModel === 'icbhi' ? '#FFFFFF' : '#3D7371'}
                />
                <Text
                  style={[
                    styles.modelTabText,
                    selectedModel === 'icbhi' && styles.modelTabTextActive,
                  ]}
                >
                  Batuk
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {result ? (
          /* RESULT SCREEN */
          <View style={styles.resultContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultScrollContent}
            >
              <View
                style={[
                  styles.diagnosisBadge,
                  { backgroundColor: getPredictionColor(result.prediction) },
                ]}
              >
                <Feather name="activity" size={28} color="#FFFFFF" />
              </View>

              <View style={styles.modelUsedBadge}>
                <Text style={styles.modelUsedBadgeText}>
                  Kategori: {selectedModel === 'spr' ? 'Suara Pernafasan (SPR)' : 'Suara Batuk (ICBHI)'}
                </Text>
              </View>

              <Text style={styles.resultTitle}>Hasil Deteksi</Text>

              <Text
                style={[
                  styles.primaryDiagnosis,
                  { color: getPredictionColor(result.prediction) },
                ]}
              >
                {result.prediction}
              </Text>

              <Text style={styles.confidenceText}>
                Tingkat Keyakinan: {result.confidence.toFixed(1)}%
              </Text>

              {/* Probabilities Breakdown */}
              {result.all_probabilities && Object.keys(result.all_probabilities).length > 0 && (
                <View style={styles.scoresContainer}>
                  <Text style={styles.scoresTitle}>Distribusi Probabilitas:</Text>
                  {Object.entries(result.all_probabilities).map(([className, scoreValue], idx) => {
                    const pct = typeof scoreValue === 'number' ? scoreValue : 0;
                    return (
                      <View key={idx} style={styles.scoreRow}>
                        <Text style={styles.scoreLabel} numberOfLines={1}>
                          {className}
                        </Text>
                        <View style={styles.progressBarBg}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${Math.min(Math.max(pct, 2), 100)}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.scoreValue}>{pct.toFixed(0)}%</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* LLM Clinical Insights */}
              {llmResult && (
                <View style={styles.llmSection}>
                  <View style={styles.llmHeaderRow}>
                    <MaterialCommunityIcons name="stethoscope" size={20} color="#6CA8C2" />
                    <Text style={styles.llmTitle}>Analisis Medis AI</Text>
                  </View>
                  <Text style={styles.llmText}>{llmResult.diagnosis}</Text>

                  <View style={[styles.llmHeaderRow, { marginTop: 12 }]}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#F0A080" />
                    <Text style={styles.llmTitle}>Rekomendasi Tindakan</Text>
                  </View>
                  <Text style={styles.llmText}>{llmResult.recommendations}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Pressable
                  style={styles.resetButton}
                  onPress={() => {
                    setResult(null);
                    setLlmResult(null);
                    setRecordingSeconds(0);
                  }}
                >
                  <Feather name="refresh-cw" size={18} color="#6CA8C2" style={{ marginRight: 6 }} />
                  <Text style={styles.resetButtonText}>Rekam Ulang</Text>
                </Pressable>

                {llmResult && (
                  <Pressable style={styles.saveButton} onPress={handleSave}>
                    <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.saveButtonText}>Simpan Hasil</Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          </View>
        ) : (
          /* DETECTOR SCREEN */
          <View style={styles.detectorSection}>
            {/* Visual Countdown & Progress Bar */}
            {isRecording && (
              <View style={styles.timerContainer}>
                <View style={styles.timerBadge}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.timerText}>
                    {recordingSeconds.toFixed(1)}s / {MAX_RECORDING_SECONDS.toFixed(1)}s
                  </Text>
                </View>

                {/* Progress bar countdown */}
                <View style={styles.timerBarTrack}>
                  <View
                    style={[
                      styles.timerBarFill,
                      { width: `${(recordingSeconds / MAX_RECORDING_SECONDS) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Mascot Detector Illustration */}
            <Animated.View style={[styles.detectorWrapper, shakeStyle]}>
              {isRecording && (
                <Image
                  source={require('@/assets/images/Effect.svg')}
                  style={styles.effectImage}
                  contentFit="contain"
                />
              )}
              <Image
                source={require('@/assets/mascot/Detector.svg')}
                style={styles.detectorImage}
                contentFit="contain"
              />
            </Animated.View>

            {/* Processing Loading Spinner */}
            {isProcessing ? (
              <View style={styles.processingState}>
                <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
                <Text style={styles.processingText}>{processingStage || 'Memproses Suara Paru...'}</Text>
                <Text style={styles.processingSubText}>Menghubungi server FastAPI...</Text>
              </View>
            ) : (
              /* Recording Button (Start / Stop) */
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.recordButton,
                    isRecording && styles.recordButtonActive,
                  ]}
                  onPress={isRecording ? stopRecordingAndProcess : startRecording}
                >
                  <Feather
                    name={isRecording ? 'square' : 'mic'}
                    size={24}
                    color="#FFFFFF"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.recordButtonText}>
                    {isRecording ? `Hentikan Rekam (${recordingSeconds.toFixed(1)}s)` : 'Mulai Rekam'}
                  </Text>
                </Pressable>

                {/* Animated Pointer Tutorial Hand */}
                {showTutorial && !isRecording && (
                  <Animated.View style={[styles.pointerHand, pointerStyle]} pointerEvents="none">
                    <Image
                      source={require('@/assets/mascot/finger.svg')}
                      style={{ width: 150, height: 150 }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#95C1B6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  historyButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  modelSelectorContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  modelSelectorLabel: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 14,
    color: '#EAF5F2',
    marginBottom: 8,
  },
  modelButtonsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 24,
    padding: 4,
    gap: 8,
  },
  modelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  modelTabActive: {
    backgroundColor: '#3D7371',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modelTabText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 13,
    color: '#3D7371',
  },
  modelTabTextActive: {
    color: '#FFFFFF',
  },
  detectorSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
    marginRight: 8,
  },
  timerText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  timerBarTrack: {
    width: '70%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: '#FFAE9D',
    borderRadius: 3,
  },
  detectorWrapper: {
    width: 280,
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 30,
  },
  detectorImage: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  effectImage: {
    position: 'absolute',
    width: 420,
    height: 480,
    zIndex: 1,
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFAE9D',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 35,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    minWidth: 240,
  },
  recordButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  recordButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  pointerHand: {
    position: 'absolute',
    bottom: -70,
    right: 10,
    zIndex: 20,
  },
  processingState: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  spinner: {
    marginBottom: 10,
  },
  processingText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 17,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  processingSubText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  resultContainer: {
    width: '100%',
    flex: 1,
    maxHeight: height * 0.78,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  resultScrollContent: {
    alignItems: 'center',
    padding: 22,
    paddingBottom: 36,
  },
  diagnosisBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modelUsedBadge: {
    backgroundColor: '#E8F1F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  modelUsedBadgeText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 12,
    color: '#6CA8C2',
  },
  resultTitle: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 15,
    color: '#777',
    marginBottom: 4,
  },
  primaryDiagnosis: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 26,
    marginBottom: 6,
    textAlign: 'center',
  },
  confidenceText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 15,
    color: '#6CA8C2',
    marginBottom: 20,
  },
  scoresContainer: {
    width: '100%',
    backgroundColor: '#F9FCFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8F1F5',
  },
  scoresTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  scoreLabel: {
    width: 70,
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 12,
    color: '#555',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8F1F5',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFAE9D',
    borderRadius: 4,
  },
  scoreValue: {
    width: 38,
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 12,
    color: '#FFAE9D',
    textAlign: 'right',
  },
  llmSection: {
    width: '100%',
    backgroundColor: '#F7FBFA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8F1F5',
  },
  llmHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  llmTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 15,
    color: '#3D7371',
  },
  llmText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E8F1F5',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 15,
    color: '#6CA8C2',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFAE9D',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
