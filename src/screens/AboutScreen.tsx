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
          <Text style={styles.footerText}>© 2024 Atomic Flix. Tous droits réservés.</Text>
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      
      {/* Header fixe au-dessus du contenu */}
      <View style={styles.headerContainer}>
        <SharedHeader />
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/atomic-flix-logo-new.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
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
              <Text style={styles.warningTitle}>🚨 Disclaimer Légal - Non-Hébergement</Text>
              <Text style={styles.warningText}>
                <Text style={styles.boldText}>ATOMIC FLIX N'HÉBERGE AUCUN CONTENU VIDÉO OU MANGA.</Text>
                {'\n\n'}Cette application fonctionne exclusivement comme un agrégateur de liens publiquement disponibles sur Internet. Nous ne stockons, n'hébergeons, ni ne distribuons aucun fichier multimédia protégé par le droit d'auteur.
                {'\n\n'}• Aucun serveur d'hébergement vidéo{'\n'}
                • Interface utilisateur uniquement{'\n'}
                • APIs publiques pour indexer le contenu{'\n'}
                • Tous les liens proviennent de sources tierces{'\n'}
                • L'utilisateur est responsable de l'utilisation qu'il fait des liens
              </Text>
            </View>

            <View style={styles.copyrightBox}>
              <Text style={styles.copyrightTitle}>📋 Droits d'Auteur et DMCA</Text>
              <Text style={styles.copyrightText}>
                Pour toute réclamation concernant le droit d'auteur, contactez directement les plateformes d'hébergement concernées. ATOMIC FLIX ne peut pas retirer un contenu qu'elle n'héberge pas.
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
  headerLogo: {
    width: 180,
    height: 55,
    marginBottom: 12,
    borderRadius: 90, // Pour rendre le logo rond
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
    color: COLORS.secondary, // Cyan du logo
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
    color: COLORS.accent, // Rose du logo
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
    color: '#ffffff',
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
  copyrightBox: {
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  copyrightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00bcd4',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#ef4444',
  },
});