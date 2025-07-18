import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SvgXml } from 'react-native-svg';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('screen');

const animatedLogoSvg = `<svg width="300" height="300" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="orbit1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff0080"/>
      <stop offset="50%" stop-color="#ff00cc"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="orbit2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
    <linearGradient id="orbit3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#00bcd4"/>
    </linearGradient>
    <linearGradient id="playGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff0080"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="fGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#00bcd4"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <g opacity="0.6">
    <circle cx="80" cy="80" r="2" fill="#00bcd4">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="320" cy="100" r="1.5" fill="#ff0080">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="350" cy="300" r="2" fill="#7c3aed">
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="50" cy="320" r="1" fill="#0ea5e9">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite"/>
    </circle>
  </g>
  
  <g transform="translate(200, 200)" filter="url(#glow)">
    <ellipse cx="0" cy="0" rx="90" ry="30" fill="none" stroke="url(#orbit1)" stroke-width="3" opacity="0.8">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="0" cy="0" rx="90" ry="30" fill="none" stroke="url(#orbit2)" stroke-width="3" opacity="0.8" transform="rotate(60)">
      <animateTransform attributeName="transform" type="rotate" from="60" to="420" dur="10s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="0" cy="0" rx="90" ry="30" fill="none" stroke="url(#orbit3)" stroke-width="3" opacity="0.8" transform="rotate(120)">
      <animateTransform attributeName="transform" type="rotate" from="120" to="480" dur="12s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.7;1;0.7" dur="3.5s" repeatCount="indefinite"/>
    </ellipse>
  </g>
  
  <g transform="translate(200, 200)">
    <polygon points="-12,18 -12,-18 18,0" fill="url(#playGradient)">
      <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="fill-opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
    </polygon>
    <polygon points="-8,12 -8,-12 12,0" fill="rgba(255,255,255,0.3)">
      <animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="fill-opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite"/>
    </polygon>
  </g>
  
  <g transform="translate(250, 200)" filter="url(#glow)">
    <path d="M-8,-25 L-8,25 M-8,-25 L15,-25 M-8,-5 L10,-5" stroke="url(#fGradient)" stroke-width="6" stroke-linecap="round" fill="none">
      <animate attributeName="stroke-width" values="6;8;6" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
    </path>
    <path d="M-8,-25 L-8,25 M-8,-25 L15,-25 M-8,-5 L10,-5" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" fill="none">
      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite"/>
    </path>
  </g>
</svg>`;

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'apparition progressive
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
      }),
    ]).start();

    // Animation de pulsation douce et continue
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.97,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Animation de rotation lente pour les étoiles
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );
    rotationAnimation.start();

    // Apparition retardée du texte
    const textTimer = setTimeout(() => {
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Auto-fermeture après 3 secondes pour mieux voir les animations
    const autoCloseTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 3000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(autoCloseTimer);
      pulseAnimation.stop();
      rotationAnimation.stop();
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
        {/* Logo SVG animé */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <SvgXml xml={animatedLogoSvg} width={300} height={300} />
        </Animated.View>
        
        {/* Texte principal */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: textOpacityAnim,
              transform: [{ scale: pulseAnim }],
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
    backgroundColor: 'rgba(10, 10, 26, 0.2)',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },

  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00bcd4',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 188, 212, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
    letterSpacing: 0.5,
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