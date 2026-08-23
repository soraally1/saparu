import { useRouter, useLocalSearchParams } from 'expo-router';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const C = {
  bg: '#F9DADA',
  btn: '#F0A080',
  btnText: '#FFFFFF',
};

export default function ConfirmGenderScreen() {
  const router = useRouter();
  const { gender } = useLocalSearchParams<{ gender: 'male' | 'female' }>();

  const isMale = gender === 'male';

  const handleLanjut = () => {
    router.replace({ pathname: '/register-body', params: { gender } });
  };

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: C.bg }}>
      
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.2, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={isMale ? require('@/assets/mascot/Laki Laki.svg') : require('@/assets/mascot/Perempuan.svg')}
          style={{ width: SCREEN_WIDTH * 0.9, height: SCREEN_WIDTH * 0.9 }}
          contentFit="contain"
        />
      </View>

      <View className="absolute bottom-20 items-center w-full">
        <Pressable
          onPress={handleLanjut}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#E8909A' : C.btn,
            borderRadius: 999,
            paddingVertical: 14,
            paddingHorizontal: 64,
            elevation: 4,
            shadowColor: C.btn,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.35,
            shadowRadius: 6,
          })}
        >
          <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 18, color: C.btnText, letterSpacing: 1 }}>
            Lanjutkan
          </Text>
        </Pressable>
      </View>

    </View>
  );
}
