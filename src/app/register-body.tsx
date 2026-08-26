import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const C = {
  bg: '#FDE3E7',
  pinkText: '#F4A6A6',
  btn: '#F0A080',
  btnText: '#FFFFFF',
  cardBg: '#9BCEC1',
};

function NumberStepper({ value, setValue, unit, label }: { value: number, setValue: React.Dispatch<React.SetStateAction<number>>, unit: string, label: string }) {
  const [timerId, setTimerId] = useState<ReturnType<typeof setInterval> | null>(null);

  const startDecrement = () => {
    setValue((v) => Math.max(0, v - 1));
    const id = setInterval(() => {
      setValue((v) => Math.max(0, v - 1));
    }, 70);
    setTimerId(id);
  };

  const startIncrement = () => {
    setValue((v) => v + 1);
    const id = setInterval(() => {
      setValue((v) => v + 1);
    }, 70);
    setTimerId(id);
  };

  const stopTimer = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  };

  return (
    <View style={{
      backgroundColor: C.cardBg,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 18,
      width: SCREEN_WIDTH * 0.85,
      zIndex: 1,
    }}>
      <Text className="text-white font-fuzzy text-base flex-1">{label}</Text>

      <View className="flex-row items-center justify-end">
        <Pressable 
          onPressIn={startDecrement} 
          onPressOut={stopTimer} 
          className="w-10 h-10 items-center justify-center bg-white/20 rounded-full"
        >
          <Text className="text-white font-fuzzy-bold text-2xl" style={{ marginTop: -4 }}>-</Text>
        </Pressable>

        <View className="flex-row items-baseline px-3">
          <TextInput
            value={value.toString()}
            onChangeText={(txt) => {
              const num = parseInt(txt, 10);
              if (!isNaN(num)) setValue(num);
            }}
            keyboardType="numeric"
            style={{ color: 'white', fontFamily: 'FuzzyBubbles_700Bold', fontSize: 22, textAlign: 'center', minWidth: 44 }}
          />
          <Text className="text-white font-fuzzy-bold text-sm">{unit}</Text>
        </View>

        <Pressable 
          onPressIn={startIncrement} 
          onPressOut={stopTimer} 
          className="w-10 h-10 items-center justify-center bg-white/20 rounded-full"
        >
          <Text className="text-white font-fuzzy-bold text-2xl" style={{ marginTop: -2 }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RegisterBodyScreen() {
  const router = useRouter();
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(45);

  const handleLanjut = () => {
    useRegistrationStore.getState().updateData({ height, weight });
    router.replace('/register-health');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Height Section */}
        <View className="items-center mt-12 w-full">
          <View style={{ zIndex: 0, marginBottom: -40, marginRight: 100 }} pointerEvents="none">
            <Image
              source={require('@/assets/mascot/Tinggi.svg')}
              style={{ width: SCREEN_WIDTH * 0.85, height: SCREEN_WIDTH * 0.7 }}
              contentFit="contain"
            />
          </View>
          <NumberStepper value={height} setValue={setHeight} unit="cm" label="Tinggi badan" />
        </View>

        {/* Weight Section */}
        <View className="items-center mt-8 w-full">
          <View style={{ zIndex: 0, marginBottom: -70, marginRight: -130 }} pointerEvents="none">
            <Image
              source={require('@/assets/mascot/Berat.svg')}
              style={{ width: SCREEN_WIDTH * 0.85, height: SCREEN_WIDTH * 0.7 }}
              contentFit="contain"
            />
          </View>
          <NumberStepper value={weight} setValue={setWeight} unit="kg" label="Berat badan" />
        </View>

        {/* Floating Button */}
        <View className="w-full px-8 mt-16 items-end">
          <Pressable
            onPress={handleLanjut}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#E8909A' : C.btn,
              borderRadius: 999,
              paddingVertical: 14,
              paddingHorizontal: 35,
              elevation: 4,
              shadowColor: C.btn,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              flexDirection: 'row',
              alignItems: 'center',
            })}
          >
            <Text className="text-white font-fuzzy-bold text-xl mr-2">
              Lanjutkan
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
