import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
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
  const [hasGetId, setHasGetId] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [isVerified, setIsVerified] = useState(false);

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
    setHasSubscribed(true);
    try {
      // Essayer d'abord avec le lien direct Telegram
      await Linking.openURL(telegramChannelUrl);
    } catch (error) {
      try {
        // Alternative : utiliser le lien web Telegram
        const webUrl = telegramChannelUrl.replace('https://t.me/', 'https://web.telegram.org/k/#@');
        await Linking.openURL(webUrl);
      } catch (webError) {
        // Dernier recours : copier le lien
        Alert.alert(
          'Ouvrir Telegram manuellement',
          `Veuillez ouvrir Telegram et rechercher : ${telegramChannelUrl.replace('https://t.me/', '@')}\n\nOu ouvrez ce lien dans votre navigateur : ${telegramChannelUrl}`,
          [
            { text: 'Lien copié', onPress: () => {
              // Dans un vrai environnement mobile, on utiliserait Clipboard
              console.log('Lien à copier:', telegramChannelUrl);
            }},
            { text: 'OK' }
          ]
        );
      }
    }
  };

  const handleGetId = async () => {
    const botUrl = 'https://t.me/getmyid_bot';
    setHasGetId(true);
    try {
      // Essayer d'abord le lien direct
      await Linking.openURL(botUrl);
    } catch (error) {
      try {
        // Alternative : utiliser le lien web Telegram
        const webUrl = 'https://web.telegram.org/k/#@getmyid_bot';
        await Linking.openURL(webUrl);
      } catch (webError) {
        // Dernier recours : instructions manuelles
        Alert.alert(
          'Ouvrir @getmyid_bot manuellement',
          'Veuillez ouvrir Telegram et rechercher : @getmyid_bot\n\nEnsuite envoyez /start pour obtenir votre ID.',
          [
            { text: 'Ouvrir dans le navigateur', onPress: () => {
              Linking.openURL('https://web.telegram.org/k/#@getmyid_bot').catch(() => {});
            }},
            { text: 'OK' }
          ]
        );
      }
    }
  };

  const handleVerify = async () => {
    if (!telegramId.trim()) {
      Alert.alert(
        'ID requis',
        'Veuillez entrer votre ID Telegram dans le champ ci-dessus.',
        [{ text: 'OK' }]
      );
      return;
    }

    verifySubscription(telegramId.trim());
  };

  const verifySubscription = async (userId: string) => {
    setIsVerifying(true);

    try {
      // Créer une fonction timeout pour les requêtes
      const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      };

      const response = await fetchWithTimeout('https://atomic-flix-verifier-bot.vercel.app/api/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }, 15000);

      const data = await response.json();

      if (data.success) {
        // Marquer comme vérifié dans le stockage local
        await AsyncStorage.setItem('telegram_verified', 'true');
        await AsyncStorage.setItem('telegram_user_id', userId);
        
        // Marquer l'étape finale comme complétée
        setIsVerified(true);
        
        // Extraire le nom de l'utilisateur pour personnaliser le message
        const userName = data.userInfo?.user?.first_name || data.userInfo?.user?.username || 'Otaku';
        const userStatus = data.status === 'creator' ? ' 👑 Bienvenue, Créateur !' : '';
        
        Alert.alert(
          `Bienvenue dans Atomic Flix${userStatus}`,
          `🎉 Félicitations ${userName} ! Explorez maintenant des milliers d'animes et mangas exclusifs !`,
          [
            {
              text: 'Commencer l\'aventure',
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
      
      let errorMessage = 'Une erreur est survenue lors de la vérification.';
      
      if (error instanceof Error) {
        if (error.message === 'Pas de connexion Internet') {
          errorMessage = 'Aucune connexion Internet détectée. Vérifiez votre connexion.';
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMessage = 'Erreur de réseau. Le serveur de vérification est peut-être indisponible.';
        } else if (error.message.includes('timeout') || error.name === 'AbortError') {
          errorMessage = 'La requête a expiré. Veuillez réessayer.';
        } else if (error.message) {
          errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      Alert.alert(
        'Erreur de vérification',
        errorMessage,
        [
          { text: 'Réessayer', onPress: () => setIsVerifying(false) },
          { 
            text: 'Mode hors ligne', 
            onPress: () => {
              Alert.alert(
                'Mode hors ligne activé',
                'Vous pouvez explorer l\'app sans vérification Telegram.',
                [{ text: 'Continuer', onPress: onVerified }]
              );
            }
          }
        ]
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.squareCard}>
        <Text style={styles.title}>Vérification Telegram</Text>
        <Text style={styles.description}>
          Rejoignez notre communauté Telegram et débloquez l'accès complet à Atomic Flix !
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressSteps}>
            <View style={[styles.progressStep, hasSubscribed && styles.progressStepActive]}>
              <Text style={[styles.progressStepText, hasSubscribed && styles.progressStepTextActive]}>1</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={[styles.progressStep, hasGetId && styles.progressStepActive]}>
              <Text style={[styles.progressStepText, hasGetId && styles.progressStepTextActive]}>2</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={[styles.progressStep, telegramId.trim() && styles.progressStepActive]}>
              <Text style={[styles.progressStepText, telegramId.trim() && styles.progressStepTextActive]}>3</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={[styles.progressStep, isVerified && styles.progressStepActive]}>
              <Text style={[styles.progressStepText, isVerified && styles.progressStepTextActive]}>4</Text>
            </View>
          </View>
          <Text style={styles.progressLabel}>
            {!hasSubscribed ? "Étape 1 : S'abonner au canal Telegram" :
             !hasGetId ? "Étape 2 : Obtenir votre ID Telegram" :
             !telegramId.trim() ? "Étape 3 : Saisir votre ID Telegram" : 
             !isVerified ? "Étape 4 : Cliquer sur Vérifier" :
             "✅ Vérification terminée !"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00bcd4', '#0ea5e9']}
            style={styles.compactButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.compactButtonText}>S'abonner au canal</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.getIdButton}
          onPress={handleGetId}
          activeOpacity={0.8}
        >
          <Text style={styles.getIdButtonText}>📱 Obtenir mon ID</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.idInput}
          placeholder="Votre ID numérique (ex: 123456789)"
          placeholderTextColor="#6b7280"
          value={telegramId}
          onChangeText={setTelegramId}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[
            styles.verifyButton,
            isVerifying && styles.disabledButton
          ]}
          onPress={handleVerify}
          disabled={isVerifying}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00bcd4', '#0ea5e9']}
            style={styles.compactButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.compactButtonText}>🚀 Vérifier l'abonnement</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => Alert.alert(
            'Besoin d\'aide ?',
            'Instructions détaillées :\n\n1️⃣ Cliquez sur "S\'abonner au canal"\n2️⃣ Rejoignez notre canal Telegram\n3️⃣ Cliquez sur "📱 Obtenir mon ID"\n4️⃣ Envoyez /start au bot @getmyid_bot\n5️⃣ Copiez l\'ID numérique que le bot vous donne\n6️⃣ Revenez ici et collez votre ID\n7️⃣ Cliquez sur "Vérifier"\n\nProblème ? Contactez-nous !',
            [{ text: 'Compris !' }]
          )}
        >
          <Text style={styles.helpButtonText}>❓ Besoin d'aide ?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  squareCard: {
    width: 320,
    height: 480,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 188, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  getIdButton: {
    width: '100%',
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.4)',
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledGetIdButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: 'rgba(107, 114, 128, 0.3)',
    opacity: 0.5,
  },
  getIdButtonText: {
    color: '#00bcd4',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledGetIdText: {
    color: '#6b7280',
  },
  
  // Styles pour l'indicateur de progression
  progressContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderWidth: 1,
    borderColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: 'rgba(0, 188, 212, 0.3)',
    borderColor: '#00bcd4',
  },
  progressStepText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  progressStepTextActive: {
    color: '#00bcd4',
  },
  progressLine: {
    width: 16,
    height: 2,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    marginHorizontal: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: '#00bcd4',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Style pour le bouton d'aide
  helpButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.2)',
  },
  helpButtonText: {
    fontSize: 12,
    color: '#00bcd4',
    textAlign: 'center',
    fontWeight: '500',
  },
  idInput: {
    width: '100%',
    height: 45,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#ffffff',
    marginVertical: 8,
    textAlign: 'center',
  },
  disabledInput: {
    opacity: 0.5,
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  subscribeButton: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: '100%',
    marginBottom: 8,
  },
  verifyButton: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: '100%',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
    elevation: 1,
    shadowOpacity: 0.1,
  },
  compactButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  compactSuccessMessage: {
    fontSize: 12,
    color: '#00bcd4',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },


});

export default TelegramVerification;