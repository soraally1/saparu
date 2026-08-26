import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { DOCTORS_BASE, DoctorItem, useDoctorStore } from '@/store/useDoctorStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TIME_SLOTS = [
  ['09:00', '10:00', '11:00', '12:00'],
  ['14:00', '15:00', '16:00', '17:00'],
  ['19:00', '20:00'],
];

const TODAY = new Date();
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const IMG_OVERFLOW = 80;   
const CARD_HEIGHT   = 260; 
const DOCTOR_IMG_H  = CARD_HEIGHT + IMG_OVERFLOW - 56; 

function InfoBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFB6A6',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 6,
        alignItems: 'center',
        gap: 6,
      }}
    >
      {icon}
      <Text
        style={{
          fontFamily: 'FuzzyBubbles_700Bold',
          fontSize: 11,
          color: '#FFFFFF',
          textAlign: 'center',
          lineHeight: 15,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function TimeSlotButton({
  time,
  isSelected,
  onPress,
}: {
  time: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: isSelected ? '#6CA8C2' : pressed ? '#F5C8B0' : '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 7,
        paddingHorizontal: 16,
        elevation: isSelected ? 3 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      })}
    >
      <Text
        style={{
          fontFamily: 'FuzzyBubbles_700Bold',
          fontSize: 12,
          color: isSelected ? '#FFFFFF' : '#8B6E6E',
        }}
      >
        {time}
      </Text>
    </Pressable>
  );
}

export default function KonsultasiDokterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { selectedDoctor, doctors } = useDoctorStore();
  const [selectedTime, setSelectedTime] = useState<string | null>('11:00');

  const doctorList = Array.isArray(doctors) && doctors.length > 0 ? doctors : DOCTORS_BASE;
  const doctor: DoctorItem =
    (params.id ? doctorList.find((d) => d.id === params.id) : null) ||
    selectedDoctor ||
    doctorList[0];

  const isIwan = doctor.id === 'iwan';
  const cleanDoctorName = doctor.name.replace(/\n/g, ' ');
  const formattedDate = `${DAY_NAMES[TODAY.getDay()]}, ${TODAY.getDate()} ${MONTH_NAMES[TODAY.getMonth()]}`;

  const handleReservasi = () => {
    if (!selectedTime) {
      Alert.alert('Pilih Waktu', 'Silakan pilih waktu konsultasi terlebih dahulu.');
      return;
    }
    Alert.alert(
      'Reservasi Berhasil!',
      `Janji temu dengan ${cleanDoctorName} (${doctor.hospital}) pada:\n\n📅 ${formattedDate}\n⏰ ${selectedTime} WIB\n\nSampai jumpa, ya!`,
      [{ text: 'Oke', style: 'default', onPress: () => router.back() }],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FDE3E7' }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 72 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: '#FDE3E7',
            paddingTop: 35,
            paddingHorizontal: 24,
            paddingBottom: 0,
            overflow: 'visible',
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              position: 'absolute',
              top: 30,
              left: 20,
              zIndex: 30,
              backgroundColor: pressed ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.92)',
              borderRadius: 999,
              padding: 9,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 4,
            })}
          >
            <Ionicons name="arrow-back" size={20} color="#6CA8C2" />
          </Pressable>

          {/* Card Container */}
          <View
            style={{
              marginTop: IMG_OVERFLOW,
              overflow: 'visible',
            }}
          >
            {/* Texture layers */}
            <View
              style={{
                position: 'absolute',
                top: -9,
                left: -9,
                right: 8,
                bottom: 8,
                borderRadius: 30,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: -6,
                left: 9,
                right: -10,
                bottom: 6,
                borderRadius: 26,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 9,
                left: -8,
                right: 7,
                bottom: -9,
                borderRadius: 28,
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 7,
                left: 8,
                right: -8,
                bottom: -10,
                borderRadius: 24,
              }}
            />

            <View
              style={{
                backgroundColor: '#9BCEC1',
                borderRadius: 20,
                height: CARD_HEIGHT,
                overflow: 'visible',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 20,
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: -IMG_OVERFLOW,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                  zIndex: 1,
                  elevation: 10,
                  height: DOCTOR_IMG_H,
                }}
              >
                <Image
                  source={doctor.image}
                  style={{
                    width: isIwan ? SCREEN_WIDTH * 0.78 : SCREEN_WIDTH * 0.68,
                    height: '100%',
                  }}
                  contentFit="contain"
                  contentPosition="bottom"
                />
              </View>

              <View
                style={{
                  backgroundColor: '#6CA8C2',
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  width: '85%',
                  alignItems: 'center',
                  zIndex: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'FuzzyBubbles_700Bold',
                    fontSize: 17,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    letterSpacing: 0.3,
                  }}
                  numberOfLines={2}
                >
                  {cleanDoctorName}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text
            style={{
              fontFamily: 'FuzzyBubbles_700Bold',
              fontSize: 17,
              color: '#6F6365',
              marginBottom: 14,
            }}
          >
            Informasi Dokter
          </Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <InfoBadge
              icon={<Feather name="briefcase" size={20} color="#FFFFFF" />}
              label={doctor.experience || '10 Tahun\nPengalaman'}
            />
            <InfoBadge
              icon={<Feather name="check-circle" size={20} color="#FFFFFF" />}
              label={
                doctor.specialization.includes('\n')
                  ? doctor.specialization
                  : `${doctor.specialization}\nSpesialisasi`
              }
            />
            <InfoBadge
              icon={<Feather name="clock" size={20} color="#FFFFFF" />}
              label={doctor.practiceHours || '09:00-20:00\nJam Praktik'}
            />
          </View>

          {/* Hospital indicator badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.75)',
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 12,
              marginTop: 12,
              gap: 8,
            }}
          >
            <Feather name="map-pin" size={16} color="#6CA8C2" />
            <Text
              style={{
                fontFamily: 'FuzzyBubbles_700Bold',
                fontSize: 12,
                color: '#6CA8C2',
                flex: 1,
              }}
              numberOfLines={1}
            >
              Praktik di {doctor.hospital}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <Text
            style={{
              fontFamily: 'FuzzyBubbles_700Bold',
              fontSize: 17,
              color: '#6F6365',
              marginBottom: 14,
            }}
          >
            Buat Janji Temu
          </Text>

          <View style={{ overflow: 'visible' }}>
            <View
              style={{
                backgroundColor: '#FFB6A6',
                borderRadius: 24,
                padding: 18,
                paddingBottom: 36,
              }}
            >
              {/* Date Row */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'FuzzyBubbles_700Bold',
                    fontSize: 16,
                    color: '#FFFFFF',
                  }}
                >
                  {formattedDate}
                </Text>
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    borderRadius: 12,
                    padding: 7,
                  }}
                >
                  <Feather name="calendar" size={18} color="#FFFFFF" />
                </View>
              </View>

              {/* Time Slots */}
              <View style={{ gap: 10 }}>
                {TIME_SLOTS.map((row, rowIndex) => (
                  <View
                    key={rowIndex}
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                  >
                    {row.map((time) => (
                      <TimeSlotButton
                        key={time}
                        time={time}
                        isSelected={selectedTime === time}
                        onPress={() => setSelectedTime(time)}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View
              style={{
                position: 'absolute',
                bottom: -22,
                right: 16,
                zIndex: 10,
                elevation: 10,
              }}
            >
              <Pressable
                onPress={handleReservasi}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#F5F5F5' : '#FFFFFF',
                  borderRadius: 999,
                  paddingVertical: 14,
                  paddingHorizontal: 34,
                })}
              >
                <Text
                  style={{
                    fontFamily: 'FuzzyBubbles_700Bold',
                    fontSize: 15,
                    color: '#6CA8C2',
                  }}
                >
                  Reservasi Sekarang
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
