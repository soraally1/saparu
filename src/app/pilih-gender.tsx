import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Dimensions, GestureResponderEvent, Pressable, View } from 'react-native';

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

  const handleCanvasPress = (evt: GestureResponderEvent) => {
    const { locationX, locationY } = evt.nativeEvent;

    // Female character center is at top-left (~39% X, ~37.5% Y)
    // Male character center is at bottom-right (~60.5% X, ~65% Y)
    const femaleDx = locationX - 0.39 * canvasW;
    const femaleDy = locationY - 0.375 * canvasH;
    const distFemaleSq = femaleDx * femaleDx + femaleDy * femaleDy;

    const maleDx = locationX - 0.605 * canvasW;
    const maleDy = locationY - 0.65 * canvasH;
    const distMaleSq = maleDx * maleDx + maleDy * maleDy;

    const gender = distFemaleSq <= distMaleSq ? 'female' : 'male';
    router.push({ pathname: '/confirm-gender', params: { gender } });
  };

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

      <Pressable
        onPress={handleCanvasPress}
        style={({ pressed }) => ({
          width: canvasW,
          height: canvasH,
          marginBottom: 36,
          opacity: pressed ? 0.92 : 1,
        })}
      >
        {/* Female Character (Top-Left) */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
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

        {/* Male Character (Bottom-Right) */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
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
  );
}

