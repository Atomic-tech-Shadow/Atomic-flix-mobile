import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

export default function AnimatedSplashScreen({ 
  onFinish, 
  duration = 2500 
}: AnimatedSplashScreenProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoRotateX = useRef(new Animated.Value(0)).current;
  const logoRotateY = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(1)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const sloganTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const animationSequence = Animated.sequence([
      Animated.delay(200),
      // Apparition 3D du logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateX, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateY, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
      // Apparition de la lueur et du slogan
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sloganOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sloganTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
      // Sortie en fondu
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start(() => {
      onFinish();
    });

    return () => {
      animationSequence.stop();
    };
  }, []);

  const pulseGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseGlow, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const rotateX = logoRotateX.interpolate({
    inputRange: [0, 1],
    outputRange: ['45deg', '0deg'],
  });

  const rotateY = logoRotateY.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '0deg'],
  });

  const glowScale = pulseGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  return (
    <Animated.View 
      style={[styles.container, { opacity: backgroundOpacity }]}
    >
      <LinearGradient
        colors={['#050505', '#1e1b4b', '#050505']}
        style={styles.gradient}
      >
        <View style={styles.logoContainer}>
          {/* Cosmic Aura */}
          <Animated.View
            style={[
              styles.glowContainer,
              {
                opacity: Animated.multiply(glowOpacity, pulseGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 0.8]
                })),
                transform: [{ scale: glowScale }],
              },
            ]}
          >
            <View style={[styles.glow, { backgroundColor: '#A855F7', opacity: 0.3 }]} />
          </Animated.View>

          {/* Logo with 3D Transforms */}
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { perspective: 1000 },
                { rotateX: rotateX },
                { rotateY: rotateY },
              ],
            }}
          >
            <Image
              source={require('../../assets/atomic-flix-logo-new.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* Slogan "I am Atomic" */}
          <Animated.Text
            style={[
              styles.slogan,
              {
                opacity: sloganOpacity,
                transform: [{ translateY: sloganTranslateY }],
              }
            ]}
          >
            I AM ATOMIC
          </Animated.Text>
        </View>

        {/* Floating Stars/Particles */}
        <View style={styles.particlesContainer}>
          {[...Array(30)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  left: `${(i * 137.5) % 100}%`,
                  top: `${(i * 123.4) % 100}%`,
                  opacity: Math.random() * 0.4 + 0.1,
                  transform: [{ scale: Math.random() + 0.5 }]
                },
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: width,
  },
  logo: {
    width: width * 0.65,
    height: width * 0.65,
    maxWidth: 400,
    maxHeight: 400,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  glowContainer: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    maxWidth: 600,
    maxHeight: 600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  slogan: {
    marginTop: 40,
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 8,
    textShadowColor: '#A855F7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFF',
  },
});
