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

// Configuration des notifications push
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
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

      // CRITIQUE: Configurer le canal Android AVANT de demander les permissions
      // Requis pour Android 13+ selon la documentation Expo 2024
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('atomic-flix-updates', {
          name: 'ATOMIC FLIX Updates',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#00bcd4',
          description: 'Notifications pour les nouvelles mises à jour ATOMIC FLIX',
        });
      }

      // Demander les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        // Demander avec paramètres iOS spécifiques si nécessaire
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: false,
          },
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

      // Obtenir le token push
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        console.log('Pas de projet ID trouvé');
        return null;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      this.expoPushToken = pushTokenData.data;
      // Supprimer le log de production pour la sécurité
      if (__DEV__) {
        console.log('Token push obtenu:', this.expoPushToken);
      }
      
      return this.expoPushToken;
    } catch (error) {
      // Gestion d'erreur améliorée pour éviter confusion avec Firebase
      if (__DEV__) {
        console.log('ℹ️ Notifications push non disponibles:', error);
      }
      // Retourner silencieusement null en production pour éviter popups d'erreur
      return null;
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

  // Envoyer une notification push locale
  private async sendLocalNotification(notification: EpisodeNotification): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Atomic Flix • ${notification.type === 'anime' ? 'Nouvel épisode' : 'Nouveau chapitre'}`,
          body: notification.message,
          data: { 
            animeId: notification.id,
            animeTitle: notification.animeTitle,
            type: notification.type,
            image: notification.image
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          color: '#00bcd4',
        },
        trigger: null, // Envoyer immédiatement
      });

      // En production, ne pas afficher d'Alert automatique pour éviter d'interrompre l'utilisateur
      // Les notifications push système suffisent
    } catch (error) {
      if (__DEV__) {
        console.error('Erreur envoi notification:', error);
      }
      // Fallback silencieux en production - les notifications en app suffisent
      // Pas d'Alert en production pour éviter de déranger l'utilisateur
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


}

export default NotificationService;