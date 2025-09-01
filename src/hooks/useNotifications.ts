import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/NotificationService';
import { PushNotification, NotificationSettings } from '../types/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const service = NotificationService.getInstance();

  // Initialiser le service
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Initialiser le service
      const { token, success } = await service.initializeService();
      
      if (success) {
        setExpoPushToken(token);
        setIsInitialized(true);
        
        // Charger les données initiales
        await loadNotifications();
        await loadSettings();
        await loadUnreadCount();
        
        if (__DEV__) {
          console.log('✅ Notifications initialisées avec succès');
        }
      }
    } catch (error) {
      console.error('Erreur initialisation hook notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    try {
      const notifs = await service.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  }, []);

  // Charger les paramètres
  const loadSettings = useCallback(async () => {
    try {
      const notificationSettings = await service.getSettings();
      setSettings(notificationSettings);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  }, []);

  // Charger le nombre non lu
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await service.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement count:', error);
    }
  }, []);

  // Listener pour les mises à jour en temps réel
  useEffect(() => {
    if (!isInitialized) return;
    
    const unsubscribe = service.addListener((updatedNotifications) => {
      setNotifications(updatedNotifications);
      const unread = updatedNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    });

    return unsubscribe;
  }, [isInitialized]);

  // Actions
  const markAsRead = useCallback(async (notificationId: string) => {
    await service.markAsRead(notificationId);
    await loadNotifications();
    await loadUnreadCount();
  }, []);

  const markAllAsRead = useCallback(async () => {
    await service.markAllAsRead();
    await loadNotifications();
    setUnreadCount(0);
  }, []);

  const updateSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      await service.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Erreur mise à jour paramètres:', error);
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    try {
      await service.sendTestNotification();
    } catch (error) {
      console.error('Erreur test notification:', error);
    }
  }, []);

  const detectNewContent = useCallback(async (content: any[]) => {
    try {
      await service.detectNewContent(content);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Erreur détection contenu:', error);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
    await loadUnreadCount();
  }, []);

  return {
    // État
    notifications,
    unreadCount,
    settings,
    expoPushToken,
    isLoading,
    isInitialized,
    
    // Actions
    markAsRead,
    markAllAsRead,
    updateSettings,
    sendTestNotification,
    detectNewContent,
    refreshNotifications
  };
}