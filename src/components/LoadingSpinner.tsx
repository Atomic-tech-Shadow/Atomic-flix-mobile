import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  showMessage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Chargement...', 
  size = 'medium',
  color = '#00bcd4',
  showMessage = true 
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation de rotation continue
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    // Animation de pulsation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24, borderWidth: 3 };
      case 'large':
        return { width: 60, height: 60, borderWidth: 6 };
      default:
        return { width: 40, height: 40, borderWidth: 4 };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          sizeStyles,
          {
            borderColor: `${color}30`,
            borderTopColor: color,
            transform: [
              { rotate: spin },
              { scale: pulseValue },
            ],
          },
        ]}
      />
      {showMessage && (
        <Animated.Text 
          style={[
            styles.message, 
            { color, opacity: pulseValue }
          ]}
        >
          {message}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  spinner: {
    borderRadius: 50,
    borderStyle: 'solid',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoadingSpinner;