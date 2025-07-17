import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import SharedHeader from '../components/SharedHeader';

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PrivacyPolicy'>;

interface Props {
  navigation: PrivacyPolicyScreenNavigationProp;
}

export default function PrivacyPolicyScreen({ navigation }: Props) {
  const lastUpdated = "5 juillet 2025";

  return (
    <SafeAreaView style={styles.safeArea}>
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
              <Text style={styles.boldText}>ATOMIC FLIX ne collecte, ne stocke et ne partage AUCUNE donnée personnelle.</Text> 
              {'\n'}Nous n'utilisons pas de cookies de suivi, d'analyses comportementales, ou de systèmes de tracking.
            </Text>
          </View>

          <Text style={styles.listTitle}>Ce que nous NE collectons PAS :</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Aucune information personnelle (nom, email, âge, etc.)</Text>
            <Text style={styles.listItem}>• Aucune donnée de navigation ou d'utilisation</Text>
            <Text style={styles.listItem}>• Aucun historique de visionnage</Text>
            <Text style={styles.listItem}>• Aucune géolocalisation</Text>
            <Text style={styles.listItem}>• Aucun cookie de suivi</Text>
            <Text style={styles.listItem}>• Aucune adresse IP stockée</Text>
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
            <Text style={styles.infoTitle}>Architecture Frontend-Only</Text>
            <Text style={styles.infoText}>
              ATOMIC FLIX est une application 100% frontend qui fonctionne directement dans votre navigateur. 
              Nous n'avons pas de serveur backend qui pourrait collecter vos données.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Sources Externes</Text>
            <Text style={styles.infoText}>
              L'application utilise des API externes pour récupérer les informations sur les animes. 
              Ces requêtes sont faites directement depuis votre navigateur vers les services tiers.
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
              <Text style={styles.listItem}>• Préférences de thème (clair/sombre)</Text>
              <Text style={styles.listItem}>• Cache des images pour améliorer les performances</Text>
              <Text style={styles.listItem}>• Données temporaires de l'application (PWA)</Text>
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
    backgroundColor: '#000000',
    paddingBottom: 20, // Espace pour la barre de navigation Android
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backButtonText: {
    color: '#00bcd4',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
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