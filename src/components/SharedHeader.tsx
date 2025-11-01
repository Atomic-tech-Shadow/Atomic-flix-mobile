import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, getThemedColors } from '../constants/newColors';
import { NotificationBadge } from './NotificationBadge';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../contexts/ThemeContext';

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
  const { isDark, toggleTheme } = useTheme();
  const themedColors = getThemedColors(isDark);

  const handleSearchPress = () => {
    // Si un onSearchPress spécifique est fourni (comme dans HomeScreen), l'utiliser
    if (onSearchPress) {
      onSearchPress();
    }
  };


  // Utiliser la version d'app.json via Constants Expo
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const headerBgColor = themedColors.primary;
  const iconColor = themedColors.text.primary;
  const titleGradientColors = [themedColors.secondary, themedColors.primary, themedColors.accent] as const;

  return (
    <View style={[styles.mobileHeader, { backgroundColor: headerBgColor }]}>
      <View style={styles.headerRow}>
        {/* Menu hamburger - position standard à gauche */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={onMenuPress}
        >
          <Ionicons name="menu" size={24} color={iconColor} />
        </TouchableOpacity>

        {/* Texte à côté du menu, style WhatsApp */}
        <View style={styles.titleSection}>
          <LinearGradient
            colors={titleGradientColors}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.titleTextGradient}
          >
            <Text style={[styles.titleText, { color: themedColors.text.primary }]} numberOfLines={1}>ATOMIC FLIX</Text>
          </LinearGradient>
        </View>

        {/* Actions à droite */}
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={handleSearchPress}
          >
            <Ionicons name="search" size={22} color={iconColor} />
          </TouchableOpacity>

          {/* Bouton thème (mode sombre/clair) */}
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={toggleTheme}
          >
            <Ionicons 
              name={isDark ? "sunny" : "moon"} 
              size={22} 
              color={iconColor} 
            />
          </TouchableOpacity>

          {/* Bouton notifications avec badge */}
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={onNotificationPress}
          >
            <Ionicons name="notifications-outline" size={22} color={iconColor} />
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
  // Header mobile exact - Effet "I am Atomic"
  mobileHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    zIndex: 10000, // Au-dessus des lignes rouges pour les masquer
    position: 'relative',
    // Effet glow subtil sur le header
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background.card,
    // Effet glow subtil
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  titleSection: {
    flex: 1,
    marginLeft: 8,
  },
  titleTextGradient: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    // Effet glow subtil pour le titre
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    letterSpacing: 0.8,
    textShadowColor: COLORS.badges.atomic,
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
    borderRadius: 6,
    backgroundColor: COLORS.background.card,
    // Effet glow subtil
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.badges.hot,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // Effet glow subtil pour le badge
    shadowColor: COLORS.badges.hot,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  badgeText: {
    color: COLORS.text.primary,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SharedHeader;