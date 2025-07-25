# Guide d'intégration mobile ATOMIC FLIX - Notifications Push

## 📱 Configuration dans votre app mobile

### 1. Installation des dépendances Expo

```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. Configuration des permissions (app.json)

```json
{
  "expo": {
    "name": "ATOMIC FLIX",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#FF6B35",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#FF6B35"
    }
  }
}
```

### 3. Code d'initialisation des notifications

Créez un fichier `services/pushNotifications.js` :

```javascript
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
        appVersion: Constants.expoConfig?.version || '1.0.0',
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
  static setupNotificationListeners() {
    // Notification reçue quand l'app est ouverte
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
    });

    // Notification tapée par l'utilisateur
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      
      // Gérer la navigation selon le contenu
      const data = response.notification.request.content.data;
      if (data?.screen) {
        // Naviguer vers l'écran spécifié
        // navigation.navigate(data.screen, data.params);
      }
    });
  }
}

export default PushNotificationService;
```

### 4. Intégration dans votre App.js

```javascript
import React, { useEffect } from 'react';
import PushNotificationService from './services/pushNotifications';

export default function App() {
  
  useEffect(() => {
    // Configurer les notifications au démarrage
    PushNotificationService.setupNotificationListeners();
    
    // Enregistrer le token utilisateur (remplacez par votre ID utilisateur réel)
    const initializePushNotifications = async () => {
      const userId = await getUserId(); // Votre fonction pour obtenir l'ID utilisateur
      if (userId) {
        await PushNotificationService.registerPushToken(userId);
      }
    };
    
    initializePushNotifications();
  }, []);

  // Mettre à jour l'activité quand l'app devient active
  useEffect(() => {
    const updateActivity = async () => {
      const userId = await getUserId();
      if (userId) {
        await PushNotificationService.updateActivity(userId);
      }
    };
    
    updateActivity();
  }, []);

  return (
    // Votre interface utilisateur
  );
}
```

### 5. Gestion dans les écrans utilisateur

```javascript
// Dans votre écran de connexion
const handleLogin = async (userData) => {
  // Votre logique de connexion existante
  
  // Enregistrer pour les notifications push
  if (userData.id) {
    await PushNotificationService.registerPushToken(userData.id);
  }
};

// Dans votre écran de déconnexion
const handleLogout = async () => {
  const userId = await getUserId();
  
  // Désinscrire des notifications
  if (userId) {
    await PushNotificationService.unregisterPushToken(userId);
  }
  
  // Votre logique de déconnexion existante
};
```

### 6. Configuration des paramètres de notification

Ajoutez un écran de paramètres pour permettre à l'utilisateur de gérer ses notifications :

```javascript
import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import PushNotificationService from '../services/pushNotifications';

export default function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const toggleNotifications = async (enabled) => {
    const userId = await getUserId();
    
    if (enabled) {
      await PushNotificationService.registerPushToken(userId);
    } else {
      await PushNotificationService.unregisterPushToken(userId);
    }
    
    setNotificationsEnabled(enabled);
  };

  return (
    <View>
      <Text>Notifications push</Text>
      <Switch
        value={notificationsEnabled}
        onValueChange={toggleNotifications}
      />
    </View>
  );
}
```

## 🚀 Points clés pour l'intégration

1. **ID utilisateur unique** : Utilisez l'ID Telegram ou un identifiant unique de votre app
2. **Gestion des permissions** : Demandez les permissions push au bon moment
3. **Test sur appareil réel** : Les notifications push ne fonctionnent que sur des appareils physiques
4. **Gestion des erreurs** : Implémentez une gestion robuste des cas d'échec
5. **Mise à jour d'activité** : Appelez `updateActivity()` régulièrement pour maintenir l'utilisateur actif

## ✅ Test de fonctionnement

Après intégration, vous pouvez tester avec :

```bash
# Vérifier les statistiques
curl -X POST "https://atomic-flix-verifier-bot.vercel.app/api/register-push-token" \
  -H "Content-Type: application/json" \
  -d '{"action": "get_stats"}'
```

Votre app ATOMIC FLIX recevra automatiquement les notifications quand vous utiliserez la commande `/update` du bot Telegram !