import React from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';
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
  // Créer seulement quelques lignes optimisées au lieu de calculer toute la largeur
  const numLines = Math.ceil(width / 20);

  return (
    <View style={styles.container}>
      {/* Lignes rouges optimisées - seulement le nécessaire */}
      <View style={styles.redLinesContainer}>
        {Array.from({ length: numLines }).map((_, index) => (
          <View
            key={`line-${index}`}
            style={[styles.redLine, { left: index * 20 }]}
          />
        ))}
      </View>
      
      {/* Contenu de l'app */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Fond noir de base
    position: 'relative',
  },
  redLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
    pointerEvents: 'none', // Ne bloque pas les interactions
  },
  redLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
  },
});

export default GlobalBackground;