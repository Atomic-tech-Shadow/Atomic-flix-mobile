import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/newColors';

const { width, height } = Dimensions.get('window');

interface CosmicBackgroundProps {
  children: React.ReactNode;
}

/**
 * 🌌 Fond cosmique inspiré de "The Eminence in Shadow"
 * Crée une ambiance mystique avec des effets de nébuleuse et d'étoiles
 */
const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ children }) => {
  // Mémoriser les positions et propriétés pour éviter le flicker
  const redLinesData = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: (width / 6) * (i + 1) - 15 + Math.random() * 30,
      rotation: -8 + Math.random() * 16,
      opacity: 0.7 + Math.random() * 0.3,
    })), []
  );

  const redLightningData = useMemo(() => 
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      left: width * (0.15 + i * 0.25) + Math.random() * 30 - 15,
      rotation: -3 + Math.random() * 6,
      opacity: 0.6 + Math.random() * 0.4,
    })), []
  );

  const starsData = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({ // Réduit de 50 à 30
      id: i,
      left: Math.random() * width,
      top: Math.random() * height,
      opacity: 0.3 + Math.random() * 0.7,
      scale: 0.5 + Math.random() * 1.5,
      isRed: i % 5 === 0, // 20% d'étoiles rouges
      hasGlow: i < 10, // Seulement 10 étoiles avec glow pour les performances
    })), []
  );

  return (
    <View style={styles.container}>
      {/* Fond principal noir cosmique */}
      <View style={styles.baseBackground} />
      
      {/* Nébuleuse violette principale */}
      <LinearGradient
        colors={[
          'rgba(168, 85, 247, 0.1)',
          'rgba(219, 39, 119, 0.05)',
          'transparent',
          'rgba(168, 85, 247, 0.08)'
        ]}
        style={styles.mainNebula}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Lueur atomique centrale */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(168, 85, 247, 0.15)',
          'rgba(219, 39, 119, 0.1)',
          'transparent'
        ]}
        style={styles.atomicGlow}
        start={{ x: 0.3, y: 0.2 }}
        end={{ x: 0.8, y: 0.9 }}
      />
      
      {/* Éclairs cosmiques subtils */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(168, 85, 247, 0.05)',
          'transparent',
          'rgba(219, 39, 119, 0.05)',
          'transparent'
        ]}
        style={styles.lightning}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
      />
      
      {/* Lignes verticales rouges dramatiques - Optimisées */}
      <View style={styles.redLinesContainer}>
        {redLinesData.map((lineData) => (
          <View
            key={`red-line-${lineData.id}`}
            style={[
              styles.redLineContainer,
              {
                left: lineData.left,
                opacity: lineData.opacity,
                transform: [
                  { rotateZ: `${lineData.rotation}deg` }
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[
                'transparent',
                COLORS.badges.crimson, // Utiliser la palette COLORS
                COLORS.badges.danger,
                COLORS.badges.shadowRed,
                COLORS.badges.crimson,
                'transparent'
              ]}
              style={styles.redLineGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </View>
        ))}
      </View>
      
      {/* Aura rouge dramatique (style Shadow) - Optimisée */}
      <LinearGradient
        colors={[
          'transparent',
          `${COLORS.badges.crimson}40`, // 25% opacity
          `${COLORS.badges.shadowRed}59`, // 35% opacity
          `${COLORS.badges.danger}33`, // 20% opacity
          'transparent'
        ]}
        style={styles.shadowRedAura}
        start={{ x: 0.8, y: 0.1 }}
        end={{ x: 0.2, y: 0.9 }}
      />
      
      {/* Éclairs rouges verticaux - Optimisés */}
      <View style={styles.redLightningContainer}>
        {redLightningData.map((lightningData) => (
          <LinearGradient
            key={`red-lightning-${lightningData.id}`}
            colors={[
              'transparent',
              `${COLORS.badges.crimson}99`, // 60% opacity
              `${COLORS.badges.danger}CC`, // 80% opacity
              `${COLORS.badges.shadowRed}80`, // 50% opacity
              'transparent'
            ]}
            style={[
              styles.redLightning,
              {
                left: lightningData.left,
                opacity: lightningData.opacity,
                transform: [{ rotateZ: `${lightningData.rotation}deg` }],
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        ))}
      </View>
      
      {/* Points d'étoiles simulés (violet et rouge) - Optimisées */}
      <View style={styles.starsContainer}>
        {starsData.map((starData) => (
          <View
            key={starData.id}
            style={[
              styles.star,
              {
                left: starData.left,
                top: starData.top,
                opacity: starData.opacity,
                transform: [{ scale: starData.scale }],
                backgroundColor: starData.isRed ? `${COLORS.badges.crimson}CC` : COLORS.text.primary,
                shadowColor: starData.isRed ? COLORS.badges.crimson : COLORS.secondary,
                shadowOpacity: starData.hasGlow ? 0.8 : 0.3, // Glow optimisé
                shadowRadius: starData.hasGlow ? 3 : 1,
                elevation: starData.hasGlow ? 3 : 1,
              },
            ]}
          />
        ))}
      </View>
      
      {/* Contenu par-dessus */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  baseBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary, // Noir cosmique de base
  },
  mainNebula: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: width + 100,
    height: height * 0.7,
    opacity: 0.8,
  },
  atomicGlow: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.2,
    width: width * 0.6,
    height: height * 0.4,
    borderRadius: width * 0.3,
    opacity: 0.6,
  },
  lightning: {
    position: 'absolute',
    top: height * 0.3,
    left: 0,
    right: 0,
    height: height * 0.2,
    opacity: 0.4,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    // Shadow props are now applied dynamically based on performance optimization
  },
  content: {
    flex: 1,
    zIndex: 10, // Z-index élevé pour être au-dessus des lignes rouges
  },
  // Nouveaux styles pour les éléments rouges
  redLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Z-index faible pour être derrière le contenu comme anime-sama
    pointerEvents: 'none', // Permettre les interactions à travers les lignes
  },
  redLineContainer: {
    position: 'absolute',
    width: 4, // Plus fin pour être plus subtil comme anime-sama
    height: height,
    top: 0,
    opacity: 0.4, // Plus subtil pour ne pas gêner la lecture
  },
  redLineGradient: {
    width: '100%',
    height: '100%',
    shadowColor: COLORS.badges.crimson,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8, // Réduit pour les performances
  },
  shadowRedAura: {
    position: 'absolute',
    top: height * 0.2,
    right: width * 0.1,
    width: width * 0.5,
    height: height * 0.6,
    borderRadius: width * 0.25,
    opacity: 0.5,
    zIndex: 1,
  },
  redLightningContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  redLightning: {
    position: 'absolute',
    width: 2,
    height: height * 0.8,
    top: height * 0.1,
  },
});

export default CosmicBackground;