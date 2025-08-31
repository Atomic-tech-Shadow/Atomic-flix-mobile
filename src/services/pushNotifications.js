import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  
  // Obtenir le token Expo push
  static async getExpoPushToken() {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Demander permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Permission for push notifications denied');
        return null;
      }

      // Obtenir le token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      return token.data;
      
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Enregistrer le token sur votre serveur
  static async registerPushToken(userId) {
    try {
      const pushToken = await this.getExpoPushToken();
      
      if (!pushToken) {
        console.warn('No push token available');
        return false;
      }

      const deviceInfo = {
        platform: Device.osName,
        device: Device.modelName,
        appVersion: Constants.expoConfig?.version || '3.7.0',
        registeredAt: new Date().toISOString()
      };

      // Appel à votre API
      const response = await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          userId: userId,
          pushToken: pushToken,
          deviceInfo: deviceInfo
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Push token registered successfully');
        return true;
      } else {
        console.error('❌ Failed to register push token:', result.error);
        return false;
      }
      
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  // Mettre à jour l'activité utilisateur
  static async updateActivity(userId) {
    try {
      await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_activity',
          userId: userId
        })
      });
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }

  // Désinscrire les notifications
  static async unregisterPushToken(userId) {
    try {
      const response = await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unregister',
          userId: userId
        })
      });

      const result = await response.json();
      return result.success;
      
    } catch (error) {
      console.error('Error unregistering push token:', error);
      return false;
    }
  }

  // Configurer les listeners de notifications
  static setupNotificationListeners(navigation) {
    // Notification reçue quand l'app est ouverte
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
    });

    // Notification tapée par l'utilisateur
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      
      // Gérer la navigation selon le contenu
      const data = response.notification.request.content.data;
      if (data?.screen && navigation) {
        navigation.navigate(data.screen, data.params);
      }
      
      // Si c'est une notification de mise à jour, ouvrir l'URL
      if (data?.downloadUrl) {
        // UpdateModal sera affiché automatiquement par UpdateService
      }
    });
  }
}

export default PushNotificationService;