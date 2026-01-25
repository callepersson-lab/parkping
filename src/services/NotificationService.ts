import PushNotification, {Importance} from 'react-native-push-notification';
import {Platform} from 'react-native';

const CHANNEL_ID = 'parkping-notifications';
const MONITORING_CHANNEL_ID = 'parkping-monitoring';

class NotificationService {
  private isConfigured = false;

  configure(): void {
    if (this.isConfigured) {
      return;
    }

    // Configure push notifications
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('Notification received:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      // Main notification channel for parking alerts
      PushNotification.createChannel(
        {
          channelId: CHANNEL_ID,
          channelName: 'Parking Notifications',
          channelDescription: 'Notifications when parking is detected',
          importance: Importance.HIGH,
          vibrate: true,
          playSound: true,
        },
        created => console.log(`Channel '${CHANNEL_ID}' created: ${created}`),
      );

      // Background monitoring channel (low priority)
      PushNotification.createChannel(
        {
          channelId: MONITORING_CHANNEL_ID,
          channelName: 'Background Monitoring',
          channelDescription: 'Shows when parking detection is active',
          importance: Importance.LOW,
          vibrate: false,
          playSound: false,
        },
        created =>
          console.log(`Channel '${MONITORING_CHANNEL_ID}' created: ${created}`),
      );
    }

    this.isConfigured = true;
  }

  sendParkingNotification(): void {
    PushNotification.localNotification({
      channelId: CHANNEL_ID,
      title: 'Parkering detekterad!',
      message: 'Du verkar ha parkerat bilen. Glöm inte var du ställde den!',
      playSound: true,
      vibrate: true,
      priority: 'high',
      visibility: 'public',
    });
  }

  showMonitoringNotification(): void {
    PushNotification.localNotification({
      channelId: MONITORING_CHANNEL_ID,
      id: 1, // Fixed ID so we can cancel it
      title: 'ParkPing är aktiv',
      message: 'Övervakar för parkering...',
      ongoing: true,
      playSound: false,
      vibrate: false,
      priority: 'low',
    });
  }

  cancelMonitoringNotification(): void {
    PushNotification.cancelLocalNotification('1');
  }

  cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }
}

export const notificationService = new NotificationService();
