import { DoctorItem, DOCTORS_BASE, useDoctorStore } from '@/store/useDoctorStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export { DoctorItem, DOCTORS_BASE };

const CARD_HEIGHT = 185;
const IMG_HEIGHT = 215;
const IMG_WIDTH = 175;

function SkeletonBlock({
  style,
  borderRadius = 8,
  baseColor = 'rgba(255, 255, 255, 0.45)',
}: {
  style?: any;
  borderRadius?: number;
  baseColor?: string;
}) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 750 }),
        withTiming(0.35, { duration: 750 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ backgroundColor: baseColor, borderRadius }, style, animatedStyle]}
    />
  );
}

function DoctorCardSkeleton({ index }: { index: number }) {
  const isPeach = index % 2 === 0;
  const bgColor = isPeach ? '#FFAE9D' : '#9BCEC1';

  return (
    <View className="overflow-visible mb-6">
      <View
        style={{
          backgroundColor: bgColor,
          height: CARD_HEIGHT,
          paddingRight: IMG_WIDTH - 20,
        }}
        className="rounded-3xl overflow-visible flex-row items-center pl-5 shadow-md elevation-4"
      >
        {/* Left content skeleton */}
        <View className="flex-1 justify-center gap-2.5 z-20">
          {/* Doctor Name skeleton */}
          <View className="gap-1 mb-1">
            <SkeletonBlock style={{ width: '85%', height: 18, borderRadius: 6 }} />
            <SkeletonBlock style={{ width: '60%', height: 15, borderRadius: 6 }} />
          </View>

          {/* Specialization line */}
          <View className="flex-row items-center gap-2">
            <SkeletonBlock style={{ width: 16, height: 16, borderRadius: 999 }} />
            <SkeletonBlock style={{ width: 90, height: 13, borderRadius: 4 }} />
          </View>

          {/* Hospital line */}
          <View className="flex-row items-center gap-2">
            <SkeletonBlock style={{ width: 16, height: 16, borderRadius: 999 }} />
            <SkeletonBlock style={{ width: 115, height: 13, borderRadius: 4 }} />
          </View>

          {/* Reservasi Button skeleton */}
          <SkeletonBlock
            style={{ width: 130, height: 32, borderRadius: 999, marginTop: 4 }}
          />
        </View>

        {/* Doctor Image cutout skeleton on the right */}
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: IMG_WIDTH - 20,
            height: IMG_HEIGHT - 30,
            zIndex: 10,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <SkeletonBlock
            style={{
              width: '85%',
              height: '88%',
              borderTopLeftRadius: 36,
              borderTopRightRadius: 36,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            }}
          />
        </View>
      </View>
    </View>
  );
}

function DoctorCard({
  doctor,
  index,
  onReservasi,
}: {
  doctor: DoctorItem;
  index: number;
  onReservasi: () => void;
}) {
  const isPeach = index % 2 === 0;
  const bgColor = isPeach ? '#FFAE9D' : '#9BCEC1';

  return (
    <View className="overflow-visible mb-6">
      <View
        style={{
          backgroundColor: bgColor,
          height: CARD_HEIGHT,
          paddingRight: IMG_WIDTH - 20,
        }}
        className="rounded-3xl overflow-visible flex-row items-center pl-5 shadow-md elevation-4"
      >
        {/* Left content */}
        <View className="flex-1 justify-center gap-2 z-20">
          <Text
            style={{
              fontFamily: 'FuzzyBubbles_700Bold',
              fontSize: 18,
              lineHeight: 24,
            }}
            className="text-white"
          >
            {doctor.name}
          </Text>

          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="stethoscope" size={15} color="#FFFFFF" />
            <Text
              style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
              className="text-white text-xs"
            >
              {doctor.specialization}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="hospital-building" size={15} color="#FFFFFF" />
            <Text
              style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
              className="text-white text-xs flex-1"
              numberOfLines={1}
            >
              {doctor.hospital}
            </Text>
          </View>

          {/* Reservasi Button */}
          <Pressable
            onPress={onReservasi}
            className="mt-1 self-start bg-white rounded-full py-2 px-4 shadow-sm elevation-2 active:bg-gray-100"
          >
            <Text
              style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
              className="text-[#6CA8C2] text-xs"
            >
              Reservasi Sekarang
            </Text>
          </Pressable>
        </View>

        {/* Doctor Image cutout on the right */}
        <View
          style={{
            position: 'absolute',
            right: -6,
            bottom: 0,
            width: IMG_WIDTH,
            height: IMG_HEIGHT,
            zIndex: 10,
          }}
        >
          <Image
            source={doctor.image}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
            contentPosition="bottom"
          />
        </View>
      </View>
    </View>
  );
}

export default function DokterListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { doctors, fetchDoctors, isLoading, setSelectedDoctor } = useDoctorStore();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const displayList = Array.isArray(doctors) && doctors.length > 0 ? doctors : DOCTORS_BASE;

  return (
    <View className="flex-1 bg-[#FDE3E7]">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: Math.max(insets.top + 10, 48),
          paddingBottom: Math.max(insets.bottom + 20, 32),
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchDoctors}
            colors={['#6CA8C2']}
            tintColor="#6CA8C2"
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={() => router.back()}
            className="bg-white/90 rounded-full p-2 mr-3.5 elevation-2 shadow-sm active:bg-white/60"
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={20} color="#6CA8C2" />
          </Pressable>

          <Text
            style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
            className="text-2xl text-[#6CA8C2]"
          >
            Dokter Mitra Saparu
          </Text>
        </View>

        {/* Doctor cards list / Skeleton loading */}
        {isLoading ? (
          <>
            {[0, 1, 2, 3].map((index) => (
              <DoctorCardSkeleton key={`skeleton-${index}`} index={index} />
            ))}
          </>
        ) : (
          displayList.map((doctor, index) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              index={index}
              onReservasi={() => {
                setSelectedDoctor(doctor);
                router.push({
                  pathname: '/konsultasi-dokter',
                  params: { id: doctor.id },
                });
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
