import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/newColors';
import { NotificationBadge } from './NotificationBadge';
import { useNotifications } from '../hooks/useNotifications';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SharedHeaderProps {
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
}

const SharedHeader: React.FC<SharedHeaderProps> = ({ 
  onSearchPress,
  onNotificationPress,
  onMenuPress
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { unreadCount } = useNotifications();

  const handleSearchPress = () => {
    // Si un onSearchPress spécifique est fourni (comme dans HomeScreen), l'utiliser
    if (onSearchPress) {
      onSearchPress();
    }
  };


  // Utiliser la version d'app.json via Constants Expo
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <View style={styles.mobileHeader}>
      <View style={styles.headerRow}>
        {/* Menu hamburger - position standard à gauche */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={onMenuPress}
        >
          <Ionicons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>

        {/* Texte à côté du menu, style WhatsApp */}
        <View style={styles.titleSection}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary, COLORS.accent]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.titleTextGradient}
          >
            <Text style={styles.titleText}>ATOMIC FLIX</Text>
          </LinearGradient>
        </View>

        {/* Actions à droite */}
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={handleSearchPress}
          >
            <Ionicons name="search" size={22} color="#ffffff" />
          </TouchableOpacity>

          {/* Bouton notifications avec badge */}
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={onNotificationPress}
          >
            <Ionicons name="notifications-outline" size={22} color="#ffffff" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount.toString()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Header mobile exact
  mobileHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleSection: {
    flex: 1,
    marginLeft: 16,
  },
  titleTextGradient: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    letterSpacing: 0.8,
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
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SharedHeader;