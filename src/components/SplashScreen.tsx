import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreenNative from 'expo-splash-screen';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('screen');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cache le splash screen natif et commence les animations
    const hideSplashScreen = async () => {
      try {
        await SplashScreenNative.hideAsync();
      } catch (e) {
        console.log('Splash screen déjà caché');
      }
    };

    // Délai pour permettre une transition fluide
    const timer = setTimeout(() => {
      hideSplashScreen();
      
      // Animation d'apparition avec pulsation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    // Animation de pulsation continue
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation de rotation continue pour les étoiles
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Apparition retardée du texte
    setTimeout(() => {
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 500);

    // Auto-fermeture après 4 secondes avec animation de sortie spectaculaire
    const autoCloseTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [fadeAnim, scaleAnim, pulseAnim, rotateAnim, textOpacityAnim, onFinish]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a1a" translucent={false} />
      
      {/* Image de fond respectant les safe areas */}
      <Image
        source={require('../../assets/splash/splash-design.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Overlay avec animations */}
      <Animated.View 
        style={[
          styles.overlayContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* Étoiles animées */}
        <Animated.View 
          style={[
            styles.starsContainer,
            {
              transform: [{ rotate }],
              opacity: textOpacityAnim,
            }
          ]}
        >
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.star,
                {
                  top: `${10 + i * 12}%`,
                  left: `${5 + i * 11}%`,
                  transform: [{ scale: pulseAnim }],
                }
              ]}
            />
          ))}
        </Animated.View>
        
        {/* Contenu principal */}
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              transform: [{ scale: pulseAnim }],
              opacity: textOpacityAnim,
            }
          ]}
        >
          <Text style={styles.title}>ATOMIC FLIX</Text>
          <Text style={styles.subtitle}>LA PLATEFORME ULTIME POUR LES OTAKUS</Text>
          
          {/* Barre de chargement avec animation */}
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBar}>
              <Animated.View 
                style={[
                  styles.loadingProgress,
                  {
                    transform: [{ scaleX: pulseAnim }],
                  }
                ]} 
              />
            </View>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  overlayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 26, 0.3)',
    paddingTop: 50,
    paddingBottom: 50,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#00bcd4',
    borderRadius: 4,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00bcd4',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 188, 212, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.95,
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: 250,
    height: 6,
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingProgress: {
    height: '100%',
    width: '85%',
    backgroundColor: '#00bcd4',
    borderRadius: 3,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default SplashScreen;