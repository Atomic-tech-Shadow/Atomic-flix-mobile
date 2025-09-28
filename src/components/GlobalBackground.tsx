import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/newColors';

const { width } = Dimensions.get('window');

interface GlobalBackgroundProps {
  children: React.ReactNode;
}

/**
 * 🔴 Fond global avec lignes rouges - Effet Matrix/Cyberpunk
 * Utilisé sur tous les écrans de l'app
 */
const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Fond principal noir */}
      <View style={styles.baseBackground} />
      
      {/* Lignes rouges répétitives - Effet Matrix/Cyberpunk */}
      <View style={styles.redLinesContainer}>
        {Array.from({ length: Math.ceil(width / 20) }).map((_, index) => (
          <LinearGradient
            key={`redline-${index}`}
            colors={[
              'transparent',
              'rgba(220, 38, 38, 0.3)',
              'rgba(185, 28, 28, 0.4)',
              'rgba(220, 38, 38, 0.3)',
              'transparent'
            ]}
            style={[styles.redLine, { left: index * 20 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ))}
      </View>
      
      {/* Contenu par-dessus */}
      {children}
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
    backgroundColor: COLORS.primary,
  },
  redLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  redLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    opacity: 0.8,
  },
});

export default GlobalBackground;