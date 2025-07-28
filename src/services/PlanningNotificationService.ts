/**
 * Service de notifications push pour le planning des sorties d'animes
 * Système intelligent de rappels temporels avant les sorties prévues
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { animeAPI } from '../utils/animeAPI';

interface PlanningItem {
  id: string;
  title: string;
  releaseTime: string;
  language: string;
  image: string;
  animeId: string;
  url: string;
}

interface ScheduledNotification {
  notificationId: string;
  animeId: string;
  releaseTime: string;
  scheduledFor: Date;
  type: 'hour_before' | 'day_of' | 'morning_reminder';
}

class PlanningNotificationService {
  private static instance: PlanningNotificationService;
  private readonly STORAGE_KEY = 'planning_notifications';
  private readonly SCHEDULED_KEY = 'scheduled_planning_notifications';
  private isInitialized = false;

  static getInstance(): PlanningNotificationService {
    if (!PlanningNotificationService.instance) {
      PlanningNotificationService.instance = new PlanningNotificationService();
    }
    return PlanningNotificationService.instance;
  }

  /**
   * Initialiser le service de notifications planning
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configurer le canal de notifications pour le planning
      await Notifications.setNotificationChannelAsync('planning-reminders', {
        name: 'Rappels Planning',
        description: 'Notifications pour les sorties d\'animes prévues',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFC107',
        sound: 'notification_sound_default',
      });

      this.isInitialized = true;
    } catch (error) {
      // Erreur silencieuse en production
    }
  }

  /**
   * Programmer les notifications pour les sorties du planning
   */
  async schedulePlanningNotifications(planningData: PlanningItem[]): Promise<void> {
    try {
      // Annuler toutes les notifications planning précédentes
      await this.cancelAllPlanningNotifications();

      const scheduledNotifications: ScheduledNotification[] = [];
      const now = new Date();

      for (const anime of planningData) {
        if (!anime.releaseTime || anime.releaseTime === '?') continue;

        // Parser l'heure (format "20h15", "12h00", etc.)
        const releaseDateTime = this.parseReleaseTime(anime.releaseTime);
        if (!releaseDateTime || releaseDateTime <= now) continue;

        // Notification 1 heure avant
        const oneHourBefore = new Date(releaseDateTime.getTime() - 60 * 60 * 1000);
        if (oneHourBefore > now) {
          const notificationId = await this.scheduleNotification(
            anime,
            oneHourBefore,
            'hour_before',
            `🕐 Dans 1h : ${anime.title}`,
            `Sortie prévue à ${anime.releaseTime} en ${anime.language}`
          );

          if (notificationId) {
            scheduledNotifications.push({
              notificationId,
              animeId: anime.animeId,
              releaseTime: anime.releaseTime,
              scheduledFor: oneHourBefore,
              type: 'hour_before'
            });
          }
        }

        // Notification le jour même (matin à 9h)
        const dayOfMorning = new Date(releaseDateTime);
        dayOfMorning.setHours(9, 0, 0, 0);
        if (dayOfMorning > now && dayOfMorning < releaseDateTime) {
          const notificationId = await this.scheduleNotification(
            anime,
            dayOfMorning,
            'morning_reminder',
            `📅 Aujourd'hui : ${anime.title}`,
            `Sortie prévue à ${anime.releaseTime} • N'oubliez pas !`
          );

          if (notificationId) {
            scheduledNotifications.push({
              notificationId,
              animeId: anime.animeId,
              releaseTime: anime.releaseTime,
              scheduledFor: dayOfMorning,
              type: 'morning_reminder'
            });
          }
        }

        // Notification à l'heure exacte
        const notificationId = await this.scheduleNotification(
          anime,
          releaseDateTime,
          'day_of',
          `🎉 Disponible : ${anime.title}`,
          `L'épisode est maintenant disponible en ${anime.language} !`
        );

        if (notificationId) {
          scheduledNotifications.push({
            notificationId,
            animeId: anime.animeId,
            releaseTime: anime.releaseTime,
            scheduledFor: releaseDateTime,
            type: 'day_of'
          });
        }
      }

      // Sauvegarder les notifications programmées
      await AsyncStorage.setItem(
        this.SCHEDULED_KEY,
        JSON.stringify(scheduledNotifications)
      );

      // Notifications programmées silencieusement
    } catch (error) {
      // Erreur silencieuse en production
    }
  }

  /**
   * Parser l'heure de sortie (ex: "20h15" → Date)
   */
  private parseReleaseTime(timeStr: string): Date | null {
    try {
      const match = timeStr.match(/(\d{1,2})h(\d{2})/);
      if (!match) return null;

      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);

      const releaseDate = new Date();
      releaseDate.setHours(hours, minutes, 0, 0);

      // Si l'heure est passée aujourd'hui, programmer pour demain
      if (releaseDate <= new Date()) {
        releaseDate.setDate(releaseDate.getDate() + 1);
      }

      return releaseDate;
    } catch (error) {
      return null;
    }
  }

  /**
   * Programmer une notification spécifique
   */
  private async scheduleNotification(
    anime: PlanningItem,
    scheduledDate: Date,
    type: string,
    title: string,
    body: string
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'planning_reminder',
            animeId: anime.animeId,
            animeTitle: anime.title,
            url: anime.url,
            reminderType: type,
            releaseTime: anime.releaseTime,
            language: anime.language
          },
          sound: 'notification_sound_default',
          vibrate: [0, 250, 250, 250],
        },
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.floor((scheduledDate.getTime() - Date.now()) / 1000) 
        },
      });

      return notificationId;
    } catch (error) {
      return null;
    }
  }

  /**
   * Annuler toutes les notifications planning
   */
  async cancelAllPlanningNotifications(): Promise<void> {
    try {
      const scheduledStr = await AsyncStorage.getItem(this.SCHEDULED_KEY);
      if (scheduledStr) {
        const scheduled: ScheduledNotification[] = JSON.parse(scheduledStr);
        
        for (const notification of scheduled) {
          await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
        }
      }

      // Nettoyer le storage
      await AsyncStorage.removeItem(this.SCHEDULED_KEY);
    } catch (error) {
      // Erreur silencieuse en production
    }
  }

  /**
   * Vérifier et mettre à jour le planning
   */
  async checkAndUpdatePlanning(): Promise<void> {
    try {
      const response = await animeAPI.getPlanning();
      if (!response.success || !response.data) return;

      // Programmer les nouvelles notifications
      await this.schedulePlanningNotifications(response.data.slice(0, 15)); // Top 15
      
      // Planning mis à jour silencieusement
    } catch (error) {
      // Erreur silencieuse en production
    }
  }

  /**
   * Obtenir les statistiques des notifications programmées
   */
  async getScheduledStats(): Promise<{ total: number; hourBefore: number; dayOf: number; morning: number }> {
    try {
      const scheduledStr = await AsyncStorage.getItem(this.SCHEDULED_KEY);
      if (!scheduledStr) return { total: 0, hourBefore: 0, dayOf: 0, morning: 0 };

      const scheduled: ScheduledNotification[] = JSON.parse(scheduledStr);
      
      return {
        total: scheduled.length,
        hourBefore: scheduled.filter(n => n.type === 'hour_before').length,
        dayOf: scheduled.filter(n => n.type === 'day_of').length,
        morning: scheduled.filter(n => n.type === 'morning_reminder').length
      };
    } catch (error) {
      return { total: 0, hourBefore: 0, dayOf: 0, morning: 0 };
    }
  }
}

export default PlanningNotificationService;