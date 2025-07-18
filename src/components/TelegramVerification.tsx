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
import Svg, { 
  Circle, 
  Ellipse, 
  G, 
  Path, 
  Defs, 
  LinearGradient as SvgLinearGradient, 
  Stop
} from 'react-native-svg';

interface TelegramVerificationProps {
  onVerified: () => void;
  telegramChannelUrl?: string;
  channelName?: string;
}

// Composant Logo SVG Animé ATOMIC FLIX avec couleurs cohérentes
const AnimatedLogo = () => (
  <Svg width="80" height="80" viewBox="0 0 400 400">
    <Defs>
      <SvgLinearGradient id="orbit1" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#00bcd4"/>
        <Stop offset="50%" stopColor="#0ea5e9"/>
        <Stop offset="100%" stopColor="#3b82f6"/>
      </SvgLinearGradient>
      <SvgLinearGradient id="orbit2" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#3b82f6"/>
        <Stop offset="50%" stopColor="#00bcd4"/>
        <Stop offset="100%" stopColor="#0ea5e9"/>
      </SvgLinearGradient>
      <SvgLinearGradient id="orbit3" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#0ea5e9"/>
        <Stop offset="50%" stopColor="#06b6d4"/>
        <Stop offset="100%" stopColor="#00bcd4"/>
      </SvgLinearGradient>
    </Defs>
    
    {/* Noyau central */}
    <Circle cx="200" cy="200" r="12" fill="#fff" opacity="0.9"/>
    
    {/* Orbites animées - version statique pour éviter les erreurs */}
    <G>
      <Ellipse cx="200" cy="200" rx="60" ry="30" fill="none" stroke="url(#orbit1)" strokeWidth="2" opacity="0.8" />
      <Circle cx="260" cy="200" r="4" fill="url(#orbit1)" opacity="0.8" />
    </G>
    
    <G>
      <Ellipse cx="200" cy="200" rx="45" ry="80" fill="none" stroke="url(#orbit2)" strokeWidth="2" opacity="0.8" />
      <Circle cx="200" cy="120" r="3" fill="url(#orbit2)" opacity="0.8" />
    </G>
    
    <G>
      <Ellipse cx="200" cy="200" rx="75" ry="50" fill="none" stroke="url(#orbit3)" strokeWidth="2" opacity="0.8" />
      <Circle cx="275" cy="200" r="3.5" fill="url(#orbit3)" opacity="0.8" />
    </G>
    
    {/* Symbole play central */}
    <Path 
      d="M185 185 L185 215 L210 200 Z" 
      fill="url(#orbit1)" 
      opacity="0.9"
    />
    
    {/* Lettre F stylisée */}
    <Path 
      d="M220 180 L220 220 M220 180 L235 180 M220 200 L232 200" 
      stroke="url(#orbit3)" 
      strokeWidth="3" 
      fill="none"
      opacity="0.8"
    />
  </Svg>
);

const TelegramVerification: React.FC<TelegramVerificationProps> = ({
  onVerified,
  telegramChannelUrl = 'https://t.me/Atomic_flix_officiel',
  channelName = 'ATOMIC FLIX OFFICIEL',
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [telegramId, setTelegramId] = useState('');

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

  const handleGetId = async () => {
    const botUrl = 'https://t.me/UserInfoToBot';
    try {
      const supported = await Linking.canOpenURL(botUrl);
      if (supported) {
        await Linking.openURL(botUrl);
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
        'Une erreur est survenue lors de l\'ouverture du bot.',
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
    <View style={styles.container}>
      {/* Logo en haut de l'écran */}
      <View style={styles.topLogo}>
        <Image 
          source={require('../../assets/atomic-flix-logo.png')}
          style={styles.headerLogoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>ATOMIC FLIX</Text>
      </View>

      {/* Carte carrée centrée */}
      <View style={styles.squareCard}>
        <Text style={styles.title}>Vérification Telegram</Text>
        
        <Text style={styles.description}>
          Abonnez-vous à notre canal pour accéder au contenu exclusif
        </Text>
        
        {/* 1. Bouton S'abonner */}
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

        {/* 2. Bouton Get your ID */}
        <TouchableOpacity
          style={[
            styles.getIdButton,
            !hasSubscribed && styles.disabledGetIdButton
          ]}
          onPress={handleGetId}
          disabled={!hasSubscribed}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.getIdButtonText,
            !hasSubscribed && styles.disabledGetIdText
          ]}>
            🤖 Get your ID
          </Text>
        </TouchableOpacity>

        {/* 3. Champ de saisie */}
        <TextInput
          style={[
            styles.idInput,
            !hasSubscribed && styles.disabledInput
          ]}
          placeholder="Collez votre ID Telegram ici"
          placeholderTextColor="#6b7280"
          value={telegramId}
          onChangeText={setTelegramId}
          editable={hasSubscribed}
          keyboardType="numeric"
        />

        {/* 4. Bouton Vérifier */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (!hasSubscribed || isVerifying || !telegramId.trim()) && styles.disabledButton
          ]}
          onPress={handleVerify}
          disabled={isVerifying || !hasSubscribed || !telegramId.trim()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={(hasSubscribed && telegramId.trim()) ? ['#00bcd4', '#0ea5e9'] : ['#374151', '#475569']}
            style={styles.compactButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.compactButtonText}>Vérifier l'abonnement</Text>
            )}
          </LinearGradient>
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
  topLogo: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
    zIndex: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00bcd4',
    marginTop: 8,
    textShadowColor: 'rgba(0, 188, 212, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerLogoImage: {
    width: 40,
    height: 40,
  },
  squareCard: {
    width: 320,
    height: 420,
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