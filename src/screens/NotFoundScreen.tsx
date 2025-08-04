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
    backgroundColor: COLORS.primary,
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