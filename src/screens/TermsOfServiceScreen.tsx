import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import SharedHeader from '../components/SharedHeader';

type TermsOfServiceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TermsOfService'>;

interface Props {
  navigation: TermsOfServiceScreenNavigationProp;
}

export default function TermsOfServiceScreen({ navigation }: Props) {
  const lastUpdated = "5 juillet 2025";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      <SharedHeader />
      <View style={styles.container}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.documentIcon}>📄</Text>
          <Text style={styles.title}>Conditions d'Utilisation</Text>
          <Text style={styles.subtitle}>Règles et conditions d'utilisation d'ATOMIC FLIX</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Dernière mise à jour : {lastUpdated}</Text>
          </View>
        </View>

        {/* Acceptance Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⚖️</Text>
            <Text style={styles.sectionTitle}>Acceptation des Conditions</Text>
          </View>
          
          <Text style={styles.description}>
            En utilisant ATOMIC FLIX, vous acceptez d'être lié par ces conditions d'utilisation. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre application.
          </Text>

          <View style={styles.definitionsBox}>
            <Text style={styles.definitionsTitle}>Définitions</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>"Application"</Text> : ATOMIC FLIX et tous ses services</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>"Utilisateur"</Text> : Toute personne utilisant l'application</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>"Contenu"</Text> : Animes, mangas et autres médias disponibles</Text>
              <Text style={styles.listItem}>• <Text style={styles.boldText}>"Développeur"</Text> : Cid AKUE, créateur d'ATOMIC FLIX</Text>
            </View>
          </View>
        </View>

        {/* Service Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👥</Text>
            <Text style={styles.sectionTitle}>Description du Service</Text>
          </View>

          <Text style={styles.description}>
            ATOMIC FLIX est une application de streaming d'anime gratuite qui permet aux utilisateurs 
            de rechercher, découvrir et regarder des animes en ligne.
          </Text>

          <Text style={styles.listTitle}>Fonctionnalités disponibles :</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Recherche et navigation d'animes</Text>
            <Text style={styles.listItem}>• Streaming vidéo en ligne</Text>
            <Text style={styles.listItem}>• Lecture de manga</Text>
            <Text style={styles.listItem}>• Interface responsive (web et mobile)</Text>
            <Text style={styles.listItem}>• Application Progressive Web App (PWA)</Text>
          </View>
        </View>

        {/* Content Disclaimer Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⚠️</Text>
            <Text style={styles.sectionTitle}>Avertissement Important sur le Contenu</Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Hébergement de Contenu</Text>
            <Text style={styles.warningText}>
              <Text style={styles.boldText}>ATOMIC FLIX n'héberge aucune vidéo sur ses serveurs.</Text> Toutes les vidéos 
              sont hébergées par des plateformes tierces externes. L'application sert uniquement 
              d'interface pour accéder à ces contenus.
            </Text>
          </View>

          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Droits d'Auteur</Text>
            <Text style={styles.errorText}>
              Pour toute réclamation de droit d'auteur concernant le contenu vidéo, 
              veuillez contacter directement la plateforme d'hébergement où le contenu est stocké. 
              ATOMIC FLIX ne peut pas traiter les réclamations de droits d'auteur car nous ne contrôlons 
              pas le contenu hébergé sur des serveurs tiers.
            </Text>
          </View>
        </View>

        {/* User Responsibilities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🛡️</Text>
            <Text style={styles.sectionTitle}>Responsabilités de l'Utilisateur</Text>
          </View>

          <Text style={styles.description}>
            En utilisant ATOMIC FLIX, vous vous engagez à :
          </Text>

          <View style={styles.list}>
            <Text style={styles.listItem}>• Utiliser l'application de manière légale et éthique</Text>
            <Text style={styles.listItem}>• Respecter les droits de propriété intellectuelle</Text>
            <Text style={styles.listItem}>• Ne pas tenter de perturber le fonctionnement de l'application</Text>
            <Text style={styles.listItem}>• Ne pas utiliser l'application pour des activités illégales</Text>
            <Text style={styles.listItem}>• Signaler tout problème technique ou contenu inapproprié</Text>
          </View>
        </View>

        {/* Service Availability Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🌐</Text>
            <Text style={styles.sectionTitle}>Disponibilité du Service</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Service Gratuit</Text>
            <Text style={styles.infoText}>
              ATOMIC FLIX est entièrement gratuit et ne nécessite aucun paiement ou abonnement. 
              Nous nous réservons le droit de modifier ou d'interrompre le service à tout moment.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Maintenance et Mises à Jour</Text>
            <Text style={styles.infoText}>
              L'application peut être temporairement indisponible pour maintenance, 
              mises à jour ou en raison de problèmes techniques indépendants de notre volonté.
            </Text>
          </View>
        </View>

        {/* Limitation of Liability Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⚖️</Text>
            <Text style={styles.sectionTitle}>Limitation de Responsabilité</Text>
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>Utilisation à vos Risques</Text>
            <Text style={styles.disclaimerText}>
              L'utilisation d'ATOMIC FLIX se fait à vos propres risques. Le développeur ne peut être tenu 
              responsable de tout dommage direct ou indirect résultant de l'utilisation de l'application.
            </Text>
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>Contenu Tiers</Text>
            <Text style={styles.disclaimerText}>
              Le développeur n'est pas responsable du contenu fourni par des plateformes tierces, 
              de sa qualité, de sa légalité ou de sa disponibilité.
            </Text>
          </View>
        </View>

        {/* Changes to Terms Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>Modifications des Conditions</Text>
          </View>

          <Text style={styles.description}>
            Ces conditions d'utilisation peuvent être modifiées à tout moment. 
            Les utilisateurs seront informés des changements importants via l'application. 
            L'utilisation continue de l'application après modifications constitue une acceptation des nouvelles conditions.
          </Text>
        </View>

        {/* Governing Law Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🏛️</Text>
            <Text style={styles.sectionTitle}>Droit Applicable</Text>
          </View>

          <Text style={styles.description}>
            Ces conditions d'utilisation sont régies par le droit français. 
            Tout litige sera soumis à la juridiction compétente française.
          </Text>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📧</Text>
            <Text style={styles.sectionTitle}>Contact</Text>
          </View>
          
          <Text style={styles.contactText}>
            Pour toute question concernant ces conditions d'utilisation, 
            vous pouvez contacter le développeur via les canaux de support de l'application.
          </Text>

          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Développeur :</Text>
            <Text style={styles.contactValue}>Cid AKUE</Text>
            <Text style={styles.contactLabel}>Projet :</Text>
            <Text style={styles.contactValue}>ATOMIC FLIX Mobile</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            En utilisant ATOMIC FLIX, vous confirmez avoir lu, compris et accepté 
            l'intégralité de ces conditions d'utilisation.
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  documentIcon: {
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
    marginBottom: 16,
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
  description: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
    marginBottom: 16,
  },
  definitionsBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  definitionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 12,
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
  boldText: {
    fontWeight: 'bold',
    color: '#ffffff',
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
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
  },
  disclaimerBox: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a855f7',
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
    marginBottom: 16,
  },
  contactInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  contactLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#00bcd4',
    fontWeight: '600',
    marginBottom: 12,
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