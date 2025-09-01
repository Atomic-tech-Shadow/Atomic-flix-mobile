import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { SearchResult } from '../types/index';

export interface NotificationSettings {
  enabled: boolean;
  newEpisodes: boolean;
  newMangas: boolean;
}

export interface EpisodeNotification {
  id: string;
  title: string;
  type: 'anime' | 'manga' | 'film';
  message: string;
  timestamp: number;
  read: boolean;
  image: string;
  episodeInfo?: string; // Ex: "E02", "Chapitre 1045", etc.
  animeTitle: string; // Titre complet de l'anime/manga
}

// Configuration moderne des notifications (2025) avec gestion intelligente
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Gestion intelligente selon l'état de l'app et le type de notification
    const isAppActive = notification.request.content.data?.priority === 'silent';
    
    return {
      shouldShowAlert: !isAppActive,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

class NotificationService {
  private static instance: NotificationService;
  private listeners: Set<(notifications: EpisodeNotification[]) => void> = new Set();
  private previousContent: Map<string, SearchResult> = new Map();
  private expoPushToken: string | null = null;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialiser les notifications push
  async initializePushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        // En mode web/émulateur, retourner un token fictif pour éviter les erreurs
        if (__DEV__) {
          console.log('Mode web/émulateur détecté - notifications push simulées');
          return 'web_simulation_token';
        }
        return null;
      }

      // Configuration moderne des canaux Android selon les pratiques 2025
      if (Platform.OS === 'android') {
        // Canal principal pour les nouvelles sorties
        await Notifications.setNotificationChannelAsync('atomic-flix-main', {
          name: 'Nouveaux épisodes et chapitres',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8B5DFF', // Couleur principale ATOMIC FLIX
          description: 'Notifications pour les nouveaux animes et mangas disponibles',
          enableLights: true,
          enableVibration: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
        
        // Canal séparé pour les mises à jour importantes
        await Notifications.setNotificationChannelAsync('atomic-flix-updates', {
          name: 'Mises à jour importantes',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#00D4FF', // Couleur cyan pour updates
          description: 'Notifications critiques et mises à jour système',
          enableLights: true,
          enableVibration: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
        
        // Canal pour le planning (notifications silencieuses)
        await Notifications.setNotificationChannelAsync('atomic-flix-planning', {
          name: 'Planning et rappels',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 150, 150],
          lightColor: '#FF6B9D', // Couleur rose pour planning
          description: 'Rappels pour les animes programmés',
          enableLights: true,
          enableVibration: false, // Moins intrusif
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }

      // Gestion moderne des permissions avec retry et fallback
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        // Demander avec paramètres optimaux pour iOS et Android
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: false,
            provideAppNotificationSettings: true,
            allowProvisional: true,
          },
          android: {},
        });
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        // Ne pas afficher d'erreur en production, juste retourner null
        if (__DEV__) {
          console.log('Permissions de notification refusées par l\'utilisateur');
        }
        return null;
      }

      // Obtenir le token push avec retry logic amélioré
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        if (__DEV__) {
          console.log('Pas de projet ID trouvé - vérifiez app.json');
        }
        return null;
      }

      // Retry logic pour les tokens avec backoff exponentiel
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const pushTokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
          });
          
          this.expoPushToken = pushTokenData.data;
          
          // Sécurité: Ne jamais logger les tokens en production
          if (__DEV__) {
            console.log('✅ Token push obtenu avec succès');
          }
          
          // Enregistrer le token sur le serveur (consolidé)
          await this.registerTokenWithServer(this.expoPushToken);
          
          return this.expoPushToken;
        } catch (tokenError) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw tokenError;
          }
          // Attendre avant retry (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      }
      
      return null;
    } catch (error) {
      // Gestion d'erreur améliorée pour éviter confusion avec Firebase
      if (__DEV__) {
        console.log('ℹ️ Notifications push non disponibles:', error);
      }
      // Retourner silencieusement null en production pour éviter popups d'erreur
      return null;
    }
  }

  // Enregistrer le token sur le serveur (méthode consolidée)
  private async registerTokenWithServer(pushToken: string): Promise<boolean> {
    try {
      const deviceInfo = {
        platform: Device.osName,
        device: Device.modelName,
        appVersion: Constants.expoConfig?.version || '3.7.0',
        registeredAt: new Date().toISOString(),
        osVersion: Device.osVersion,
        brand: Device.brand,
      };

      const response = await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          userId: 'atomic-flix-user', // ID utilisateur générique pour cette version
          pushToken: pushToken,
          deviceInfo: deviceInfo
        })
      });

      const result = await response.json();
      
      if (__DEV__) {
        console.log('🚀 Token enregistré sur serveur:', result.success);
      }
      
      return result.success || false;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Erreur enregistrement token:', error);
      }
      return false;
    }
  }

  // Vérifier si les notifications sont autorisées (compatible iOS provisional)
  async allowsNotificationsAsync(): Promise<boolean> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return (
        settings.granted || 
        (settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL)
      );
    } catch (error) {
      console.error('Erreur vérification permissions:', error);
      return false;
    }
  }

  // Obtenir les paramètres de notification
  async getSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      return settings ? JSON.parse(settings) : {
        enabled: true,
        newEpisodes: true,
        newMangas: true
      };
    } catch (error) {

      return { enabled: true, newEpisodes: true, newMangas: true };
    }
  }

  // Sauvegarder les paramètres de notification
  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
    } catch (error) {

    }
  }

  // Obtenir les notifications stockées
  async getNotifications(): Promise<EpisodeNotification[]> {
    try {
      const notifications = await AsyncStorage.getItem('stored_notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {

      return [];
    }
  }

  // Sauvegarder les notifications
  private async saveNotifications(notifications: EpisodeNotification[]): Promise<void> {
    try {
      await AsyncStorage.setItem('stored_notifications', JSON.stringify(notifications));
      // Notifier les listeners
      this.listeners.forEach(listener => listener(notifications));
    } catch (error) {

    }
  }

  // Ajouter un listener pour les nouvelles notifications
  addListener(callback: (notifications: EpisodeNotification[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Détecter de nouveaux épisodes en comparant avec le contenu précédent
  async detectNewEpisodes(currentContent: SearchResult[]): Promise<void> {
    const settings = await this.getSettings();
    
    if (!settings.enabled) {
      this.previousContent.clear();
      currentContent.forEach(item => {
        this.previousContent.set(item.id, item);
      });
      return;
    }

    const newNotifications: EpisodeNotification[] = [];
    
    for (const item of currentContent) {
      const previousItem = this.previousContent.get(item.id);
      
      // Si l'élément est nouveau ou a été mis à jour
      if (!previousItem || this.hasContentChanged(previousItem, item)) {
        const shouldNotify = this.shouldCreateNotification(item, settings);
        
        if (shouldNotify) {
          const episodeInfo = this.extractEpisodeInfo(item, previousItem);
          const notification: EpisodeNotification = {
            id: `${item.id}-${Date.now()}`,
            title: item.title,
            type: item.type as 'anime' | 'manga' | 'film',
            message: this.generateNotificationMessage(item, !previousItem, episodeInfo),
            timestamp: Date.now(),
            read: false,
            image: item.image,
            episodeInfo: episodeInfo,
            animeTitle: item.title
          };
          
          newNotifications.push(notification);
        }
      }
      
      // Mettre à jour le cache
      this.previousContent.set(item.id, item);
    }

    // Ajouter les nouvelles notifications aux existantes
    if (newNotifications.length > 0) {
      console.log(`🔔 ${newNotifications.length} nouvelle(s) notification(s) détectée(s):`, 
        newNotifications.map(n => `${n.animeTitle} - ${n.episodeInfo}`));
      
      const existingNotifications = await this.getNotifications();
      const allNotifications = [...newNotifications, ...existingNotifications];
      
      // Garder seulement les 50 dernières notifications
      const limitedNotifications = allNotifications.slice(0, 50);
      
      await this.saveNotifications(limitedNotifications);
      
      // Envoyer une notification push pour la première nouvelle notification
      this.sendLocalNotification(newNotifications[0]);
    } else {
      console.log('📱 Aucun nouveau contenu détecté dans trending');
    }
  }

  // Vérifier si le contenu a changé (détection de nouveaux épisodes)
  private hasContentChanged(previous: SearchResult, current: SearchResult): boolean {
    // Comparaison complète incluant épisodes et infos détaillées
    return previous.status !== current.status || 
           previous.title !== current.title ||
           previous.image !== current.image ||
           previous.currentEpisode !== current.currentEpisode ||
           previous.episodeInfo !== current.episodeInfo ||
           previous.currentSeason !== current.currentSeason;
  }

  // Déterminer si une notification doit être créée
  private shouldCreateNotification(item: SearchResult, settings: NotificationSettings): boolean {
    if (item.type === 'anime' && settings.newEpisodes) return true;
    if (item.type === 'manga' && settings.newMangas) return true;
    if (item.type === 'film' && settings.newEpisodes) return true;
    return false;
  }

  // Extraire les informations d'épisode du titre ou du status
  private extractEpisodeInfo(item: SearchResult, previousItem?: SearchResult): string {
    // 🎯 Utiliser episodeInfo de l'API trending en priorité
    if (item.episodeInfo) {
      return item.episodeInfo;
    }
    
    // 🎯 Utiliser currentEpisode et currentSeason de l'API
    if (item.currentEpisode && item.currentSeason) {
      return `Saison ${item.currentSeason} Episode ${item.currentEpisode}`;
    }
    
    // Rechercher des patterns d'épisodes dans le titre et le status
    const episodePatterns = [
      /Episode?\s*(\d+)/i,
      /E(\d+)/i,
      /Ep\.?\s*(\d+)/i,
      /Épisode\s*(\d+)/i,
      /Chapitre\s*(\d+)/i,
      /Chapter\s*(\d+)/i,
      /Ch\.?\s*(\d+)/i,
      /disponible/i // Pour détecter les nouveaux épisodes disponibles
    ];
    
    for (const pattern of episodePatterns) {
      const match = item.title.match(pattern) || item.status?.match(pattern);
      if (match) {
        const episodeNum = match[1];
        if (item.type === 'manga') {
          return `Ch.${episodeNum}`;
        } else {
          return `E${episodeNum.padStart(2, '0')}`;
        }
      }
    }
    
    // Si aucun pattern trouvé, essayer de détecter une différence avec l'élément précédent
    if (previousItem && item.status !== previousItem.status) {
      return item.type === 'manga' ? 'Nouveau chapitre' : 'Nouvel épisode';
    }
    
    return item.type === 'manga' ? 'Nouveau' : 'Nouveau';
  }

  // Générer le message de notification avec infos détaillées
  private generateNotificationMessage(item: SearchResult, isNew: boolean, episodeInfo?: string): string {
    const typeText = item.type === 'anime' ? 'anime' : 
                     item.type === 'manga' ? 'manga' : 'film';
    
    if (episodeInfo && episodeInfo !== 'Nouveau') {
      return `${item.title} - ${episodeInfo}`;
    } else if (isNew) {
      return `Nouveau ${typeText} : ${item.title}`;
    } else {
      return `Mise à jour : ${item.title}`;
    }
  }

  // Afficher une alerte de notification avec image et détails
  private showNotificationAlert(notification: EpisodeNotification): void {
    const typeEmoji = notification.type === 'anime' ? '📺' : 
                      notification.type === 'manga' ? '📖' : '🎬';
    
    const title = `${typeEmoji} ${notification.type.toUpperCase()} mis à jour !`;
    
    let message = notification.message;
    if (notification.episodeInfo && notification.episodeInfo !== 'Nouveau') {
      message = `${notification.animeTitle}\n${notification.episodeInfo} disponible !`;
    }
    
    Alert.alert(
      title,
      message,
      [
        { text: 'Plus tard', style: 'cancel' },
        { 
          text: 'Voir maintenant', 
          onPress: () => {
            this.markAsRead(notification.id);
            // TODO: Naviguer vers l'anime/manga si possible
          }
        }
      ],
      { cancelable: true }
    );
  }

  // Envoyer une notification locale moderne avec channels spécialisés
  private async sendLocalNotification(notification: EpisodeNotification): Promise<void> {
    try {
      // Déterminer le canal selon le type de notification
      const channelId = this.getNotificationChannel(notification.type);
      const typeEmoji = notification.type === 'anime' ? '📺' : 
                       notification.type === 'manga' ? '📖' : '🎬';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${typeEmoji} ATOMIC FLIX`,
          subtitle: notification.type === 'anime' ? 'Nouvel épisode disponible' : 
                   notification.type === 'manga' ? 'Nouveau chapitre disponible' : 
                   'Nouveau film disponible',
          body: notification.message,
          data: { 
            animeId: notification.id,
            animeTitle: notification.animeTitle,
            type: notification.type,
            image: notification.image,
            timestamp: notification.timestamp,
            screen: 'AnimeDetail', // Navigation automatique
            params: { animeId: notification.id }
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          color: '#8B5DFF', // Couleur principale ATOMIC FLIX
          categoryIdentifier: 'anime-update', // Pour actions iOS
        },
        trigger: null, // Envoyer immédiatement
        channelId: Platform.OS === 'android' ? channelId : undefined,
      });

      if (__DEV__) {
        console.log(`✅ Notification locale envoyée: ${notification.animeTitle}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Erreur envoi notification locale:', error);
      }
      // Pas d'Alert en production pour éviter d'interrompre l'utilisateur
    }
  }

  // Déterminer le canal de notification selon le type
  private getNotificationChannel(type: string): string {
    switch (type) {
      case 'anime':
      case 'manga':
      case 'film':
        return 'atomic-flix-main';
      default:
        return 'atomic-flix-updates';
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<void> {
    const notifications = await this.getNotifications();
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    await this.saveNotifications(updatedNotifications);
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<void> {
    const notifications = await this.getNotifications();
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    await this.saveNotifications(updatedNotifications);
  }

  // Obtenir le nombre de notifications non lues
  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(notif => !notif.read).length;
  }

  // Nettoyer les anciennes notifications (> 7 jours)
  async cleanOldNotifications(): Promise<void> {
    const notifications = await this.getNotifications();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const recentNotifications = notifications.filter(notif => 
      notif.timestamp > sevenDaysAgo
    );
    
    if (recentNotifications.length !== notifications.length) {
      await this.saveNotifications(recentNotifications);
    }
  }

  // Configurer les listeners de notifications modernes (2025)
  async setupNotificationListeners(): Promise<() => void> {
    try {
      // Configurer les catégories iOS avec actions
      if (Platform.OS === 'ios') {
        await Notifications.setNotificationCategoryAsync('anime-update', [
          {
            identifier: 'watch-now',
            buttonTitle: 'Regarder',
            options: {
              isDestructive: false,
              isAuthenticationRequired: false,
            },
          },
          {
            identifier: 'remind-later',
            buttonTitle: 'Plus tard',
            options: {
              isDestructive: false,
              isAuthenticationRequired: false,
            },
          },
        ]);
      }

      // Listener pour notifications reçues (app en premier plan)
      const receivedListener = Notifications.addNotificationReceivedListener(
        notification => {
          if (__DEV__) {
            console.log('🔔 Notification reçue:', notification.request.content.title);
          }
          // La notification sera affichée automatiquement par le système
        }
      );

      // Listener pour réponses aux notifications (tap utilisateur)
      const responseListener = Notifications.addNotificationResponseReceivedListener(
        response => {
          const { notification, actionIdentifier } = response;
          const data = notification.request.content.data;
          
          if (__DEV__) {
            console.log('👆 Notification tapée:', actionIdentifier, data);
          }
          
          // Marquer comme lue automatiquement
          if (data?.animeId) {
            this.markAsRead(data.animeId);
          }
          
          // Gérer les actions spécifiques
          if (actionIdentifier === 'watch-now' && data?.screen) {
            // TODO: Navigation intégrée (nécessite référence navigation)
            console.log('Navigation vers:', data.screen, data.params);
          } else if (actionIdentifier === 'remind-later') {
            // Programmer un rappel dans 1 heure
            this.scheduleReminder(notification.request.content);
          }
        }
      );

      // Listener pour changements de tokens (sécurité)
      const tokenListener = Notifications.addPushTokenListener(token => {
        if (__DEV__) {
          console.log('🔄 Token push mis à jour');
        }
        this.expoPushToken = token.data;
        // Re-enregistrer le nouveau token
        this.registerTokenWithServer(token.data);
      });

      // Retourner la fonction de nettoyage
      return () => {
        receivedListener.remove();
        responseListener.remove();
        tokenListener.remove();
      };
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Erreur configuration listeners:', error);
      }
      return () => {}; // Fonction vide si échec
    }
  }

  // Programmer un rappel pour plus tard
  private async scheduleReminder(content: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Rappel ATOMIC FLIX',
          body: `N'oubliez pas: ${content.body}`,
          data: content.data,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          color: '#FF6B9D', // Couleur rose pour rappels
        },
        trigger: {
          seconds: 3600, // Dans 1 heure
        },
        channelId: Platform.OS === 'android' ? 'atomic-flix-planning' : undefined,
      });
      
      if (__DEV__) {
        console.log('⏰ Rappel programmé dans 1 heure');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Erreur programmation rappel:', error);
      }
    }
  }

  // Méthode publique pour initialiser complètement le service
  async initializeService(): Promise<{ token: string | null; cleanup: () => void }> {
    const token = await this.initializePushNotifications();
    const cleanup = await this.setupNotificationListeners();
    
    // Nettoyage automatique des anciennes notifications
    await this.cleanOldNotifications();
    
    return { token, cleanup };
  }


}

export default NotificationService;