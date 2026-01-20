import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
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
      padding: 24,
      backgroundColor: `${COLORS.secondary}15`,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: `${COLORS.secondary}33`,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 15,
      shadowColor: COLORS.secondary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
      tintColor: isDark ? undefined : COLORS.secondary,
    },
    appName: {
      fontSize: 32,
      fontWeight: '800',
      color: COLORS.text.primary,
      textAlign: 'center',
      letterSpacing: 1,
    },
    version: {
      fontSize: 14,
      color: COLORS.secondary,
      marginTop: 8,
      fontWeight: '600',
    },
    section: {
      marginBottom: 24,
      backgroundColor: `${COLORS.primary}f2`,
      padding: 18,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: `${COLORS.secondary}25`,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text.primary,
      marginBottom: 14,
      letterSpacing: 0.5,
    },
    description: {
      fontSize: 15,
      color: COLORS.text.secondary,
      lineHeight: 24,
      textAlign: 'justify',
    },
    featureList: {
      gap: 12,
    },
    featureItem: {
      fontSize: 15,
      color: COLORS.text.secondary,
      lineHeight: 22,
      paddingLeft: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
      gap: 20,
    },
    socialButton: {
      width: 56,
      height: 56,
      backgroundColor: COLORS.background.secondary,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: COLORS.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 1,
      borderColor: `${COLORS.secondary}33`,
    },
    footer: {
      marginTop: 40,
      marginBottom: 20,
      alignItems: 'center',
      padding: 16,
      backgroundColor: `${COLORS.accent}15`,
      borderRadius: 12,
    },
    footerText: {
      fontSize: 13,
      color: COLORS.text.secondary,
      textAlign: 'center',
      fontWeight: '500',
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
          <Text style={styles.version}>Version 3.1.0</Text>
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
            style={styles.socialButton} 
            onPress={() => openURL('https://wa.me/22871394585')}
          >
            <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={() => openURL('https://discord.gg/anime-sama')}
          >
            <Ionicons name="logo-discord" size={32} color="#5865F2" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={() => openURL('mailto:atomictech228@gmail.com')}
          >
            <Ionicons name="mail" size={32} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Atomic Flix. Tous droits réservés.</Text>
          <Text style={[styles.footerText, { marginTop: 8 }]}>Développé par cid AKUE</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;