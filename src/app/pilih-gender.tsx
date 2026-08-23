import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Dimensions, Pressable, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const C = {
  bg: '#F9DADA',
};

const CHAR_SIZE = SCREEN_WIDTH * 0.75;
const OVERLAP_X = CHAR_SIZE * -0.05;
const OVERLAP_Y = CHAR_SIZE * -0.05;

export default function PilihGenderScreen() {
  const router = useRouter();

  const canvasW = CHAR_SIZE + OVERLAP_X;
  const canvasH = CHAR_SIZE + OVERLAP_Y;

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: C.bg }}
    >
      <View
        className="items-center"
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH * 0.4,
          marginBottom: 16,
          marginTop: -20,
        }}
        pointerEvents="none"
      >
        <Image
          source={require('@/assets/mascot/Gender.svg')}
          style={{ width: SCREEN_WIDTH * 0.7, height: '100%', marginTop: 120, marginLeft: 105 }}
          contentFit="contain"
        />
      </View>
      <View style={{ width: canvasW, height: canvasH, marginBottom: 36 }}>
        {/* Female Character */}
        <Pressable
          onPress={() => router.push({ pathname: '/confirm-gender', params: { gender: 'female' } })}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CHAR_SIZE,
            height: CHAR_SIZE,
            zIndex: 1,
          }}
        >
          <View
            style={{
              width: CHAR_SIZE,
              height: CHAR_SIZE,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={require('@/assets/images/female.svg')}
              style={{ width: CHAR_SIZE, height: CHAR_SIZE }}
              contentFit="contain"
            />
          </View>
        </Pressable>

        {/* Male Character */}
        <Pressable
          onPress={() => router.push({ pathname: '/confirm-gender', params: { gender: 'male' } })}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: CHAR_SIZE,
            height: CHAR_SIZE,
            zIndex: 2,
          }}
        >
          <View
            style={{
              width: CHAR_SIZE,
              height: CHAR_SIZE,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={require('@/assets/images/male.svg')}
              style={{ width: CHAR_SIZE, height: CHAR_SIZE }}
              contentFit="contain"
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
