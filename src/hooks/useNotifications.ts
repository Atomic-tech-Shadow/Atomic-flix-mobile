import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/NotificationService';
import { PushNotification } from '../types/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
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
    expoPushToken,
    isLoading,
    isInitialized,
    
    // Actions
    markAsRead,
    markAllAsRead,
    detectNewContent,
    refreshNotifications
  };
}