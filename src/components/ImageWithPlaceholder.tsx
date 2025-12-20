import React, { useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/newColors';

interface ImageWithPlaceholderProps {
  uri: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  fadeDuration?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  fadeDuration = 200,
  onLoadStart,
  onLoadEnd,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start();
    onLoadEnd?.();
  };

  const handleLoadError = () => {
    setIsLoading(false);
    fadeAnim.setValue(1);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Placeholder visible pendant le chargement */}
      {isLoading && (
        <View style={[styles.placeholder, style]}>
          <View style={styles.shimmer} />
        </View>
      )}

      {/* Image réelle avec fade-in */}
      <Animated.Image
        source={{ uri }}
        style={[
          style,
          {
            opacity: fadeAnim,
          },
        ]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleLoadError}
        fadeDuration={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
  },
  placeholder: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  shimmer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});

export default ImageWithPlaceholder;
