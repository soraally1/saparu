import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useParuStore, ParuHistoryItem } from '@/store/useParuStore';

export default function ParuHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { history, loadHistory, deleteHistory, isLoading } = useParuStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ParuHistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getPredictionColor = (prediction: string = '') => {
    const p = prediction.toLowerCase();
    if (p.includes('normal')) {
      return { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9', iconColor: '#2E7D32' };
    }
    if (p.includes('wheez') || p.includes('mengi')) {
      return { bg: '#FFF3E0', text: '#E65100', border: '#FFE0B2', iconColor: '#E65100' };
    }
    if (p.includes('crack') || p.includes('ronk') || p.includes('rhonch') || p.includes('stridor')) {
      return { bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2', iconColor: '#C62828' };
    }
    return { bg: '#E0F2F1', text: '#00695C', border: '#B2DFDB', iconColor: '#00695C' };
  };

  const handleDelete = (id: string, prediction: string) => {
    Alert.alert(
      'Hapus Riwayat',
      `Apakah Anda yakin ingin menghapus hasil pemeriksaan "${prediction}" ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            if (selectedItem?.id === id) {
              setSelectedItem(null);
            }
            deleteHistory(id);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 10, 48) }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Feather name="arrow-left" size={22} color="#3D7371" />
        </Pressable>
        <Text style={styles.headerTitle}>Riwayat Suara Paru</Text>
        <View style={{ width: 40 }} />
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
          const badge = getPredictionColor(item.prediction);

          return (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() => setSelectedItem(item)}
            >
              {/* Card Header: Date & Accuracy */}
              <View style={styles.cardHeader}>
                <View style={styles.dateBadge}>
                  <Feather name="calendar" size={13} color="#6CA8C2" style={{ marginRight: 5 }} />
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                </View>

                <View style={styles.confidenceBadge}>
                  <Feather name="check-circle" size={12} color="#6CA8C2" style={{ marginRight: 4 }} />
                  <Text style={styles.confidenceText}>
                    {typeof item.confidence === 'number' ? item.confidence.toFixed(1) : item.confidence}% Akurasi
                  </Text>
                </View>
              </View>

              {/* Main Detection Result Banner */}
              <View style={[styles.resultBanner, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF' }]}>
                  <MaterialCommunityIcons name="lungs" size={22} color={badge.iconColor} />
                </View>
                <View style={styles.resultTextCol}>
                  <Text style={styles.resultLabel}>Hasil Deteksi Suara</Text>
                  <Text style={[styles.predictionValue, { color: badge.text }]}>
                    {item.prediction}
                  </Text>
                </View>
              </View>

              {/* Brief Clinical Summary (Singkat 2 Baris) */}
              {item.diagnosis ? (
                <Text style={styles.summaryText} numberOfLines={2}>
                  {item.diagnosis}
                </Text>
              ) : null}

              {/* Card Footer: Delete & Detail Button */}
              <View style={styles.cardFooter}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id, item.prediction);
                  }}
                  style={styles.deleteButton}
                  hitSlop={8}
                >
                  <Feather name="trash-2" size={15} color="#999999" />
                  <Text style={styles.deleteButtonText}>Hapus</Text>
                </Pressable>

                <Pressable
                  style={styles.detailButton}
                  onPress={() => setSelectedItem(item)}
                >
                  <Text style={styles.detailButtonText}>Lihat Detail</Text>
                  <Feather name="chevron-right" size={15} color="#3D7371" style={{ marginLeft: 3 }} />
                </Pressable>
              </View>
            </Pressable>
          );
        })}

        {/* Empty State */}
        {history.length === 0 && !isLoading && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="microphone-outline" size={54} color="#6CA8C2" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
            <Text style={styles.emptySubtitle}>
              Rekaman auskultasi dan deteksi suara paru-paru Anda akan otomatis tercatat di sini secara ringkas.
            </Text>
            <Pressable
              style={styles.startScanButton}
              onPress={() => router.push('/scan-paru')}
            >
              <MaterialCommunityIcons name="microphone" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.startScanButtonText}>Mulai Rekam Suara Paru</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal Pop-up */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSelectedItem(null)}
          />

          {selectedItem && (
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalDate}>{formatDate(selectedItem.date)}</Text>
                  <Text style={styles.modalTitle}>Detail Pemeriksaan</Text>
                </View>

                <Pressable
                  onPress={() => setSelectedItem(null)}
                  style={styles.modalCloseButton}
                  hitSlop={10}
                >
                  <Feather name="x" size={20} color="#555555" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Status Result Card */}
                {(() => {
                  const badge = getPredictionColor(selectedItem.prediction);
                  return (
                    <View style={[styles.resultBanner, { backgroundColor: badge.bg, borderColor: badge.border, marginBottom: 16 }]}>
                      <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF' }]}>
                        <MaterialCommunityIcons name="lungs" size={24} color={badge.iconColor} />
                      </View>
                      <View style={styles.resultTextCol}>
                        <Text style={styles.resultLabel}>Klasifikasi AI ({selectedItem.confidence.toFixed(1)}%)</Text>
                        <Text style={[styles.predictionValue, { color: badge.text, fontSize: 18 }]}>
                          {selectedItem.prediction}
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                {/* Full Clinical Analysis */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionTitleRow}>
                    <MaterialCommunityIcons name="stethoscope" size={18} color="#3D7371" style={{ marginRight: 6 }} />
                    <Text style={styles.sectionTitle}>Analisis Klinis Medis</Text>
                  </View>
                  <Text style={styles.modalBodyText}>
                    {selectedItem.diagnosis || 'Pemeriksaan auskultasi paru selesai dengan hasil di atas.'}
                  </Text>
                </View>

                {/* Full Recommendations */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionTitleRow}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#FFAE9D" style={{ marginRight: 6 }} />
                    <Text style={[styles.sectionTitle, { color: '#E65100' }]}>Saran & Rekomendasi Tindakan</Text>
                  </View>
                  <Text style={styles.modalBodyText}>
                    {selectedItem.recommendations || 'Pantau kondisi anak secara teratur dan konsultasikan ke dokter anak jika gejala berlanjut.'}
                  </Text>
                </View>

                {/* Close Button */}
                <Pressable
                  style={styles.modalDismissButton}
                  onPress={() => setSelectedItem(null)}
                >
                  <Text style={styles.modalDismissButtonText}>Tutup</Text>
                </Pressable>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
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
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9F8',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  dateText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 11,
    color: '#555555',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  confidenceText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 11,
    color: '#3D7371',
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 1,
  },
  resultTextCol: {
    flex: 1,
  },
  resultLabel: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 11,
    color: '#666666',
    marginBottom: 1,
  },
  predictionValue: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 16,
  },
  summaryText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  deleteButtonText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 11,
    color: '#999999',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  detailButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 12,
    color: '#3D7371',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalDate: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 12,
    color: '#888888',
  },
  modalTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 18,
    color: '#3D7371',
  },
  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSection: {
    backgroundColor: '#F8FAF9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6CA8C2',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 14,
    color: '#3D7371',
  },
  modalBodyText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 13,
    color: '#444444',
    lineHeight: 20,
  },
  modalDismissButton: {
    backgroundColor: '#6CA8C2',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalDismissButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  emptyTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  startScanButton: {
    backgroundColor: '#FFAE9D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 20,
    elevation: 3,
  },
  startScanButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
