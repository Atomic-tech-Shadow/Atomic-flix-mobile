import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import SharedHeader from '../components/SharedHeader';
import { getThemedColors } from '../constants/newColors';
import { useTheme } from '../contexts/ThemeContext';

type AboutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'About'>;

interface Props {
  navigation: AboutScreenNavigationProp;
}

const AboutScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark } = useTheme();
  const COLORS = getThemedColors(isDark);

  const openURL = (url: string) => {
    Linking.openURL(url);
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
      color: COLORS.text.primary,
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      color: COLORS.text.muted,
      lineHeight: 24,
      textAlign: 'justify',
    },
    featureList: {
      gap: 8,
    },
    featureItem: {
      fontSize: 16,
      color: COLORS.text.muted,
      lineHeight: 22,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
      gap: 15,
    },
    linkButton: {
      flex: 1,
      backgroundColor: COLORS.secondary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    linkButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      marginTop: 40,
      marginBottom: 20,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: COLORS.text.muted,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor="transparent" translucent />
      <SharedHeader />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/atomic-flix-logo-new.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Atomic Flix</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
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

export default AboutScreen;