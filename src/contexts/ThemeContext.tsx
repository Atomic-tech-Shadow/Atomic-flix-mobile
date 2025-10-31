import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemedColors, getGradientColors as getGradientColorsHelper, createOverlayGradient, hexToRgba } from '../constants/newColors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  colors: ReturnType<typeof getThemedColors>;
  getGradient: (type: 'primary' | 'secondary' | 'atomic') => string[];
  getOverlayGradient: () => string[];
  hexToRgba: (hex: string, alpha?: number) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemColorScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Erreur chargement thème:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('app_theme', newTheme);
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error);
    }
  };

  const isDark = theme === 'dark';
  const isLight = theme === 'light';
  
  const colors = useMemo(() => getThemedColors(isDark), [isDark]);
  
  const getGradient = useMemo(
    () => (type: 'primary' | 'secondary' | 'atomic') => getGradientColorsHelper(isDark, type),
    [isDark]
  );
  
  const getOverlayGradient = useMemo(
    () => () => createOverlayGradient(isDark),
    [isDark]
  );

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        isDark, 
        isLight,
        colors,
        getGradient,
        getOverlayGradient,
        hexToRgba
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
