import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  bg: '#9BCEC1',
  card: '#FDE3E7',
  deep: '#D4608A',
  rose: '#C1607A',
  text: '#7D3E50',
  muted: '#C07088',
  btn: '#F0A080',
  placeholder: '#C8A0AE',
  divider: '#F5CEDD',
  badge1: '#FFDDE8',
  badge2: '#D4F4EE',
};

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAgree?: () => void;
}

const SectionHeader = ({
  icon,
  title,
  badgeColor,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  badgeColor: string;
}) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.iconCircle, { backgroundColor: badgeColor }]}>
      <Feather name={icon} size={16} color={C.deep} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const Bullet = ({ text }: { text: string }) => (
  <View style={styles.bulletRow}>
    <View style={styles.bulletDot} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const HighlightBox = ({
  icon,
  text,
  color,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  text: string;
  color: string;
}) => (
  <View style={[styles.highlightBox, { borderLeftColor: color }]}>
    <Feather name={icon} size={14} color={color} style={{ marginTop: 1 }} />
    <Text style={styles.highlightText}>{text}</Text>
  </View>
);

export default function TermsModal({ visible, onClose, onAgree }: TermsModalProps) {
  const insets = useSafeAreaInsets();
  const handleAgree = onAgree ?? onClose;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom + 16, 28) },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Syarat &amp; Ketentuan</Text>
              <Text style={styles.headerSubtitle}>Penggunaan Aplikasi SAPARU</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Feather name="x" size={20} color={C.rose} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Scrollable content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Section 1 */}
            <View style={styles.section}>
              <SectionHeader
                icon="alert-circle"
                title="1. Batasan Layanan & Penyangkalan Medis"
                badgeColor={C.badge1}
              />
              <HighlightBox
                icon="info"
                color={C.deep}
                text="Hanya Sebagai Analisis Awal: Aplikasi SAPARU dirancang eksklusif sebagai alat bantu skrining awal berbasis kecerdasan buatan. Bukan pengganti diagnosis medis profesional, konsultasi dokter, maupun keputusan klinis."
              />
              <View style={{ marginTop: 10, gap: 8 }}>
                <Bullet text="Larangan Self-Diagnosed: Pengguna dilarang keras melakukan diagnosis mandiri atau mengambil tindakan medis sepihak (mengubah dosis obat, memulai pengobatan baru) semata-mata berdasarkan hasil, probabilitas, atau skor risiko dari aplikasi ini." />
                <Bullet text="Kewajiban Konsultasi Dokter: Setiap hasil analisis, dugaan patologi pernapasan, maupun peringatan Red Flags Alert wajib dikonsultasikan langsung kepada dokter spesialis anak atau tenaga kesehatan di fasilitas layanan terkait." />
                <Bullet text="Kondisi Darurat: Jika anak menunjukkan tanda bahaya atau sesak napas berat, jangan hanya bergantung pada aplikasi — segera menuju Instalasi Gawat Darurat (IGD) rumah sakit terdekat." />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Section 2 */}
            <View style={styles.section}>
              <SectionHeader
                icon="shield"
                title="2. Privasi & Keamanan Data Rekaman"
                badgeColor={C.badge2}
              />
              <HighlightBox
                icon="lock"
                color={C.bg}
                text="Pemrosesan Tanpa Penyimpanan Terekam: Kami berkomitmen penuh melindungi privasi Anda. Data rekaman audio (suara napas/batuk) hanya digunakan untuk pemrosesan analisis sesaat (real-time signal processing)."
              />
              <View style={{ marginTop: 10, gap: 8 }}>
                <Bullet text="Tidak Disimpan di Server: Data rekaman tidak disimpan secara permanen. Segera setelah AI selesai mengekstraksi hasil analisis awal, data rekaman otomatis dihapus dari sistem." />
                <Bullet text="Jaminan Keamanan: Mekanisme pemrosesan tanpa penyimpanan memastikan privasi rekaman data pasien Anda aman dari risiko penyalahgunaan atau kebocoran data pihak ketiga." />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Footer note */}
            <View style={styles.footerNote}>
              <Feather name="check-circle" size={14} color={C.bg} style={{ marginTop: 1 }} />
              <Text style={styles.footerNoteText}>
                Dengan menggunakan SAPARU, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat & ketentuan di atas.
              </Text>
            </View>
          </ScrollView>

          {/* CTA */}
          <Pressable style={styles.agreeBtn} onPress={handleAgree}>
            <Feather name="check" size={16} color="white" />
            <Text style={styles.agreeBtnText}>Saya Mengerti &amp; Setuju</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(60,30,40,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFAFC',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '88%',
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: C.divider,
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'FuzzyBubbles-Bold',
    color: C.deep,
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'FuzzyBubbles-Regular',
    color: C.muted,
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.badge1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 14,
    borderRadius: 99,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  section: {
    gap: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'FuzzyBubbles-Bold',
    color: C.text,
    flex: 1,
    lineHeight: 18,
  },
  highlightBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFF4F8',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    alignItems: 'flex-start',
  },
  highlightText: {
    fontSize: 12,
    fontFamily: 'FuzzyBubbles-Regular',
    color: '#7D3E50',
    lineHeight: 18,
    flex: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.placeholder,
    marginTop: 6,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 12,
    fontFamily: 'FuzzyBubbles-Regular',
    color: C.text,
    lineHeight: 18,
    flex: 1,
  },
  footerNote: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#EEF9F7',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  footerNoteText: {
    fontSize: 11,
    fontFamily: 'FuzzyBubbles-Regular',
    color: C.text,
    lineHeight: 16,
    flex: 1,
  },
  agreeBtn: {
    marginTop: 14,
    backgroundColor: C.btn,
    borderRadius: 999,
    paddingVertical: 15,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeBtnText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'FuzzyBubbles-Bold',
    letterSpacing: 0.5,
  },
});
