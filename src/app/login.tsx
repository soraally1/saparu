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
import { Image } from 'expo-image';
import Svg, { Path, G } from 'react-native-svg';

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

// ─── SVG Icon Components ──────────────────────────────────────
function UserIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 29 29" fill="none">
      <Path
        d="M8.92957 19.9846C7.25175 18.8014 5.99422 17.1148 5.33917 15.169C4.68411 13.2233 4.66556 11.1195 5.2862 9.16249C5.90684 7.2055 7.13443 5.49692 8.79112 4.28432C10.4478 3.07172 12.4475 2.41806 14.5006 2.41806C16.5536 2.41806 18.5534 3.07172 20.2101 4.28432C21.8668 5.49692 23.0943 7.2055 23.715 9.16249C24.3356 11.1195 24.3171 13.2233 23.662 15.169C23.007 17.1148 21.7494 18.8014 20.0716 19.9846L22.5886 25.7363C22.629 25.8283 22.6458 25.929 22.6375 26.0292C22.6291 26.1295 22.5959 26.226 22.5408 26.3101C22.4857 26.3942 22.4105 26.4633 22.322 26.511C22.2335 26.5587 22.1345 26.5836 22.0339 26.5833H6.96603C6.86563 26.5835 6.76679 26.5586 6.67842 26.511C6.59005 26.4633 6.51494 26.3944 6.45989 26.3104C6.40484 26.2265 6.37158 26.1301 6.36312 26.0301C6.35465 25.9301 6.37125 25.8295 6.4114 25.7375L8.92957 19.9846ZM17.0677 19.1472L18.6772 18.0102C19.9359 17.123 20.8795 15.8581 21.3712 14.3988C21.8628 12.9394 21.877 11.3614 21.4117 9.8934C20.9464 8.42543 20.0257 7.14375 18.7831 6.2341C17.5405 5.32446 16.0406 4.83411 14.5006 4.83411C12.9606 4.83411 11.4607 5.32446 10.2181 6.2341C8.97548 7.14375 8.05481 8.42543 7.58949 9.8934C7.12416 11.3614 7.13836 12.9394 7.63001 14.3988C8.12166 15.8581 9.06523 17.123 10.324 18.0102L11.9323 19.1472L9.73674 24.1667H19.2632L17.0677 19.1472ZM9.81044 13.2554L12.1546 12.6694C12.2847 13.193 12.5863 13.6581 13.0113 13.9904C13.4364 14.3228 13.9604 14.5034 14.5 14.5034C15.0396 14.5034 15.5636 14.3228 15.9886 13.9904C16.4137 13.6581 16.7153 13.193 16.8454 12.6694L19.1895 13.2554C18.9267 14.3 18.3225 15.2269 17.473 15.8892C16.6235 16.5514 15.5771 16.911 14.5 16.911C13.4228 16.911 12.3765 16.5514 11.527 15.8892C10.6774 15.2269 10.0733 14.3 9.81044 13.2554Z"
        fill="#C49BAA"
      />
    </Svg>
  );
}

function PassIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 19 25" fill="none">
      <Path
        d="M9.33333 18.6667C8.71449 18.6667 8.121 18.4208 7.68342 17.9832C7.24583 17.5457 7 16.9522 7 16.3333C7 15.0383 8.03833 14 9.33333 14C9.95217 14 10.5457 14.2458 10.9832 14.6834C11.4208 15.121 11.6667 15.7145 11.6667 16.3333C11.6667 16.9522 11.4208 17.5457 10.9832 17.9832C10.5457 18.4208 9.95217 18.6667 9.33333 18.6667ZM16.3333 22.1667V10.5H2.33333V22.1667H16.3333ZM16.3333 8.16667C16.9522 8.16667 17.5457 8.4125 17.9832 8.85008C18.4208 9.28767 18.6667 9.88116 18.6667 10.5V22.1667C18.6667 22.7855 18.4208 23.379 17.9832 23.8166C17.5457 24.2542 16.9522 24.5 16.3333 24.5H2.33333C1.71449 24.5 1.121 24.2542 0.683417 23.8166C0.245833 23.379 0 22.7855 0 22.1667V10.5C0 9.205 1.03833 8.16667 2.33333 8.16667H3.5V5.83333C3.5 4.28624 4.11458 2.80251 5.20854 1.70854C6.30251 0.614582 7.78624 0 9.33333 0C10.0994 0 10.8579 0.150884 11.5657 0.444036C12.2734 0.737189 12.9164 1.16687 13.4581 1.70854C13.9998 2.25022 14.4295 2.89328 14.7226 3.60101C15.0158 4.30875 15.1667 5.06729 15.1667 5.83333V8.16667H16.3333ZM9.33333 2.33333C8.40508 2.33333 7.51484 2.70208 6.85846 3.35846C6.20208 4.01484 5.83333 4.90508 5.83333 5.83333V8.16667H12.8333V5.83333C12.8333 4.90508 12.4646 4.01484 11.8082 3.35846C11.1518 2.70208 10.2616 2.33333 9.33333 2.33333Z"
        fill="#C49BAA"
      />
    </Svg>
  );
}

function EyeIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 52 52" fill="none">
      <G opacity={0.8}>
        <Path
          d="M14.6667 29.3333C14.6667 22.7059 19.7408 17.3333 26 17.3333C32.2593 17.3333 37.3334 22.7059 37.3334 29.3333M32.2963 29.3333C32.2963 33.0152 29.4773 36 26 36C22.5227 36 19.7037 33.0152 19.7037 29.3333C19.7037 25.6514 22.5227 22.6666 26 22.6666C29.4773 22.6666 32.2963 25.6514 32.2963 29.3333Z"
          stroke="#C49BAA"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-saparu-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end' }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Mascot — overlaps card from top */}
        <View className="items-center z-[100] -mb-8">
          <Image
            source={require('@/assets/images/axolot.svg')}
            style={{ width: 240, height: 220 }}
            contentFit="contain"
          />
        </View>

        {/* Card */}
        <View
          className="w-full bg-saparu-card items-center elevation-1"
          style={{
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            paddingHorizontal: 28,
            paddingTop: 44,
            marginTop: -10,
            paddingBottom: 28,
            elevation: 1,
          }}>

          {/* Title */}
          <Text
            className="text-saparu-btn text-center mb-[22px]"
            style={{
              fontFamily: 'FuzzyBubbles_400Regular',
              fontSize: 26,
              fontWeight: '900',
            }}>
            Log in on{' '}
            <Text
              className="text-saparu-rose"
              style={{ fontFamily: 'FuzzyBubbles_700Bold' }}>
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
              elevation: 2,
            }}>
            <View className="mr-[10px] justify-center items-center">
              <UserIcon />
            </View>
            <TextInput
              className="flex-1 text-saparu-text"
              style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 14 }}
              placeholder="Email or Username"
              placeholderTextColor={C.placeholder}
              value={username}
              onChangeText={setUsername}
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
              elevation: 2,
            }}>
            <View className="mr-[10px] justify-center items-center">
              <PassIcon />
            </View>
            <TextInput
              className="flex-1 text-saparu-text"
              style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 14 }}
              placeholder="Password"
              placeholderTextColor={C.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
              <EyeIcon />
            </Pressable>
          </View>

          {/* Forgot Password */}
          <Pressable className="self-start ml-[6px] mb-4 -mt-1">
            <Text
              className="text-saparu-muted"
              style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 13 }}>
              Forget Password?
            </Text>
          </Pressable>

          {/* Login Button */}
          <Pressable
            className="w-full items-center mb-4"
            style={{
              backgroundColor: C.btn,
              borderRadius: 999,
              paddingVertical: 16,
              elevation: 5,
            }}
            onPress={() => {}}>
            <Text
              className="text-white"
              style={{
                fontFamily: 'FuzzyBubbles_700Bold',
                fontSize: 18,
                letterSpacing: 5,
              }}>
              L o g i n
            </Text>
          </Pressable>

          {/* Sign Up Link */}
          <View className="items-center gap-[2px]">
            <Text
              className="text-saparu-muted italic"
              style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 13 }}>
              Didn't have an account?
            </Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text
                className="text-saparu-rose"
                style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 13 }}>
                Sign Up
              </Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
