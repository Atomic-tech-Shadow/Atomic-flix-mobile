import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import SharedHeader from '../components/SharedHeader';
import { COLORS } from '../constants/newColors';

type AboutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'About'>;

interface Props {
  navigation: AboutScreenNavigationProp;
}

const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const openURL = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <SharedHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/atomic-flix-logo-new.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Atomic Flix</Text>
          <Text style={styles.version}>Version 2.6.2</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>
            Atomic Flix est votre compagnon ultime pour découvrir et suivre vos animés et mangas préférés. 
            Profitez d'une expérience fluide avec des notifications intelligentes et une interface moderne.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonctionnalités</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Catalogue complet d'animés et mangas</Text>
            <Text style={styles.featureItem}>• Notifications de nouveaux épisodes</Text>
            <Text style={styles.featureItem}>• Recherche globale avancée</Text>
            <Text style={styles.featureItem}>• Interface moderne et fluide</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={() => openURL('https://github.com/atomicflix')}
          >
            <Text style={styles.linkButtonText}>GitHub</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={() => openURL('https://atomicflix.com')}
          >
            <Text style={styles.linkButtonText}>Site Web</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Atomic Flix. Tous droits réservés.</Text>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  version: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
    textAlign: 'justify',
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 30,
    gap: 15,
  },
  linkButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  linkButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.card,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.text.muted,
    textAlign: 'center',
  },
});

export default AboutScreen;