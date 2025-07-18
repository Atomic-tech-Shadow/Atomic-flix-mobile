import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SvgXml } from 'react-native-svg';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('screen');

const staticLogoSvg = `<svg width="300" height="300" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
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
    <circle cx="80" cy="80" r="2" fill="#00bcd4" opacity="0.8"/>
    <circle cx="320" cy="100" r="1.5" fill="#ff0080" opacity="0.8"/>
    <circle cx="350" cy="300" r="2" fill="#7c3aed" opacity="0.8"/>
    <circle cx="50" cy="320" r="1" fill="#0ea5e9" opacity="0.8"/>
  </g>
  
  <g transform="translate(200, 200)" filter="url(#glow)">
    <ellipse cx="0" cy="0" rx="90" ry="30" fill="none" stroke="url(#orbit1)" stroke-width="3" opacity="0.8"/>
    <ellipse cx="0" cy="0" rx="90" ry="30" fill="none" stroke="url(#orbit2)" stroke-width="3" opacity="0.8" transform="rotate(60)"/>
    <ellipse cx="0" cy="0" rx="90" ry="30" fill="none" stroke="url(#orbit3)" stroke-width="3" opacity="0.8" transform="rotate(120)"/>
  </g>
  
  <g transform="translate(200, 200)">
    <polygon points="-12,18 -12,-18 18,0" fill="url(#playGradient)" fill-opacity="0.9"/>
    <polygon points="-8,12 -8,-12 12,0" fill="rgba(255,255,255,0.3)" fill-opacity="0.4"/>
  </g>
  
  <g transform="translate(250, 200)" filter="url(#glow)">
    <path d="M-8,-25 L-8,25 M-8,-25 L15,-25 M-8,-5 L10,-5" stroke="url(#fGradient)" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.9"/>
    <path d="M-8,-25 L-8,25 M-8,-25 L15,-25 M-8,-5 L10,-5" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6"/>
  </g>
</svg>`;

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Auto-fermeture après 2 secondes
    const autoCloseTimer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => {
      clearTimeout(autoCloseTimer);
    };
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a1a" translucent={false} />
      
      {/* Image de fond respectant les safe areas */}
      <Image
        source={require('../../assets/splash/splash-design.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Overlay statique */}
      <View style={styles.overlayContainer}>
        {/* Logo SVG statique */}
        <View style={styles.logoContainer}>
          <SvgXml xml={staticLogoSvg} width={300} height={300} />
        </View>
        
        {/* Texte principal */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>ATOMIC FLIX</Text>
          <Text style={styles.subtitle}>LA PLATEFORME ULTIME POUR LES OTAKUS</Text>
          
          {/* Barre de chargement statique */}
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBar}>
              <View style={styles.loadingProgress} />
            </View>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        </View>
      </View>
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