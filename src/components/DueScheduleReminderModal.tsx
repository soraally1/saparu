import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMedicationStore, MedicationSchedule } from '@/store/useMedicationStore';
import { getMedicineImageSource } from '@/store/usePharmacyStore';
import { addNotificationResponseListener } from '@/utils/notificationService';

const { width } = Dimensions.get('window');

export default function DueScheduleReminderModal() {
  const { schedules, toggleTaken, loadSchedules } = useMedicationStore();
  const [activeDueItem, setActiveDueItem] = useState<MedicationSchedule | null>(null);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Check periodically for schedules that match the current time
  useEffect(() => {
    loadSchedules();

    const checkDueSchedules = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const due = schedules.find((s) => {
        if (s.isTaken) return false;
        if (dismissedIds.includes(s.id)) return false;

        // Check if time matches or within +-2 minutes of current time
        const [itemH, itemM] = (s.time || '').split(':');
        if (!itemH || !itemM) return false;

        const itemMinutesTotal = parseInt(itemH, 10) * 60 + parseInt(itemM, 10);
        const currentMinutesTotal = now.getHours() * 60 + now.getMinutes();

        // Trigger if time is within current 3 minute window
        const diff = Math.abs(currentMinutesTotal - itemMinutesTotal);
        return diff <= 1;
      });

      if (due && !activeDueItem) {
        setActiveDueItem(due);
      }
    };

    const interval = setInterval(checkDueSchedules, 15000);
    checkDueSchedules();

    return () => clearInterval(interval);
  }, [schedules, dismissedIds, activeDueItem]);

  // Also listen for incoming push / local notification taps safely
  useEffect(() => {
    const subscription = addNotificationResponseListener((scheduleId) => {
      const found = schedules.find((s) => s.id === scheduleId);
      if (found && !found.isTaken) {
        setActiveDueItem(found);
      }
    });

    return () => subscription.remove();
  }, [schedules]);

  const handleMarkTaken = async () => {
    if (activeDueItem) {
      await toggleTaken(activeDueItem.id);
      setDismissedIds((prev) => [...prev, activeDueItem.id]);
      setActiveDueItem(null);
    }
  };

  const handleDismiss = () => {
    if (activeDueItem) {
      setDismissedIds((prev) => [...prev, activeDueItem.id]);
      setActiveDueItem(null);
    }
  };

  if (!activeDueItem) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={!!activeDueItem}
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Badge with Alarm Icon */}
          <View style={styles.topIconCircle}>
            <MaterialCommunityIcons name="bell-ring" size={32} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Waktunya Minum Obat! 💊</Text>
          <Text style={styles.subtitle}>
            Sudah masuk jadwal dosis untuk si kecil. Yuk berikan obatnya tepat waktu!
          </Text>

          {/* Medicine Details Card */}
          <View style={styles.detailsBox}>
            <View style={styles.imageWrapper}>
              <Image
                source={getMedicineImageSource(activeDueItem)}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.medName} numberOfLines={1}>
                {activeDueItem.name}
              </Text>
              <View style={styles.badgeRow}>
                <View style={styles.timeBadge}>
                  <Feather name="clock" size={12} color="#6CA8C2" style={{ marginRight: 4 }} />
                  <Text style={styles.timeBadgeText}>{activeDueItem.time} WIB</Text>
                </View>
                <View style={styles.dosageBadge}>
                  <Text style={styles.dosageBadgeText}>{activeDueItem.dosage}</Text>
                </View>
              </View>
              <Text style={styles.instructionText}>
                📌 {activeDueItem.instruction}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable style={styles.snoozeButton} onPress={handleDismiss}>
              <Text style={styles.snoozeText}>Nanti Dulu</Text>
            </Pressable>

            <Pressable style={styles.confirmButton} onPress={handleMarkTaken}>
              <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmText}>Sudah Diminum</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  topIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -48,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 20,
    color: '#3D7371',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  detailsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F8FBFA',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E8F1F5',
    marginBottom: 20,
    gap: 12,
  },
  imageWrapper: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8F1F5',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  medName: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F1F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timeBadgeText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 11,
    color: '#6CA8C2',
  },
  dosageBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dosageBadgeText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 11,
    color: '#F0A080',
  },
  instructionText: {
    fontFamily: 'FuzzyBubbles_400Regular',
    fontSize: 11,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  snoozeButton: {
    flex: 1,
    backgroundColor: '#F0F4F6',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snoozeText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 13,
    color: '#888',
  },
  confirmButton: {
    flex: 1.4,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  confirmText: {
    fontFamily: 'FuzzyBubbles_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
