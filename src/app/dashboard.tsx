import { useAuthStore } from '@/store/useAuthStore';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const patient = useAuthStore(state => state.patient);

  return (
    <View className="flex-1" style={{ backgroundColor: '#FDE3E7' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={{ width: SCREEN_WIDTH, aspectRatio: 390 / 380 }}>
          <Image
            source={require('@/assets/mascot/ImgBG.svg')}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            contentFit="cover"
          />
          <View style={{ paddingHorizontal: 24, paddingTop: 100 }}>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 28, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>
              Halo bunda,
            </Text>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 36, color: '#9BCEC1', marginTop: -8, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>
              {patient?.child_name || 'Ananda'}
            </Text>
            <Text style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 18, color: '#FFFFFF', marginTop: 4, maxWidth: '65%', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>
              Bagaimana kondisi ananda hari ini?
            </Text>

            <Pressable
              style={{
                marginTop: 16,
                backgroundColor: 'transparent',
                borderColor: '#FFFFFF',
                borderWidth: 2,
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 20,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#FFFFFF', fontSize: 14 }}>
                Cek Kondisi
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 3 Cards Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'flex-start', paddingHorizontal: 12, marginTop: -50, zIndex: 20 }}>
          {/* Left Card */}
          <View style={{ width: '30%', marginTop: 25 }}>
            <View style={{ backgroundColor: '#6CA8C2', width: '100%', aspectRatio: 1, borderRadius: 16, padding: 10, justifyContent: 'flex-end', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, overflow: 'visible' }}>
              <View style={{ position: 'absolute', top: -70, left: 0, right: 30, alignItems: 'center', zIndex: 10, elevation: 5 }}>
                <Image source={require('@/assets/mascot/left.svg')} style={{ width: 155, height: 155 }} contentFit="contain" />
              </View>
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#FFFFFF', fontSize: 12, textAlign: 'center', paddingBottom: 10 }}>
                Paru Kamu!
              </Text>
            </View>
          </View>

          {/* Middle Card */}
          <View style={{ width: '30%', marginTop: 25 }}>
            <View style={{ backgroundColor: '#6CA8C2', width: '100%', aspectRatio: 1, borderRadius: 16, padding: 8, justifyContent: 'flex-end', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, overflow: 'visible' }}>
              <View style={{ position: 'absolute', top: -80, left: 0, right: 0, alignItems: 'center', zIndex: 10, elevation: 5 }}>
                <Image source={require('@/assets/images/axolot.svg')} style={{ width: 105, height: 105 }} contentFit="contain" />
              </View>
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#FFFFFF', fontSize: 12, textAlign: 'center', paddingBottom: 10 }}>
                Cek Kesehatan{'\n'}Paru Kamu!
              </Text>
            </View>
          </View>

          {/* Right Card */}
          <View style={{ width: '30%', marginTop: 25 }}>
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
        <View style={{ marginHorizontal: 20, marginTop: 40, backgroundColor: '#F0A080', borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingRight: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, overflow: 'visible' }}>
          
          {/* Mascot */}
          <View style={{ position: 'absolute', left: -5, bottom: 0, zIndex: 10, elevation: 5, width: 155, height: 155 }}>
            <Image source={require('@/assets/mascot/inhaler.svg')} style={{ width: '100%', height: '100%' }} contentFit="contain" />
          </View>

          {/* Content */}
          <View style={{ flex: 1, marginLeft: 135 }}>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 18, color: '#FFFFFF', marginBottom: 12, lineHeight: 26 }}>
              Jangan lupa untuk obat ananda yaa!
            </Text>
            <Pressable
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 20,
                alignSelf: 'flex-start',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#F0A080', fontSize: 13 }}>
                Cek Jadwal
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Doctor Card */}
        <View style={{ marginHorizontal: 20, marginTop: 50 }}>
          <View style={{ backgroundColor: '#9BCEC1', borderRadius: 20, padding: 20, paddingTop: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, overflow: 'visible' }}>

            {/* Top Text Content */}
            <View style={{ paddingRight: 100, marginBottom: 16 }}>
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 24, color: '#FFFFFF', marginBottom: 4 }}>
                dr. Adam, Sp.A
              </Text>
              <Text style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 10, color: '#FFFFFF' }}>
                "dr. Adam, Sp.A adalah seorang Dokter Anak. Beliau dapat membantu layanan Konsultasi kesehatan anak menyeluruh."
              </Text>
            </View>

            {/* Doctor Image anchored to the top of the blue box. zIndex MUST be positive to float above the green card's background. */}
            <View style={{ position: 'absolute', right: 5, bottom: 95, zIndex: 10, width: 130, height: 160 }}>
              <Image source={require('@/assets/mascot/dr.svg')} style={{ width: '100%', height: '100%' }} contentFit="contain" />
            </View>

            {/* Bottom Blue Box */}
            <View style={{ backgroundColor: '#6CA8C2', borderRadius: 16, padding: 16, marginHorizontal: -10, marginBottom: -10, zIndex: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#FFFFFF', paddingBottom: 8, marginBottom: 8 }}>
                <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 13, color: '#FFFFFF' }}>
                  RS Hermina Pandanaran, Semarang
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 10, color: '#FFFFFF', maxWidth: '70%' }}>
                  Untuk konsultasi dengan Dokter Adam bisa menggunakan BPJS yang dapat diakses di mobile JKN
                </Text>
                <Pressable
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 999,
                    paddingVertical: 6,
                    paddingHorizontal: 16,
                  }}
                >
                  <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#6CA8C2', fontSize: 12 }}>
                    Detail
                  </Text>
                </Pressable>
              </View>
            </View>

          </View>
        </View>

      </ScrollView>
    </View>
  );
}
