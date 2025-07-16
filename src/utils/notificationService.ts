import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
}

class NotificationService {
  private static instance: NotificationService;
  private listeners: Set<(notifications: EpisodeNotification[]) => void> = new Set();
  private previousContent: Map<string, SearchResult> = new Map();
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Obtenir les paramètres de notification
  async getSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      return settings ? JSON.parse(settings) : {
        enabled: false,
        newEpisodes: true,
        newMangas: true
      };
    } catch (error) {
      console.error('Erreur lecture paramètres notifications:', error);
      return { enabled: false, newEpisodes: true, newMangas: true };
    }
  }

  // Sauvegarder les paramètres de notification
  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erreur sauvegarde paramètres notifications:', error);
    }
  }

  // Obtenir les notifications stockées
  async getNotifications(): Promise<EpisodeNotification[]> {
    try {
      const notifications = await AsyncStorage.getItem('stored_notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Erreur lecture notifications:', error);
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
      console.error('Erreur sauvegarde notifications:', error);
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
          const notification: EpisodeNotification = {
            id: `${item.id}-${Date.now()}`,
            title: item.title,
            type: item.type as 'anime' | 'manga' | 'film',
            message: this.generateNotificationMessage(item, !previousItem),
            timestamp: Date.now(),
            read: false
          };
          
          newNotifications.push(notification);
        }
      }
      
      // Mettre à jour le cache
      this.previousContent.set(item.id, item);
    }

    // Ajouter les nouvelles notifications aux existantes
    if (newNotifications.length > 0) {
      const existingNotifications = await this.getNotifications();
      const allNotifications = [...newNotifications, ...existingNotifications];
      
      // Garder seulement les 50 dernières notifications
      const limitedNotifications = allNotifications.slice(0, 50);
      
      await this.saveNotifications(limitedNotifications);
      
      // Afficher une alerte pour la première nouvelle notification
      this.showNotificationAlert(newNotifications[0]);
    }
  }

  // Vérifier si le contenu a changé (détection de nouveaux épisodes)
  private hasContentChanged(previous: SearchResult, current: SearchResult): boolean {
    // Comparaison basique - pourrait être améliorée avec plus de métadonnées
    return previous.status !== current.status || 
           previous.title !== current.title ||
           previous.image !== current.image;
  }

  // Déterminer si une notification doit être créée
  private shouldCreateNotification(item: SearchResult, settings: NotificationSettings): boolean {
    if (item.type === 'anime' && settings.newEpisodes) return true;
    if (item.type === 'manga' && settings.newMangas) return true;
    if (item.type === 'film' && settings.newEpisodes) return true;
    return false;
  }

  // Générer le message de notification
  private generateNotificationMessage(item: SearchResult, isNew: boolean): string {
    const typeText = item.type === 'anime' ? 'anime' : 
                     item.type === 'manga' ? 'manga' : 'film';
    
    if (isNew) {
      return `Nouveau ${typeText} ajouté : ${item.title}`;
    } else {
      return `Mise à jour du ${typeText} : ${item.title}`;
    }
  }

  // Afficher une alerte de notification
  private showNotificationAlert(notification: EpisodeNotification): void {
    Alert.alert(
      '🔔 Nouvelle notification !',
      notification.message,
      [
        { text: 'Ignorer', style: 'cancel' },
        { text: 'Voir', onPress: () => this.markAsRead(notification.id) }
      ],
      { cancelable: true }
    );
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