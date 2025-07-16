import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    // Auto-fermeture après 2.5 secondes
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Fond étoilé */}
      <View style={styles.starsContainer}>
        <View style={[styles.star, styles.star1]} />
        <View style={[styles.star, styles.star2]} />
        <View style={[styles.star, styles.star3]} />
        <View style={[styles.star, styles.star4]} />
        <View style={[styles.star, styles.star5]} />
      </View>

      {/* Logo principal avec animation */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image
          source={require('../../assets/splash-screen.png')}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Indicateur de chargement */}
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <View style={styles.loadingBar}>
          <View style={styles.loadingProgress} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#00bcd4',
    borderRadius: 1,
  },
  star1: {
    top: '20%',
    left: '15%',
    opacity: 0.8,
  },
  star2: {
    top: '35%',
    right: '20%',
    opacity: 0.6,
  },
  star3: {
    top: '60%',
    left: '25%',
    opacity: 0.9,
  },
  star4: {
    bottom: '25%',
    right: '15%',
    opacity: 0.7,
  },
  star5: {
    bottom: '40%',
    left: '10%',
    opacity: 0.5,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: width * 0.8,
    height: height * 0.6,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    width: '70%',
    backgroundColor: '#00bcd4',
    borderRadius: 2,
  },
});

export default SplashScreen;