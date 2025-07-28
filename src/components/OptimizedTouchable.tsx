import React, { useState } from 'react';
import { TouchableOpacity, Animated, ViewStyle, TouchableOpacityProps } from 'react-native';

interface OptimizedTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  scaleOnPress?: boolean;
  scaleFactor?: number;
}

/**
 * 🔥 Composant TouchableOpacity optimisé pour des interactions ultra-fluides
 * Utilise le native driver pour des animations 60fps
 */
const OptimizedTouchable: React.FC<OptimizedTouchableProps> = ({
  children,
  style,
  scaleOnPress = true,
  scaleFactor = 0.98,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = (event: any) => {
    if (scaleOnPress) {
      Animated.timing(scaleValue, {
        toValue: scaleFactor,
        duration: 100,
        useNativeDriver: true, // 🔥 Animation native pour performances optimales
      }).start();
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    if (scaleOnPress) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true, // 🔥 Animation native pour performances optimales
      }).start();
    }
    onPressOut?.(event);
  };

  return (
    <TouchableOpacity
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          style,
          scaleOnPress && {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default OptimizedTouchable;