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
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>ATOMIC FLIX</Text>
            <Text style={styles.subtitle}>Accès exclusif requis</Text>
          </View>

          {/* Message principal */}
          <View style={styles.messageContainer}>
            <Text style={styles.messageTitle}>
              Rejoignez notre communauté !
            </Text>
            <Text style={styles.messageText}>
              Pour accéder à ATOMIC FLIX, veuillez vous abonner à notre canal Telegram officiel.
              Restez informé des dernières sorties d'anime et des mises à jour de l'application.
            </Text>
            <Text style={styles.channelName}>
              📢 {channelName}
            </Text>
          </View>

          {/* Boutons d'action */}
          <View style={styles.buttonsContainer}>
            
            {/* Bouton S'abonner */}
            <TouchableOpacity
              style={[styles.button, styles.subscribeButton]}
              onPress={handleSubscribe}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#0088cc', '#005588']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  📱 S'abonner au canal
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Bouton Vérifier */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.verifyButton,
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
                    <Text style={styles.buttonText}>Vérification...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>
                    ✅ Vérifier l'abonnement
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Instructions :</Text>
            <Text style={styles.instructionsText}>
              1. Appuyez sur "S'abonner au canal"{'\n'}
              2. Rejoignez le canal Telegram{'\n'}
              3. Revenez dans l'app et appuyez sur "Vérifier"
            </Text>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00bcd4',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 188, 212, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    opacity: 0.8,
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.2)',
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  channelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00bcd4',
    textAlign: 'center',
  },
  buttonsContainer: {
    marginBottom: 30,
  },
  button: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subscribeButton: {},
  verifyButton: {},
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#00bcd4',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00bcd4',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },

});

export default TelegramVerification;