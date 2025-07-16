import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const starAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation du logo avec pulsation continue
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation d'apparition du logo
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Animation d'apparition du texte avec délai
    Animated.timing(textOpacityAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
      delay: 1000,
    }).start();

    // Animation des étoiles en rotation
    Animated.loop(
      Animated.timing(starAnimation, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Auto-fermeture après 4 secondes
    const timer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const starRotate = starAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Fond étoilé animé */}
      <Animated.View 
        style={[
          styles.starsContainer, 
          { transform: [{ rotate: starRotate }] }
        ]}
      >
        <View style={[styles.star, styles.star1]} />
        <View style={[styles.star, styles.star2]} />
        <View style={[styles.star, styles.star3]} />
        <View style={[styles.star, styles.star4]} />
        <View style={[styles.star, styles.star5]} />
        <View style={[styles.star, styles.star6]} />
        <View style={[styles.star, styles.star7]} />
        <View style={[styles.star, styles.star8]} />
      </Animated.View>

      {/* Logo principal avec animation de pulsation */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image
          source={require('../../assets/splash/logo-af.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Texte ATOMIC FLIX avec animation */}
      <Animated.Text 
        style={[
          styles.text, 
          { opacity: textOpacityAnim }
        ]}
      >
        ATOMIC FLIX
      </Animated.Text>

      {/* Slogan avec animation */}
      <Animated.Text 
        style={[
          styles.slogan, 
          { opacity: textOpacityAnim }
        ]}
      >
        LA PLATEFORME ULTIME POUR LES OTAKUS
      </Animated.Text>

      {/* Indicateur de chargement amélioré */}
      <Animated.View style={[styles.loadingContainer, { opacity: textOpacityAnim }]}>
        <View style={styles.loadingBar}>
          <Animated.View 
            style={[
              styles.loadingProgress,
              { 
                transform: [{ scale: scaleAnim }]
              }
            ]} 
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#00bcd4',
    borderRadius: 1.5,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  star1: {
    top: '15%',
    left: '10%',
    opacity: 0.9,
  },
  star2: {
    top: '25%',
    right: '15%',
    opacity: 0.7,
  },
  star3: {
    top: '45%',
    left: '20%',
    opacity: 0.8,
  },
  star4: {
    bottom: '30%',
    right: '10%',
    opacity: 0.6,
  },
  star5: {
    bottom: '20%',
    left: '15%',
    opacity: 0.9,
  },
  star6: {
    top: '35%',
    left: '5%',
    opacity: 0.5,
  },
  star7: {
    top: '55%',
    right: '25%',
    opacity: 0.7,
  },
  star8: {
    bottom: '40%',
    right: '30%',
    opacity: 0.6,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
  text: {
    marginTop: 30,
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  slogan: {
    marginTop: 15,
    color: '#00bcd4',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingBar: {
    width: 250,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    width: '80%',
    backgroundColor: '#00bcd4',
    borderRadius: 3,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default SplashScreen;