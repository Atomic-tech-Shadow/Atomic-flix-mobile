import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

interface AppUpdate {
  version: string;
  changelog: string;
  downloadUrl: string;
  isRequired: boolean;
  releaseDate: string;
}

interface UpdateSettings {
  autoCheck: boolean;
  notifyUpdates: boolean;
  lastChecked: string;
  ignoredVersion?: string;
}

class UpdateService {
  private static instance: UpdateService;
  private currentVersion: string;
  private telegramBotUrl: string;

  constructor() {
    this.currentVersion = Constants.expoConfig?.version || '2.6.2';
    this.telegramBotUrl = 'https://atomic-flix-verifier-bot.vercel.app';
  }

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  // Vérifier les mises à jour disponibles
  async checkForUpdates(): Promise<AppUpdate | null> {
    try {
      const settings = await this.getUpdateSettings();
      
      // Vérifier si on doit checker (max 1 fois par jour)
      const lastChecked = new Date(settings.lastChecked);
      const now = new Date();
      const daysDiff = (now.getTime() - lastChecked.getTime()) / (1000 * 3600 * 24);
      
      if (daysDiff < 1 && !__DEV__) {
        return null;
      }

      // Appeler l'API pour vérifier les mises à jour
      const response = await fetch(`${this.telegramBotUrl}/api/check-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentVersion: this.currentVersion,
          platform: 'android'
        }),
      });

      if (!response.ok) {
        if (__DEV__) {
          console.log('Pas de mise à jour disponible');
        }
        return null;
      }

      const updateData: AppUpdate = await response.json();
      
      // Sauvegarder la date de vérification
      await this.saveUpdateSettings({
        ...settings,
        lastChecked: now.toISOString()
      });

      // Vérifier si cette version n'est pas ignorée
      if (settings.ignoredVersion === updateData.version) {
        return null;
      }

      return updateData;
    } catch (error) {
      if (__DEV__) {
        console.error('Erreur vérification mise à jour:', error);
      }
      return null;
    }
  }

  // Envoyer notification de mise à jour
  async notifyUpdate(update: AppUpdate): Promise<void> {
    try {
      const settings = await this.getUpdateSettings();
      
      if (!settings.notifyUpdates) {
        return;
      }

      // Notification push locale
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎉 ATOMIC FLIX ${update.version} disponible !`,
          body: this.formatChangelogForNotification(update.changelog),
          data: {
            type: 'app_update',
            version: update.version,
            downloadUrl: update.downloadUrl,
            isRequired: update.isRequired
          },
        },
        trigger: null, // Immédiat
      });

      // Notification via Bot Telegram si l'utilisateur est vérifié
      await this.sendTelegramUpdateNotification(update);

    } catch (error) {
      if (__DEV__) {
        console.error('Erreur notification mise à jour:', error);
      }
    }
  }

  // Envoyer notification via Bot Telegram
  private async sendTelegramUpdateNotification(update: AppUpdate): Promise<void> {
    try {
      const telegramId = await AsyncStorage.getItem('telegram_user_id');
      
      if (!telegramId) {
        return;
      }

      await fetch(`${this.telegramBotUrl}/api/notify-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: telegramId,
          version: update.version,
          changelog: update.changelog,
          downloadUrl: update.downloadUrl,
          isRequired: update.isRequired
        }),
      });

    } catch (error) {
      if (__DEV__) {
        console.error('Erreur notification Telegram:', error);
      }
    }
  }

  // Vérifier automatiquement les mises à jour
  async autoCheckUpdates(): Promise<AppUpdate | null> {
    const settings = await this.getUpdateSettings();
    
    if (!settings.autoCheck) {
      return null;
    }

    const update = await this.checkForUpdates();
    
    if (update) {
      await this.notifyUpdate(update);
    }

    return update;
  }

  // Ignorer une version
  async ignoreVersion(version: string): Promise<void> {
    const settings = await this.getUpdateSettings();
    await this.saveUpdateSettings({
      ...settings,
      ignoredVersion: version
    });
  }

  // Formater le changelog pour notification
  private formatChangelogForNotification(changelog: string): string {
    // Prendre les 3 premières lignes du changelog
    const lines = changelog.split('\n').filter(line => line.trim());
    const preview = lines.slice(0, 3).join(' • ');
    
    if (lines.length > 3) {
      return preview + '...';
    }
    
    return preview;
  }

  // Comparer deux versions (ex: "2.6.2" vs "2.7.0")
  private isNewerVersion(newVersion: string, currentVersion: string): boolean {
    const parseVersion = (version: string) => {
      return version.split('.').map(Number);
    };

    const newV = parseVersion(newVersion);
    const currentV = parseVersion(currentVersion);

    for (let i = 0; i < Math.max(newV.length, currentV.length); i++) {
      const newPart = newV[i] || 0;
      const currentPart = currentV[i] || 0;

      if (newPart > currentPart) return true;
      if (newPart < currentPart) return false;
    }

    return false;
  }

  // Paramètres de mise à jour
  async getUpdateSettings(): Promise<UpdateSettings> {
    try {
      const settings = await AsyncStorage.getItem('update_settings');
      return settings ? JSON.parse(settings) : {
        autoCheck: true,
        notifyUpdates: true,
        lastChecked: new Date(0).toISOString() // 1970 pour forcer première vérification
      };
    } catch (error) {
      return {
        autoCheck: true,
        notifyUpdates: true,
        lastChecked: new Date(0).toISOString()
      };
    }
  }

  async saveUpdateSettings(settings: UpdateSettings): Promise<void> {
    try {
      await AsyncStorage.setItem('update_settings', JSON.stringify(settings));
    } catch (error) {
      if (__DEV__) {
        console.error('Erreur sauvegarde paramètres update:', error);
      }
    }
  }

  // Obtenir version actuelle
  getCurrentVersion(): string {
    return this.currentVersion;
  }
}

export default UpdateService;