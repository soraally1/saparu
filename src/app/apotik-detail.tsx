import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { APOTIK_DATA } from './apotik';

export default function ApotikDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; apotikId?: string }>();
  const apotikId = params.id || params.apotikId;

  const apotik = APOTIK_DATA.find((a: any) => a.id === apotikId) || APOTIK_DATA[0];

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${apotik.name} ${apotik.address}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <Feather name="arrow-left" size={24} color="#3D7371" />
        </Pressable>
        <Text style={styles.headerTitle}>Detail Apotik</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section: Pharmacy Photo + Overlay Badge */}
        <View style={styles.heroWrapper}>
          <Image
            source={apotik.imageSource}
            style={styles.heroImage}
            contentFit="cover"
          />

          {/* Pharmacy Name & Address Card */}
          <View style={styles.pharmacyBadge}>
            <Text style={styles.pharmacyName}>{apotik.name}</Text>
            <View style={styles.addressRow}>
              <Feather name="map-pin" size={14} color="#6CA8C2" style={{ marginRight: 4 }} />
              <Text style={styles.addressText}>{apotik.address}</Text>
            </View>
          </View>
        </View>

        {/* Section Obat Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Obat</Text>
        </View>

        {/* Horizontal Medicine Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.medicinesScroll}
        >
          {apotik.medicines.map((med: any) => (
            <View key={med.id} style={styles.medicineCard}>
              <View style={styles.medicineImageContainer}>
                <Image
                  source={{ uri: med.imageUrl }}
                  style={styles.medicineImage}
                  contentFit="cover"
                />
              </View>
              <Text style={styles.medicineNameText} numberOfLines={2}>
                {med.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Button: Cek Lokasi */}
        <Pressable style={styles.cekLokasiButton} onPress={handleOpenMaps}>
          <Feather name="navigation" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.cekLokasiText}>Cek Lokasi</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#95C1B6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    elevation: 3,
  },
  headerTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroWrapper: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: 280,
    borderRadius: 28,
    backgroundColor: '#A8D2C8',
  },
  pharmacyBadge: {
    backgroundColor: '#FFE5E5',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '88%',
    marginTop: -45,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  pharmacyName: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 18,
    color: '#6CA8C2',
    marginBottom: 4,
    textAlign: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 12,
    color: '#6CA8C2',
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  medicinesScroll: {
    gap: 14,
    paddingVertical: 4,
    marginBottom: 32,
  },
  medicineCard: {
    backgroundColor: '#FFAE9D',
    width: 140,
    height: 180,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  medicineImageContainer: {
    width: 116,
    height: 116,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  medicineImage: {
    width: '100%',
    height: '100%',
  },
  medicineNameText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cekLokasiButton: {
    backgroundColor: '#6CA8C2',
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cekLokasiText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
