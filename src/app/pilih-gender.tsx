import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const C = {
  bg: '#F9DADA',
  pinkText: '#F4A6A6',
  subText: '#F4A6A6',
  btn: '#F4A6A6',
  btnDisabled: '#F2C8C8',
  btnText: '#FFFFFF',
  labelFemale: '#F4719A',
  labelMale: '#7DC8E8',
  selectedRingFemale: '#F4719A',
  selectedRingMale: '#7DC8E8',
};

type Gender = 'female' | 'male' | null;

const CHAR_SIZE = SCREEN_WIDTH * 0.75;
const OVERLAP_X  = CHAR_SIZE * -0.05;
const OVERLAP_Y  = CHAR_SIZE * -0.05;

export default function PilihGenderScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Gender>(null);

  const namaUser = 'Ananda';

  const femaleScale = useRef(new Animated.Value(1)).current;
  const maleScale   = useRef(new Animated.Value(1)).current;

  const [femaleOnTop, setFemaleOnTop] = useState(false);

  useEffect(() => {
    if (selected === 'female') {
      setFemaleOnTop(true);
      Animated.sequence([
        Animated.timing(femaleScale, { toValue: 1.14, duration: 160, useNativeDriver: true }),
        Animated.spring(femaleScale, { toValue: 1.06, useNativeDriver: true, friction: 5 }),
      ]).start();
      Animated.spring(maleScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    } else if (selected === 'male') {
      setFemaleOnTop(false);
      Animated.spring(femaleScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
      Animated.sequence([
        Animated.timing(maleScale, { toValue: 1.14, duration: 160, useNativeDriver: true }),
        Animated.spring(maleScale, { toValue: 1.06, useNativeDriver: true, friction: 5 }),
      ]).start();
    } else {
      // Reset ke default
      setFemaleOnTop(false);
      Animated.spring(femaleScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
      Animated.spring(maleScale,   { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    }
  }, [selected]);

  const handleLanjut = () => {
    if (!selected) return;
    console.log('Gender dipilih:', selected);
  };

  const canvasW = CHAR_SIZE + OVERLAP_X;
  const canvasH = CHAR_SIZE + OVERLAP_Y;

  const arcLabel  = 'Pilih Gender';
  const arcChars  = arcLabel.split('');
  const arcR      = canvasW * 0.52;
  const arcCX     = canvasW * 0.50;
  const arcCY     = canvasH * 0.92;          
  const arcStart  = -Math.PI * 0.78;
  const arcEnd    = -Math.PI * 0.22;

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: C.bg }}
    >
      <View
        style={{
          width: canvasW,
          height: canvasH * 0.70,
          marginBottom: 8,
        }}
        pointerEvents="none"
      >
        {arcChars.map((ch, i) => {
          const t     = arcChars.length === 1 ? 0.5 : i / (arcChars.length - 1);
          const angle = arcStart + t * (arcEnd - arcStart);
          const x     = arcCX + arcR * Math.cos(angle);
          const y     = arcCY + arcR * Math.sin(angle);
          const rot   = (angle + Math.PI / 2) * (180 / Math.PI);
          return (
            <Text
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                fontFamily: 'FuzzyBubbles_700Bold',
                fontSize: 36,
                color: C.pinkText,
                textShadowColor: '#EE9E9E',
                textShadowOffset: { width: 2, height: 1.5 },
                textShadowRadius: 0,
                transform: [{ rotate: `${rot}deg` }],
              }}
            >
              {ch}
            </Text>
          );
        })}
        <Text
          style={{
            position: 'absolute',
            bottom: 2,
            left: canvasW * 0.38,
            fontFamily: 'FuzzyBubbles_400Regular',
            fontSize: 16,
            color: C.subText,
            letterSpacing: 0.5,
            transform: [{ rotate: '5deg' }],
          }}
        >
          {namaUser}
        </Text>
      </View>
      <View style={{ width: canvasW, height: canvasH, marginBottom: 36 }}>
        <Pressable
          onPress={() => setSelected(selected === 'female' ? null : 'female')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CHAR_SIZE,
            height: CHAR_SIZE,
            zIndex: femaleOnTop ? 1 : 3,
          }}
        >
          <Animated.View
            style={{
              width: CHAR_SIZE,
              height: CHAR_SIZE,
              transform: [{ scale: femaleScale }],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={require('@/assets/images/female.svg')}
              style={{ width: CHAR_SIZE, height: CHAR_SIZE }}
              contentFit="contain"
            />
            {selected === 'female' && (
              <View
                style={{
                  position: 'absolute',
                  bottom: CHAR_SIZE * 0.05,
                  right: CHAR_SIZE * 0.05,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: C.selectedRingFemale,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 6,
                  shadowColor: C.selectedRingFemale,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                }}
              >
                <Text className="text-white text-sm font-bold">✓</Text>
              </View>
            )}
          </Animated.View>
        </Pressable>

        {/* ── Male Character ── */}
        <Pressable
          onPress={() => setSelected(selected === 'male' ? null : 'male')}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: CHAR_SIZE,
            height: CHAR_SIZE,
            zIndex: femaleOnTop ? 1 : 2,
          }}
        >
          <Animated.View
            style={{
              width: CHAR_SIZE,
              height: CHAR_SIZE,
              transform: [{ scale: maleScale }],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={require('@/assets/images/male.svg')}
              style={{ width: CHAR_SIZE, height: CHAR_SIZE }}
              contentFit="contain"
            />
            {selected === 'male' && (
              <View
                style={{
                  position: 'absolute',
                  bottom: CHAR_SIZE * 0.05,
                  right: CHAR_SIZE * 0.05,
                  width: 20,
                  height: 20,
                  borderRadius: 13,
                  backgroundColor: C.selectedRingMale,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 6,
                  shadowColor: C.selectedRingMale,
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                }}
              >
                <Text className="text-white text-sm font-bold">✓</Text>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </View>

      <View
        className="flex-row justify-between mb-10 px-1"
        style={{ width: canvasW }}
      >
        <Text
          style={{
            fontFamily: 'FuzzyBubbles_700Bold',
            fontSize: 14,
            color: selected === 'female' ? C.selectedRingFemale : C.pinkText,
            opacity: selected === 'male' ? 0.45 : 1,
          }}
        >
          ♀ Perempuan
        </Text>
        <Text
          style={{
            fontFamily: 'FuzzyBubbles_700Bold',
            fontSize: 14,
            color: selected === 'male' ? C.selectedRingMale : '#A0C8E0',
            opacity: selected === 'female' ? 0.45 : 1,
          }}
        >
          Laki-laki ♂
        </Text>
      </View>

      <Pressable
        onPress={handleLanjut}
        disabled={!selected}
        style={({ pressed }) => ({
          backgroundColor: selected
            ? pressed ? '#E8909A' : C.btn
            : C.btnDisabled,
          borderRadius: 999,
          paddingVertical: 14,
          paddingHorizontal: 64,
          elevation: selected ? 6 : 2,
          shadowColor: C.btn,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.35,
          shadowRadius: 6,
          opacity: selected ? 1 : 0.6,
        })}
      >
        <Text
          style={{
            fontFamily: 'FuzzyBubbles_700Bold',
            fontSize: 18,
            color: C.btnText,
            letterSpacing: 1,
          }}
        >
          Lanjutkan →
        </Text>
      </Pressable>
    </View>
  );
}
