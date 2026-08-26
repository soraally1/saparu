import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useRoentgenStore } from '@/store/useRoentgenStore';

export default function ScanRoentgenHistoryScreen() {
  const router = useRouter();
  const { history, loadHistory, deleteHistory, isLoading } = useRoentgenStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getSeverityColor = (severity?: string) => {
    const s = severity?.toLowerCase() || '';
    if (s.includes('normal')) return { bg: '#E8F5E9', text: '#2E7D32' };
    if (s.includes('ringan')) return { bg: '#E0F2F1', text: '#00695C' };
    if (s.includes('sedang')) return { bg: '#FFF3E0', text: '#E65100' };
    return { bg: '#FFEBEE', text: '#C62828' };
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#3D7371" />
        </Pressable>
        <Text style={styles.title}>Riwayat Diagnosis{'\n'}Foto Rontgen</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            colors={['#6CA8C2', '#FFAE9D']}
            tintColor="#6CA8C2"
          />
        }
      >
        {history.map((item) => {
          const badge = getSeverityColor(item.severity);
          const displayImage = item.imageUrl || item.imageBase64 || item.imageUri;

          return (
            <View key={item.id} style={styles.card}>
              {/* Card Top: Date & Severity Badge */}
              <View style={styles.cardHeader}>
                <View style={styles.cardDateContainer}>
                  <Feather name="calendar" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.cardDate}>{item.date}</Text>
                </View>

                {item.severity && (
                  <View style={[styles.severityBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.severityBadgeText, { color: badge.text }]}>
                      {item.severity}
                    </Text>
                  </View>
                )}
              </View>

              {/* Middle Section: Thumbnail Image & Diagnosis Title */}
              <View style={styles.cardBody}>
                {displayImage ? (
                  <Image
                    source={{ uri: displayImage }}
                    style={styles.thumbnail}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.thumbnailPlaceholder}>
                    <MaterialCommunityIcons name="image" size={28} color="#6CA8C2" />
                  </View>
                )}

                <View style={styles.cardInfo}>
                  <Text style={styles.cardDiagnosisTitle} numberOfLines={2}>
                    {item.diagnosisTitle || 'Analisis Rontgen Dada'}
                  </Text>
                  <Text style={styles.cardDiagnosisDescription} numberOfLines={2}>
                    {item.diagnosis}
                  </Text>
                </View>
              </View>

              {/* Card Footer: Detail Button & Delete Option */}
              <View style={styles.cardFooter}>
                <Pressable
                  onPress={() => deleteHistory(item.id)}
                  style={styles.deleteButton}
                  hitSlop={8}
                >
                  <Feather name="trash-2" size={16} color="rgba(255, 255, 255, 0.8)" />
                </Pressable>

                <Pressable
                  style={styles.detailButton}
                  onPress={() =>
                    router.push({
                      pathname: '/scan-roentgen/result',
                      params: { imageUri: displayImage },
                    })
                  }
                >
                  <Text style={styles.detailButtonText}>Lihat Detail</Text>
                  <Feather name="chevron-right" size={16} color="#3D7371" style={{ marginLeft: 4 }} />
                </Pressable>
              </View>
            </View>
          );
        })}

        {history.length === 0 && !isLoading && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="radiology-box-outline" size={64} color="#95C1B6" />
            <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
            <Text style={styles.emptyText}>
              Foto rontgen yang Anda pindai dan simpan akan otomatis tersinkronisasi ke Firestore dan tercatat di sini.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE5E5',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    elevation: 2,
  },
  title: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 22,
    color: '#3D7371',
    lineHeight: 28,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: '#6CA8C2',
    borderRadius: 20,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDate: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  severityBadgeText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 11,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#95C1B6',
  },
  thumbnailPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#E8F5F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardDiagnosisTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  cardDiagnosisDescription: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  deleteButton: {
    padding: 6,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  detailButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 12,
    color: '#3D7371',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 18,
    color: '#3D7371',
    marginTop: 16,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 13,
    color: '#7A6B6B',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
