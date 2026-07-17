import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestPermission() {
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
}

export async function scheduleReminder(med) {
  if (!med.reminder) return;

  const [hours, minutes] = med.time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);

  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id: med.id,
        title: '💊 MediTrackr Reminder',
        body: `Time to take ${med.name}${med.instructions ? ' - ' + med.instructions : ''}`,
        schedule: { at: scheduledTime, repeats: true, every: 'day' },
        sound: null,
        actionTypeId: '',
        extra: null,
      },
    ],
  });
}

export async function cancelReminder(id) {
  await LocalNotifications.cancel({ notifications: [{ id }] });
}

export async function rescheduleAll(reminders) {
  const ids = reminders.map(r => ({ id: r.id }));
  if (ids.length) await LocalNotifications.cancel({ notifications: ids });

  for (const med of reminders) {
    if (med.reminder) await scheduleReminder(med);
  }
}