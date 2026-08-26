import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HospitalDetailData {
  id: string;
  name: string;
  location: string;
  rating: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
}

const HOSPITALS_DETAIL: Record<string, HospitalDetailData> = {
  kariadi: {
    id: 'kariadi',
    name: 'RSUP Dr. Kariadi',
    location: 'Randusari, Semarang',
    rating: '4,6',
    description:
      'Rumah Sakit Umum Pusat Dr. Kariadi atau RSUP. Dr. Kariadi, merupakan rumah sakit umum daerah yang terafiliasi dengan Fakultas Kedokteran Universitas Diponegoro. Ini adalah salah satu rumah sakit terkemuka di Indonesia, berlokasi di Semarang, Jawa Tengah.',
    imageUrl:
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80',
    latitude: -6.9985,
    longitude: 110.4127,
  },
  hermina: {
    id: 'hermina',
    name: 'RS Hermina Pandanaran',
    location: 'Pandanaran, Semarang',
    rating: '4,7',
    description:
      'RS Hermina Pandanaran adalah rumah sakit umum dengan keunggulan pelayanan kesehatan ibu dan anak, serta fasilitas IGD dan Poli Paru Anak 24 Jam dengan tenaga spesialis profesional.',
    imageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    latitude: -6.9885,
    longitude: 110.4140,
  },
  telogorejo: {
    id: 'telogorejo',
    name: 'SMC RS Telogorejo',
    location: 'Pekunden, Semarang',
    rating: '4,8',
    description:
      'Semarang Medical Center (SMC) RS Telogorejo merupakan rumah sakit swasta modern dengan pusat layanan unggulan pulmonologi, pernapasan anak, dan rehabilitasi medis terpadu.',
    imageUrl:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
    latitude: -6.9868,
    longitude: 110.4195,
  },
  elisabeth: {
    id: 'elisabeth',
    name: 'RS St. Elisabeth',
    location: 'Wonotingal, Semarang',
    rating: '4,7',
    description:
      'RS St. Elisabeth Semarang memberikan pelayanan kesehatan komprehensif dengan pendekatan holistik dan fasilitas penanganan sesak napas serta asma anak yang lengkap.',
    imageUrl:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
    latitude: -7.0090,
    longitude: 110.4220,
  },
  columbia: {
    id: 'columbia',
    name: 'Columbia Asia Hospital',
    location: 'Kalibanteng, Semarang',
    rating: '4,9',
    description:
      'Columbia Asia Hospital Semarang menyediakan perawatan medis berstandar internasional dengan dokter spesialis respirologi anak berpengalaman dan IGD darurat 24 jam.',
    imageUrl:
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=80',
    latitude: -6.9830,
    longitude: 110.3790,
  },
};

export default function RumahSakitDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();

  const hospitalId = params.id || 'kariadi';
  const hospital = HOSPITALS_DETAIL[hospitalId] || HOSPITALS_DETAIL.kariadi;

  const handleNavigasiMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleReservasi = () => {
    const hospitalDoctorMap: Record<string, string> = {
      kariadi: 'anna',
      columbia: 'agung',
      hermina: 'adam',
      elisabeth: 'iwan',
    };
    const docId = hospitalDoctorMap[hospitalId] || 'anna';
    router.push({
      pathname: '/konsultasi-dokter',
      params: { id: docId },
    });
  };

  return (
    <View className="flex-1 bg-[#FDE3E7]">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Math.max(insets.bottom + 24, 32),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Photo Section */}
        <View className="relative w-full h-[360px] overflow-hidden rounded-b-[36px]">
          <Image
            source={{ uri: hospital.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />

          {/* Back Button on top left */}
          <Pressable
            onPress={() => router.back()}
            style={{ top: Math.max(insets.top + 10, 48), left: 20 }}
            className="absolute bg-[#FFAE9D] rounded-full p-2.5 elevation-4 shadow-md active:bg-[#F59E8C]"
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Floating Cards (Overlap Photo) */}
        <View className="-mt-14 px-5 flex-row gap-3 z-20">
          {/* Left Card: Hospital Name & Location */}
          <View className="flex-1 bg-[#FFAE9D] rounded-3xl p-4.5 justify-center shadow-md elevation-4">
            <Text
              style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
              className="text-white text-[19px] leading-6 mb-1"
            >
              {hospital.name}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="location-outline" size={15} color="#FFFFFF" />
              <Text
                style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
                className="text-white text-xs"
              >
                {hospital.location}
              </Text>
            </View>
          </View>

          {/* Right Card: Rating */}
          <View className="w-24 bg-[#FFAE9D] rounded-3xl items-center justify-center flex-row gap-1.5 shadow-md elevation-4">
            <Feather name="star" size={22} color="#FFFFFF" />
            <Text
              style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
              className="text-white text-xl"
            >
              {hospital.rating}
            </Text>
          </View>
        </View>

        {/* Content Section: About Rumah Sakit */}
        <View className="px-5 pt-6 flex-1">
          <Text
            style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
            className="text-[#6CA8C2] text-xl mb-3"
          >
            About Rumah Sakit
          </Text>

          <Text
            style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
            className="text-[#4A4A4A] text-sm leading-6"
          >
            {hospital.description}
          </Text>
        </View>

        {/* Bottom Action Buttons */}
        <View className="px-5 pt-8 flex-row gap-3 items-center">
          {/* Map / Route Search Button */}
          <Pressable
            onPress={handleNavigasiMaps}
            className="bg-[#D7E3E0] rounded-3xl p-4 items-center justify-center shadow-sm elevation-2 active:bg-[#C9D9D5]"
          >
            <MaterialCommunityIcons name="map-search-outline" size={26} color="#6CA8C2" />
          </Pressable>

          {/* Reservasi Sekarang Button */}
          <Pressable
            onPress={handleReservasi}
            className="flex-1 bg-[#D7E3E0] rounded-3xl py-4 items-center justify-center shadow-sm elevation-2 active:bg-[#C9D9D5]"
          >
            <Text
              style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
              className="text-[#6CA8C2] text-base"
            >
              Reservasi Sekarang
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
