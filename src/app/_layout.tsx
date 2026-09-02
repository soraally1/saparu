import '../../global.css';
import {
  FuzzyBubbles_400Regular,
  FuzzyBubbles_700Bold,
  useFonts,
} from '@expo-google-fonts/fuzzy-bubbles';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { preloadAppAssets } from '@/utils/assetPreloader';

import { Image } from 'expo-image';
import Animated, { FadeOut } from 'react-native-reanimated';
import DueScheduleReminderModal from '@/components/DueScheduleReminderModal';
import { requestNotificationPermission } from '@/utils/notificationService';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    FuzzyBubbles_400Regular,
    FuzzyBubbles_700Bold,
  });

  const { token, hydrateAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // Load auth state, preload all image/SVG assets, and request notification permissions on startup
  useEffect(() => {
    const initApp = async () => {
      try {
        await Promise.all([
          hydrateAuth(),
          preloadAppAssets(),
          requestNotificationPermission(),
        ]);
      } finally {
        setAssetsLoaded(true);
        setIsReady(true);
      }
    };
    initApp();
  }, []);

  // Hide native splash screen when fonts, assets, and auth are all ready
  useEffect(() => {
    if (fontsLoaded && isReady && assetsLoaded) {
      SplashScreen.hideAsync();
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, isReady, assetsLoaded]);

  // Handle routing based on auth state
  useEffect(() => {
    if (!isReady || !fontsLoaded) return;

    // Define auth-related screens that logged-in users shouldn't see
    const inAuthGroup = [
      'login', 'register', 'register-name', 'pilih-gender', 
      'confirm-gender', 'register-body', 'register-health', 'welcome'
    ].includes(segments[0]);
    
    // Define protected screens that unauthenticated users shouldn't see
    const isProtected = segments[0] === 'dashboard';

    if (token && inAuthGroup) {
      // If user is logged in and trying to access an auth screen, redirect to dashboard
      router.replace('/dashboard');
    } else if (!token && isProtected) {
      // If user is not logged in and trying to access a protected screen, redirect to login
      router.replace('/login');
    }
  }, [token, isReady, assetsLoaded, fontsLoaded, segments]);

  if (!fontsLoaded || !isReady || !assetsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#9BCEC1', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="dark" />
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={{ width: 240, height: 190 }}
          contentFit="contain"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#9BCEC1' }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: '#9BCEC1' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" options={{ animation: 'none' }} />
        <Stack.Screen name="register" options={{ animation: 'none' }} />
        <Stack.Screen name="register-name" />
        <Stack.Screen name="pilih-gender" />
        <Stack.Screen name="confirm-gender" />
        <Stack.Screen name="register-body" />
        <Stack.Screen name="register-health" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="konsultasi-dokter" />
        <Stack.Screen name="dokter-list" />
        <Stack.Screen name="rute-bunda" />
        <Stack.Screen name="jadwal-obat" />
        <Stack.Screen name="tambah-obat" />
        <Stack.Screen name="rekomendasi-obat-ai" />
        <Stack.Screen name="obat" />
        <Stack.Screen name="apotik" />
        <Stack.Screen name="apotik-detail" />
        <Stack.Screen name="rumah-sakit-detail" />
      </Stack>

      {/* Global Due Schedule & Medication In-App Reminder Modal */}
      <DueScheduleReminderModal />

      {/* Branded Full-Screen Splash Screen Overlay */}
      {showSplash && (
        <Animated.View
          exiting={FadeOut.duration(400)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#9BCEC1',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999,
          }}
        >
          <Image
            source={require('@/assets/images/splash-icon.png')}
            style={{ width: 240, height: 190 }}
            contentFit="contain"
          />
        </Animated.View>
      )}
    </View>
  );
}
