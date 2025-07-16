import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AboutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'About'>;

interface Props {
  navigation: AboutScreenNavigationProp;
}

export default function AboutScreen({ navigation }: Props) {
  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/22871394585');
  };

  const openEmail = () => {
    Linking.openURL('mailto:sorokomarco@gmail.com');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>À Propos d'ATOMIC FLIX</Text>
        <Text style={styles.subtitle}>
          Votre plateforme de streaming d'anime moderne et innovante
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        
        {/* About the App */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>L'Application</Text>
            <Text style={styles.cardDescription}>
              Une expérience de streaming révolutionnaire
            </Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.text}>
              ATOMIC FLIX est une application de streaming d'anime créée par{' '}
              <Text style={styles.highlightText}>Cid AKUE</Text>. 
              Elle offre une expérience utilisateur fluide et intuitive pour découvrir et regarder vos anime préférés.
            </Text>
            
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Avertissement Important</Text>
              <Text style={styles.warningText}>
                ATOMIC FLIX n'héberge aucune vidéo sur son serveur. Contactez directement la plateforme d'hébergement vidéo 
                pour toute réclamation de droit relative aux contenus en question.
              </Text>
            </View>
            
            <View style={styles.privacyBox}>
              <Text style={styles.privacyTitle}>Confidentialité</Text>
              <Text style={styles.privacyText}>
                Cette application ne collecte aucune donnée personnelle. Votre vie privée est respectée.
              </Text>
            </View>
            
            <View style={styles.featureSection}>
              <Text style={styles.featureTitle}>Fonctionnalités principales :</Text>
              <View style={styles.featureList}>
                <Text style={styles.featureItem}>• Recherche avancée d'anime</Text>
                <Text style={styles.featureItem}>• Streaming haute qualité</Text>
                <Text style={styles.featureItem}>• Interface moderne et responsive</Text>
                <Text style={styles.featureItem}>• Lecture de manga intégrée</Text>
                <Text style={styles.featureItem}>• Application mobile native</Text>
                <Text style={styles.featureItem}>• Support tactile complet</Text>
              </View>
            </View>

            <View style={styles.techBadges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>React Native</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>TypeScript</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Expo</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Mobile</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Contact</Text>
            <Text style={styles.cardDescription}>
              Contactez Cid AKUE - Développeur
            </Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.text}>
              Pour toute question, suggestion ou support technique, n'hésitez pas à me contacter :
            </Text>
            
            <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
              <Text style={styles.buttonText}>WhatsApp: +228 71 39 45 85</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emailButton} onPress={openEmail}>
              <Text style={styles.emailButtonText}>sorokomarco@gmail.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Technologies Used */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Technologies Utilisées</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.techGrid}>
              {[
                "React Native", "TypeScript", "Expo SDK", "React Navigation",
                "TanStack Query", "React Hooks", "Native Base", "Async Storage",
                "Vector Icons", "Gesture Handler", "Safe Area", "StatusBar"
              ].map((tech, index) => (
                <View key={index} style={styles.techItem}>
                  <Text style={styles.techText}>{tech}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Développé avec ❤️ par Cid AKUE pour les fans d'anime
          </Text>
          <Text style={styles.copyrightText}>
            © 2025 ATOMIC FLIX - Cid AKUE. Tous droits réservés.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#00bcd4',
  },
  subtitle: {
    fontSize: 18,
    color: '#d1d5db',
    textAlign: 'center',
    maxWidth: 300,
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.3)',
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00bcd4',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#d1d5db',
  },
  cardContent: {
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
    marginBottom: 16,
  },
  highlightText: {
    color: '#00bcd4',
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffc107',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  privacyBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  featureSection: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9c27b0',
    marginBottom: 12,
  },
  featureList: {
    paddingLeft: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 4,
  },
  techBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#ba68c8',
    fontWeight: '500',
  },
  whatsappButton: {
    backgroundColor: '#25d366',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emailButton: {
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.5)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#ba68c8',
    fontSize: 16,
    fontWeight: '600',
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  techItem: {
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.3)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: '45%',
  },
  techText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});