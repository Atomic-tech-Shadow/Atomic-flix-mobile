import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { PushNotification, NotificationChannel } from '../types/notifications';
import { SearchResult } from '../types/index';

// Configuration moderne des notifications (2025) optimisée
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const priority = data?.priority || 'default';
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: priority !== 'silent',
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export class NotificationService {
  private static instance: NotificationService;
  private listeners: Set<(notifications: PushNotification[]) => void> = new Set();
  private expoPushToken: string | null = null;
  private isInitialized: boolean = false;
  private notificationReceivedSubscription: any = null;
  private notificationResponseSubscription: any = null;
  private pushTokenSubscription: any = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Canaux de notification modernes pour ATOMIC FLIX
  private readonly channels: NotificationChannel[] = [
    {
      id: 'atomic-flix-episodes',
      name: 'Nouveaux épisodes',
      description: 'Notifications pour les nouveaux épisodes d\'anime disponibles',
      importance: 'high',
      sound: true,
      vibration: true,
      lights: true,
      color: '#8B5DFF'
    },
    {
      id: 'atomic-flix-manga',
      name: 'Nouveaux chapitres manga',
      description: 'Notifications pour les nouveaux chapitres de manga disponibles',
      importance: 'high',
      sound: true,
      vibration: true,
      lights: true,
      color: '#FF6B9D'
    },
    {
      id: 'atomic-flix-films',
      name: 'Nouveaux films',
      description: 'Notifications pour les nouveaux films disponibles',
      importance: 'high',
      sound: true,
      vibration: true,
      lights: true,
      color: '#00D4FF'
    },
    {
      id: 'atomic-flix-planning',
      name: 'Planning et rappels',
      description: 'Rappels pour les animes programmés et planning de diffusion',
      importance: 'default',
      sound: false,
      vibration: true,
      lights: true,
      color: '#8B5DFF'
    }
  ];

  // Initialiser le service de notifications
  async initializeService(): Promise<{ token: string | null; success: boolean }> {
    if (this.isInitialized) {
      return { token: this.expoPushToken, success: true };
    }

    try {
      // Configuration des canaux Android
      await this.setupNotificationChannels();
      
      // Obtenir le token push
      const token = await this.registerForPushNotifications();
      
      // Configurer les listeners (avec nettoyage automatique)
      await this.setupNotificationListeners();
      
      // Nettoyer les anciennes notifications au démarrage
      await this.cleanOldNotifications();
      
      this.isInitialized = true;
      return { token, success: true };
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
      return { token: null, success: false };
    }
  }

  // Méthode pour nettoyer complètement le service (utile pour debug/reset)
  async cleanup(): Promise<void> {
    try {
      // Nettoyer les listeners
      if (this.notificationReceivedSubscription) {
        this.notificationReceivedSubscription.remove();
        this.notificationReceivedSubscription = null;
      }
      if (this.notificationResponseSubscription) {
        this.notificationResponseSubscription.remove();
        this.notificationResponseSubscription = null;
      }
      if (this.pushTokenSubscription) {
        this.pushTokenSubscription.remove();
        this.pushTokenSubscription = null;
      }
      
      // Nettoyer les listeners internes
      this.listeners.clear();
      
      // Reset state
      this.isInitialized = false;
      this.expoPushToken = null;
      
      if (__DEV__) {
        console.log('🧹 Service de notifications nettoyé');
      }
    } catch (error) {
      console.error('Erreur nettoyage service notifications:', error);
    }
  }

  // Configuration des canaux Android modernes
  private async setupNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    for (const channel of this.channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: this.getAndroidImportance(channel.importance),
        sound: channel.sound ? 'default' : null,
        enableVibrate: channel.vibration,
        enableLights: channel.lights,
        lightColor: channel.color,
        vibrationPattern: channel.vibration ? [0, 250, 250, 250] : [0],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  }

  // Convertir l'importance en valeur Android
  private getAndroidImportance(importance: string): Notifications.AndroidImportance {
    switch (importance) {
      case 'low': return Notifications.AndroidImportance.LOW;
      case 'default': return Notifications.AndroidImportance.DEFAULT;
      case 'high': return Notifications.AndroidImportance.HIGH;
      case 'max': return Notifications.AndroidImportance.MAX;
      default: return Notifications.AndroidImportance.DEFAULT;
    }
  }

  // Enregistrement pour les notifications push avec retry automatique
  private async registerForPushNotifications(): Promise<string | null> {
    try {
      // Vérifier si c'est un appareil physique
      if (!Device.isDevice) {
        if (__DEV__) {
          console.log('Mode web/émulateur - notifications push simulées');
          return 'web_simulation_token';
        }
        return null;
      }

      // Vérifier et demander les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowProvisional: true,
          },
          android: {},
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permissions de notification refusées');
        return null;
      }

      // Obtenir le token Expo avec retry
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error('Projet ID manquant dans app.json');
        return null;
      }

      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          this.expoPushToken = pushTokenData.data;
          
          if (__DEV__) {
            console.log('✅ Token push obtenu avec succès');
          }
          
          return this.expoPushToken;
        } catch (error) {
          retryCount++;
          if (retryCount >= maxRetries) throw error;
          
          // Backoff exponentiel
          await new Promise(resolve => 
            setTimeout(resolve, 1000 * Math.pow(2, retryCount))
          );
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement push:', error);
      return null;
    }
  }

  // Configuration des listeners de notifications
  private async setupNotificationListeners(): Promise<void> {
    // Nettoyer les anciens listeners si ils existent
    if (this.notificationReceivedSubscription) {
      this.notificationReceivedSubscription.remove();
    }
    if (this.notificationResponseSubscription) {
      this.notificationResponseSubscription.remove();
    }
    if (this.pushTokenSubscription) {
      this.pushTokenSubscription.remove();
    }

    // Listener pour notifications reçues (app en premier plan)
    this.notificationReceivedSubscription = Notifications.addNotificationReceivedListener(async (notification) => {
      if (__DEV__) {
        console.log('🔔 Notification reçue:', notification.request.content.title);
      }
      
      // Ajouter à la liste des notifications stockées
      await this.storeNotification(notification);
    });

    // Listener pour interactions utilisateur
    this.notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const { notification } = response;
      const data = notification.request.content.data;
      
      if (__DEV__) {
        console.log('👆 Notification tapée:', data);
      }
      
      // Marquer comme lue
      if (data?.notificationId) {
        await this.markAsRead(data.notificationId as string);
      }
      
      // Navigation automatique si spécifiée
      if (data?.screen && data?.params) {
        // TODO: Implémenter la navigation globale
        console.log('Navigation vers:', data.screen, data.params);
      }
    });

    // Listener pour changements de token
    this.pushTokenSubscription = Notifications.addPushTokenListener((token) => {
      if (__DEV__) {
        console.log('🔄 Token push mis à jour');
      }
      this.expoPushToken = token.data;
    });
  }

  // Stocker une notification reçue
  private async storeNotification(notification: Notifications.Notification): Promise<void> {
    try {
      const content = notification.request.content;
      const data = content.data || {};
      
      const pushNotification: PushNotification = {
        id: notification.request.identifier,
        title: content.title || 'ATOMIC FLIX',
        body: content.body || '',
        type: (data.type as 'episode' | 'manga' | 'film' | 'planning') || 'episode',
        timestamp: Date.now(),
        read: false,
        image: (data.image as string) || '',
        data: data
      };

      const notifications = await this.getNotifications();
      const updatedNotifications = [pushNotification, ...notifications].slice(0, 50);
      
      await AsyncStorage.setItem('push_notifications', JSON.stringify(updatedNotifications));
      this.notifyListeners(updatedNotifications);
    } catch (error) {
      console.error('Erreur stockage notification:', error);
    }
  }

  // Envoyer une notification locale
  async sendLocalNotification(
    title: string,
    body: string,
    type: 'episode' | 'manga' | 'film' | 'planning',
    data: any = {},
    image?: string
  ): Promise<void> {
    try {
      const channelId = this.getChannelId(type);
      const emoji = this.getTypeEmoji(type);
      
      const notificationContent: any = {
        title: `${emoji} ${title}`,
        body,
        data: {
          ...data,
          type,
          notificationId: `local_${Date.now()}`,
          timestamp: Date.now(),
          image: image || ''
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: this.getChannelColor(type),
      };

      // Ajouter l'image si elle est fournie
      if (image) {
        notificationContent.attachments = [{
          url: image,
          thumbnailClipArea: { x: 0, y: 0, width: 1, height: 1 }
        }];
      }

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // Immédiate
      });

      if (__DEV__) {
        console.log(`✅ Notification locale envoyée: ${title}`);
      }
    } catch (error) {
      console.error('Erreur envoi notification locale:', error);
    }
  }

  // Détecter nouveaux contenus et notifier
  async detectNewContent(currentContent: SearchResult[]): Promise<void> {
    try {
      const previousContent = await this.getPreviousContent();
      const existingNotifications = await this.getNotifications();
      const newNotifications: PushNotification[] = [];

      // Si c'est la première fois ou si pas de contenu précédent, juste sauvegarder sans notifier
      if (previousContent.length === 0) {
        await this.savePreviousContent(currentContent);
        return;
      }

      for (const item of currentContent) {
        const previousItem = previousContent.find(p => p.id === item.id);
        
        // Seul nouveau contenu ou contenu avec changements significatifs
        if (!previousItem || this.hasContentChanged(previousItem, item)) {
          if (this.shouldNotify(item)) {
            const notification = this.createNotificationFromContent(item);
            
            // Vérifier qu'on n'a pas déjà cette notification récemment (dernières 24h)
            const isDuplicate = this.isDuplicateNotification(notification, existingNotifications);
            
            if (!isDuplicate) {
              newNotifications.push(notification);
              
              // Envoyer notification locale seulement pour vraiment nouveau contenu
              if (!previousItem) {
                await this.sendLocalNotification(
                  notification.title,
                  notification.body,
                  notification.type,
                  notification.data,
                  notification.image // Inclure l'image de l'anime
                );
              }
            }
          }
        }
      }

      // Sauvegarder le contenu actuel pour la prochaine fois
      await this.savePreviousContent(currentContent);
      
      if (newNotifications.length > 0) {
        const allNotifications = [...newNotifications, ...existingNotifications].slice(0, 50);
        await AsyncStorage.setItem('push_notifications', JSON.stringify(allNotifications));
        this.notifyListeners(allNotifications);
      }
    } catch (error) {
      console.error('Erreur détection nouveau contenu:', error);
    }
  }

  // Vérifier si c'est une notification en double (même contenu dans les 24h)
  private isDuplicateNotification(notification: PushNotification, existingNotifications: PushNotification[]): boolean {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    return existingNotifications.some(existing => 
      existing.title === notification.title &&
      existing.body === notification.body &&
      existing.type === notification.type &&
      existing.timestamp > twentyFourHoursAgo &&
      existing.data?.animeId === notification.data?.animeId
    );
  }

  // Vérifier si le contenu a changé
  private hasContentChanged(previous: SearchResult, current: SearchResult): boolean {
    return (
      previous.episodeInfo !== current.episodeInfo ||
      previous.currentEpisode !== current.currentEpisode ||
      previous.currentSeason !== current.currentSeason ||
      previous.status !== current.status
    );
  }

  // Toutes les notifications sont envoyées - gestion via paramètres système
  private shouldNotify(item: SearchResult): boolean {
    return true; // Laissons l'utilisateur gérer via les paramètres système
  }

  // Créer une notification depuis un SearchResult
  private createNotificationFromContent(item: SearchResult): PushNotification {
    const type = this.mapContentType(item.type);
    const emoji = this.getTypeEmoji(type);
    
    let title = `${emoji} ATOMIC FLIX`;
    let body = '';
    
    if (item.episodeInfo) {
      title = `Nouvel épisode disponible`;
      body = `${item.title} - ${item.episodeInfo}`;
    } else if (type === 'manga') {
      title = `Nouveau chapitre disponible`;
      body = item.title;
    } else if (type === 'film') {
      title = `Nouveau film disponible`;
      body = item.title;
    } else {
      title = `Nouveau contenu disponible`;
      body = item.title;
    }

    return {
      id: `content_${item.id}_${Date.now()}`,
      title,
      body,
      type,
      timestamp: Date.now(),
      read: false,
      image: item.image,
      data: {
        animeId: item.animeId || item.id,
        animeTitle: item.title,
        episodeNumber: item.currentEpisode,
        seasonNumber: item.currentSeason,
        screen: type === 'manga' ? 'MangaReader' : 'AnimeDetail',
        params: {
          animeUrl: item.animeId || item.id,
          animeTitle: item.title
        }
      }
    };
  }

  // Mapper les types de contenu
  private mapContentType(type?: string): 'episode' | 'manga' | 'film' | 'planning' {
    switch (type) {
      case 'manga': return 'manga';
      case 'film':
      case 'movie': return 'film';
      default: return 'episode';
    }
  }

  // Obtenir l'emoji selon le type
  private getTypeEmoji(type: string): string {
    switch (type) {
      case 'episode': return '📺';
      case 'manga': return '📖';
      case 'film': return '🎬';
      case 'planning': return '⏰';
      default: return '📺';
    }
  }

  // Obtenir l'ID du canal selon le type
  private getChannelId(type: string): string {
    switch (type) {
      case 'episode': return 'atomic-flix-episodes';
      case 'manga': return 'atomic-flix-manga';
      case 'film': return 'atomic-flix-films';
      case 'planning': return 'atomic-flix-planning';
      default: return 'atomic-flix-episodes';
    }
  }

  // Obtenir la couleur selon le type
  private getChannelColor(type: string): string {
    const channel = this.channels.find(c => c.id === this.getChannelId(type));
    return channel?.color || '#8B5DFF';
  }


  // Gestion des notifications stockées
  async getNotifications(): Promise<PushNotification[]> {
    try {
      const notifications = await AsyncStorage.getItem('push_notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Erreur lecture notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      
      await AsyncStorage.setItem('push_notifications', JSON.stringify(updatedNotifications));
      this.notifyListeners(updatedNotifications);
    } catch (error) {
      console.error('Erreur marquage lecture:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      
      await AsyncStorage.setItem('push_notifications', JSON.stringify(updatedNotifications));
      this.notifyListeners(updatedNotifications);
    } catch (error) {
      console.error('Erreur marquage toutes lectures:', error);
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(notif => !notif.read).length;
    } catch (error) {
      return 0;
    }
  }

  // Gestion du contenu précédent pour détection
  private async getPreviousContent(): Promise<SearchResult[]> {
    try {
      const content = await AsyncStorage.getItem('previous_content');
      return content ? JSON.parse(content) : [];
    } catch (error) {
      return [];
    }
  }

  private async savePreviousContent(content: SearchResult[]): Promise<void> {
    try {
      await AsyncStorage.setItem('previous_content', JSON.stringify(content));
    } catch (error) {
      console.error('Erreur sauvegarde contenu précédent:', error);
    }
  }

  // Gestion des listeners
  addListener(callback: (notifications: PushNotification[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(notifications: PushNotification[]): void {
    this.listeners.forEach(listener => listener(notifications));
  }

  // Nettoyer les anciennes notifications (7 jours)
  async cleanOldNotifications(): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      const recentNotifications = notifications.filter(notif =>
        notif.timestamp > sevenDaysAgo
      );
      
      if (recentNotifications.length !== notifications.length) {
        await AsyncStorage.setItem('push_notifications', JSON.stringify(recentNotifications));
        this.notifyListeners(recentNotifications);
      }
    } catch (error) {
      console.error('Erreur nettoyage notifications:', error);
    }
  }

  // Obtenir le token Expo (pour debug/tests)
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

}