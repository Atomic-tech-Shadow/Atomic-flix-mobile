import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import NotificationService, { EpisodeNotification } from '../utils/notificationService';
import NotificationModal from './NotificationModal';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SharedHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

const SharedHeader: React.FC<SharedHeaderProps> = ({ 
  onSearchPress,
  onNotificationPress 
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<EpisodeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notificationService = NotificationService.getInstance();



  const handleNotificationPress = async () => {
    // Si les notifications sont activées, ouvrir le modal des notifications
    if (notificationsEnabled) {
      const allNotifications = await notificationService.getNotifications();
      setNotifications(allNotifications);
      setShowNotificationModal(true);
      return;
    }

    // Sinon, activer/désactiver les notifications
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    
    // Marquer les notifications comme lues quand on les active
    if (newState) {
      setHasNewNotifications(false);
    }

    // Afficher une confirmation à l'utilisateur
    Alert.alert(
      'Notifications',
      newState 
        ? 'Notifications activées ! Vous recevrez les alertes pour les nouveaux épisodes et mangas.' 
        : 'Notifications désactivées. Vous ne recevrez plus d\'alertes.',
      [{ text: 'OK' }]
    );

    // Appeler la fonction callback si fournie
    if (onNotificationPress) {
      onNotificationPress();
    }
  };

  const handleNotificationItemPress = (notification: EpisodeNotification) => {
    // Marquer comme lu et fermer le modal
    notificationService.markAsRead(notification.id);
    setShowNotificationModal(false);
    
    // TODO: Naviguer vers l'anime/manga spécifique
    console.log('Navigation vers:', notification.animeTitle);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    const updatedNotifications = await notificationService.getNotifications();
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    setHasNewNotifications(false);
  };

  // Écouter les changements de notifications et mettre à jour le compteur
  useEffect(() => {
    const loadNotifications = async () => {
      const settings = await notificationService.getSettings();
      setNotificationsEnabled(settings.enabled);
      
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      setHasNewNotifications(count > 0);
    };

    loadNotifications();

    // Écouter les nouvelles notifications
    const unsubscribe = notificationService.addListener(async (newNotifications) => {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      setHasNewNotifications(count > 0);
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.mobileHeader}>
      <View style={styles.headerRow}>
        {/* Logo ATOMIC FLIX à gauche */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../../assets/atomic-flix-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Icônes navigation droite */}
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={onSearchPress}
          >
            <Ionicons name="search" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={handleNotificationPress}
          >
            <View style={styles.notificationContainer}>
              <Ionicons 
                name={notificationsEnabled ? "notifications" : "notifications-off"} 
                size={22} 
                color={notificationsEnabled ? "#00bcd4" : "#ffffff"} 
              />
              {notificationsEnabled && unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="menu" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal des notifications */}
      <NotificationModal
        visible={showNotificationModal}
        notifications={notifications}
        onClose={() => setShowNotificationModal(false)}
        onNotificationPress={handleNotificationItemPress}
        onMarkAllRead={handleMarkAllRead}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Header mobile exact
  mobileHeader: {
    backgroundColor: '#0a0a1a',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoImage: {
    width: 120,
    height: 35,
    borderRadius: 60, // Pour rendre le logo rond
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ff4444',
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SharedHeader;