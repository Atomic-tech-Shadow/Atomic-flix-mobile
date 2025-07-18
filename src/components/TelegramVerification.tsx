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

    // Vérifier s'il y a un ID sauvegardé
    const savedUserId = await AsyncStorage.getItem('telegram_user_id');
    
    if (savedUserId) {
      // Utiliser l'ID sauvegardé
      Alert.alert(
        'Vérification Telegram',
        `Utiliser l'ID sauvegardé ${savedUserId} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Nouvel ID', onPress: () => promptForNewId() },
          { text: 'Vérifier', onPress: () => verifySubscription(savedUserId) }
        ]
      );
    } else {
      promptForNewId();
    }
  };

  const promptForNewId = () => {
    Alert.prompt(
      'Vérification Telegram',
      'Entrez votre ID Telegram (vous pouvez le trouver en cherchant @userinfobot sur Telegram)',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Vérifier', 
          onPress: (userId) => {
            if (userId && userId.trim()) {
              verifySubscription(userId.trim());
            } else {
              Alert.alert('Erreur', 'Veuillez entrer un ID Telegram valide.');
            }
          }
        }
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const verifySubscription = async (userId: string) => {
    setIsVerifying(true);

    try {
      const response = await fetch('https://atomic-flix-verifier-bot.vercel.app/api/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        // Marquer comme vérifié dans le stockage local
        await AsyncStorage.setItem('telegram_verified', 'true');
        await AsyncStorage.setItem('telegram_user_id', userId);
        
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
      } else {
        // Gestion des erreurs spécifiques
        let errorMessage = 'Vérification échouée.';
        
        if (data.error?.includes('not found')) {
          errorMessage = 'Vous n\'êtes pas abonné au canal. Veuillez vous abonner d\'abord.';
        } else if (data.error?.includes('left')) {
          errorMessage = 'Vous avez quitté le canal. Veuillez vous réabonner.';
        } else if (data.error?.includes('kicked')) {
          errorMessage = 'Vous avez été banni du canal. Contactez les administrateurs.';
        } else if (data.error?.includes('invalid')) {
          errorMessage = 'ID Telegram invalide. Vérifiez votre ID avec @userinfobot.';
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        Alert.alert(
          'Vérification échouée',
          errorMessage,
          [{ text: 'Réessayer' }]
        );
      }
    } catch (error) {
      console.error('Erreur API:', error);
      Alert.alert(
        'Erreur de connexion',
        'Impossible de vérifier votre abonnement. Vérifiez votre connexion internet.',
        [{ text: 'Réessayer' }]
      );
    } finally {
      setIsVerifying(false);
    }
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
          3. Trouvez votre ID Telegram avec @userinfobot{'\n'}
          4. Revenez dans l'app et cliquez "Vérifier"
        </Text>
      )}
      
      {hasSubscribed && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Comment trouver votre ID Telegram :</Text>
          <Text style={styles.infoText}>
            1. Ouvrez Telegram{'\n'}
            2. Cherchez @userinfobot{'\n'}
            3. Envoyez /start{'\n'}
            4. Copiez votre ID (nombre)
          </Text>
        </View>
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
  infoBox: {
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  infoTitle: {
    fontSize: 14,
    color: '#00bcd4',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#e2e8f0',
    lineHeight: 18,
  },

});

export default TelegramVerification;