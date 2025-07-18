import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SvgXml } from 'react-native-svg';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('screen');

const appIconSvg = `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00bcd4"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="60" cy="60" r="58" fill="url(#bgGradient)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  
  <!-- Play button -->
  <g transform="translate(60, 60)">
    <polygon points="-15,20 -15,-20 20,0" fill="url(#iconGradient)" opacity="0.95"/>
  </g>
  
  <!-- Letter A -->
  <g transform="translate(85, 60)" fill="url(#iconGradient)" opacity="0.9">
    <path d="M-8,-25 L-8,25 M-8,-25 L12,-25 M-8,-5 L8,-5" stroke="url(#iconGradient)" stroke-width="4" stroke-linecap="round" fill="none"/>
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
      <StatusBar style="dark" backgroundColor="#f8fafc" translucent={false} />
      
      {/* Icône de l'app centrée */}
      <View style={styles.iconContainer}>
        <SvgXml xml={appIconSvg} width={120} height={120} />
      </View>
      
      {/* Texte "from" en bas */}
      <View style={styles.bottomContainer}>
        <Text style={styles.fromText}>from</Text>
        <Text style={styles.companyText}>ATOMIC FLIX</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  fromText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '400',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  companyText: {
    fontSize: 18,
    color: '#00bcd4',
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default SplashScreen;