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
import { useAuthStore } from '@/store/useAuthStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    FuzzyBubbles_400Regular,
    FuzzyBubbles_700Bold,
  });

  const { token, hydrateAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Load auth state from SecureStore/localStorage on startup
  useEffect(() => {
    const initAuth = async () => {
      await hydrateAuth();
      setIsReady(true);
    };
    initAuth();
  }, []);

  // Hide splash screen when fonts and auth are ready
  useEffect(() => {
    if (fontsLoaded && isReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady]);

  // Handle routing based on auth state
  useEffect(() => {
    if (!isReady || !fontsLoaded) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (token && inAuthGroup) {
      // Redirect to dashboard if user is logged in but tries to access login/register
      router.replace('/dashboard');
    } else if (token && !segments[0]) {
      // Redirect to dashboard if user is on index
      router.replace('/dashboard');
    }
  }, [token, isReady, fontsLoaded, segments]);

  if (!fontsLoaded || !isReady) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: '#9BCEC1' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="register" options={{ animation: 'fade' }} />
        <Stack.Screen name="dashboard" />
      </Stack>
    </>
  );
}
