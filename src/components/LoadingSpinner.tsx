import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/newColors';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  showMessage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Chargement...', 
  size = 'medium',
  color = COLORS.secondary,
  showMessage = true 
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.8)).current;
  const rotateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation de rotation continue
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();

    // Animation 3D (Y-axis)
    Animated.loop(
      Animated.timing(rotateY, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ).start();

    // Animation de pulsation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinValue, pulseValue, rotateY]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateYVal = rotateY.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 30, height: 30, borderWidth: 3 };
      case 'large':
        return { width: 80, height: 80, borderWidth: 5 };
      default:
        return { width: 50, height: 50, borderWidth: 4 };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {/* Glow effect background */}
        <Animated.View 
          style={[
            styles.glow,
            {
              backgroundColor: color,
              opacity: pulseValue.interpolate({
                inputRange: [0.9, 1.1],
                outputRange: [0.2, 0.5]
              }),
              transform: [{ scale: 1.5 }]
            }
          ]}
        />
        
        {/* Main Spinner with 3D effect */}
        <Animated.View
          style={[
            styles.spinner,
            sizeStyles,
            {
              borderColor: 'transparent',
              borderTopColor: color,
              borderRightColor: COLORS.accent,
              transform: [
                { rotate: spin },
                { rotateY: rotateYVal },
                { scale: pulseValue },
                { perspective: 1000 }
              ],
            },
          ]}
        />
        
        {/* Inner core */}
        <Animated.View 
          style={[
            styles.core,
            {
              backgroundColor: color,
              transform: [{ scale: pulseValue }],
              opacity: 0.8
            }
          ]}
        />
      </View>
      
      {showMessage && (
        <Animated.Text 
          style={[
            styles.message, 
            { 
              color, 
              opacity: pulseValue,
              textShadowColor: color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10
            }
          ]}
        >
          {message.toUpperCase()}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderRadius: 100,
    borderStyle: 'solid',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    blurRadius: 20,
  },
  core: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  message: {
    marginTop: 20,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 4,
  },
});

export default LoadingSpinner;