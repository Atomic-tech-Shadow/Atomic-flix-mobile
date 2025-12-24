import React, { useState } from 'react';
import { View, StyleSheet, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import { COLORS } from '../constants/newColors';

interface ScrollProgressIndicatorProps {
  scrollViewRef?: React.RefObject<ScrollView>;
  contentLength: number;
  containerWidth: number;
  colors: any;
  currentScrollOffset?: number;
}

const ScrollProgressIndicator: React.FC<ScrollProgressIndicatorProps> = ({
  scrollViewRef,
  contentLength = 0,
  containerWidth = 0,
  colors,
  currentScrollOffset = 0,
}) => {
  const [scrollOffset, setScrollOffset] = useState(0);

  // Valider les props pour éviter division par zéro
  const validContentLength = Math.max(0, contentLength || 0);
  const validContainerWidth = Math.max(0, containerWidth || 0);
  
  // Utiliser currentScrollOffset si fourni, sinon utiliser scrollOffset interne
  const activeScrollOffset = currentScrollOffset !== undefined ? currentScrollOffset : scrollOffset;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(event.nativeEvent.contentOffset.x);
  };

  // Calculer la largeur relative du curseur avec protection contre division par zéro
  const maxScroll = Math.max(0, validContentLength - validContainerWidth);
  const indicatorWidth = validContentLength > 0 && validContainerWidth > 0 
    ? (validContainerWidth / validContentLength) * 100 
    : 100;
  const indicatorPosition = maxScroll > 0 
    ? Math.min(100, (activeScrollOffset / maxScroll) * 100) 
    : 0;

  const styles = StyleSheet.create({
    container: {
      height: 4,
      backgroundColor: 'rgba(0, 212, 255, 0.15)',
      borderRadius: 2,
      marginTop: 8,
      marginHorizontal: 16,
      overflow: 'hidden',
    },
    indicator: {
      height: '100%',
      backgroundColor: colors.secondary || COLORS.secondary,
      borderRadius: 2,
      width: `${Math.max(indicatorWidth, 20)}%`,
      left: `${indicatorPosition}%`,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.indicator} />
    </View>
  );
};

export default ScrollProgressIndicator;
