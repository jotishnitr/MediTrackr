import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Convert a string ID (like MongoDB _id) or number into a valid positive 32-bit integer ID for Capacitor
 */
export function toNotificationId(idStr) {
  if (typeof idStr === 'number') return Math.abs(idStr) % 2147483647;
  if (!idStr) return Math.floor(Math.random() * 1000000) + 1;
  let hash = 0;
  const str = String(idStr);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return (Math.abs(hash) % 2147483647) || 1;
}

let channelInitialized = false;

/**
 * Initialize high-importance Android Notification Channel with custom alarm sound
 */
export async function initNotificationChannel() {
  if (channelInitialized || !Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: 'meditrackr_alarms',
      name: 'Medication Alarms & Reminders',
      description: 'High-priority alarms and reminders for scheduled medications',
      importance: 5,
      visibility: 1,
      sound: 'notificationsound.mp3',
      vibration: true,
      lights: true,
      lightColor: '#2563EB',
    });
    channelInitialized = true;
  } catch (err) {
    console.warn('[LocalNotifications] Notification channel creation warning:', err);
  }
}

/**
 * Request notification permissions on native devices
 */
export async function requestPermission() {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await initNotificationChannel();
    const status = await LocalNotifications.checkPermissions();
    if (status.display === 'granted') return true;
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch (err) {
    console.error('[LocalNotifications] Permission request error:', err);
    return false;
  }
}

/**
 * Schedule a local notification / alarm for a medicine
 */
export async function scheduleReminder(med) {
  if (!med || !med.reminder || !med.time) return;
  if (!Capacitor.isNativePlatform()) return;

  try {
    await initNotificationChannel();

    const [hours, minutes] = med.time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const notifId = toNotificationId(med._id || med.id);

    // Cancel existing reminder for this medicine before setting new one
    try {
      await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
    } catch {
      // ignore
    }

    const bodyText = `Time to take ${med.name}${med.dosage ? ' (' + med.dosage + ')' : ''}${med.instructions ? ' - ' + med.instructions : ''}`;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notifId,
          title: '💊 MediTrackr Reminder',
          body: bodyText,
          channelId: 'meditrackr_alarms',
          sound: 'notificationsound.mp3',
          schedule: {
            at: scheduledTime,
            repeats: true,
            every: 'day',
            allowWhileIdle: true, // Crucial for firing when device is asleep/idle
          },
          actionTypeId: 'MED_REMINDER_ACTION',
          extra: {
            medicineId: med._id || med.id,
            name: med.name,
          },
        },
      ],
    });
    console.log(`[LocalNotifications] Scheduled alarm for "${med.name}" at ${scheduledTime.toLocaleTimeString()}`);
  } catch (err) {
    console.error('[LocalNotifications] Schedule reminder error:', err);
  }
}

/**
 * Cancel a scheduled reminder by medicine ID
 */
export async function cancelReminder(id) {
  if (!Capacitor.isNativePlatform() || !id) return;
  try {
    const notifId = toNotificationId(id);
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
    console.log(`[LocalNotifications] Cancelled reminder for: ${id}`);
  } catch (err) {
    console.error('[LocalNotifications] Cancel reminder error:', err);
  }
}

/**
 * Reschedule all active medication reminders
 */
export async function rescheduleAll(reminders) {
  if (!Capacitor.isNativePlatform() || !Array.isArray(reminders)) return;
  try {
    await initNotificationChannel();
    const pending = await LocalNotifications.getPending();
    if (pending && pending.notifications && pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    for (const med of reminders) {
      if (med && med.reminder) {
        await scheduleReminder(med);
      }
    }
  } catch (err) {
    console.error('[LocalNotifications] Reschedule all error:', err);
  }
}

/**
 * Set up notification action listener for tapping notifications
 */
export function setupNotificationListeners(onAction) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
      console.log('[LocalNotifications] Action clicked:', notificationAction);
      if (typeof onAction === 'function') {
        onAction(notificationAction);
      }
    });
  } catch (err) {
    console.warn('[LocalNotifications] Listener setup warning:', err);
  }
}