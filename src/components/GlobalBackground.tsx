import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { COLORS } from '../constants/newColors';

interface GlobalBackgroundProps {
  children: React.ReactNode;
}

/**
 * 🔴 Fond global avec lignes rouges - Effet Matrix/Cyberpunk
 * Utilisé sur tous les écrans de l'app
 */
const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children }) => {
  return (
    <ImageBackground
      source={require('../../attached_assets/Screenshot_20250928-160000~2_1759075324140.png')}
      style={styles.container}
      resizeMode="repeat"
    >
      {/* Contenu de l'app au-dessus du fond avec lignes */}
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Fond noir de base si l'image ne charge pas
  },
});

export default GlobalBackground;