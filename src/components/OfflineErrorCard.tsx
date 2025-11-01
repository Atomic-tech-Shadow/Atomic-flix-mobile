import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/newColors';

interface OfflineErrorCardProps {
  onRetry?: () => void;
  message?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const OfflineErrorCard: React.FC<OfflineErrorCardProps> = ({ 
  onRetry,
  message = 'Impossible de se connecter au serveur',
  subtitle = 'Vérifiez votre connexion internet et réessayez',
  icon = 'cloud-offline-outline'
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de fade-in pour le conteneur
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animation de pulse pour l'icône
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation de bounce subtil
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, pulseAnim, bounceAnim]);

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.content}>
        {/* Icône animée avec glow effect */}
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: pulseAnim },
                { translateY: bounceAnim }
              ]
            }
          ]}
        >
          <View style={styles.iconGlow} />
          <Ionicons 
            name={icon} 
            size={72} 
            color={COLORS.secondary} 
          />
        </Animated.View>

        {/* Message principal */}
        <Text style={styles.message}>{message}</Text>
        
        {/* Sous-titre */}
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Bouton retry avec effet néon */}
        {onRetry && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color={COLORS.text.primary} style={styles.retryIcon} />
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        )}

        {/* Effet de particules cosmiques */}
        <View style={styles.particlesContainer}>
          <View style={[styles.particle, styles.particle1]} />
          <View style={[styles.particle, styles.particle2]} />
          <View style={[styles.particle, styles.particle3]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 400,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.secondary,
    opacity: 0.15,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  message: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: COLORS.text.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  particlesContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    top: -50,
    left: -50,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: COLORS.accent,
  },
  particle1: {
    width: 4,
    height: 4,
    top: 20,
    left: 40,
    opacity: 0.3,
  },
  particle2: {
    width: 6,
    height: 6,
    top: 80,
    right: 60,
    opacity: 0.2,
    backgroundColor: COLORS.secondary,
  },
  particle3: {
    width: 3,
    height: 3,
    bottom: 40,
    left: 100,
    opacity: 0.25,
    backgroundColor: COLORS.text.atomic,
  },
});

export default OfflineErrorCard;
