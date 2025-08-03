import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Modal, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import NotificationService, { EpisodeNotification } from '../utils/notificationService';
import NotificationModal from './NotificationModal';
import { COLORS } from '../constants/newColors';
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
            source={require('../../assets/atomic-flix-logo-new.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary, COLORS.accent]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.logoTextGradient}
          >
            <Text style={styles.logoText}>ATOMIC FLIX 🇹🇬</Text>
          </LinearGradient>
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
                color={notificationsEnabled ? COLORS.secondary : "#ffffff"} 
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
                source={require('../../assets/atomic-flix-logo-new.png')}
                style={styles.drawerLogo}
                resizeMode="contain"
              />
              <LinearGradient
                colors={['#00bcd4', '#4ca9ff', '#00bcd4']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.drawerTitleGradient}
              >
                <Text style={styles.drawerTitle}>ATOMIC FLIX 🇹🇬</Text>
              </LinearGradient>
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
  logoTextGradient: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 188, 212, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    backgroundColor: COLORS.primary, // Violet du logo
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: COLORS.secondary, // Cyan du logo
    paddingTop: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent, // Rose du logo
  },
  drawerLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  drawerTitleGradient: {
    flex: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 188, 212, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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