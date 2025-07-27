import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SearchResult } from '../types';

// Configuration des notifications selon documentation Expo 2025
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface TrendingNotification {
  id: string;
  title: string;
  body: string;
  data: any;
  timestamp: number;
  read: boolean;
}

class TrendingNotificationService {
  private static instance: TrendingNotificationService;
  private expoPushToken: string | null = null;
  private lastTrendingCheck: number = 0;
  private previousTrending: SearchResult[] = [];
  private isInitialized: boolean = false;

  static getInstance(): TrendingNotificationService {
    if (!TrendingNotificationService.instance) {
      TrendingNotificationService.instance = new TrendingNotificationService();
    }
    return TrendingNotificationService.instance;
  }

  // Initialisation complète selon documentation Expo
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Configuration canal Android OBLIGATOIRE avant permissions (Android 13+)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('atomic-flix-trending', {
          name: 'ATOMIC FLIX - Tendances',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00bcd4',
          description: 'Nouvelles tendances et animes populaires',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });
      }

      // Vérifier si c'est un appareil physique
      if (!Device.isDevice) {
        console.log('Notifications push nécessitent un appareil physique');
        return false;
      }

      // Demander permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: false,
            allowProvisional: false,
          },
        });
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permissions de notification refusées');
        return false;
      }

      // Obtenir token Expo push
      const projectId = 
        Constants?.expoConfig?.extra?.eas?.projectId ?? 
        Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.error('Project ID non trouvé pour les notifications');
        return false;
      }

      try {
        const pushTokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        
        this.expoPushToken = pushTokenData.data;
        await AsyncStorage.setItem('expo_push_token', this.expoPushToken);
        
        console.log('Service notifications tendances initialisé');
        this.isInitialized = true;
        
        // Charger données précédentes
        await this.loadPreviousTrending();
        
        return true;
      } catch (error) {
        console.error('Erreur obtention token push:', error);
        return false;
      }
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
      return false;
    }
  }

  // Charger les données trending précédentes
  private async loadPreviousTrending(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('previous_trending_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.previousTrending = data.trending || [];
        this.lastTrendingCheck = data.timestamp || 0;
      }
    } catch (error) {
      console.error('Erreur chargement données précédentes:', error);
    }
  }

  // Sauvegarder données trending
  private async saveTrendingData(trending: SearchResult[]): Promise<void> {
    try {
      const data = {
        trending,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem('previous_trending_data', JSON.stringify(data));
      this.previousTrending = trending;
      this.lastTrendingCheck = data.timestamp;
    } catch (error) {
      console.error('Erreur sauvegarde données trending:', error);
    }
  }

  // Vérifier nouvelles tendances et envoyer notifications
  async checkForNewTrending(currentTrending: SearchResult[]): Promise<void> {
    if (!this.isInitialized || !this.expoPushToken) {
      return;
    }

    try {
      // Éviter vérifications trop fréquentes (max toutes les 5 minutes)
      const now = Date.now();
      if (now - this.lastTrendingCheck < 5 * 60 * 1000) {
        return;
      }

      // Détecter nouveaux animes trending
      const newTrending = this.detectNewTrending(currentTrending);
      
      if (newTrending.length > 0) {
        await this.sendTrendingNotifications(newTrending);
      }

      // Sauvegarder nouvelles données
      await this.saveTrendingData(currentTrending);

    } catch (error) {
      console.error('Erreur vérification nouvelles tendances:', error);
    }
  }

  // Détecter nouveaux animes dans les tendances
  private detectNewTrending(currentTrending: SearchResult[]): SearchResult[] {
    if (this.previousTrending.length === 0) {
      // Première fois, pas de notifications
      return [];
    }

    const previousIds = new Set(this.previousTrending.map(anime => anime.id || anime.url));
    const newAnimes = currentTrending.filter(anime => 
      !previousIds.has(anime.id || anime.url)
    );

    // Limiter à 3 nouveautés max pour éviter spam
    return newAnimes.slice(0, 3);
  }

  // Envoyer notifications pour nouvelles tendances
  private async sendTrendingNotifications(newTrending: SearchResult[]): Promise<void> {
    for (const anime of newTrending) {
      try {
        // Notification locale
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔥 Nouvelle tendance !',
            body: `${anime.title} fait fureur en ce moment !`,
            data: {
              type: 'trending',
              animeId: anime.id || anime.url,
              animeTitle: anime.title,
              animeImage: anime.image,
              contentType: anime.contentType,
            },
            categoryIdentifier: 'trending',
            badge: 1,
          },
          trigger: null,
        });

        // Notification push si token disponible
        if (this.expoPushToken) {
          await this.sendPushNotification({
            title: '🔥 Nouvelle tendance !',
            body: `${anime.title} fait fureur en ce moment !`,
            data: {
              type: 'trending',
              animeId: anime.id || anime.url,
              animeTitle: anime.title,
              screen: 'AnimeDetail',
              params: { 
                id: anime.id || anime.url,
                contentType: anime.contentType 
              },
            },
          });
        }

        // Petite pause entre notifications
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error('Erreur envoi notification trending:', error);
      }
    }
  }

  // Envoyer notification push via Expo
  private async sendPushNotification(message: {
    title: string;
    body: string;
    data: any;
  }): Promise<void> {
    if (!this.expoPushToken) return;

    try {
      const notification = {
        to: this.expoPushToken,
        sound: 'default',
        title: message.title,
        body: message.body,
        data: message.data,
        channelId: 'atomic-flix-trending',
        priority: 'high',
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Notification push envoyée:', result);

    } catch (error) {
      console.error('Erreur envoi push notification:', error);
    }
  }

  // Configurer listeners de notifications
  setupNotificationListeners(navigation?: any): void {
    // Notification reçue quand app ouverte
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification reçue:', notification.request.content.title);
    });

    // Notification tapée par utilisateur
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.type === 'trending' && navigation) {
        // Naviguer vers détails anime
        if (data.screen && data.params) {
          navigation.navigate(data.screen, data.params);
        }
      }
    });
  }

  // Tester notifications (pour développement)
  async sendTestNotification(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test ATOMIC FLIX',
        body: 'Les notifications tendances fonctionnent !',
        data: { test: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
  }

  // Obtenir statut des permissions
  async getPermissionStatus(): Promise<string> {
    try {
      const permissions = await Notifications.getPermissionsAsync();
      if (permissions.granted) return 'granted';
      if (permissions.canAskAgain) return 'can_ask';
      return 'denied';
    } catch (error) {
      return 'error';
    }
  }

  // Nettoyage des anciennes données
  async cleanupOldData(): Promise<void> {
    try {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      if (this.lastTrendingCheck < sevenDaysAgo) {
        await AsyncStorage.removeItem('previous_trending_data');
        this.previousTrending = [];
        this.lastTrendingCheck = 0;
      }
    } catch (error) {
      console.error('Erreur nettoyage données:', error);
    }
  }
}

export default TrendingNotificationService;