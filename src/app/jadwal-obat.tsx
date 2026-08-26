import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMedicationStore } from '@/store/useMedicationStore';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

interface DayItem {
  id: string;
  dayName: string;
  dateNum: string;
  monthYear: string;
  fullDate: string;
  dateIso: string;
}

function generateDaysData(totalDays = 7): DayItem[] {
  const today = new Date();
  const days: DayItem[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dayName = DAY_NAMES[d.getDay()];
    const dateNum = String(d.getDate());
    const monthYear = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    const fullDate = `${dayName}, ${d.getDate()} ${monthYear}`;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const dateIso = `${year}-${month}-${date}`;

    days.push({
      id: String(i + 1),
      dayName,
      dateNum,
      monthYear,
      fullDate,
      dateIso,
    });
  }

  return days;
}

export default function JadwalObatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [daysData, setDaysData] = useState<DayItem[]>(() => generateDaysData(7));
  const [selectedDayId, setSelectedDayId] = useState<string>('1');

  const {
    schedules,
    loadSchedules,
    toggleTaken,
    deleteSchedule,
    isLoading,
    hasLoaded,
  } = useMedicationStore();

  useEffect(() => {
    loadSchedules();
    setDaysData(generateDaysData(7));
  }, []);

  const selectedDay = daysData.find((d) => d.id === selectedDayId) || daysData[0];
  const dosesRemaining = schedules.filter((s) => !s.isTaken).length;

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Hapus Jadwal', `Apakah Anda yakin ingin menghapus jadwal obat "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => deleteSchedule(id),
      },
    ]);
  };

  // Loading state
  if (isLoading && !hasLoaded) {
    return (
      <View className="flex-1 bg-[#95C1B6] items-center justify-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-base mt-3">
          Memuat Jadwal Obat...
        </Text>
      </View>
    );
  }

  // =========================================================================
  // TAMPILAN ONBOARDING JIKA BELUM ADA JADWAL OBAT
  // =========================================================================
  if (hasLoaded && schedules.length === 0) {
    return (
      <View className="flex-1 bg-[#95C1B6]">
        {/* Header */}
        <View
          style={{ paddingTop: Math.max(insets.top + 10, 48) }}
          className="flex-row items-center justify-between px-5 pb-3"
        >
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center elevation-3 shadow-sm"
            hitSlop={10}
          >
            <Feather name="arrow-left" size={22} color="#3D7371" />
          </Pressable>
          <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xl text-white">
            Jadwal Obat Anak
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Illustration */}
          <View className="items-center justify-center mt-4 mb-2">
            <View className="w-[220px] h-[220px] items-center justify-center">
              <Image
                source={require('@/assets/mascot/inhaler_full.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            </View>
          </View>

          {/* Intro Card */}
          <View className="bg-white rounded-3xl p-6 shadow-sm elevation-4 mb-5 items-center">
            <Text
              style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
              className="text-xl text-[#3D7371] text-center mb-2"
            >
              Belum Ada Jadwal Obat
            </Text>
            <Text
              style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
              className="text-sm text-[#666666] text-center leading-5 mb-6"
            >
              Yuk atur pengobatan napas anak dengan mudah! Anda dapat memasukkan resep dokter secara manual atau meminta rekomendasi cerdas dari AI Saparu.
            </Text>

            {/* Opsi 1: Input Resep Dokter */}
            <Pressable
              onPress={() => router.push('/tambah-obat')}
              className="w-full bg-[#6CA8C2] rounded-2xl py-3.5 px-4 flex-row items-center justify-between mb-3.5 shadow-sm elevation-2"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <MaterialCommunityIcons name="clipboard-text-outline" size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-base">
                    Input Resep Dokter
                  </Text>
                  <Text style={{ fontFamily: 'FuzzyBubbles_400Regular' }} className="text-white/85 text-xs">
                    Catat dosis dari dokter spesialis anak
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#FFFFFF" />
            </Pressable>

            {/* Opsi 2: Rekomendasi AI */}
            <Pressable
              onPress={() => router.push('/rekomendasi-obat-ai')}
              className="w-full bg-[#FFAE9D] rounded-2xl py-3.5 px-4 flex-row items-center justify-between shadow-sm elevation-2"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <MaterialCommunityIcons name="creation" size={22} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-base">
                    Rekomendasi AI Saparu
                  </Text>
                  <Text style={{ fontFamily: 'FuzzyBubbles_400Regular' }} className="text-white/85 text-xs">
                    Susun dosis otomatis dari keluhan anak
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Quick Pharmacy Link */}
          <Pressable
            className="bg-[#FFE5E5] rounded-2xl py-3.5 flex-row items-center justify-center elevation-2"
            onPress={() => router.push('/apotik' as any)}
          >
            <MaterialCommunityIcons
              name="storefront-outline"
              size={20}
              color="#6CA8C2"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
              className="text-[#6CA8C2] text-sm"
            >
              Cari Apotik & Stok Obat Terdekat
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // TAMPILAN DASHBOARD JADWAL OBAT AKTIF
  // =========================================================================
  return (
    <View className="flex-1 bg-[#95C1B6]">
      {/* Top Header */}
      <View
        style={{ paddingTop: Math.max(insets.top + 10, 48) }}
        className="flex-row items-center justify-between px-5 pb-3"
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3.5 elevation-3 shadow-sm"
            hitSlop={10}
          >
            <Feather name="arrow-left" size={22} color="#3D7371" />
          </Pressable>
          <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xl text-white">
            Jadwal Obat & Inhaler
          </Text>
        </View>

        {/* Quick Add Button */}
        <Pressable
          onPress={() => router.push('/tambah-obat')}
          className="w-10 h-10 rounded-full bg-[#FFE5E5] items-center justify-center elevation-2"
          hitSlop={10}
        >
          <Feather name="plus" size={22} color="#6CA8C2" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section: Inhaler Mascot as Background + Dosage Info */}
        <View className="relative w-full h-[240px] justify-center mt-1 mb-3">
          <View className="absolute left-[-15px] top-0 w-[240px] h-[240px] z-0">
            <Image
              source={require('@/assets/mascot/inhaler_full.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          </View>

          <View className="ml-[145px] z-10 justify-center">
            <View className="flex-row items-baseline gap-1.5">
              <Text
                style={{ fontFamily: 'FuzzyBubbles_700Bold', lineHeight: 66 }}
                className="text-white text-[58px]"
              >
                {dosesRemaining}
              </Text>
              <Text
                style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                className="text-white text-[22px] mb-1.5"
              >
                Dosis
              </Text>
            </View>
            <Text
              style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
              className="text-white text-[26px] -mt-2 mb-1"
            >
              Hari Ini
            </Text>
            <Text
              style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
              className="text-white/95 text-xs"
            >
              {dosesRemaining > 0 ? 'Waktunya Cek Jadwal' : 'Semua Dosis Selesai! 🎉'}
            </Text>
          </View>
        </View>

        {/* Horizontal Calendar Days Strip */}
        <View className="-mx-5 mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingVertical: 4 }}
          >
            {daysData.map((item) => {
              const isSelected = item.id === selectedDayId;
              const countForDay = schedules.length;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedDayId(item.id)}
                  style={[
                    {
                      width: 104,
                      height: 138,
                      borderRadius: 22,
                      backgroundColor: '#FFAE9D',
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      elevation: 4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                    },
                    isSelected
                      ? { borderWidth: 2.5, borderColor: '#FFFFFF', transform: [{ scale: 1.02 }] }
                      : { opacity: 0.9, borderWidth: 0 },
                  ]}
                >
                  <Text
                    style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                    className="text-white text-[15px] text-center"
                  >
                    {item.dayName}
                  </Text>
                  <Text
                    style={{ fontFamily: 'FuzzyBubbles_700Bold', lineHeight: 42 }}
                    className="text-white text-[36px] text-center"
                  >
                    {item.dateNum}
                  </Text>
                  <View className="items-center">
                    <Text
                      style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                      className="text-white text-xs text-center"
                    >
                      {countForDay} Dosis
                    </Text>
                    <Text
                      style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
                      className="text-white/95 text-[9.5px] text-center mt-0.5"
                    >
                      {item.monthYear}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Action Buttons: Tambah Resep Dokter & Rekomendasi AI */}
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={() => router.push('/tambah-obat')}
            className="flex-1 bg-[#FFAE9D] py-3.5 px-3 rounded-2xl flex-row items-center justify-center elevation-2 shadow-sm"
          >
            <Feather name="plus-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-xs">
              + Resep Dokter
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/rekomendasi-obat-ai')}
            className="flex-1 bg-[#FFE5E5] py-3.5 px-3 rounded-2xl flex-row items-center justify-center elevation-2 shadow-sm"
          >
            <MaterialCommunityIcons name="creation" size={16} color="#6CA8C2" style={{ marginRight: 6 }} />
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-[#6CA8C2] text-xs">
              Rekomendasi AI
            </Text>
          </Pressable>
        </View>

        {/* Schedule List Container */}
        <View
          style={{
            backgroundColor: '#6CA8C2',
            borderRadius: 24,
            padding: 16,
            gap: 14,
            marginBottom: 20,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 5,
          }}
        >
          {schedules.map((item, index) => {
            const isLeftMascot = index % 2 === 1;

            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: item.isTaken ? '#81B3A7' : '#95C1B6',
                  borderRadius: 18,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 110,
                  elevation: 2,
                  opacity: item.isTaken ? 0.88 : 1,
                }}
              >
                {/* Left Mascot on alternate cards */}
                {isLeftMascot && (
                  <View className="w-20 h-20 items-center justify-center mr-2">
                    <Image
                      source={require('@/assets/mascot/mascotobat2.svg')}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="contain"
                    />
                  </View>
                )}

                {/* Content */}
                <View className="flex-1 justify-center px-1.5">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-[#FFAE9D] mr-1.5" />
                      <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-[11px]">
                        {item.day || selectedDay.fullDate}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1.5">
                      {item.isAiGenerated ? (
                        <View className="bg-white/25 px-1.5 py-0.5 rounded-md">
                          <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-[9px]">
                            ✨ AI
                          </Text>
                        </View>
                      ) : null}

                      {/* Delete button */}
                      <Pressable
                        onPress={() => handleDelete(item.id, item.name)}
                        hitSlop={8}
                        className="p-1"
                      >
                        <Feather name="trash-2" size={13} color="rgba(255,255,255,0.75)" />
                      </Pressable>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontFamily: 'FuzzyBubbles_700Bold',
                      textDecorationLine: item.isTaken ? 'line-through' : 'none',
                    }}
                    className="text-white text-sm mb-0.5"
                  >
                    {item.dosage} {item.name}
                  </Text>
                  <Text
                    style={{ fontFamily: 'FuzzyBubbles_400Regular' }}
                    className="text-white/90 text-[11px] mb-1.5"
                  >
                    {item.instruction}
                  </Text>

                  {/* Time & Checklist Row */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Feather name="clock" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-xs">
                        {item.time}
                      </Text>
                    </View>

                    {/* Toggle Taken Button */}
                    <Pressable
                      onPress={() => toggleTaken(item.id)}
                      className={`flex-row items-center px-2.5 py-1 rounded-xl ${
                        item.isTaken ? 'bg-[#2E7D32]' : 'bg-white/20'
                      }`}
                    >
                      <Feather
                        name={item.isTaken ? 'check' : 'circle'}
                        size={12}
                        color="#FFFFFF"
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                        className="text-white text-[10px]"
                      >
                        {item.isTaken ? 'Sudah Minum' : 'Tandai Minum'}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Right Mascot on standard cards */}
                {!isLeftMascot && (
                  <View className="w-20 h-20 items-center justify-center ml-2">
                    <Image
                      source={require('@/assets/mascot/mascotobat.svg')}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="contain"
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Bottom Action Button: Kunjungi Apotik */}
        <Pressable
          className="bg-[#FFE5E5] rounded-2xl py-3.5 items-center justify-center flex-row elevation-3 shadow-sm"
          onPress={() => router.push('/apotik' as any)}
        >
          <MaterialCommunityIcons
            name="storefront-outline"
            size={22}
            color="#6CA8C2"
            style={{ marginRight: 8 }}
          />
          <Text
            style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
            className="text-[#6CA8C2] text-sm"
          >
            Kunjungi Apotik Terdekat
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
