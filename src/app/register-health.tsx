import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Pressable,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const C = {
  bg: '#FDE3E7',
  btn: '#F0A080',
  btnText: '#FFFFFF',
  blueText: '#7DC8E8',
  darkBlueText: '#5A9BB3', // Darker blue for readability
  cardBg: 'rgba(255, 255, 255, 0.45)', // Frosted glass effect
};

// Replaced Checkbox with modern clickable Chips
function Chip({ label, checked, onPress }: { label: string, checked: boolean, onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: checked ? C.blueText : '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: checked ? C.blueText : '#E0E0E0',
        elevation: checked ? 3 : 1,
        shadowColor: checked ? C.blueText : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: checked ? 0.3 : 0.05,
        shadowRadius: 3,
      }}
    >
      <Text
        style={{
          fontFamily: checked ? 'FuzzyBubbles_700Bold' : 'FuzzyBubbles_700Bold',
          color: checked ? '#FFFFFF' : '#A0B8C4',
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Section({ title, options, selected, onToggle }: { title: string, options: string[], selected: string[], onToggle: (opt: string) => void }) {
  return (
    <View className="mb-6 mx-5 p-5" style={{ backgroundColor: C.cardBg, borderRadius: 24 }}>
      <Text className="font-fuzzy-bold text-[18px] mb-4" style={{ color: C.darkBlueText }}>
        {title}
      </Text>
      <View className="flex-row flex-wrap">
        {options.map(opt => (
          <Chip
            key={opt}
            label={opt}
            checked={selected.includes(opt)}
            onPress={() => onToggle(opt)}
          />
        ))}
      </View>
    </View>
  );
}

export default function RegisterHealthScreen() {
  const router = useRouter();
  const [kondisi, setKondisi] = useState<string[]>([]);
  const [riwayat, setRiwayat] = useState<string[]>([]);
  const [gejala, setGejala] = useState<string[]>([]);
  const [perawatan, setPerawatan] = useState<string[]>([]);

  const toggleArray = (setter: React.Dispatch<React.SetStateAction<string[]>>, array: string[], item: string) => {
    if (array.includes(item)) setter(array.filter(i => i !== item));
    else setter([...array, item]);
  };

  const handleLanjut = () => {
    // Selesai registrasi -> kembali ke dashboard
    router.replace('/dashboard');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, paddingTop: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot decoration on top right */}
        <View className="absolute top-0 right-0 z-10" style={{ marginTop: -20, marginRight: -20 }} pointerEvents="none">
          <Image
            source={require('@/assets/mascot/SayHi.svg')}
            style={{ width: 205, height: 205 }}
            contentFit="contain"
          />
        </View>

        <View style={{ marginTop: 120, zIndex: 20 }}>
          <Section
            title="Kondisi Pernapasan"
            options={['Sehat', 'Sering mengalami gangguan napas', 'Kadang mengalami gangguan napas']}
            selected={kondisi}
            onToggle={(opt) => toggleArray(setKondisi, kondisi, opt)}
          />

          <Section
            title="Riwayat Pernapasan"
            options={['Tidak ada', 'Lainnya', 'Alergi pernapasan']}
            selected={riwayat}
            onToggle={(opt) => toggleArray(setRiwayat, riwayat, opt)}
          />

          <Section
            title="Gejala Pemicu"
            options={['Debu', 'Bulu hewan', 'Cuaca dingin', 'Asap polusi', 'Aktivitas berat', 'Tidak tahu']}
            selected={gejala}
            onToggle={(opt) => toggleArray(setGejala, gejala, opt)}
          />

          <Section
            title="Perawatan Saat Ini"
            options={['Tidak ada', 'Menggunakan nebulizer', 'Menggunakan inhaler', 'Obat dari dokter']}
            selected={perawatan}
            onToggle={(opt) => toggleArray(setPerawatan, perawatan, opt)}
          />
        </View>
      </ScrollView>

      {/* Floating Button fixed at bottom right */}
      <View className="absolute bottom-10 right-0">
        <Pressable
          onPress={handleLanjut}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#E8909A' : C.btn,
            borderTopLeftRadius: 999,
            borderBottomLeftRadius: 999,
            paddingVertical: 14,
            paddingHorizontal: 28,
            elevation: 4,
            shadowColor: C.btn,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            flexDirection: 'row',
            alignItems: 'center',
          })}
        >
          <Text className="text-white font-fuzzy-bold text-[22px] mr-2" style={{ marginTop: -4 }}>
            →
          </Text>
          <Text className="text-white font-fuzzy-bold text-xl">
            Lanjutkan
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
