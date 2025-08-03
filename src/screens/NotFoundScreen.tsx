import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import SharedHeader from '../components/SharedHeader';
import { COLORS } from '../constants/newColors';

type NotFoundScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NotFound'>;

interface Props {
  navigation: NotFoundScreenNavigationProp;
}

const NotFoundScreen: React.FC<Props> = ({ navigation }) => {
  const goHome = () => {
    navigation.navigate('Home');
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <SharedHeader />
      
      <View style={styles.content}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.errorTitle}>Page introuvable</Text>
          <Text style={styles.errorMessage}>
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </Text>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.homeButton} onPress={goHome}>
              <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Text style={styles.backButtonText}>Page précédente</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative elements */}
        <View style={styles.starsContainer}>
          <View style={[styles.star, styles.star1]} />
          <View style={[styles.star, styles.star2]} />
          <View style={[styles.star, styles.star3]} />
          <View style={[styles.star, styles.star4]} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.primary,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  buttonContainer: {
    marginTop: 40,
    gap: 15,
  },
  homeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  homeButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.border.primary,
  },
  backButtonText: {
    color: COLORS.text.accent,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  star1: {
    top: '20%',
    left: '15%',
  },
  star2: {
    top: '40%',
    right: '20%',
  },
  star3: {
    bottom: '30%',
    left: '25%',
  },
  star4: {
    bottom: '50%',
    right: '15%',
  },
});

export default NotFoundScreen;

interface Props {
  navigation: NotFoundScreenNavigationProp;
}

export default function NotFoundScreen({ navigation }: Props) {
  const goHome = () => {
    navigation.navigate('Home');
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />

      {/* Header fixe au-dessus du contenu */}
      <View style={styles.headerContainer}>
        <SharedHeader />
      </View>

      <View style={styles.container}>
        {/* Background overlay */}
        <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo ATOMIC FLIX */}
        <View style={styles.logoSection}>
          <Text style={styles.errorCode}>404</Text>
          <Image 
            source={require('../../assets/atomic-flix-logo-new.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Page introuvable dans l'univers</Text>
        </View>

        {/* Error message */}
        <View style={styles.messageContainer}>
          <Text style={styles.errorTitle}>
            Oops ! Cette page n'existe pas
          </Text>
          <Text style={styles.errorDescription}>
            Il semblerait que cette page se soit perdue dans l'espace-temps. 
            Retournez à l'accueil pour découvrir nos animes.
          </Text>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.homeButton} onPress={goHome}>
              <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Text style={styles.backButtonText}>Page précédente</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative elements */}
        <View style={styles.starsContainer}>
          <View style={[styles.star, styles.star1]} />
          <View style={[styles.star, styles.star2]} />
          <View style={[styles.star, styles.star3]} />
          <View style={[styles.star, styles.star4]} />
        </View>
      </View>
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary, // Violet du logo
  },
  headerContainer: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: COLORS.secondary, // Cyan du logo
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Violet du logo
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  errorCode: {
    fontSize: 80,
    fontWeight: 'bold',
    color: COLORS.secondary, // Cyan du logo
    marginBottom: 16,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  logoImage: {
    width: 160,
    height: 50,
    marginBottom: 8,
    borderRadius: 80, // Pour rendre le logo rond
  },
  tagline: {
    fontSize: 18,
    color: COLORS.accent, // Rose du logo
  },
  messageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorDescription: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  homeButton: {
    backgroundColor: '#00bcd4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#00bcd4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
  },
  backButtonText: {
    color: '#00bcd4',
    fontSize: 16,
    fontWeight: '600',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#00bcd4',
    borderRadius: 50,
  },
  star1: {
    width: 8,
    height: 8,
    top: '25%',
    left: '25%',
    opacity: 0.6,
  },
  star2: {
    width: 4,
    height: 4,
    top: '33%',
    right: '33%',
    opacity: 0.8,
  },
  star3: {
    width: 6,
    height: 6,
    bottom: '25%',
    left: '33%',
    opacity: 0.7,
  },
  star4: {
    width: 4,
    height: 4,
    top: '50%',
    right: '25%',
    opacity: 0.6,
  },
});