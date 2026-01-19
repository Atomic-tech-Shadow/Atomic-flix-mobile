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
          <View style={styles.iconGlowContainer}>
            <Ionicons name="menu" size={24} color={iconColor} />
          </View>
        </TouchableOpacity>

        {/* Texte à côté du menu, style WhatsApp */}
        <View style={styles.titleSection}>
          <View style={styles.logo3DContainer}>
            <Text style={styles.logoTextMain}>ATOMIC</Text>
            <Text style={styles.logoTextSub}>FLIX</Text>
            <View style={styles.logoHologram} />
          </View>
        </View>

        {/* Actions à droite */}
        <View style={styles.headerIcons}>
          {/* Bouton changement de thème */}
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={toggleTheme}
          >
            <View style={styles.iconGlowContainer}>
              <Ionicons 
                name={isDark ? "sunny" : "moon"} 
                size={22} 
                color={isDark ? "#FFD700" : COLORS.secondary} 
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={handleSearchPress}
          >
            <View style={styles.iconGlowContainer}>
              <Ionicons name="search" size={22} color={iconColor} />
            </View>
          </TouchableOpacity>

          {/* Bouton notifications avec badge */}
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={onNotificationPress}
          >
            <View style={styles.iconGlowContainer}>
              <Ionicons name="notifications-outline" size={22} color={iconColor} />
              {unreadCount > 0 ? (
                <View style={styles.notificationBadge} />
              ) : null}
            </View>
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
    paddingLeft: 8,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 12,
    zIndex: 10000,
    position: 'relative',
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
    marginLeft: 0,
  },
  titleSection: {
    flex: 1,
    marginLeft: 0,
  },
  logo3DContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    // Effet de perspective 3D plus prononcé
    transform: [
      { perspective: 1000 }, 
      { rotateX: '12deg' }, 
      { rotateY: '-15deg' },
      { skewX: '-5deg' }
    ],
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  logoTextMain: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(168, 85, 247, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  logoTextSub: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.secondary,
    marginLeft: 5,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  logoHologram: {
    position: 'absolute',
    bottom: 2,
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: COLORS.secondary,
    opacity: 0.6,
    borderRadius: 1,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  titleTextGradient: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    // Effet glow subtil pour le titre
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    letterSpacing: 0.5,
    textShadowColor: COLORS.badges.atomic,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  devName: {
    fontSize: 10,
    color: COLORS.text.muted,
    fontStyle: 'italic',
    marginTop: -2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Espace réduit entre les icônes
  },
  headerIconButton: {
    padding: 6, // Un peu moins de padding
    position: 'relative',
  },
  iconGlowContainer: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.1)',
    // Effet de lueur néon pour les icônes
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    backgroundColor: COLORS.badges.hot,
    borderRadius: 6,
    // Effet glow subtil pour le badge
    shadowColor: COLORS.badges.hot,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
});

export default SharedHeader;