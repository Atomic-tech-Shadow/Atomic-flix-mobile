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
    <>
      {/* Lignes rouges en position fixed (au-dessus de tout) */}
      <View style={styles.fixedRedLinesContainer}>
        {Array.from({ length: Math.ceil(width / 20) }).map((_, index) => (
          <View
            key={`redline-${index}`}
            style={[styles.redLine, { left: index * 20 }]}
          />
        ))}
      </View>
      
      {/* Contenu de l'app */}
      <View style={styles.container}>
        {children}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  fixedRedLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
    zIndex: 9999, // Au-dessus de tout
    pointerEvents: 'none', // Ne bloque pas les interactions
  },
  redLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(220, 38, 38, 0.8)', // Rouge crimson
    opacity: 1,
  },
});

export default GlobalBackground;