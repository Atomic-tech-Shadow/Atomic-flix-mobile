import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Modal, Animated, Dimensions, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import NotificationService, { EpisodeNotification } from '../utils/notificationService';
import NotificationModal from './NotificationModal';
import GlobalSearchModal from './GlobalSearchModal';

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
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showGlobalSearchModal, setShowGlobalSearchModal] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));

  // 🧪 BOUTON TEST TEMPORAIRE pour les notifications push
  const sendTestNotification = async () => {
    try {
      // Les imports sont déjà disponibles en haut du fichier
      
      // Vérifier si c'est un appareil physique
      if (!Device.isDevice) {
        Alert.alert('Test Notification', 'Les notifications push ne fonctionnent que sur des appareils physiques.');
        return;
      }

      // Configurer le canal de notifications pour Android (obligatoire Android 8+)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('atomic-flix-test', {
          name: 'Test ATOMIC FLIX',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B35',
        });
      }

      // Vérifier et demander les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Test Notification', 'Impossible d\'obtenir le token push. Vérifiez les permissions.');
        return;
      }

      // Obtenir le token Expo push
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      if (!pushToken?.data) {
        Alert.alert('Test Notification', 'Impossible d\'obtenir le token push. Vérifiez les permissions.');
        return;
      }

      // Envoyer une notification de test via l'API Expo
      const message = {
        to: pushToken.data,
        sound: 'default',
        title: '🧪 Test ATOMIC FLIX',
        body: 'Notification de test réussie ! Les notifications push fonctionnent correctement.',
        channelId: Platform.OS === 'android' ? 'atomic-flix-test' : undefined,
        data: { 
          screen: 'test',
          timestamp: Date.now()
        },
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      
      if (result.data && result.data[0] && result.data[0].status === 'ok') {
        Alert.alert('Test réussi !', 'Notification push envoyée avec succès. Vous devriez la recevoir dans quelques secondes.');
      } else {
        Alert.alert('Erreur test', `Échec envoi: ${JSON.stringify(result)}`);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      Alert.alert('Erreur test', `Erreur: ${errorMessage}`);
    }
  };

  const notificationService = NotificationService.getInstance();

  const handleSearchPress = () => {
    // Si un onSearchPress spécifique est fourni (comme dans HomeScreen), l'utiliser
    if (onSearchPress) {
      onSearchPress();
    } else {
      // Sinon, ouvrir le modal de recherche globale
      setShowGlobalSearchModal(true);
    }
  };

  const handleNotificationPress = async () => {
    if (notificationsEnabled && (unreadCount > 0 || hasNewNotifications)) {
      // Si les notifications sont activées et qu'il y a des notifications non lues, ouvrir le modal
      const currentNotifications = await notificationService.getNotifications();
      setNotifications(currentNotifications);
      setShowNotificationModal(true);
    } else {
      // Sinon, activer/désactiver les notifications
      const newState = !notificationsEnabled;
      
      if (newState) {
        // En mode web, activer directement (notifications simulées)
        if (Platform.OS === 'web') {
          console.log('Mode web - notifications simulées activées');
        } else {
          // Sur mobile, vérifier d'abord si les permissions sont déjà accordées
          const isAllowed = await notificationService.allowsNotificationsAsync();
          if (isAllowed) {
            // Permissions déjà accordées, juste obtenir/créer le token
            await notificationService.initializePushNotifications();
          } else {
            // Demander les permissions
            const token = await notificationService.initializePushNotifications();
            if (!token) {
              // Si les permissions sont refusées, informer l'utilisateur
              Alert.alert(
                'Permissions requises',
                'Pour recevoir les notifications de nouvelles sorties, activez les permissions dans Paramètres > Applications > ATOMIC FLIX > Notifications.',
                [{ text: 'OK' }]
              );
              return;
            }
          }
        }
      }
      
      setNotificationsEnabled(newState);

      // Sauvegarder l'état dans les paramètres
      await notificationService.saveSettings({
        enabled: newState,
        newEpisodes: newState,
        newMangas: newState,
      });

      // Marquer les notifications comme lues quand on les active
      if (newState) {
        setHasNewNotifications(false);
      }

      // Afficher une confirmation à l'utilisateur
      Alert.alert(
        'Notifications',
        newState 
          ? '✅ Notifications activées ! Vous recevrez les alertes pour les nouveaux épisodes et mangas.' 
          : '🔕 Notifications désactivées. Vous ne recevrez plus d\'alertes.',
        [{ text: 'OK' }]
      );

      // Appeler la fonction callback si fournie
      if (onNotificationPress) {
        onNotificationPress();
      }
    }
  };

  const handleNotificationItemPress = (notification: EpisodeNotification) => {
    // Marquer comme lu et fermer le modal
    notificationService.markAsRead(notification.id);
    setShowNotificationModal(false);

    // TODO: Naviguer vers l'anime/manga spécifique
    console.log('Navigation vers:', notification.animeTitle);
  };

  const handleMenuPress = () => {
    setShowMenuDrawer(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenuDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowMenuDrawer(false);
    });
  };

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    closeMenuDrawer();
    // Navigation avec vérification des paramètres requis
    switch (screenName) {
      case 'Home':
      case 'About':
      case 'NotFound':
      case 'PrivacyPolicy':
      case 'TermsOfService':
        navigation.navigate(screenName);
        break;
      default:
        // Pour les écrans qui nécessitent des paramètres, naviguer vers Home par défaut
        navigation.navigate('Home');
        break;
    }
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

  // Utiliser la version d'app.json via Constants Expo
  const appVersion = Constants.expoConfig?.version || '2.9.3';

  return (
    <View style={styles.mobileHeader}>
      <View style={styles.headerRow}>
        <View style={styles.logoSection}>
          <Image 
            source={require('../../assets/atomic-flix-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>ATOMIC FLIX 🇹🇬</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={handleSearchPress}
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

          {/* 🧪 BOUTON TEST TEMPORAIRE */}
          <TouchableOpacity 
            style={[styles.headerIconButton, { backgroundColor: '#ff6b35' }]}
            onPress={sendTestNotification}
          >
            <Ionicons name="flask" size={18} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={handleMenuPress}
          >
            <Ionicons name="menu" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
      <NotificationModal
        visible={showNotificationModal}
        notifications={notifications}
        onClose={() => setShowNotificationModal(false)}
        onNotificationPress={handleNotificationItemPress}
        onMarkAllRead={handleMarkAllRead}
      />
      <Modal
        visible={showMenuDrawer}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenuDrawer}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity 
            style={styles.drawerBackground}
            onPress={closeMenuDrawer}
          />
          <Animated.View 
            style={[
              styles.drawerContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <View style={styles.drawerHeader}>
              <Image 
                source={require('../../assets/atomic-flix-logo.png')}
                style={styles.drawerLogo}
                resizeMode="contain"
              />
              <Text style={styles.drawerTitle}>ATOMIC FLIX 🇹🇬</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeMenuDrawer}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View style={styles.menuItems}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToScreen('Home')}
              >
                <Ionicons name="home" size={20} color="#00bcd4" />
                <Text style={styles.menuItemText}>Accueil</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToScreen('About')}
              >
                <Ionicons name="information-circle" size={20} color="#00bcd4" />
                <Text style={styles.menuItemText}>À propos</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToScreen('PrivacyPolicy')}
              >
                <Ionicons name="shield-checkmark" size={20} color="#00bcd4" />
                <Text style={styles.menuItemText}>Politique de confidentialité</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToScreen('TermsOfService')}
              >
                <Ionicons name="document-text" size={20} color="#00bcd4" />
                <Text style={styles.menuItemText}>Conditions d'utilisation</Text>
              </TouchableOpacity>
            </View>

            {/* Footer du menu */}
            <View style={styles.drawerFooter}>
              <Text style={styles.footerText}>Version {appVersion}</Text>
              <Text style={styles.footerSubtext}>Développé par Cid AKUE</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal de recherche globale */}
      <GlobalSearchModal
        visible={showGlobalSearchModal}
        onClose={() => setShowGlobalSearchModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Header mobile exact
  mobileHeader: {
    backgroundColor: '#0a0a1a',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
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
    width: 35,
    height: 35,
    borderRadius: 60, // Pour rendre le logo rond
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
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
  // Styles pour le menu drawer
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  drawerBackground: {
    flex: 1,
  },
  drawerContainer: {
    width: 280,
    backgroundColor: '#0a0a1a',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#1a1a2e',
    paddingTop: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  drawerLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  drawerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  menuItemText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 15,
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default SharedHeader;