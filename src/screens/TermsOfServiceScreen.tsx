import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import SharedHeader from '../components/SharedHeader';
import { COLORS } from '../constants/newColors';

type TermsOfServiceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TermsOfService'>;

interface Props {
  navigation: TermsOfServiceScreenNavigationProp;
}

const TermsOfServiceScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <SharedHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Conditions d'utilisation</Text>
          <Text style={styles.lastUpdated}>Dernière mise à jour : 28 janvier 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
          <Text style={styles.text}>
            En utilisant Atomic Flix, vous acceptez d'être lié par ces conditions d'utilisation. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description du service</Text>
          <Text style={styles.text}>
            Atomic Flix est une application mobile qui permet aux utilisateurs de découvrir, 
            suivre et recevoir des notifications sur les animés et mangas.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Utilisation acceptable</Text>
          <Text style={styles.text}>
            Vous vous engagez à utiliser l'application de manière légale et appropriée, 
            en respectant tous les droits d'auteur et propriétés intellectuelles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Confidentialité</Text>
          <Text style={styles.text}>
            Votre vie privée est importante pour nous. Consultez notre politique de confidentialité 
            pour comprendre comment nous collectons et utilisons vos informations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Modifications</Text>
          <Text style={styles.text}>
            Nous nous réservons le droit de modifier ces conditions à tout moment. 
            Les modifications prendront effet immédiatement après leur publication.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.acceptButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.acceptButtonText}>J'ai lu et j'accepte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  lastUpdated: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
    textAlign: 'justify',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TermsOfServiceScreen;
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.documentIcon}>📄</Text>
