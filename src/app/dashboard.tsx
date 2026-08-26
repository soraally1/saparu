import { useAuthStore } from '@/store/useAuthStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function SkeletonBlock({ style, borderRadius = 8 }: { style: any, borderRadius?: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ backgroundColor: '#EABDC6', borderRadius }, style, animatedStyle]} />
  );
}

function DashboardSkeleton() {
  return (
    <View className="flex-1" style={{ backgroundColor: '#FDE3E7' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header Skeleton */}
        <View style={{ width: SCREEN_WIDTH, aspectRatio: 370 / 380, backgroundColor: '#F4CFD6', overflow: 'hidden', paddingHorizontal: 24, paddingTop: 100 }}>
          <SkeletonBlock style={{ width: 120, height: 32, marginBottom: 4 }} />
          <SkeletonBlock style={{ width: 200, height: 42, marginBottom: 12 }} />
          <SkeletonBlock style={{ width: 220, height: 48, marginBottom: 16 }} />
          <SkeletonBlock style={{ width: 140, height: 42, borderRadius: 999 }} />
        </View>

        {/* 3 Cards Skeleton */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-start', paddingHorizontal: 12, marginTop: -50, zIndex: 20 }}>
          {[1, 2, 3].map(i => (
            <View key={i} style={{ width: '30%' }}>
              <SkeletonBlock style={{ width: '100%', aspectRatio: 1, borderRadius: 16 }} />
            </View>
          ))}
        </View>

        {/* Reminder Banner Skeleton */}
        <View style={{ marginHorizontal: 20, marginTop: 40 }}>
          <SkeletonBlock style={{ width: '100%', height: 110, borderRadius: 20 }} />
        </View>

        {/* Doctor Section Skeleton */}
        <View style={{ marginHorizontal: 20, marginTop: 40 }}>
          <SkeletonBlock style={{ width: 160, height: 26, marginBottom: 4 }} />
          <SkeletonBlock style={{ width: 200, height: 18, marginBottom: 20 }} />
          <SkeletonBlock style={{ width: '100%', height: 190, borderRadius: 20 }} />
        </View>
      </ScrollView>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const patient = useAuthStore(state => state.patient);
  const logout = useAuthStore(state => state.logout);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#FDE3E7' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={{ width: SCREEN_WIDTH, aspectRatio: 370 / 380, overflow: 'hidden' }}>
          <Image
            source={require('@/assets/mascot/ImgBG.svg')}
            style={{ width: '120%', height: '100%', position: 'absolute', top: -20, left: -25, transform: [{ translateX: 25 }] }}
            contentFit="cover"
          />

          {/* Logout Button */}
          <View style={{ position: 'absolute', top: 50, right: 24, zIndex: 50 }}>
            <Pressable
              onPress={async () => {
                await logout();
                router.replace('/login');
              }}
              style={({ pressed }) => ({
                backgroundColor: pressed ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)',
                borderRadius: 999,
                padding: 10,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              })}
            >
              <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 24, paddingTop: 100 }}>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 28, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 4 }}>
              Halo bunda,
            </Text>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 36, color: '#FFB6A6', marginTop: -8, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 5 }}>
              {patient?.child_name?.split(' ')[0] || 'Ananda'}
            </Text>
            <Text style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 18, color: '#FFFFFF', marginTop: 4, maxWidth: '65%', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 4 }}>
              Bagaimana kondisi ananda hari ini?
            </Text>

            <Pressable
              style={{
                marginTop: 16,
                backgroundColor: '#F0A080',
                borderColor: '#FFFFFF',
                borderWidth: 2,
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 20,
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}
            >
              <Feather name="activity" size={16} color="#FFFFFF" />
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#FFFFFF', fontSize: 14 }}>
                Cek Kondisi
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 3 Cards Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-start', paddingHorizontal: 12, marginTop: -50, zIndex: 20 }}>
          {/* Left Card — navigates to Rute Bunda */}
          <Link href="/rute-bunda" asChild>
            <Pressable style={{ width: '30%', marginTop: 0 }}>
              <View style={{ backgroundColor: '#6CA8C2', width: '100%', aspectRatio: 1, borderRadius: 16, padding: 10, justifyContent: 'flex-end', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, overflow: 'visible' }}>
                <View style={{ position: 'absolute', top: -70, left: 0, right: 30, alignItems: 'center', zIndex: 10, elevation: 5 }}>
                  <Image source={require('@/assets/mascot/left.svg')} style={{ width: 155, height: 155 }} contentFit="contain" />
                </View>
                <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#FFFFFF', fontSize: 12, textAlign: 'center', paddingBottom: 10 }}>
                  Paru Kamu!
                </Text>
              </View>
            </Pressable>
          </Link>

          {/* Middle Card */}
          <Link href="/scan-paru" asChild>
            <Pressable style={{ width: '30%', marginTop: 0 }}>
              <View style={{ backgroundColor: '#6CA8C2', width: '100%', aspectRatio: 1, borderRadius: 16, padding: 8, justifyContent: 'flex-end', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, overflow: 'visible' }}>
                <View style={{ position: 'absolute', top: -80, left: 0, right: 0, alignItems: 'center', zIndex: 10, elevation: 5 }}>
                  <Image source={require('@/assets/images/axolot.svg')} style={{ width: 105, height: 105 }} contentFit="contain" />
                </View>
                <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#FFFFFF', fontSize: 12, textAlign: 'center', paddingBottom: 10 }}>
                  Cek Kesehatan{'\n'}Paru Kamu!
                </Text>
              </View>
            </Pressable>
          </Link>

          {/* Right Card */}
          <View style={{ width: '30%', marginTop: 0 }}>
            <View style={{ backgroundColor: '#6CA8C2', width: '100%', aspectRatio: 1, borderRadius: 16, padding: 10, justifyContent: 'flex-end', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, overflow: 'visible' }}>
              <View style={{ position: 'absolute', top: -70, left: 30, right: 0, alignItems: 'center', zIndex: 10, elevation: 5 }}>
                <Image source={require('@/assets/mascot/right.svg')} style={{ width: 155, height: 155 }} contentFit="contain" />
              </View>
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#FFFFFF', fontSize: 12, textAlign: 'center', paddingBottom: 10 }}>
                Paru Kamu!
              </Text>
            </View>
          </View>
        </View>

        {/* Reminder Banner */}
        <View style={{ marginHorizontal: 20, marginTop: 40, backgroundColor: '#F0A080', borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingRight: 20, elevation: 4, overflow: 'hidden' }}>

          {/* Mascot */}
          <View style={{ position: 'absolute', left: -10, top: 0, bottom: 0, zIndex: 5, elevation: 5, width: 150 }}>
            <Image source={require('@/assets/mascot/inhaler.svg')} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </View>

          {/* Content */}
          <View style={{ flex: 1, marginLeft: 165, paddingVertical: 20 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="bell" size={12} color="#FFFFFF" />
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 10, color: '#FFFFFF' }}>Pengingat Harian</Text>
            </View>

            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 16, color: '#FFFFFF', marginBottom: 12, lineHeight: 22 }}>
              Waktunya cek jadwal pemakaian inhaler!
            </Text>

            <Pressable
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignSelf: 'flex-start',
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Feather name="calendar" size={14} color="#F0A080" />
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#F0A080', fontSize: 12 }}>
                Lihat Jadwal
              </Text>
              <Feather name="arrow-right" size={14} color="#F0A080" />
            </Pressable>
          </View>
        </View>

        {/* Doctor Section Header */}
        <View style={{ marginHorizontal: 20, marginTop: 40, marginBottom: -35, zIndex: 10 }}>
          <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 20, color: '#6CA8C2', marginBottom: 2 }}>
            Butuh Konsultasi?
          </Text>
          <Text style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 14, color: '#6CA8C2' }}>
            "Cari dokter terdekat nya!"
          </Text>
        </View>

        {/* Doctor Card */}
        <View style={{ marginHorizontal: 20, marginTop: 50 }}>
          <View style={{ backgroundColor: '#9BCEC1', borderRadius: 20, padding: 16, paddingTop: 16, elevation: 4, overflow: 'visible' }}>

            {/* Top Text Content */}
            <View style={{ paddingRight: 90, marginBottom: 10 }}>
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 18, color: '#FFFFFF', marginBottom: 4 }}>
                dr. Adam, Sp.A
              </Text>

              <View style={{ backgroundColor: '#F0A080', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFFFFF' }} />
                <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 10, color: '#FFFFFF' }}>Tersedia Hari Ini</Text>
              </View>

              <Text style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 10, color: '#FFFFFF', lineHeight: 14 }}>
                Dokter Spesialis Paru Anak. Berpengalaman menangani masalah pernapasan anak secara menyeluruh.
              </Text>
            </View>

            {/* Doctor Image */}
            <View style={{ position: 'absolute', right: -50, bottom: 85, zIndex: 10, width: 200, height: 200 }}>
              <Image source={require('@/assets/mascot/dr bunga 1.svg')} style={{ width: '100%', height: '100%' }} contentFit="contain" />
            </View>

            {/* Bottom Blue Box */}
            <View style={{ backgroundColor: '#6CA8C2', borderRadius: 16, padding: 12, marginHorizontal: -6, marginBottom: -6, zIndex: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)', paddingBottom: 8, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="location-outline" size={14} color="#FFFFFF" />
                  <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 11, color: '#FFFFFF' }}>
                    RS Hermina Pandanaran
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 10, color: '#FFFFFF', maxWidth: '75%', lineHeight: 14 }}>
                  Konsultasi dengan BPJS aktif dapat diakses langsung di mobile JKN.
                </Text>
                <Link href="/konsultasi-dokter" asChild>
                <Pressable
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 999,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#6CA8C2', fontSize: 10 }}>
                    Detail
                  </Text>
                  <Feather name="chevron-right" size={12} color="#6CA8C2" />
                </Pressable>
                </Link>
              </View>
            </View>

          </View>
        </View>

      </ScrollView>
    </View>
  );
}
