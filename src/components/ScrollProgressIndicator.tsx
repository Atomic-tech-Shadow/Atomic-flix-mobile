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
  contentLength,
  containerWidth,
  colors,
  currentScrollOffset = 0,
}) => {
  const [scrollOffset, setScrollOffset] = useState(0);

  // Utiliser currentScrollOffset si fourni, sinon utiliser scrollOffset interne
  const activeScrollOffset = currentScrollOffset !== undefined ? currentScrollOffset : scrollOffset;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(event.nativeEvent.contentOffset.x);
  };

  // Calculer la largeur relative du curseur
  const maxScroll = Math.max(0, contentLength - containerWidth);
  const indicatorWidth = maxScroll > 0 ? (containerWidth / contentLength) * 100 : 100;
  const indicatorPosition = maxScroll > 0 ? (activeScrollOffset / maxScroll) * 100 : 0;

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
