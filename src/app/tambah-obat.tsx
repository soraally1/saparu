import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMedicationStore } from '@/store/useMedicationStore';

export default function TambahObatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addSchedule } = useMedicationStore();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [type, setType] = useState<'inhaler' | 'sirup' | 'tablet' | 'lainnya'>('inhaler');
  const [instruction, setInstruction] = useState('Sesudah makan');
  const [frequency, setFrequency] = useState('2x Sehari');
  const [doctor, setDoctor] = useState('dr. Anna, Sp.A, Subsp, Respi');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TIME_PRESETS = ['06:00', '08:00', '12:00', '14:00', '18:00', '20:00'];
  const INSTRUCTION_PRESETS = ['Sesudah makan', 'Sebelum makan', 'Saat sesak napas', 'Menjelang tidur'];
  const FREQUENCY_PRESETS = ['1x Sehari', '2x Sehari', '3x Sehari', 'Saat Dibutuhkan'];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nama Obat Kosong', 'Harap masukkan nama obat atau terapi.');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Dosis Kosong', 'Harap masukkan takaran atau dosis pemakaian obat.');
      return;
    }

    try {
      setIsSubmitting(true);
      const todayFormatted = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const todayIso = new Date().toISOString().split('T')[0];

      await addSchedule({
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        instruction,
        time: time.trim() || '08:00',
        day: todayFormatted,
        dateIso: todayIso,
        type,
        notes: notes.trim() || undefined,
        prescribedBy: doctor.trim() || 'Resep Dokter',
        isAiGenerated: false,
      });

      Alert.alert('Berhasil Ditambahkan', `Jadwal minum obat ${name.trim()} berhasil disimpan!`, [
        {
          text: 'Lihat Jadwal',
          onPress: () => router.replace('/jadwal-obat'),
        },
      ]);
    } catch (e) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan jadwal obat.');
    } finally {
      setIsSubmitting(false);
    }
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
          Input Resep Dokter
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Doctor Mascot */}
        <View
          style={{
            backgroundColor: '#6CA8C2',
            borderRadius: 24,
            padding: 16,
            paddingRight: 110,
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 12,
            overflow: 'hidden',
            position: 'relative',
            minHeight: 115,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', color: '#FFFFFF', fontSize: 16, marginBottom: 4 }}>
              Catat Dosis Medis Anak
            </Text>
            <Text style={{ fontFamily: 'FuzzyBubbles_400Regular', color: 'rgba(255, 255, 255, 0.9)', fontSize: 12, lineHeight: 17 }}>
              Masukkan resep dari dokter spesialis agar jadwal minum obat anak teratur dan terpantau.
            </Text>
          </View>
          <View style={{ position: 'absolute', right: -5, bottom: 0, width: 115, height: 125 }}>
            <Image
              source={require('@/assets/mascot/dr bunga 1.svg')}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
              contentPosition="bottom"
            />
          </View>
        </View>

        {/* Card Form */}
        <View className="bg-white rounded-3xl p-5 shadow-sm elevation-4 gap-4">
          {/* Nama Obat */}
          <View>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
              Nama Obat / Terapi *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="cth: Ventolin Inhaler / Profilas Sirup"
              placeholderTextColor="#A0A0A0"
              style={{
                fontFamily: 'FuzzyBubbles_400Regular',
                backgroundColor: '#F7FBFA',
                borderColor: '#E0ECE9',
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 14,
                color: '#333333',
              }}
            />
          </View>

          {/* Dosis & Takaran */}
          <View>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
              Dosis & Takaran *
            </Text>
            <TextInput
              value={dosage}
              onChangeText={setDosage}
              placeholder="cth: 2 semprot (puff) / 1 sendok teh (5ml)"
              placeholderTextColor="#A0A0A0"
              style={{
                fontFamily: 'FuzzyBubbles_400Regular',
                backgroundColor: '#F7FBFA',
                borderColor: '#E0ECE9',
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 14,
                color: '#333333',
              }}
            />
          </View>

          {/* Bentuk Sediaan */}
          <View>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
              Bentuk Sediaan Obat
            </Text>
            <View className="flex-row bg-[#F7FBFA] border border-[#E0ECE9] rounded-2xl p-1 justify-between">
              {(
                [
                  { id: 'inhaler', label: 'Inhaler', icon: 'lungs' },
                  { id: 'sirup', label: 'Sirup', icon: 'cup-water' },
                  { id: 'tablet', label: 'Tablet', icon: 'pill' },
                  { id: 'lainnya', label: 'Lainnya', icon: 'medical-bag' },
                ] as const
              ).map((t) => {
                const isSelected = type === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setType(t.id)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginHorizontal: 2,
                      backgroundColor: isSelected ? '#6CA8C2' : 'transparent',
                      elevation: isSelected ? 2 : 0,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={t.icon as any}
                      size={18}
                      color={isSelected ? '#FFFFFF' : '#666666'}
                    />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: 'FuzzyBubbles_700Bold',
                        fontSize: 11,
                        marginTop: 4,
                        color: isSelected ? '#FFFFFF' : '#666666',
                      }}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Jam Minum */}
          <View>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
              Jam Minum Obat
            </Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="08:00"
              placeholderTextColor="#A0A0A0"
              style={{
                fontFamily: 'FuzzyBubbles_700Bold',
                backgroundColor: '#F7FBFA',
                borderColor: '#E0ECE9',
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: '#3D7371',
                textAlign: 'center',
                marginBottom: 8,
              }}
            />
            {/* Presets Jam */}
            <View className="flex-row flex-wrap gap-2 justify-center">
              {TIME_PRESETS.map((t) => {
                const isSelected = time === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTime(t)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      borderWidth: 1,
                      backgroundColor: isSelected ? '#6CA8C2' : '#F7FBFA',
                      borderColor: isSelected ? '#6CA8C2' : '#E0ECE9',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'FuzzyBubbles_700Bold',
                        fontSize: 12,
                        color: isSelected ? '#FFFFFF' : '#666666',
                      }}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Aturan Minum */}
          <View>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
              Aturan Minum
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {INSTRUCTION_PRESETS.map((inst) => {
                const isSelected = instruction === inst;
                return (
                  <Pressable
                    key={inst}
                    onPress={() => setInstruction(inst)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 16,
                      borderWidth: 1,
                      backgroundColor: isSelected ? '#E8F5F2' : '#F7FBFA',
                      borderColor: isSelected ? '#6CA8C2' : '#E0ECE9',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'FuzzyBubbles_700Bold',
                        fontSize: 12,
                        color: isSelected ? '#3D7371' : '#666666',
                      }}
                    >
                      {inst}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Frekuensi */}
          <View>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
              Frekuensi Pemakaian
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {FREQUENCY_PRESETS.map((freq) => {
                const isSelected = frequency === freq;
                return (
                  <Pressable
                    key={freq}
                    onPress={() => setFrequency(freq)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 16,
                      borderWidth: 1,
                      backgroundColor: isSelected ? '#FFE5E5' : '#F7FBFA',
                      borderColor: isSelected ? '#FFAE9D' : '#E0ECE9',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'FuzzyBubbles_700Bold',
                        fontSize: 12,
                        color: isSelected ? '#E65100' : '#666666',
                      }}
                    >
                      {freq}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Dokter yang Meresepkan */}
          <View>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
              Dokter yang Meresepkan
            </Text>
            <TextInput
              value={doctor}
              onChangeText={setDoctor}
              placeholder="cth: dr. Anna, Sp.A, Subsp, Respi"
              placeholderTextColor="#A0A0A0"
              style={{
                fontFamily: 'FuzzyBubbles_400Regular',
                backgroundColor: '#F7FBFA',
                borderColor: '#E0ECE9',
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 14,
                color: '#333333',
              }}
            />
          </View>

          {/* Catatan Tambahan */}
          <View>
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-xs text-[#3D7371] mb-1.5">
              Catatan / Petunjuk Tambahan (Opsional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="cth: Gunakan spacer, bersihkan corong inhaler, beri air hangat..."
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={3}
              style={{
                fontFamily: 'FuzzyBubbles_400Regular',
                textAlignVertical: 'top',
                backgroundColor: '#F7FBFA',
                borderColor: '#E0ECE9',
                borderWidth: 1,
                borderRadius: 16,
                padding: 14,
                fontSize: 14,
                color: '#333333',
                minHeight: 80,
              }}
            />
          </View>

          {/* Tombol Simpan */}
          <Pressable
            onPress={handleSave}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#6CA8C2',
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
              elevation: 3,
            }}
          >
            <Text style={{ fontFamily: 'FuzzyBubbles_700Bold' }} className="text-white text-base">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Dosis ke Jadwal'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
