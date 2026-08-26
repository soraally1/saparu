import { useRegistrationStore } from '@/store/useRegistrationStore';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInDown, SlideOutDown, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

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

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Harap isi semua kolom');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password dan Confirm Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    try {
      // Simpan credentials ke dalam store, pendaftaran aslinya di akhir (register-health)
      useRegistrationStore.getState().updateData({
        email: email,
        password: password,
        full_name: fullName,
      });

      router.replace({ pathname: '/welcome', params: { source: 'register' } });
    } catch (error: any) {
      console.error('Register store error:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan data sementara');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateLogin = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.replace('/login');
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
              {/* Mascot — peeking from top of card */}
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
                  paddingBottom: Math.max(insets.bottom + 28, 56),
                }}>

                <Text className="text-saparu-deep text-center mb-[2px] font-fuzzy-bold text-[22px]">
                  Halo Bunda
                </Text>
                <Text className="text-saparu-deep text-center mb-5 font-fuzzy text-[17px]">
                  Daftar ke Saparu
                </Text>

                {/* Full Name Input */}
                <View
                  className="flex-row items-center bg-white w-full mb-3"
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    height: 52,

                  }}>
                  <View className="mr-[10px] justify-center items-center">
                    <Feather name="user" size={20} color="#C49BAA" />
                  </View>
                  <TextInput
                    className="flex-1 text-saparu-text font-fuzzy text-[14px]"
                    placeholder="Nama Lengkap"
                    placeholderTextColor={C.placeholder}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>

                {/* Email Input */}
                <View
                  className="flex-row items-center bg-white w-full mb-3"
                  style={{
                    borderRadius: 999,
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
                    borderRadius: 999,
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

                {/* Confirm Password Input */}
                <View
                  className="flex-row items-center bg-white w-full mb-3"
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 16,
                    height: 52,

                  }}>
                  <View className="mr-[10px] justify-center items-center">
                    <Feather name="lock" size={20} color="#C49BAA" />
                  </View>
                  <TextInput
                    className="flex-1 text-saparu-text font-fuzzy text-[14px]"
                    placeholder="Confirm Password"
                    placeholderTextColor={C.placeholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={10}>
                    <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#C49BAA" />
                  </Pressable>
                </View>

                {/* Register Button */}
                <Pressable
                  className={`w-full items-center mt-[6px] mb-4 ${isLoading ? 'opacity-70' : ''}`}
                  style={{
                    backgroundColor: C.btn,
                    borderRadius: 999,
                    paddingVertical: 16,

                  }}
                  disabled={isLoading}
                  onPress={handleRegister}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-fuzzy-bold text-[18px] tracking-[5px]">
                      R e g i s t e r
                    </Text>
                  )}
                </Pressable>

                {/* Login Link */}
                <View className="items-center gap-[4px] mt-1 mb-2">
                  <Text className="text-saparu-muted font-fuzzy text-[13px]">
                    Already have account?
                  </Text>
                  <Pressable onPress={handleNavigateLogin} disabled={isLoading} hitSlop={12} className="py-1 px-3">
                    <Text className="text-saparu-rose font-fuzzy-bold text-[14px]">
                      Login Here
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

