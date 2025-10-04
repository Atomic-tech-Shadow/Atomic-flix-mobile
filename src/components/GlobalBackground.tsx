import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface GlobalBackgroundProps {
  children: React.ReactNode;
}

/**
 * Fond global utilisant les couleurs système
 * Bascule entre mode sombre et clair
 */
const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children }) => {
  const { isDark } = useTheme();
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
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