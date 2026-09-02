import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useRegistrationStore } from '@/store/useRegistrationStore';
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
  const [isAutoCalculated, setIsAutoCalculated] = useState(false);

  const calculateAge = (dobText: string) => {
    if (dobText.length === 10) {
      const parts = dobText.split('/');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      if (day > 0 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= new Date().getFullYear()) {
        const birthDateObj = new Date(year, month, day);
        const today = new Date();
        
        let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
          calculatedAge--;
        }

        if (!isNaN(calculatedAge) && calculatedAge >= 0 && calculatedAge < 150) {
          setAge(calculatedAge.toString());
          setIsAutoCalculated(true);
          return;
        }
      }
    }
  };

  const handleLanjut = () => {
    useRegistrationStore.getState().updateData({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob,
      age: parseInt(age, 10) >= 0 ? parseInt(age, 10) : 0,
    });
    router.replace('/pilih-gender');
  };

  const isFormValid = Boolean(firstName.trim() && lastName.trim() && dob.length === 10 && age !== '');

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
                onChangeText={(text) => {
                  let numericText = text.replace(/\D/g, '');
                  
                  if (numericText.length >= 2) {
                    let dd = parseInt(numericText.slice(0, 2), 10);
                    if (dd > 31) dd = 31;
                    if (dd === 0) dd = 1;
                    numericText = dd.toString().padStart(2, '0') + numericText.slice(2);
                  }
                  
                  if (numericText.length >= 4) {
                    let mm = parseInt(numericText.slice(2, 4), 10);
                    if (mm > 12) mm = 12;
                    if (mm === 0) mm = 1;
                    numericText = numericText.slice(0, 2) + mm.toString().padStart(2, '0') + numericText.slice(4);
                  }

                  let formattedDate = '';
                  
                  if (numericText.length <= 2) {
                    formattedDate = numericText;
                  } else if (numericText.length <= 4) {
                    formattedDate = `${numericText.slice(0, 2)}/${numericText.slice(2)}`;
                  } else {
                    formattedDate = `${numericText.slice(0, 2)}/${numericText.slice(2, 4)}/${numericText.slice(4, 8)}`;
                  }
                  
                  setDob(formattedDate);
                  calculateAge(formattedDate);
                }}
                keyboardType="numeric"
                maxLength={10}
              />
              <CalendarIcon />
            </View>
          </View>
          
          {/* Usia Field with Auto-Calculate Indicator */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-fuzzy text-sm">Usia</Text>
              {isAutoCalculated && age !== '' && (
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 10, fontFamily: 'FuzzyBubbles_400Regular', marginTop: 2 }}>
                  ✨ Dihitung otomatis
                </Text>
              )}
            </View>
            <View className="flex-row items-center justify-end flex-1" style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)', paddingBottom: 4 }}>
              <TextInput
                style={{ color: 'white', fontFamily: 'FuzzyBubbles_700Bold', fontSize: 14, textAlign: 'right', flex: 1 }}
                placeholder="Misal: 8"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={age}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '');
                  setAge(cleaned);
                  setIsAutoCalculated(false);
                }}
                keyboardType="numeric"
                maxLength={3}
              />
              {age !== '' && (
                <Text style={{ color: 'white', fontFamily: 'FuzzyBubbles_700Bold', fontSize: 13, marginLeft: 4 }}>
                  Tahun
                </Text>
              )}
            </View>
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
