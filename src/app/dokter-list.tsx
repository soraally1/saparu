import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

const CARD_HEIGHT = 180;
const IMG_HEIGHT  = CARD_HEIGHT + 40;
const IMG_WIDTH   = 148;

const DOCTORS = [
  {
    id: 'anna',
    name: 'dr. Anna, Sp.A,\nSubsp. Respi',
    specialization: 'Dokter Anak',
    hospital: 'RSUP Dr. Kariadi',
    image: require('@/assets/mascot/dr bunga 1.svg'),
  },
  {
    id: 'agung',
    name: 'dr. Agung, Sp.A,\nSubsp. Respi',
    specialization: 'Dokter Anak',
    hospital: 'Columbia Asia Hospital',
    image: require('@/assets/mascot/dr daffa 1.svg'),
  },
  {
    id: 'adam',
    name: 'dr. Adam, Sp.A\nSubsp. Respi',
    specialization: 'Dokter Anak',
    hospital: 'RS Hermina Pandanaran',
    image: require('@/assets/mascot/dr erland 1.svg'),
  },
  {
    id: 'iwan',
    name: 'dr. Iwan, Sp.A,\nSubsp. Respi',
    specialization: 'Dokter Anak',
    hospital: 'RS St. Elisabeth',
    image: require('@/assets/mascot/dr_ibanez_1.svg'),
  },
];

function DoctorCard({
  doctor,
  onReservasi,
}: {
  doctor: (typeof DOCTORS)[number];
  onReservasi: () => void;
}) {
  return (
    <View style={{ overflow: 'visible', marginBottom: 15 }}>
      <View
        style={{
          backgroundColor: '#9BCEC1',
          borderRadius: 20,
          height: CARD_HEIGHT,
          overflow: 'visible',
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 18,
          paddingRight: IMG_WIDTH - 10,
        }}
      >
        {/* Left content */}
        <View style={{ flex: 1, gap:  6}}>
          <Text
            style={{
              fontFamily: 'FuzzyBubbles_700Bold',
              fontSize: 16,
              color: '#FFFFFF',
              lineHeight: 22,
            }}
          >
            {doctor.name}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap:6 }}>
            <Feather name="activity" size={13} color="#FFFFFFCC" />
            <Text
              style={{
                fontFamily: 'FuzzyBubbles_400Regular',
                fontSize: 12,
                color: '#FFFFFFCC',
              }}
            >
              {doctor.specialization}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="home" size={13} color="#FFFFFFCC" />
            <Text
              style={{
                fontFamily: 'FuzzyBubbles_400Regular',
                fontSize: 12,
                color: '#FFFFFFCC',
              }}
            >
              {doctor.hospital}
            </Text>
          </View>

          <Pressable
            onPress={onReservasi}
            style={({ pressed }) => ({
              marginTop: 6,
              alignSelf: 'flex-start',
              backgroundColor: pressed ? '#F0F0F0' : '#FFFFFF',
              borderRadius: 999,
              paddingVertical: 7,
              paddingHorizontal: 18,
            })}
          >
            <Text
              style={{
                fontFamily: 'FuzzyBubbles_700Bold',
                fontSize: 12,
                color: '#6CA8C2',
              }}
            >
              Reservasi Sekarang
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            position: 'absolute',
            right: -4,
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

  return (
    <View style={{ flex: 1, backgroundColor: '#FDE3E7' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 56,
          paddingBottom: 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 28,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? 'rgba(255,255,255,0.65)'
                : 'rgba(255,255,255,0.92)',
              borderRadius: 999,
              padding: 8,
            })}
          >
            <Ionicons name="arrow-back" size={20} color="#6CA8C2" />
          </Pressable>

          <Text
            style={{
              fontFamily: 'FuzzyBubbles_700Bold',
              fontSize: 22,
              color: '#6CA8C2',
            }}
          >
            Dokter Mitra Saparu
          </Text>
        </View>

        {/* Doctor cards */}
        {DOCTORS.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onReservasi={() => router.push('/konsultasi-dokter')}
          />
        ))}
      </ScrollView>
    </View>
  );
}
