import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardScreen() {
  const router = useRouter();
  const logout = useAuthStore(state => state.logout);
  const patient = useAuthStore(state => state.patient);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-saparu-bg items-center justify-center px-6">
      <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 24, color: '#D4608A', marginBottom: 12 }}>
        Dashboard Sementara
      </Text>
      
      {patient && (
        <View className="bg-white p-4 rounded-xl shadow-sm mb-8 w-full max-w-sm">
          <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 16, color: '#7D3E50', marginBottom: 8 }}>
            Selamat datang, {patient.parent_name}!
          </Text>
          <Text style={{ fontFamily: 'FuzzyBubbles_400Regular', fontSize: 14, color: '#7D3E50' }}>
            Ini adalah halaman dashboard sementara setelah kamu berhasil login/register.
          </Text>
        </View>
      )}

      <Pressable 
        onPress={handleLogout}
        className="w-full max-w-sm items-center"
        style={{
          backgroundColor: '#F0A080',
          borderRadius: 999,
          paddingVertical: 14,
          elevation: 2,
        }}>
        <Text style={{ fontFamily: 'FuzzyBubbles_700Bold', fontSize: 16, color: 'white' }}>
          L O G O U T
        </Text>
      </Pressable>
    </View>
  );
}
