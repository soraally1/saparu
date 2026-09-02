import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { usePharmacyStore, ApotikItem, APOTIK_BASE_DATA } from '@/store/usePharmacyStore';

export { ApotikItem, APOTIK_BASE_DATA };
export const APOTIK_DATA = APOTIK_BASE_DATA;

export default function ApotikScreen() {
  const router = useRouter();
  const { pharmacies, fetchPharmacies, isLoading } = usePharmacyStore();
  const [locationStatus, setLocationStatus] = useState<string>('Mendeteksi apotik terdekat...');
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let userLat = -6.9932;
        let userLng = 110.4203;

        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          userLat = loc.coords.latitude;
          userLng = loc.coords.longitude;
          setIsGpsActive(true);
          setLocationStatus('Lokasi real-time terdeteksi');
        } else {
          setLocationStatus('Izin lokasi ditolak (menggunakan acuan pusat kota)');
        }

        // Panggil backend API /api/v1/pharmacies
        await fetchPharmacies(userLat, userLng);
      } catch (err) {
        setLocationStatus('Mode estimasi lokasi terdekat');
      }
    })();
  }, []);

  const displayList = Array.isArray(pharmacies) && pharmacies.length > 0 ? pharmacies : APOTIK_BASE_DATA;

  return (
    <View className="flex-1 bg-[#95C1B6]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 pt-14 pb-2.5">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center elevation-3 shadow-sm"
          hitSlop={10}
        >
          <Feather name="arrow-left" size={24} color="#3D7371" />
        </Pressable>
        <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xl text-white">
          Apotik Terdekat
        </Text>
        <View className="w-10" />
      </View>

      {/* GPS Location Status Strip */}
      <View className="flex-row items-center bg-white/95 mx-5 mb-3 py-1.5 px-3 rounded-xl">
        <Ionicons
          name={isGpsActive ? 'location' : 'location-outline'}
          size={16}
          color={isGpsActive ? '#2E7D32' : '#6CA8C2'}
          style={{ marginRight: 6 }}
        />
        <Text style={{ fontFamily: 'FuzzyBubbles_400Regular' }} className="text-xs text-[#3D7371]">
          {locationStatus}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {displayList.map((item) => (
          <View key={item.id} className="bg-white rounded-3xl p-4 elevation-4 shadow-sm">
            {/* Header / Name & Distance Badge */}
            <View className="flex-row justify-between items-center mb-1.5">
              <View className="flex-1 pr-2.5">
                <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-[17px] text-[#3D7371]">
                  {item.name}
                </Text>
              </View>

              <View
                className={`py-1 px-2.5 rounded-xl ${
                  item.isNearest ? 'bg-[#FFE5E5]' : 'bg-[#F0F7F6]'
                }`}
              >
                <Text
                  style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                  className={`text-[11px] ${
                    item.isNearest ? 'text-[#F0A080]' : 'text-[#6CA8C2]'
                  }`}
                >
                  {item.distance}
                </Text>
              </View>
            </View>

            {/* Address Row */}
            <View className="flex-row items-center mb-3">
              <Ionicons
                name="location-outline"
                size={14}
                color="#6CA8C2"
                style={{ marginRight: 4 }}
              />
              <Text style={{ fontFamily: 'FuzzyBubbles_400Regular' }} className="text-xs text-gray-500">
                {item.address}
              </Text>
            </View>

            {/* Pharmacy Image */}
            <View className="w-full h-40 bg-[#F0F7F6] rounded-2xl mb-3 overflow-hidden">
              <Image
                source={item.imageSource}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                contentPosition="center"
              />
            </View>

            {/* Description */}
            <Text
              style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
              className="text-xs text-gray-600 leading-4 mb-3.5"
              numberOfLines={3}
            >
              {item.description}
            </Text>

            {/* View Pharmacy Detail / Stock Button */}
            <Pressable
              className="bg-[#6CA8C2] rounded-2xl py-3 flex-row items-center justify-center elevation-2"
              onPress={() =>
                router.push({
                  pathname: '/apotik-detail',
                  params: { id: item.id },
                })
              }
            >
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-xs">
                Lihat Detail & Stok Obat
              </Text>
              <Feather
                name="arrow-right"
                size={16}
                color="#FFFFFF"
                style={{ marginLeft: 6 }}
              />
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
