import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

// ─── Warna Saparu ─────────────────────────────────────────────
const C = {
  bg: '#9BCEC1',
  card: '#FDE3E7',
  pink: '#D4819A',
  rose: '#C1607A',
  deep: '#D4608A',
  placeholder: '#C8A0AE',
  text: '#7D3E50',
  muted: '#C07088',
  btn: '#F0A080',
};


// ─── Screen ───────────────────────────────────────────────────
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { ActivityIndicator, Alert } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Harap isi email dan password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.status === 200) {
        const { token, patient } = response.data;
        await setAuth(token, patient);

        // Redirect ke halaman welcome sementara
        router.replace({ pathname: '/welcome', params: { source: 'login' } });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Email atau password salah';
      Alert.alert('Gagal Login', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateRegister = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.replace('/register');
    }, 400);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-saparu-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end' }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View className="w-full max-w-[480px] items-center">
          {isVisible && (
            <Animated.View
              className="w-full items-center"
              entering={SlideInDown.duration(400)}
              exiting={SlideOutDown.duration(400)}
            >
              {/* Mascot — overlaps card from top */}
              <View className="items-center z-[100] -mb-10">
                <Image
                  source={require('@/assets/images/axolot.svg')}
                  style={{ width: 240, height: 220 }}
                  contentFit="contain"
                />
              </View>

              {/* Card */}
              <View
                className="w-full bg-saparu-card items-center"
                style={{
                  borderTopLeftRadius: 50,
                  borderTopRightRadius: 50,
                  paddingHorizontal: 28,
                  paddingTop: 44,
                  marginTop: -10,
                  paddingBottom: 28,
                }}>

        {/* Title */}
        <Text
        className="text-[32px] font-fuzzy-bold"
        style={{
          color: "#FFB6A6",
          textShadowColor: "#BFA4A6",
          textShadowOffset: { width: 2.5, height: 1 },
          textShadowRadius: 0,
        }}
      >
      Log in on
      <Text
        className="text-saparu-rose px-3 font-fuzzy-bold"
        style={{ color: '#9BCEC1' }}>
        Saparu
      </Text>
      </Text>

                {/* Email Input */}
                <View
                  className="flex-row items-center bg-white w-full mb-3"
                  style={{
                    borderRadius: 44,
                    paddingHorizontal: 16,
                    height: 52,

                  }}>
                  <View className="mr-[10px] justify-center items-center">
                    <Feather name="mail" size={20} color="#C49BAA" />
                  </View>
                  <TextInput
                    className="flex-1 text-saparu-text font-fuzzy text-[14px]"
                    placeholder="Email"
                    placeholderTextColor={C.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                {/* Password Input */}
                <View
                  className="flex-row items-center bg-white w-full mb-3"
                  style={{
                    borderRadius: 44,
                    paddingHorizontal: 16,
                    height: 52,

                  }}>
                  <View className="mr-[10px] justify-center items-center">
                    <Feather name="lock" size={20} color="#C49BAA" />
                  </View>
                  <TextInput
                    className="flex-1 text-saparu-text font-fuzzy text-[14px]"
                    placeholder="Password"
                    placeholderTextColor={C.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#C49BAA" />
                  </Pressable>
                </View>

                {/* Forgot Password */}
                <Pressable className="self-start ml-[6px] mb-4 -mt-1">
                  <Text className="text-saparu-muted font-fuzzy text-[13px]">
                    Forget Password?
                  </Text>
                </Pressable>

                {/* Login Button */}
                <Pressable
                  className={`w-full items-center mb-4 ${isLoading ? 'opacity-70' : ''}`}
                  style={{
                    backgroundColor: C.btn,
                    borderRadius: 999,
                    paddingVertical: 16,
                  }}
                  disabled={isLoading}
                  onPress={handleLogin}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-fuzzy-bold text-[18px] tracking-[5px]">
                      L o g i n
                    </Text>
                  )}
                </Pressable>

                {/* Sign Up Link */}
                <View className="items-center gap-[2px]">
                  <Text className="text-saparu-muted font-fuzzy text-[13px]">
                    Didn't have an account?
                  </Text>
                  <Pressable onPress={handleNavigateRegister} disabled={isLoading}>
                    <Text className="text-saparu-rose font-fuzzy-bold text-[13px]">
                      Sign Up
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
