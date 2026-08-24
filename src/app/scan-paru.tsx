import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useAudioRecorder, requestRecordingPermissionsAsync, setAudioModeAsync, RecordingOptions } from 'expo-audio';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { predictRespiratorySound, ApiPredictionResult } from '@/utils/api';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

const customRecordingOptions: RecordingOptions = {
  isMeteringEnabled: true,
  extension: '.wav',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 256000,
  android: {
    extension: '.wav',
    outputFormat: 'default',
    audioEncoder: 'default',
    sampleRate: 16000,
  },
  ios: {
    extension: '.wav',
    outputFormat: 'lpcm',
    audioQuality: 127,
    sampleRate: 16000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  }
};

export default function ScanParuScreen() {
  const router = useRouter();
  const recorder = useAudioRecorder(customRecordingOptions);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ApiPredictionResult | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const shakeAnim = useSharedValue(0);
  const pointerAnimY = useSharedValue(100);
  const pointerScale = useSharedValue(1);
  const pointerOpacity = useSharedValue(0);

  useEffect(() => {
    // Check if tutorial has been seen
    const checkTutorial = async () => {
      try {
        const hasSeen = await SecureStore.getItemAsync('hasSeenScanTutorial2');
        if (!hasSeen) {
          setShowTutorial(true);
        }
      } catch (e) {
        setShowTutorial(true);
      }
    };
    checkTutorial();
  }, []);

  useEffect(() => {
    if (showTutorial && !isRecording && !isProcessing && !result) {
      pointerAnimY.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 400 }), // hold position while clicking
          withTiming(100, { duration: 500, easing: Easing.in(Easing.ease) }),
          withTiming(100, { duration: 500 }) // pause before next loop
        ),
        -1,
        false
      );
      pointerScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }), // wait while moving up
          withTiming(0.8, { duration: 200 }), // press down
          withTiming(1, { duration: 200 }), // release
          withTiming(1, { duration: 1000 }) // wait during fade out and pause
        ),
        -1,
        false
      );
      pointerOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }), // fade in while moving up
          withTiming(1, { duration: 800 }), // hold opacity
          withTiming(0, { duration: 500 }), // fade out while moving down
          withTiming(0, { duration: 500 }) // pause
        ),
        -1,
        false
      );
    } else {
      pointerOpacity.value = withTiming(0);
    }
  }, [showTutorial, isRecording, isProcessing, result]);

  const pointerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: pointerAnimY.value },
        { scale: pointerScale.value }
      ],
      opacity: pointerOpacity.value,
    };
  });

  const shakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${shakeAnim.value}deg` }],
    };
  });

  const startRecording = async () => {
    try {
      if (showTutorial) {
        setShowTutorial(false);
        try {
          await SecureStore.setItemAsync('hasSeenScanTutorial2', 'true');
        } catch (e) {}
      }

      setResult(null); // Clear previous result
      const permission = await requestRecordingPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Aplikasi membutuhkan akses mikrofon untuk mendeteksi suara paru-paru.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);

      // Start Shake Animation (Rotate back and forth)
      shakeAnim.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 60, easing: Easing.linear }),
          withTiming(8, { duration: 60, easing: Easing.linear }),
          withTiming(0, { duration: 60, easing: Easing.linear })
        ),
        -1,
        true
      );

      // Auto stop after 5 seconds
      setTimeout(async () => {
        await stopRecordingAndProcess();
      }, 5000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Gagal memulai rekaman.');
    }
  };

  const stopRecordingAndProcess = async () => {
    setIsRecording(false);
    shakeAnim.value = withTiming(0);
    setIsProcessing(true);

    try {
      await recorder.stop();
      const uri = recorder.uri;
      console.log('Recording stopped and stored at', uri);
      
      if (!uri) throw new Error('URI not found');

      // Panggil Vercel API Backend (Menggunakan model SPRSound secara default)
      const predictionResponse = await predictRespiratorySound(uri, 'spr');
      
      setResult(predictionResponse);
      
    } catch (error) {
      console.error('Failed to process recording via API', error);
      Alert.alert('Error API', 'Gagal menghubungi server untuk memproses suara paru-paru. Pastikan internet Anda lancar.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button Floating */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.content}>
        {result ? (
          <View style={styles.resultContainer}>
            <View style={styles.diagnosisBadge}>
              <Feather name="activity" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.resultTitle}>Hasil Deteksi</Text>
            
            <Text style={styles.primaryDiagnosis}>
              {result.prediction}
            </Text>
            
            <Text style={styles.confidenceText}>
              Akurasi: {result.confidence.toFixed(1)}%
            </Text>

            <View style={styles.scoresContainer}>
              {Object.entries(result.all_probabilities).map(([className, scoreValue], idx) => (
                <View key={idx} style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>{className}</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.max(scoreValue, 2)}%` }]} />
                  </View>
                  <Text style={styles.scoreValue}>{scoreValue.toFixed(0)}%</Text>
                </View>
              ))}
            </View>
            
            <Pressable style={styles.resetButton} onPress={() => setResult(null)}>
              <Text style={styles.resetButtonText}>Rekam Ulang</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.detectorSection}>
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

            {isProcessing ? (
              <View style={styles.processingState}>
                <Feather name="loader" size={32} color="#FFFFFF" style={styles.spinner} />
                <Text style={styles.processingText}>Menganalisis Suara...</Text>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <Pressable 
                  style={[styles.recordButton, isRecording && styles.recordButtonActive]} 
                  onPress={isRecording ? undefined : startRecording}
                  disabled={isRecording}
                >
                  <Text style={styles.recordButtonText}>
                    {isRecording ? 'Merekam...' : 'Mulai Rekam'}
                  </Text>
                </Pressable>
                
                {showTutorial && !isRecording && (
                  <Animated.View style={[styles.pointerHand, pointerStyle]} pointerEvents="none">
                    <Image 
                      source={require('@/assets/mascot/finger.svg')} 
                      style={{ width: 160, height: 160 }} 
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  detectorSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  detectorWrapper: {
    width: 320,
    height: 420,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 50,
  },
  detectorImage: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  effectImage: {
    position: 'absolute',
    width: 450,
    height: 550,
    zIndex: 1,
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  recordButton: {
    backgroundColor: '#FFAE9D',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 40,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  recordButtonActive: {
    backgroundColor: '#E59A8B',
    transform: [{ scale: 0.95 }],
  },
  recordButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  pointerHand: {
    position: 'absolute',
    bottom: -80,
    right: -20,
    zIndex: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  processingState: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  spinner: {
    marginBottom: 8,
  },
  processingText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  resultContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  diagnosisBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6CA8C2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 16,
    color: '#777',
    marginBottom: 4,
  },
  primaryDiagnosis: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 28,
    color: '#FF6B6B',
    marginBottom: 8,
    textAlign: 'center',
  },
  confidenceText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 16,
    color: '#6CA8C2',
    marginBottom: 24,
  },
  scoresContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 30,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    width: 60,
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 12,
    color: '#555',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8F1F5',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F0A080',
    borderRadius: 4,
  },
  scoreValue: {
    width: 40,
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 12,
    color: '#F0A080',
    textAlign: 'right',
  },
  resetButton: {
    backgroundColor: '#F0A080',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  resetButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  }
});
