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

function AuthNavigationGuard({ isReady, fontsLoaded }: { isReady: boolean; fontsLoaded: boolean }) {
  const token = useAuthStore((state) => state.token);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady || !fontsLoaded) return;

    const inAuthGroup = [
      'login', 'register', 'register-name', 'pilih-gender', 
      'confirm-gender', 'register-body', 'register-health', 'welcome'
    ].includes(segments[0]);
    
    const isProtected = segments[0] === 'dashboard';

    if (token && inAuthGroup) {
      router.replace('/dashboard');
    } else if (!token && isProtected) {
      router.replace('/login');
    }
  }, [token, isReady, fontsLoaded, segments]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    FuzzyBubbles_400Regular,
    FuzzyBubbles_700Bold,
  });

  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);
  const [isReady, setIsReady] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

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
  }, [hydrateAuth]);

  // Hide native splash screen when fonts, assets, and auth are all ready
  useEffect(() => {
    if (fontsLoaded && isReady && assetsLoaded) {
      SplashScreen.hideAsync();
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, isReady, assetsLoaded]);

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
      <AuthNavigationGuard isReady={isReady} fontsLoaded={fontsLoaded} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'default',
          contentStyle: { backgroundColor: '#9BCEC1' },
        }}
      >
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
