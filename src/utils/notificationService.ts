import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { MedicationSchedule } from '@/store/useMedicationStore';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: typeof import('expo-notifications') | null = null;

try {
  // Only initialize expo-notifications outside Expo Go or when supported
  if (!isExpoGo) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notifications = require('expo-notifications');
    if (Notifications && Notifications.setNotificationHandler) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldPresentAlert: true,
          shouldShowList: true,
        }),
      });
    }
  }
} catch (e) {
  console.log('expo-notifications is not supported in Expo Go environment.');
}

/**
 * Request notification permissions from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications) {
    return false;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
      await Notifications.setNotificationChannelAsync('saparu_reminders', {
        name: 'Pengingat Jadwal Saparu',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6CA8C2',
        sound: 'default',
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.log('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a local notification for a specific medication schedule
 */
export async function scheduleMedicationNotification(item: MedicationSchedule): Promise<string | null> {
  if (!Notifications) {
    return null;
  }
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    // Parse time 'HH:mm'
    const [hoursStr, minutesStr] = (item.time || '08:00').split(':');
    const hours = parseInt(hoursStr, 10) || 8;
    const minutes = parseInt(minutesStr, 10) || 0;

    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    // If time has already passed today, schedule for tomorrow
    if (targetDate.getTime() <= now.getTime()) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const diffSeconds = Math.max(Math.floor((targetDate.getTime() - now.getTime()) / 1000), 1);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Waktunya Minum Obat! 💊`,
        body: `Saatnya memberikan ${item.name} (${item.dosage}) untuk anak Anda. (${item.instruction})`,
        data: {
          type: 'medication',
          scheduleId: item.id,
          name: item.name,
          dosage: item.dosage,
          time: item.time,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: diffSeconds,
        repeats: false,
      },
    });

    return notificationId;
  } catch (error) {
    console.log('Failed to schedule medication notification:', error);
    return null;
  }
}

/**
 * Schedule notification for Doctor Consultation Appointment
 */
export async function scheduleDoctorReservationNotification(details: {
  doctorName: string;
  hospital: string;
  dateStr: string;
  timeStr: string;
}): Promise<string | null> {
  if (!Notifications) {
    return null;
  }
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    // Instant reminder confirmation
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Janji Temu Dokter Terkonfirmasi! 👨‍⚕️`,
        body: `Reservasi dengan ${details.doctorName} di ${details.hospital} pada ${details.dateStr} pukul ${details.timeStr} WIB telah dicatat.`,
        sound: true,
      },
      trigger: null,
    });

    // Parse time 'HH:mm' for scheduled appointment reminder
    const [hoursStr, minutesStr] = (details.timeStr || '10:00').split(':');
    const hours = parseInt(hoursStr, 10) || 10;
    const minutes = parseInt(minutesStr, 10) || 0;

    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    if (targetDate.getTime() > now.getTime()) {
      const diffSeconds = Math.max(Math.floor((targetDate.getTime() - now.getTime()) / 1000), 5);
      const appointmentId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Waktunya Konsultasi Dokter! 👨‍⚕️`,
          body: `Janji temu konsultasi dengan ${details.doctorName} di ${details.hospital} pukul ${details.timeStr} WIB sekarang!`,
          sound: true,
          data: { type: 'doctor_consultation', ...details },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: diffSeconds,
          repeats: false,
        },
      });
      return appointmentId;
    }

    return 'instant_scheduled';
  } catch (e) {
    console.log('Error scheduling doctor appointment notification:', e);
    return null;
  }
}

/**
 * Reschedule all active un-taken medication schedules
 */
export async function syncAllMedicationNotifications(schedules: MedicationSchedule[]) {
  if (!Notifications) {
    return;
  }
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const s of schedules) {
      if (!s.isTaken) {
        await scheduleMedicationNotification(s);
      }
    }
  } catch (e) {
    console.log('Error syncing notifications:', e);
  }
}

/**
 * Safely subscribe to notification tap events
 */
export function addNotificationResponseListener(callback: (scheduleId: string) => void) {
  if (!Notifications || !Notifications.addNotificationResponseReceivedListener) {
    return { remove: () => {} };
  }
  try {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data && data.scheduleId) {
        callback(data.scheduleId as string);
      }
    });
    return sub;
  } catch (e) {
    return { remove: () => {} };
  }
}
