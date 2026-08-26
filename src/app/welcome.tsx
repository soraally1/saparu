import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions, Pressable, Text, View } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Warna Saparu (nilai dinamis — tidak bisa jadi Tailwind class) ---
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

export default function WelcomeScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams();

  return (
    <>
      {/* Layer 1: bg-top */}
      <Image
        source={require('@/assets/images/bg-top.svg')}
        style={{
          position: 'relative',
          top: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT * 0.55,
          zIndex: 1,
        }}
        contentFit="cover"
      />

      {/* Layer 2: bg-bottom */}
      <Image
        source={require('@/assets/images/bg-bottom.svg')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT * 0.9,
        }}
        contentFit="cover"
      />

      {/* Layer 3: Teks HALLO + Selamat Datang */}
      <View
        className="absolute top-0 left-0 right-0 items-center justify-center"
        style={{ height: SCREEN_HEIGHT * 0.35, zIndex: 10 }}
      >
        <Text
          style={{
            fontSize: 50,
            fontFamily: 'FuzzyBubbles_700Bold',
            color: '#FFB6A6',
            textShadowColor: '#C49BAA',
            textShadowOffset: { width: 3, height: 2 },
            textShadowRadius: 0,
            letterSpacing: 3,
          }}
        >
          HALLO!
        </Text>
        <Text
          style={{
            fontSize: 32,
            fontFamily: 'FuzzyBubbles_700Bold',
            color: '#9BCEC1',
            textShadowColor: '#8CB4AA',
            textShadowOffset: { width: 3, height: 2 },
            textShadowRadius: 1,
            marginTop: -4,
            letterSpacing: 1,
          }}
        >
          Selamat Datang
        </Text>
      </View>

      {/* Layer 4: Tombol Mulai Sekarang */}
      <View className="absolute bottom-10 left-0 right-0 items-center">
        <Pressable
          onPress={() => {
            if (source === 'register') {
              router.replace('/register-name');
            } else {
              router.replace('/dashboard');
            }
          }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#F0B8C4' : '#FFB6A6',
            borderRadius: 999,
            paddingVertical: 6,
            paddingHorizontal: 52,
            elevation: 6,
            shadowColor: C.pink,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.35,
            shadowRadius: 6,
            borderWidth: 2.5,
            borderColor: '#F0B8C4',
            opacity: pressed ? 0.88 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: 'FuzzyBubbles_700Bold',
              fontSize: 20,
              color: '#FFFFFF',
              letterSpacing: 1,
            }}
          >
            Mulai Sekarang!
          </Text>
        </Pressable>
      </View>
    </>
  );
}