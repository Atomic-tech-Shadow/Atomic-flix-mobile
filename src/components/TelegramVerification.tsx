import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface TelegramVerificationProps {
  onVerified: () => void;
  telegramChannelUrl?: string;
  channelName?: string;
}

const TelegramVerification: React.FC<TelegramVerificationProps> = ({
  onVerified,
  telegramChannelUrl = 'https://t.me/Atomic_flix_officiel',
  channelName = 'ATOMIC FLIX OFFICIEL',
}) => {
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
          'Merci de vous être abonné à notre canal Telegram. Vous pouvez maintenant accéder à tout le contenu de l\'application !',
          [
            {
              text: 'Accéder à l\'app',
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
    <View style={styles.modalContent}>
      {/* Header avec logo */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#00bcd4', '#0094cc']}
          style={styles.logoContainer}
        >
          <Text style={styles.logoText}>⚛️</Text>
        </LinearGradient>
        <Text style={styles.title}>ATOMIC FLIX</Text>
        <Text style={styles.subtitle}>Accès exclusif requis</Text>
      </View>

      {/* Contenu */}
      <Text style={styles.description}>
        Abonnez-vous à notre canal Telegram pour accéder au contenu exclusif !
      </Text>
      
      {!hasSubscribed && (
        <Text style={styles.stepsText}>
          1. Cliquez sur "S'abonner" pour ouvrir Telegram{'\n'}
          2. Abonnez-vous au canal{'\n'}
          3. Revenez dans l'app et cliquez "Vérifier"
        </Text>
      )}

      <View style={styles.channelInfo}>
        <Text style={styles.channelName}>📢 {channelName}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00bcd4', '#0094cc']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>📱 S'abonner</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            (!hasSubscribed || isVerifying) && styles.disabledButton
          ]}
          onPress={handleVerify}
          disabled={isVerifying || !hasSubscribed}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={hasSubscribed ? ['#00bcd4', '#0094cc'] : ['#374151', '#475569']}
            style={styles.buttonGradient}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>✅ Vérifier</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {hasSubscribed && (
        <Text style={styles.successMessage}>
          ✅ Parfait ! Maintenant cliquez sur "Vérifier" pour confirmer votre abonnement
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 24,
    color: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#00bcd4',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  stepsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'left',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 188, 212, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#00bcd4',
  },
  channelInfo: {
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  channelName: {
    fontSize: 14,
    color: '#00bcd4',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  verifyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
    elevation: 1,
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  successMessage: {
    fontSize: 14,
    color: '#00bcd4',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '500',
  },
});

export default TelegramVerification;