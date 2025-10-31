import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemedColors } from '../constants/newColors';

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  createStyles: (colors: ReturnType<typeof getThemedColors>) => T
) => {
  const { colors } = useTheme();
  
  return useMemo(() => StyleSheet.create(createStyles(colors)), [colors]);
};

export default useThemedStyles;
