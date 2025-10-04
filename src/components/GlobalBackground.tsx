import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';

interface GlobalBackgroundProps {
  children: React.ReactNode;
}

/**
 * Fond global utilisant les couleurs système
 * S'adapte automatiquement au mode sombre/clair du téléphone
 */
const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GlobalBackground;