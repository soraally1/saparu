import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const VIEWFINDER_WIDTH = width * 0.82;
const VIEWFINDER_HEIGHT = height * 0.46;

export default function ScanRoentgenScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Animated Scanline
  const scanLineAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    // Scan line moving vertically back and forth
    scanLineAnim.value = withRepeat(
      withSequence(
        withTiming(VIEWFINDER_HEIGHT - 8, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    // Subtle pulse animation on viewfinder corners
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineAnim.value }],
  }));

  const viewfinderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  // Handle capture picture
  const handleCapture = async () => {
    if (cameraRef && !isProcessing) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: false,
        });

        if (photo?.uri) {
          router.push({
            pathname: '/scan-roentgen/result',
            params: {
              imageUri: photo.uri,
              imageBase64: photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : '',
            },
          });
        }
      } catch (e) {
        console.error('Camera error:', e);
        Alert.alert('Gagal Mengambil Foto', 'Terjadi kesalahan saat mengambil foto dari kamera.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handle pick from gallery
  const handlePickImage = async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
        aspect: [4, 5],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        router.push({
          pathname: '/scan-roentgen/result',
          params: {
            imageUri: asset.uri,
            imageBase64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : '',
          },
        });
      }
    } catch (e) {
      console.error('Gallery error:', e);
      Alert.alert('Error', 'Gagal memilih foto dari galeri.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle flash torch
  const toggleTorch = () => {
    setTorchEnabled((prev) => !prev);
  };

  // Permission Checking State
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6CA8C2" />
        <Text style={styles.loadingText}>Menyiapkan kamera...</Text>
      </View>
    );
  }

  // Permission Denied State
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconCircle}>
            <MaterialCommunityIcons name="camera-lock" size={44} color="#6CA8C2" />
          </View>
          <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
          <Text style={styles.permissionDescription}>
            Aplikasi Saparu memerlukan akses kamera untuk memindai dan menganalisis foto rontgen dada
            secara akurat.
          </Text>

          <Pressable onPress={requestPermission} style={styles.permissionButton}>
            <Feather name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.permissionButtonText}>Izinkan Akses Kamera</Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.permissionBackButton}>
            <Text style={styles.permissionBackText}>Kembali ke Dashboard</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Camera Live View */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchEnabled}
        ref={(ref) => setCameraRef(ref)}
      />

      {/* Dark Overlay with Viewfinder Mask */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]}>
        {/* Top Floating Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerIconButton}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Scan Rontgen Dada</Text>
            <Text style={styles.headerSubtitle}>Posisikan rontgen di dalam bingkai</Text>
          </View>

          <Pressable
            onPress={() => router.push('/scan-roentgen/history')}
            style={styles.headerIconButton}
          >
            <Feather name="clock" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Viewfinder Target Area */}
        <Animated.View style={[styles.viewfinderWrapper, viewfinderAnimatedStyle]}>
          {/* 4 Corner Markers */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {/* Center Crosshair / Grid lines */}
          <View style={styles.crosshairCenter}>
            <View style={styles.crosshairHorizontal} />
            <View style={styles.crosshairVertical} />
          </View>

          {/* Animated Laser Scanline */}
          <Animated.View style={[styles.scanLine, scanLineStyle]}>
            <View style={styles.scanLineGlow} />
          </Animated.View>
        </Animated.View>

        {/* Tip Badge below Viewfinder */}
        <View style={styles.tipBadge}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color="#FFD166" />
          <Text style={styles.tipText}>Posisikan foto tegak & hindari pantulan cahaya</Text>
        </View>

        {/* Bottom Floating Control Bar */}
        <View style={styles.bottomControlsContainer}>
          {/* Torch / Flash Toggle */}
          <Pressable
            style={[
              styles.controlIconButton,
              torchEnabled && styles.controlIconButtonActive,
            ]}
            onPress={toggleTorch}
          >
            <Ionicons
              name={torchEnabled ? 'flash' : 'flash-off-outline'}
              size={24}
              color={torchEnabled ? '#FFD166' : '#FFFFFF'}
            />
            <Text style={styles.controlIconText}>{torchEnabled ? 'Flash On' : 'Flash'}</Text>
          </Pressable>

          {/* Main Shutter Capture Button */}
          <Pressable
            style={[styles.captureOuterRing, isProcessing && { opacity: 0.6 }]}
            onPress={handleCapture}
            disabled={isProcessing}
          >
            <View style={styles.captureInnerCircle}>
              {isProcessing ? (
                <ActivityIndicator color="#6CA8C2" size="small" />
              ) : (
                <Feather name="camera" size={28} color="#6CA8C2" />
              )}
            </View>
          </Pressable>

          {/* Gallery Picker Button */}
          <Pressable style={styles.controlIconButton} onPress={handlePickImage} disabled={isProcessing}>
            <Feather name="image" size={24} color="#FFFFFF" />
            <Text style={styles.controlIconText}>Galeri</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#95C1B6',
  },
  loadingText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#95C1B6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  permissionIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  permissionTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 20,
    color: '#2D4A47',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionDescription: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFAE9D',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    width: '100%',
    marginBottom: 12,
    elevation: 3,
  },
  permissionButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  permissionBackButton: {
    paddingVertical: 8,
  },
  permissionBackText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 14,
    color: '#6CA8C2',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 12,
    color: '#E0F2EE',
    marginTop: 2,
  },
  viewfinderWrapper: {
    width: VIEWFINDER_WIDTH,
    height: VIEWFINDER_HEIGHT,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: '#95C1B6',
    zIndex: 2,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  crosshairCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  crosshairVertical: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#FFFFFF',
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#95C1B6',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3,
    shadowColor: '#95C1B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  scanLineGlow: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(149, 193, 182, 0.25)',
    position: 'absolute',
    top: -4,
  },
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tipText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  bottomControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 30,
  },
  controlIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  controlIconButtonActive: {
    opacity: 1,
  },
  controlIconText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 4,
  },
  captureOuterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  captureInnerCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
