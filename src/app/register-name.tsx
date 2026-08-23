import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const C = {
  bg: '#FDE3E7',
  pinkText: '#F4A6A6',
  btn: '#F0A080',
  btnDisabled: '#F2C8C8',
  btnText: '#FFFFFF',
  cardBg: '#9BCEC1',
  placeholder: '#E0F0EC',
};

function CalendarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
      <Path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
  );
}

function ArrowRightIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12h14M12 5l7 7-7 7" />
    </Svg>
  );
}

export default function RegisterNameScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');

  const handleLanjut = () => {
    router.replace('/pilih-gender');
  };

  const isFormValid = firstName && lastName && dob && age;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background image at bottom */}
      <Image
        source={require('@/assets/mascot/underbg.svg')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH * 1.1, // Approximate aspect ratio
          zIndex: 0,
        }}
        contentFit="cover"
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot + Text SVG */}
        <View
          className="items-center mt-12"
          style={{ zIndex: 30, marginBottom: -90 }}
          pointerEvents="none"
        >
          <Image
            source={require('@/assets/mascot/NameMascot.svg')}
            style={{ width: SCREEN_WIDTH * 0.9, height: SCREEN_WIDTH * 0.7 }}
            contentFit="contain"
          />
        </View>

        {/* Form Card */}
        <View
          style={{
            backgroundColor: C.cardBg,
            width: SCREEN_WIDTH * 0.85,
            borderRadius: 24,
            padding: 24,
            paddingTop: 40, // extra padding so inputs are not blocked by the visual overlap
            paddingBottom: 32,
            position: 'relative',
            zIndex: 20,
          }}
        >
          {/* Inputs */}
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-white font-fuzzy text-sm flex-1">Nama Depan</Text>
            <TextInput
              style={{ color: 'white', fontFamily: 'FuzzyBubbles_700Bold', fontSize: 14, textAlign: 'right', flex: 1, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)', paddingBottom: 4 }}
              placeholder="Ketik nama depan"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-white font-fuzzy text-sm flex-1">Nama Belakang</Text>
            <TextInput
              style={{ color: 'white', fontFamily: 'FuzzyBubbles_700Bold', fontSize: 14, textAlign: 'right', flex: 1, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)', paddingBottom: 4 }}
              placeholder="Ketik nama belakang"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-white font-fuzzy text-sm flex-1">Tanggal Lahir</Text>
            <View className="flex-row items-center justify-end flex-1" style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)', paddingBottom: 4 }}>
              <TextInput
                style={{ color: 'white', fontFamily: 'FuzzyBubbles_700Bold', fontSize: 14, textAlign: 'right', marginRight: 8, flex: 1 }}
                placeholder="HH/BB/TTTT"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={dob}
                onChangeText={setDob}
              />
              <CalendarIcon />
            </View>
          </View>
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-white font-fuzzy text-sm flex-1">Usia</Text>
            <TextInput
              style={{ color: 'white', fontFamily: 'FuzzyBubbles_700Bold', fontSize: 14, textAlign: 'right', flex: 1, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)', paddingBottom: 4 }}
              placeholder="Misal: 8"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>

          {/* Lanjutkan Button */}
          <Pressable
            onPress={handleLanjut}
            disabled={!isFormValid}
            style={({ pressed }) => ({
              backgroundColor: isFormValid ? (pressed ? '#E8909A' : C.btn) : C.btnDisabled,
              borderRadius: 999,
              paddingVertical: 12,
              paddingHorizontal: 24,
              position: 'absolute',
              bottom: -24,
              right: 16,
              elevation: 6,
              shadowColor: C.btn,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
            })}
          >
            <Text className="text-white font-fuzzy text-base mr-2">
              Lanjutkan
            </Text>
            <ArrowRightIcon />
          </Pressable>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
