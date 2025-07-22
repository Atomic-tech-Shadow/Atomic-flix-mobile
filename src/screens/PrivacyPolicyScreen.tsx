import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import SharedHeader from '../components/SharedHeader';

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

interface Props {
  navigation: PrivacyPolicyScreenNavigationProp;
}

export default function PrivacyPolicyScreen({ navigation }: Props) {
  const lastUpdated = "22 juillet 2025";

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      
      {/* Header fixe au-dessus du contenu */}
      <View style={styles.headerContainer}>
        <SharedHeader />
      </View>
      
      <View style={styles.container}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.shieldIcon}>🛡️</Text>
          <Text style={styles.title}>Politique de Confidentialité</Text>
          <Text style={styles.subtitle}>Votre vie privée est notre priorité absolue</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Dernière mise à jour : {lastUpdated}</Text>
          </View>
        </View>

        {/* No Data Collection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👁️</Text>
            <Text style={styles.sectionTitle}>Aucune Collecte de Données</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Nous respectons totalement votre vie privée</Text>
          
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>Engagement Principal</Text>
            <Text style={styles.highlightText}>
              <Text style={styles.boldText}>ATOMIC FLIX collecte uniquement les données nécessaires à la vérification Telegram.</Text> 
              {'\n'}Nous n'utilisons pas de cookies de suivi, d'analyses comportementales, ou de systèmes de tracking publicitaire.
            </Text>
          </View>

          <Text style={styles.listTitle}>Données que nous collectons :</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>ID Telegram</Text> : Pour vérifier votre abonnement au canal</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Nom Telegram</Text> : Pour personnaliser votre expérience</Text>
            <Text style={styles.listItem}>• <Text style={styles.boldText}>Statut d'abonnement</Text> : Pour contrôler l'accès au contenu</Text>
          </View>
          
          <Text style={styles.listTitle}>Ce que nous NE collectons PAS :</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Aucune donnée de navigation ou d'utilisation</Text>
            <Text style={styles.listItem}>• Aucun historique de visionnage</Text>
            <Text style={styles.listItem}>• Aucune géolocalisation</Text>
            <Text style={styles.listItem}>• Aucun cookie de suivi publicitaire</Text>
            <Text style={styles.listItem}>• Aucune adresse IP stockée de manière permanente</Text>
            <Text style={styles.listItem}>• Aucune donnée bancaire ou financière</Text>
          </View>
        </View>

        {/* Telegram Integration Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📱</Text>
            <Text style={styles.sectionTitle}>Intégration Telegram</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Vérification d'abonnement et protection du contenu</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Pourquoi nous utilisons Telegram</Text>
            <Text style={styles.infoText}>
              Pour accéder au contenu exclusif d'ATOMIC FLIX, vous devez vous abonner à notre canal Telegram officiel. 
              Cette vérification nous permet de construire une communauté engagée et de protéger notre contenu.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Données Telegram collectées</Text>
            <Text style={styles.infoText}>
              • Votre ID Telegram (numérique unique){'\n'}
              • Votre prénom/nom d'utilisateur Telegram{'\n'}
              • Votre statut d'abonnement au canal{'\n'}
              Ces données sont stockées localement sur votre appareil et utilisées uniquement pour la vérification.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Sécurité et confidentialité</Text>
            <Text style={styles.infoText}>
              Vos données Telegram sont traitées via l'API officielle Telegram Bot. 
              Nous ne stockons pas vos messages privés ou autres informations sensibles.
            </Text>
          </View>
        </View>

        {/* Legal Disclaimer Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⚖️</Text>
            <Text style={styles.sectionTitle}>Disclaimer Légal Important</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Nature de l'application et responsabilités</Text>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>🚨 NON-HÉBERGEMENT DE CONTENU</Text>
            <Text style={styles.disclaimerText}>
              <Text style={styles.boldText}>ATOMIC FLIX N'HÉBERGE AUCUN CONTENU VIDÉO OU MANGA.</Text>
              {'\n\n'}Cette application fonctionne exclusivement comme un agrégateur de liens publiquement disponibles sur Internet. Nous ne stockons, n'hébergeons, ni ne distribuons aucun fichier multimédia protégé par le droit d'auteur.
            </Text>
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>📡 FONCTIONNEMENT TECHNIQUE</Text>
            <Text style={styles.disclaimerText}>
              • L'application utilise des APIs publiques pour indexer le contenu{'\n'}
              • Tous les liens proviennent de sources externes tierces{'\n'}
              • Aucun fichier média n'est stocké sur nos serveurs{'\n'}
              • Nous agissons uniquement comme interface utilisateur
            </Text>
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>⚠️ RESPONSABILITÉ UTILISATEUR</Text>
            <Text style={styles.disclaimerText}>
              L'utilisateur est seul responsable de l'utilisation qu'il fait des liens fournis par l'application. Il appartient à chaque utilisateur de s'assurer de la légalité du contenu consulté dans sa juridiction.
            </Text>
          </View>
        </View>

        {/* Copyright Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📋</Text>
            <Text style={styles.sectionTitle}>Droits d'Auteur et DMCA</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Respect de la propriété intellectuelle</Text>

          <View style={styles.copyrightBox}>
            <Text style={styles.copyrightTitle}>🛡️ RESPECT DES DROITS D'AUTEUR</Text>
            <Text style={styles.copyrightText}>
              ATOMIC FLIX respecte les droits de propriété intellectuelle. Si vous êtes propriétaire de droits d'auteur et pensez qu'un contenu porte atteinte à vos droits, contactez directement les plateformes d'hébergement concernées.
            </Text>
          </View>

          <View style={styles.copyrightBox}>
            <Text style={styles.copyrightTitle}>📞 PROCÉDURE DE RÉCLAMATION</Text>
            <Text style={styles.copyrightText}>
              Pour toute réclamation concernant le droit d'auteur :{'\n'}
              1. Identifiez la source d'hébergement du contenu{'\n'}
              2. Contactez directement cette plateforme{'\n'}
              3. ATOMIC FLIX ne peut pas retirer un contenu qu'elle n'héberge pas
            </Text>
          </View>
        </View>

        {/* Technical Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🖥️</Text>
            <Text style={styles.sectionTitle}>Informations Techniques</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Comment fonctionne notre application</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Architecture Mobile Native</Text>
            <Text style={styles.infoText}>
              ATOMIC FLIX est une application mobile React Native avec un backend minimal pour la vérification Telegram. 
              La plupart des données restent sur votre appareil.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Sources Externes</Text>
            <Text style={styles.infoText}>
              L'application utilise des API externes pour récupérer les informations sur les animes. 
              Ces requêtes sont sécurisées et ne transmettent pas vos données personnelles.
            </Text>
          </View>
        </View>

        {/* Data Storage Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💾</Text>
            <Text style={styles.sectionTitle}>Stockage Local</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Données stockées uniquement sur votre appareil</Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Stockage Local du Navigateur</Text>
            <Text style={styles.warningText}>
              Seules les données suivantes peuvent être stockées localement dans votre navigateur :
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• Préférences de thème et paramètres d'interface</Text>
              <Text style={styles.listItem}>• ID et nom Telegram pour la vérification d'accès</Text>
              <Text style={styles.listItem}>• Cache des images pour améliorer les performances</Text>
              <Text style={styles.listItem}>• Données temporaires de l'application mobile</Text>
              <Text style={styles.listItem}>• Historique de navigation local (non partagé)</Text>
            </View>
            <Text style={styles.warningText}>
              <Text style={styles.boldText}>Important :</Text> Ces données restent sur votre appareil et ne sont jamais envoyées à nos serveurs.
            </Text>
          </View>
        </View>

        {/* Content Disclaimer Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⚠️</Text>
            <Text style={styles.sectionTitle}>Avertissement sur le Contenu</Text>
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>Responsabilité du Contenu</Text>
            <Text style={styles.disclaimerText}>
              ATOMIC FLIX n'héberge aucun contenu directement. Nous servons uniquement d'interface 
              pour accéder à des contenus hébergés par des plateformes tierces externes.
            </Text>
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>Protection des Données</Text>
            <Text style={styles.disclaimerText}>
              Votre utilisation de l'application reste entièrement privée. Aucune donnée de visionnage 
              ou de navigation n'est collectée, stockée ou partagée.
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📧</Text>
            <Text style={styles.sectionTitle}>Contact</Text>
          </View>
          <Text style={styles.contactText}>
            Pour toute question concernant cette politique de confidentialité, 
            vous pouvez contacter le développeur via les canaux de support de l'application.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cette politique de confidentialité peut être mise à jour occasionnellement. 
            Les changements seront toujours communiqués dans cette section.
          </Text>
          <Text style={styles.footerDate}>Dernière mise à jour : {lastUpdated}</Text>
        </View>
      </ScrollView>
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  headerContainer: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: '#0a0a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  shieldIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#00bcd4',
    textAlign: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
    borderWidth: 1,
    borderColor: '#00bcd4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#00bcd4',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00bcd4',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 16,
  },
  highlightBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a855f7',
    marginBottom: 12,
  },
  list: {
    marginBottom: 16,
  },
  listItem: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 24,
    marginBottom: 4,
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
    marginBottom: 8,
  },
  disclaimerBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
  },
  copyrightBox: {
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  copyrightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00bcd4',
    marginBottom: 8,
  },
  copyrightText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  contactText: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  footerDate: {
    fontSize: 12,
    color: '#00bcd4',
    fontWeight: '500',
  },
});