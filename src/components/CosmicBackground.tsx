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

  return (
    <View style={styles.container}>
      {/* Fond transparent pour laisser passer le GlobalBackground */}
      
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
  content: {
    flex: 1,
  },
});

export default CosmicBackground;