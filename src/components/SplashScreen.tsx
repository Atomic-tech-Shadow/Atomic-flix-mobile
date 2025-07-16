import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('screen'); // Utilise 'screen' pour les vraies dimensions

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.3)).current; // Commencer plus petit
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const starAnimation = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(50)).current; // Animation de glissement
  const pulseAnim = useRef(new Animated.Value(1)).current; // Animation de pulsation
  const glowAnim = useRef(new Animated.Value(0)).current; // Animation de brillance

  useEffect(() => {
    // Séquence d'animations d'entrée spectaculaire
    Animated.sequence([
      // 1. Animation d'apparition du logo avec zoom et fade-in
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideInAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Animation de brillance
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de pulsation continue après l'apparition
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animation de rotation des étoiles
    Animated.loop(
      Animated.timing(starAnimation, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();

    // Animation d'apparition du texte avec délai
    setTimeout(() => {
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1000);

    // Auto-fermeture après 3 secondes avec animation de sortie
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const starRotate = starAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { 
      marginTop: -insets.top,  // Étendre au-dessus de la barre de statut
      marginBottom: -insets.bottom, // Étendre en bas
      paddingTop: 0,
      paddingBottom: 0,
    }]}>
      <StatusBar style="light" hidden={true} />
      
      {/* Background animé avec effet de brillance */}
      <Animated.View 
        style={[
          styles.backgroundGlow,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          }
        ]}
      />
      
      {/* Splash design complet avec animations spectaculaires */}
      <Animated.View 
        style={[
          styles.splashContainer,
          {
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideInAnim },
              { scale: pulseAnim }
            ],
            marginTop: -insets.top,
            height: height + insets.top + insets.bottom, // Hauteur totale
          }
        ]}
      >
        <Image
          source={require('../../assets/splash/splash-design.png')}
          style={[styles.splashDesign, {
            height: height + insets.top + insets.bottom,
            marginTop: -insets.top,
          }]}
          resizeMode="cover"
        />
        
        {/* Overlay avec effet de brillance */}
        <Animated.View 
          style={[
            styles.shineOverlay,
            {
              opacity: glowAnim,
              transform: [{ rotate: starRotate }],
            }
          ]}
        />
      </Animated.View>

      {/* Particules animées */}
      <Animated.View 
        style={[
          styles.particlesContainer,
          {
            opacity: textOpacityAnim,
            transform: [{ rotate: starRotate }],
          }
        ]}
      >
        {[...Array(6)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                top: `${20 + i * 12}%`,
                left: `${10 + i * 15}%`,
                transform: [
                  { rotate: starRotate },
                  { scale: pulseAnim },
                ],
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* Indicateur de chargement amélioré */}
      <Animated.View style={[styles.loadingContainer, { opacity: textOpacityAnim }]}>
        <Text style={styles.loadingText}>ATOMIC FLIX</Text>
        <View style={styles.loadingBar}>
          <Animated.View 
            style={[
              styles.loadingProgress,
              { 
                transform: [{ scale: pulseAnim }],
                opacity: glowAnim,
              }
            ]} 
          />
        </View>
        <Text style={styles.loadingSubtext}>Chargement...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    width: '100%',
    height: '100%',
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  splashDesign: {
    width: width,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    borderRadius: width / 2,
    transform: [{ scale: 2 }],
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: width / 2,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#00bcd4',
    borderRadius: 3,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00bcd4',
    textShadowColor: 'rgba(0, 188, 212, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 20,
    letterSpacing: 2,
  },
  loadingBar: {
    width: 250,
    height: 6,
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingProgress: {
    height: '100%',
    width: '75%',
    backgroundColor: '#00bcd4',
    borderRadius: 3,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default SplashScreen;