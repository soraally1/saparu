import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image as RNImage,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { analyzeRoentgenImage, RoentgenAnalysisResult } from '@/utils/roentgenApi';
import { useRoentgenStore } from '@/store/useRoentgenStore';

const { width } = Dimensions.get('window');

export default function ScanRoentgenResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri?: string; imageBase64?: string }>();
  const imageUri = Array.isArray(params.imageUri) ? params.imageUri[0] : params.imageUri;
  const imageBase64Param = Array.isArray(params.imageBase64) ? params.imageBase64[0] : params.imageBase64;

  const [result, setResult] = useState<RoentgenAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(imageBase64Param || null);

  const addHistory = useRoentgenStore((state) => state.addHistory);

  useEffect(() => {
    if (imageUri) {
      loadAndProcess(imageUri);
    }
  }, [imageUri]);

  const loadAndProcess = async (uri: string) => {
    try {
      setIsLoading(true);

      // 1. Dapatkan Base64 gambar (dari param langsung atau baca file)
      if (imageBase64Param) {
        setImageBase64(imageBase64Param);
      } else if (uri) {
        try {
          const decodedUri = decodeURI(uri);
          const base64 = await FileSystem.readAsStringAsync(decodedUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(`data:image/jpeg;base64,${base64}`);
        } catch {
          try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            setImageBase64(`data:image/jpeg;base64,${base64}`);
          } catch (err) {
            console.log('Info: Menggunakan URI gambar lokal langsung');
          }
        }
      }

      // 2. Jalankan Analisis AI Rontgen Lengkap (Qwen 3.6 27B)
      const data = await analyzeRoentgenImage(uri);
      setResult(data);
    } catch (e) {
      console.error('Error menganalisis gambar rontgen:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (result && imageUri && !isSaving) {
      try {
        setIsSaving(true);
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        };
        const dateString = today.toLocaleDateString('id-ID', options);

        // Simpan ke Zustand & Persistent Storage dengan Base64 image
        await addHistory({
          date: dateString,
          imageUri: imageUri,
          imageBase64: imageBase64 || undefined,
          diagnosisTitle: result.diagnosisTitle,
          diagnosis: result.diagnosis,
          severity: result.severity,
          confidence: result.confidence,
          findings: result.findings,
          recommendations: result.recommendations,
          redFlags: result.redFlags,
        });

        router.replace('/scan-roentgen/history');
      } catch (err) {
        console.error('Gagal menyimpan hasil:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getSeverityBadgeColor = (severity?: string) => {
    const s = severity?.toLowerCase() || '';
    if (s.includes('normal')) return { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' };
    if (s.includes('ringan')) return { bg: '#E0F2F1', text: '#00695C', border: '#80CBC4' };
    if (s.includes('sedang')) return { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80' };
    return { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' };
  };

  if (isLoading || !result) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6CA8C2" />
        <Text style={styles.loadingTitle}>Menganalisis Citra Rontgen...</Text>
        <Text style={styles.loadingSubtitle}>
          Menghubungkan ke Model AI Qwen untuk evaluasi lapang paru, siluet jantung, dan diafragma
        </Text>
      </View>
    );
  }

  const badgeColor = getSeverityBadgeColor(result.severity);

  return (
    <View style={styles.mainContainer}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.headerBackButton}>
          <Feather name="arrow-left" size={22} color="#3D7371" />
        </Pressable>
        <Text style={styles.headerBarTitle}>Hasil Analisis Rontgen</Text>
        <Pressable
          onPress={() => router.push('/scan-roentgen/history')}
          style={styles.headerBackButton}
        >
          <Feather name="clock" size={20} color="#3D7371" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Gambar Foto Rontgen Terlampir */}
        <View style={styles.imageCard}>
          {imageBase64 || imageUri ? (
            <Image
              source={{ uri: imageBase64 || imageUri }}
              style={styles.image}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="image-off-outline" size={48} color="#95C1B6" />
              <Text style={styles.imagePlaceholderText}>Gambar tidak tersedia</Text>
            </View>
          )}
          <View style={styles.imageBadge}>
            <MaterialCommunityIcons name="camera-iris" size={14} color="#FFFFFF" />
            <Text style={styles.imageBadgeText}>Foto Rontgen Terlampir</Text>
          </View>
        </View>

        {/* 2. Diagnosis Utama & Status Badge */}
        <View style={styles.diagnosisCard}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: badgeColor.bg, borderColor: badgeColor.border },
              ]}
            >
              <Text style={[styles.severityBadgeText, { color: badgeColor.text }]}>
                Status: {result.severity || 'Terekam'}
              </Text>
            </View>

            <View style={styles.confidenceBadge}>
              <Feather name="check-circle" size={13} color="#6CA8C2" style={{ marginRight: 4 }} />
              <Text style={styles.confidenceText}>{result.confidence.toFixed(1)}% Akurasi</Text>
            </View>
          </View>

          <Text style={styles.diagnosisTitle}>{result.diagnosisTitle}</Text>
          <Text style={styles.diagnosisDescription}>{result.diagnosis}</Text>
        </View>

        {/* 3. Detail Temuan Radiologis (4 Area Anatomi) */}
        {result.findings && (
          <View style={styles.findingsSection}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#3D7371" />
              <Text style={styles.sectionTitle}>Detail Temuan Radiologis</Text>
            </View>

            {/* Lapang Paru */}
            {result.findings.lungField && (
              <View style={styles.findingCard}>
                <View style={styles.findingHeader}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="lungs" size={18} color="#3D7371" />
                  </View>
                  <Text style={styles.findingCardTitle}>Lapang Paru & Corakan Vaskular</Text>
                </View>
                <Text style={styles.findingCardText}>{result.findings.lungField}</Text>
              </View>
            )}

            {/* Jantung & Mediastinum */}
            {result.findings.heartAndMediastinum && (
              <View style={styles.findingCard}>
                <View style={styles.findingHeader}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="heart-pulse" size={18} color="#E91E63" />
                  </View>
                  <Text style={styles.findingCardTitle}>Jantung & Mediastinum (CTR)</Text>
                </View>
                <Text style={styles.findingCardText}>{result.findings.heartAndMediastinum}</Text>
              </View>
            )}

            {/* Diafragma & Sinus Kostofrenikus */}
            {result.findings.diaphragmAndSinus && (
              <View style={styles.findingCard}>
                <View style={styles.findingHeader}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="sine-wave" size={18} color="#6CA8C2" />
                  </View>
                  <Text style={styles.findingCardTitle}>Diafragma & Sudut Kostofrenikus</Text>
                </View>
                <Text style={styles.findingCardText}>{result.findings.diaphragmAndSinus}</Text>
              </View>
            )}

            {/* Struktur Tulang & Dinding Dada */}
            {result.findings.bones && (
              <View style={styles.findingCard}>
                <View style={styles.findingHeader}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="bone" size={18} color="#3D7371" />
                  </View>
                  <Text style={styles.findingCardTitle}>Struktur Tulang & Skeletal Toraks</Text>
                </View>
                <Text style={styles.findingCardText}>{result.findings.bones}</Text>
              </View>
            )}
          </View>
        )}

        {/* 4. Rekomendasi & Tindakan Medis */}
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <MaterialCommunityIcons name="stethoscope" size={22} color="#FFFFFF" />
            <Text style={styles.recommendationTitle}>Rekomendasi & Tindakan Medis</Text>
          </View>
          <Text style={styles.recommendationText}>{result.recommendations}</Text>
        </View>

        {/* 5. Tanda Bahaya (Red Flags Alert) */}
        {result.redFlags && result.redFlags.length > 0 && (
          <View style={styles.redFlagsCard}>
            <View style={styles.redFlagsHeader}>
              <Ionicons name="warning-outline" size={20} color="#D32F2F" />
              <Text style={styles.redFlagsTitle}>Tanda Bahaya (Segera ke IGD)</Text>
            </View>
            {result.redFlags.map((flag, idx) => (
              <View key={idx} style={styles.redFlagRow}>
                <Text style={styles.redFlagBullet}>•</Text>
                <Text style={styles.redFlagText}>{flag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 6. Tombol Simpan & Lanjutkan */}
        <Pressable
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
          onPress={handleSaveAndContinue}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather name="check-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Simpan ke Riwayat Pasien</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFE5E5',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBarTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 18,
    color: '#3D7371',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 30,
  },
  loadingTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 20,
    color: '#3D7371',
    marginTop: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  imageCard: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#95C1B6',
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5F2',
  },
  imagePlaceholderText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 13,
    color: '#6CA8C2',
    marginTop: 8,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  imageBadgeText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  diagnosisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  severityBadgeText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 12,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 12,
    color: '#6CA8C2',
  },
  diagnosisTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 20,
    color: '#2D4A47',
    marginBottom: 8,
    lineHeight: 26,
  },
  diagnosisDescription: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 14,
    color: '#555555',
    lineHeight: 22,
  },
  findingsSection: {
    width: '100%',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  sectionTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 16,
    color: '#3D7371',
  },
  findingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#95C1B6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  findingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  findingCardTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 14,
    color: '#3D7371',
  },
  findingCardText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 13,
    color: '#555555',
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: '#6CA8C2',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  recommendationTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  recommendationText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  redFlagsCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  redFlagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  redFlagsTitle: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 14,
    color: '#D32F2F',
  },
  redFlagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  redFlagBullet: {
    color: '#D32F2F',
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  redFlagText: {
    flex: 1,
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 12,
    color: '#B71C1C',
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#FFAE9D',
    flexDirection: 'row',
    paddingVertical: 16,
    width: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  saveButtonText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
