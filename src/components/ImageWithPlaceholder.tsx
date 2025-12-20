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
    fadeAnim.setValue(0);
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
    <View style={style}>
      {/* Image réelle avec fade-in */}
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleLoadError}
        fadeDuration={0}
      />

      {/* Placeholder overlay - disparaît quand image est chargée */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.primary,
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            zIndex: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [10, -1],
            }),
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  placeholder: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ImageWithPlaceholder;
