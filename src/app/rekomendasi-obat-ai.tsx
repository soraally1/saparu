import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMedicationStore, MedicationSchedule } from '@/store/useMedicationStore';

const SYMPTOM_PRESETS = [
  'Batuk berdahak',
  'Mengi / wheezing saat malam',
  'Napas berbunyi grok-grok',
  'Batuk setelah aktivitas fisik',
  'Sesak saat udara dingin',
  'Riwayat alergi / asma',
];

export default function RekomendasiObatAiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestAiRecommendation, addMultipleSchedules } = useMedicationStore();

  const [symptoms, setSymptoms] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [childAge, setChildAge] = useState('2'); // tahun
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Omit<MedicationSchedule, 'id' | 'isTaken'>[] | null>(null);
  const [selectedResults, setSelectedResults] = useState<number[]>([]);

  const handleToggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter((c) => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const handleGenerate = async () => {
    const combinedSymptoms = [
      ...selectedChips,
      symptoms.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    if (!combinedSymptoms) {
      Alert.alert(
        'Input Belum Diisi',
        'Harap pilih gejala atau tuliskan keluhan pernapasan anak Anda.'
      );
      return;
    }

    try {
      setIsLoading(true);
      const ageMonths = (parseFloat(childAge) || 2) * 12;
      const recs = await requestAiRecommendation(combinedSymptoms, ageMonths);
      setResults(recs);
      setSelectedResults(recs.map((_, idx) => idx)); // Pilih semua secara default
    } catch (e) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat memproses rekomendasi AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelectResult = (index: number) => {
    if (selectedResults.includes(index)) {
      setSelectedResults(selectedResults.filter((i) => i !== index));
    } else {
      setSelectedResults([...selectedResults, index]);
    }
  };

  const handleApply = async () => {
    if (!results || selectedResults.length === 0) {
      Alert.alert('Pilih Rekomendasi', 'Pilih minimal satu obat yang ingin diterapkan.');
      return;
    }

    const itemsToSave = selectedResults.map((idx) => results[idx]);
    await addMultipleSchedules(itemsToSave);

    Alert.alert(
      'Berhasil Diterapkan 🎉',
      `${itemsToSave.length} jadwal rekomendasi obat berhasil dimasukkan ke jadwal harian anak!`,
      [
        {
          text: 'Lihat Jadwal Saya',
          onPress: () => router.replace('/jadwal-obat'),
        },
      ]
    );
  };

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
          Rekomendasi AI Saparu
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Mascot */}
        <View className="bg-[#FFAE9D] rounded-3xl p-4 flex-row items-center my-3 elevation-3">
          <View className="flex-1 pr-2">
            <View className="flex-row items-center gap-1.5 mb-1">
              <MaterialCommunityIcons name="creation" size={18} color="#FFFFFF" />
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-base">
                AI Asisten Pulmonologi
              </Text>
            </View>
            <Text style={{ fontFamily: 'FuzzyBubbles_400Regular' }} className="text-white/95 text-xs leading-4">
              Dapatkan rekomendasi cerdas dosis inhaler dan obat suportif berdasarkan keluhan batuk atau napas anak.
            </Text>
          </View>
          <View className="w-20 h-20 items-center justify-center">
            <Image
              source={require('@/assets/mascot/inhaler_full.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          </View>
        </View>

        {!results ? (
          /* STEP 1: INPUT KELUHAN & GEJALA */
          <View className="bg-white rounded-3xl p-5 shadow-sm elevation-4 gap-4">
            {/* Usia Anak */}
            <View>
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
                Usia Anak (Tahun)
              </Text>
              <View className="flex-row gap-2">
                {['1', '2', '3', '4', '5', '6+'].map((age) => (
                  <Pressable
                    key={age}
                    onPress={() => setChildAge(age)}
                    className={`flex-1 py-2.5 rounded-xl border items-center justify-center ${
                      childAge === age
                        ? 'bg-[#6CA8C2] border-[#6CA8C2]'
                        : 'bg-[#F7FBFA] border-[#E0ECE9]'
                    }`}
                  >
                    <Text
                      style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                      className={`text-xs ${childAge === age ? 'text-white' : 'text-[#666]'}`}
                    >
                      {age} Th
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Pilihan Gejala Cepat */}
            <View>
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
                Pilih Gejala yang Dirasakan
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SYMPTOM_PRESETS.map((preset) => {
                  const isChecked = selectedChips.includes(preset);
                  return (
                    <Pressable
                      key={preset}
                      onPress={() => handleToggleChip(preset)}
                      className={`px-3 py-2 rounded-2xl border flex-row items-center ${
                        isChecked
                          ? 'bg-[#FFE5E5] border-[#FFAE9D]'
                          : 'bg-[#F7FBFA] border-[#E0ECE9]'
                      }`}
                    >
                      <Feather
                        name={isChecked ? 'check-circle' : 'plus-circle'}
                        size={13}
                        color={isChecked ? '#E65100' : '#888888'}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={{ fontFamily: 'FuzzyBubbles_700Bold' }}
                        className={`text-xs ${isChecked ? 'text-[#E65100]' : 'text-[#666]'}`}
                      >
                        {preset}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Keluhan Bebas Tambahan */}
            <View>
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
                Catatan Keluhan Tambahan
              </Text>
              <TextInput
                value={symptoms}
                onChangeText={setSymptoms}
                placeholder="cth: Batuk sudah 3 hari, bunyi napas agak berat saat tidur, tidak ada demam tinggi..."
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={3}
                style={{ fontFamily: 'FuzzyBubbles_400Regular', textAlignVertical: 'top' }}
                className="bg-[#F7FBFA] border border-[#E0ECE9] rounded-2xl p-3.5 text-sm text-[#333] min-h-[85px]"
              />
            </View>

            {/* Tombol Generate AI */}
            <Pressable
              onPress={handleGenerate}
              disabled={isLoading}
              className="bg-[#FFAE9D] rounded-2xl py-4 items-center justify-center flex-row shadow-md elevation-3 mt-1"
            >
              {isLoading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-sm">
                    Menyusun Rekomendasi AI...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <MaterialCommunityIcons name="creation" size={20} color="#FFFFFF" />
                  <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-base">
                    Susunkan Rekomendasi Jadwal
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        ) : (
          /* STEP 2: REVIEW REKOMENDASI AI */
          <View className="bg-white rounded-3xl p-5 shadow-sm elevation-4 gap-4">
            <View className="flex-row items-center justify-between pb-2 border-b border-gray-100">
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-base text-[#3D7371]">
                Rekomendasi Terstruktur ({results.length} Obat)
              </Text>
              <Pressable onPress={() => setResults(null)}>
                <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#E65100]">
                  Ubah Gejala
                </Text>
              </Pressable>
            </View>

            <Text style={{ fontFamily: 'FuzzyBubbles_400Regular' }} className="text-xs text-[#777] leading-4">
              Pilih rekomendasi dosis di bawah ini untuk langsung dimasukkan ke jadwal minum obat harian anak Anda:
            </Text>

            {/* Cards Obat Rekomendasi */}
            {results.map((item, idx) => {
              const isSelected = selectedResults.includes(idx);
              return (
                <Pressable
                  key={idx}
                  onPress={() => handleToggleSelectResult(idx)}
                  className={`p-4 rounded-2xl border ${
                    isSelected
                      ? 'bg-[#E8F5F2] border-[#6CA8C2]'
                      : 'bg-[#F7FBFA] border-[#E0ECE9] opacity-75'
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Feather
                        name={isSelected ? 'check-square' : 'square'}
                        size={18}
                        color={isSelected ? '#3D7371' : '#999999'}
                      />
                      <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-[#3D7371] text-sm flex-1">
                        {item.name}
                      </Text>
                    </View>

                    <View className="bg-white px-2.5 py-0.5 rounded-full border border-[#B2DFDB]">
                      <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-[#E65100] text-xs">
                        {item.time}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#555] ml-6 mb-1.5">
                    Dosis: {item.dosage} ({item.instruction})
                  </Text>

                  <View className="bg-white/85 rounded-xl p-2.5 ml-6">
                    <Text style={{ fontFamily: 'FuzzyBubbles_400Regular' }} className="text-[11.5px] text-[#666] leading-4">
                      💡 {item.notes}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            {/* Disclaimer Medis */}
            <View className="bg-[#FFF9E6] border border-[#FFE082] rounded-2xl p-3.5 flex-row gap-2">
              <Ionicons name="information-circle" size={18} color="#F57F17" style={{ marginTop: 1 }} />
              <Text style={{ fontFamily: 'FuzzyBubbles_400Regular' }} className="flex-1 text-[11px] text-[#795548] leading-4">
                Rekomendasi ini disusun secara otomatis oleh AI Pulmonologi sebagai panduan suportif awal. Selalu konsultasikan penggunaan obat keras dengan dokter spesialis anak.
              </Text>
            </View>

            {/* Tombol Terapkan */}
            <Pressable
              onPress={handleApply}
              className="bg-[#6CA8C2] rounded-2xl py-4 items-center justify-center mt-1 shadow-md elevation-3"
            >
              <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-base">
                Terapkan ({selectedResults.length}) ke Jadwal Saya
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
