import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SharedHeaderProps {
  showBackButton?: boolean;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

const SharedHeader: React.FC<SharedHeaderProps> = ({ 
  showBackButton = false,
  onSearchPress,
  onNotificationPress 
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleNotificationPress = () => {
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

  // Simuler l'arrivée de nouvelles notifications périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      if (notificationsEnabled && Math.random() > 0.7) {
        setHasNewNotifications(true);
      }
    }, 30000); // Vérifie toutes les 30 secondes

    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  return (
    <View style={styles.mobileHeader}>
      <View style={styles.headerRow}>
        {/* Logo ATOMIC FLIX avec symbole atomique */}
        <View style={styles.logoSection}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
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
              {notificationsEnabled && hasNewNotifications && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>•</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="menu" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  logoImage: {
    width: 120,
    height: 35,
    marginLeft: 8,
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
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default SharedHeader;