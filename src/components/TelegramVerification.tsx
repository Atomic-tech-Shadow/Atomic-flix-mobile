import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface TelegramVerificationProps {
  onVerified: () => void;
  telegramChannelUrl: string;
  channelName: string;
}

const { width, height } = Dimensions.get('window');

const TelegramVerification: React.FC<TelegramVerificationProps> = ({
  onVerified,
  telegramChannelUrl,
  channelName,
}) => {
  const insets = useSafeAreaInsets();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const verified = await AsyncStorage.getItem('telegram_verified');
      if (verified === 'true') {
        onVerified();
      }
    } catch (error) {
      console.log('Erreur vérification status:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const supported = await Linking.canOpenURL(telegramChannelUrl);
      if (supported) {
        await Linking.openURL(telegramChannelUrl);
        setHasSubscribed(true);
      } else {
        Alert.alert(
          'Erreur',
          'Impossible d\'ouvrir Telegram. Veuillez installer l\'application Telegram.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de l\'ouverture du canal.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVerify = async () => {
    if (!hasSubscribed) {
      Alert.alert(
        'Abonnement requis',
        'Veuillez d\'abord vous abonner au canal Telegram avant de vérifier.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsVerifying(true);

    // Simulation de vérification (dans une vraie app, vous feriez un appel API)
    setTimeout(async () => {
      try {
        // Marquer comme vérifié dans le stockage local
        await AsyncStorage.setItem('telegram_verified', 'true');
        
        Alert.alert(
          'Vérification réussie !',
          'Merci de vous être abonné à notre canal Telegram. Profitez de l\'application !',
          [
            {
              text: 'Continuer',
              onPress: () => {
                setIsVerifying(false);
                onVerified();
              }
            }
          ]
        );
      } catch (error) {
        setIsVerifying(false);
        Alert.alert(
          'Erreur',
          'Une erreur est survenue lors de la vérification.',
          [{ text: 'Réessayer' }]
        );
      }
    }, 2000);
  };



  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a1a" translucent={false} />
      
      <LinearGradient
        colors={['#0a0a1a', '#1a1a2e', '#16213e']}
        style={styles.backgroundGradient}
      >
        <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
          
          {/* Carte principale centrée */}
          <View style={styles.cardContainer}>
            
            {/* Logo et titre */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>⚛️</Text>
              </View>
              <Text style={styles.appTitle}>ATOMIC FLIX</Text>
              <Text style={styles.cardSubtitle}>Accès exclusif requis</Text>
            </View>

            {/* Message principal */}
            <View style={styles.messageSection}>
              <Text style={styles.welcomeText}>
                Rejoignez notre communauté !
              </Text>
              <Text style={styles.descriptionText}>
                Abonnez-vous à notre canal Telegram officiel pour accéder à l'application.
              </Text>
              <View style={styles.channelBadge}>
                <Text style={styles.channelText}>📢 {channelName}</Text>
              </View>
            </View>

            {/* Boutons d'action */}
            <View style={styles.actionButtonsContainer}>
              
              {/* Bouton S'abonner */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSubscribe}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#0088cc', '#005588']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    📱 S'abonner au canal
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Bouton Vérifier */}
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  (!hasSubscribed || isVerifying) && styles.buttonDisabled
                ]}
                onPress={handleVerify}
                disabled={!hasSubscribed || isVerifying}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    hasSubscribed && !isVerifying
                      ? ['#00bcd4', '#0097a7']
                      : ['#424242', '#616161']
                  }
                  style={styles.buttonGradient}
                >
                  {isVerifying ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={styles.secondaryButtonText}>Vérification...</Text>
                    </View>
                  ) : (
                    <Text style={styles.secondaryButtonText}>
                      ✅ Vérifier l'abonnement
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Instructions compactes */}
            <View style={styles.instructionsSection}>
              <Text style={styles.stepsText}>
                1. S'abonner • 2. Vérifier • 3. Profiter
              </Text>
            </View>

          </View>

        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  backgroundGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Design en carte centrée
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 30,
    maxWidth: 380,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
    elevation: 15,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  
  // Section logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 188, 212, 0.4)',
  },
  logoText: {
    fontSize: 32,
    textAlign: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00bcd4',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 188, 212, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Section message
  messageSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.9,
  },
  channelBadge: {
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  channelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00bcd4',
    textAlign: 'center',
  },
  
  // Boutons d'action
  actionButtonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#0088cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  // Instructions
  instructionsSection: {
    alignItems: 'center',
  },
  stepsText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },

});

export default TelegramVerification;