import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('screen');



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
      
      {/* Icône de l'app centrée */}
      <View style={styles.iconContainer}>
        <Image
          source={require('../../assets/atomic-flix-logo.png')}
          style={styles.appIcon}
          resizeMode="contain"
        />
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
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appIcon: {
    width: 120,
    height: 120,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  fromText: {
    fontSize: 16,
    color: '#94a3b8',
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