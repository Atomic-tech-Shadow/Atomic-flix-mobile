import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import SharedHeader from '../components/SharedHeader';
import { getThemedColors } from '../constants/newColors';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  navigation: any;
}

const PrivacyPolicyScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark } = useTheme();
  const COLORS = getThemedColors(isDark);
  const lastUpdated = "4 septembre 2025";

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.primary,
    },
    headerContainer: {
      zIndex: 1000,
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    titleSection: {
      alignItems: 'center',
      paddingVertical: 30,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border.card,
      marginBottom: 20,
    },
    icon: {
      fontSize: 48,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.text.secondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    badge: {
      backgroundColor: COLORS.secondary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 12,
      color: COLORS.text.primary,
      fontWeight: '600',
    },
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.text.primary,
      flex: 1,
    },
    text: {
      fontSize: 16,
      color: COLORS.text.secondary,
      lineHeight: 24,
      marginBottom: 16,
    },
    boldText: {
      fontWeight: 'bold',
      color: COLORS.text.primary,
    },
    highlightBox: {
      backgroundColor: COLORS.accent + '20',
      borderLeftWidth: 4,
      borderLeftColor: COLORS.accent,
      padding: 16,
      borderRadius: 8,
      marginBottom: 20,
    },
    highlightTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.text.primary,
      marginBottom: 8,
    },
    highlightText: {
      fontSize: 15,
      color: COLORS.text.secondary,
      lineHeight: 22,
    },
    infoBox: {
      backgroundColor: COLORS.secondary + '30',
      padding: 16,
      borderRadius: 12,
      marginTop: 16,
    },
    infoText: {
      fontSize: 14,
      color: COLORS.text.secondary,
      lineHeight: 20,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text.primary,
      marginBottom: 12,
    },
    list: {
      marginBottom: 16,
    },
    listItem: {
      fontSize: 15,
      color: COLORS.text.secondary,
      lineHeight: 24,
      marginBottom: 8,
      paddingLeft: 8,
    },
    serviceBox: {
      backgroundColor: COLORS.primary + '40',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.border.card,
    },
    serviceTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.text.primary,
      marginBottom: 8,
    },
    serviceText: {
      fontSize: 14,
      color: COLORS.text.secondary,
      lineHeight: 20,
    },
    permissionList: {
      marginTop: 8,
    },
    permissionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      padding: 12,
      backgroundColor: COLORS.primary + '20',
      borderRadius: 10,
    },
    permissionIcon: {
      fontSize: 20,
      marginRight: 12,
      marginTop: 2,
    },
    permissionContent: {
      flex: 1,
    },
    permissionName: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text.primary,
      marginBottom: 4,
    },
    permissionDesc: {
      fontSize: 14,
      color: COLORS.text.secondary,
      lineHeight: 20,
    },
    contactBox: {
      backgroundColor: COLORS.accent + '20',
      padding: 16,
      borderRadius: 12,
      marginTop: 8,
    },
    contactText: {
      fontSize: 14,
      color: COLORS.text.secondary,
      lineHeight: 22,
    },
    buttonContainer: {
      paddingVertical: 30,
      alignItems: 'center',
    },
    acceptButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.accent,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 25,
      minWidth: 200,
      justifyContent: 'center',
      elevation: 3,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    acceptButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text.primary,
      marginLeft: 8,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={COLORS.primary} />
      
      <View style={styles.headerContainer}>
        <SharedHeader />
      </View>
      
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Header Section */}
          <View style={styles.titleSection}>
            <Text style={styles.icon}>🛡️</Text>
            <Text style={styles.title}>Politique de Confidentialité</Text>
            <Text style={styles.subtitle}>Votre vie privée est notre priorité</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Mis à jour le {lastUpdated}</Text>
            </View>
          </View>

          {/* Privacy First Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔒</Text>
              <Text style={styles.sectionTitle}>Privacy by Design</Text>
            </View>
            
            <View style={styles.highlightBox}>
              <Text style={styles.highlightTitle}>🎯 Notre Engagement</Text>
              <Text style={styles.highlightText}>
                <Text style={styles.boldText}>ATOMIC FLIX</Text> est conçu avec une approche {' '}
                <Text style={styles.boldText}>« Privacy First »</Text>. Toutes vos données restent sur votre appareil.
              </Text>
            </View>

            <Text style={styles.listTitle}>✅ Ce que nous NE faisons PAS :</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>🚫 Aucune collecte de données personnelles</Text>
              <Text style={styles.listItem}>🚫 Aucun tracking ou profilage utilisateur</Text>
              <Text style={styles.listItem}>🚫 Aucun partage avec des tiers</Text>
              <Text style={styles.listItem}>🚫 Aucune analyse comportementale</Text>
              <Text style={styles.listItem}>🚫 Aucun cookie de suivi</Text>
            </View>
          </View>

          {/* Data Storage Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📱</Text>
              <Text style={styles.sectionTitle}>Stockage Local Uniquement</Text>
            </View>
            
            <Text style={styles.text}>
              Toutes les données de l'application sont stockées <Text style={styles.boldText}>exclusivement sur votre appareil</Text> :
            </Text>

            <View style={styles.list}>
              <Text style={styles.listItem}>📺 <Text style={styles.boldText}>Historique de visionnage</Text> - Vos épisodes regardés</Text>
              <Text style={styles.listItem}>⚙️ <Text style={styles.boldText}>Préférences utilisateur</Text> - Langue, thème, paramètres</Text>
              <Text style={styles.listItem}>🔔 <Text style={styles.boldText}>Notifications</Text> - Historique des notifications reçues</Text>
              <Text style={styles.listItem}>🔍 <Text style={styles.boldText}>Cache de recherche</Text> - Amélioration des performances</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 <Text style={styles.boldText}>Note :</Text> Vous pouvez effacer ces données à tout moment via les paramètres de votre appareil.
              </Text>
            </View>
          </View>

          {/* External Services Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🌐</Text>
              <Text style={styles.sectionTitle}>Services Externes</Text>
            </View>
            
            <Text style={styles.text}>
              L'application utilise les services suivants pour fonctionner :
            </Text>

            <View style={styles.serviceBox}>
              <Text style={styles.serviceTitle}>📡 API Anime-Sama</Text>
              <Text style={styles.serviceText}>
                • <Text style={styles.boldText}>Finalité :</Text> Récupération du contenu anime/manga{'\n'}
                • <Text style={styles.boldText}>Données transmises :</Text> Requêtes de recherche anonymes{'\n'}
                • <Text style={styles.boldText}>Domaine :</Text> anime-sama-scraper.vercel.app
              </Text>
            </View>

            <View style={styles.serviceBox}>
              <Text style={styles.serviceTitle}>🔔 Expo Push Notifications</Text>
              <Text style={styles.serviceText}>
                • <Text style={styles.boldText}>Finalité :</Text> Envoi de notifications sur nouveaux épisodes{'\n'}
                • <Text style={styles.boldText}>Données transmises :</Text> Token de notification anonyme{'\n'}
                • <Text style={styles.boldText}>Contrôle :</Text> Désactivable à tout moment
              </Text>
            </View>
          </View>

          {/* Permissions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔐</Text>
              <Text style={styles.sectionTitle}>Permissions Requises</Text>
            </View>
            
            <Text style={styles.text}>
              L'application demande les permissions suivantes pour fonctionner :
            </Text>

            <View style={styles.permissionList}>
              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>🌐</Text>
                <View style={styles.permissionContent}>
                  <Text style={styles.permissionName}>Accès Internet</Text>
                  <Text style={styles.permissionDesc}>Nécessaire pour charger le contenu anime/manga</Text>
                </View>
              </View>

              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>🔔</Text>
                <View style={styles.permissionContent}>
                  <Text style={styles.permissionName}>Notifications</Text>
                  <Text style={styles.permissionDesc}>Vous informer des nouveaux épisodes (optionnel)</Text>
                </View>
              </View>

              <View style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>🔊</Text>
                <View style={styles.permissionContent}>
                  <Text style={styles.permissionName}>Audio</Text>
                  <Text style={styles.permissionDesc}>Contrôler le volume et l'audio des vidéos</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📧</Text>
              <Text style={styles.sectionTitle}>Contact</Text>
            </View>
            
            <Text style={styles.text}>
              Pour toute question concernant cette politique de confidentialité ou vos données :
            </Text>

            <View style={styles.contactBox}>
              <Text style={styles.contactText}>
                📱 <Text style={styles.boldText}>Application :</Text> Atomic Flix v1.0.0{'\n'}
                🛡️ <Text style={styles.boldText}>Engagement :</Text> Zéro collecte de données personnelles{'\n'}
                ⏰ <Text style={styles.boldText}>Dernière révision :</Text> {lastUpdated}
              </Text>
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.acceptButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="checkmark-circle" size={20} color={COLORS.text.primary} />
              <Text style={styles.acceptButtonText}>J'ai lu et je comprends</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;