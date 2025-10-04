import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/newColors';

interface GlobalBackgroundProps {
  children: React.ReactNode;
}

/**
 * Fond global noir
 * Utilisé sur tous les écrans de l'app
 */
const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default GlobalBackground;