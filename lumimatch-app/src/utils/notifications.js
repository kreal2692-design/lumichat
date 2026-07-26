import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Bildirim davranışlarını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermission = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { success: false, message: 'Bildirim izni verilmedi' };
    }

    // Android için notification channel oluştur
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Varsayılan',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00e5ff',
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Mesajlar',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('calls', {
        name: 'Aramalar',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500],
        sound: 'default',
      });
    }

    // Push token al
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'cf684bc9-e947-4cdd-a671-c601e1ccc50b',
    });

    return { success: true, token: token.data };
  } catch (error) {
    console.error('Notification permission error:', error);
    return { success: false, message: error.message };
  }
};

export const scheduleLocalNotification = async ({ title, body, data, channelId = 'default' }) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: channelId,
      },
      trigger: null, // Hemen gönder
    });
  } catch (error) {
    console.error('Schedule notification error:', error);
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Cancel notifications error:', error);
  }
};

export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

export const addNotificationResponseReceivedListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};
