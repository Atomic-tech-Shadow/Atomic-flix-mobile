import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import SharedHeader from '../components/SharedHeader';
import { COLORS } from '../constants/newColors';

interface Props {
  navigation: any;
}

const TermsOfServiceScreen: React.FC<Props> = ({ navigation }) => {
  const lastUpdated = "4 septembre 2025";

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      
      <View style={styles.headerContainer}>
        <SharedHeader />
      </View>
      
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Header Section */}
          <View style={styles.titleSection}>
            <Text style={styles.icon}>📋</Text>
            <Text style={styles.title}>Conditions d'Utilisation</Text>
            <Text style={styles.subtitle}>Utilisation responsable d'Atomic Flix</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Version en vigueur depuis le {lastUpdated}</Text>
            </View>
          </View>

          {/* Acceptance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>✅</Text>
              <Text style={styles.sectionTitle}>Acceptation des Conditions</Text>
            </View>
            
            <Text style={styles.text}>
              En utilisant <Text style={styles.boldText}>Atomic Flix</Text>, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
            </Text>

            <View style={styles.highlightBox}>
              <Text style={styles.highlightTitle}>🎯 Application Mobile Gratuite</Text>
              <Text style={styles.highlightText}>
                Atomic Flix est une application mobile <Text style={styles.boldText}>100% gratuite</Text> qui vous aide à découvrir 
                et suivre les animes et mangas disponibles publiquement.
              </Text>
            </View>
          </View>

          {/* Service Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📱</Text>
              <Text style={styles.sectionTitle}>Description du Service</Text>
            </View>
            
            <Text style={styles.text}>
              <Text style={styles.boldText}>Atomic Flix</Text> est une application mobile qui permet aux utilisateurs de :
            </Text>

            <View style={styles.featureList}>
              <Text style={styles.featureItem}>🔍 <Text style={styles.boldText}>Rechercher</Text> des animes et mangas</Text>
              <Text style={styles.featureItem}>📺 <Text style={styles.boldText}>Découvrir</Text> les nouveaux épisodes et chapitres</Text>
              <Text style={styles.featureItem}>🔔 <Text style={styles.boldText}>Recevoir des notifications</Text> sur les nouveautés</Text>
              <Text style={styles.featureItem}>📖 <Text style={styles.boldText}>Suivre votre historique</Text> de visionnage (local)</Text>
              <Text style={styles.featureItem}>⏰ <Text style={styles.boldText}>Consulter le planning</Text> des sorties à venir</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 <Text style={styles.boldText}>Important :</Text> Atomic Flix est un agrégateur qui facilite l'accès au contenu publiquement disponible. 
                Nous ne stockons pas de contenu vidéo.
              </Text>
            </View>
          </View>

          {/* Acceptable Use */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>⚖️</Text>
              <Text style={styles.sectionTitle}>Utilisation Acceptable</Text>
            </View>
            
            <Text style={styles.text}>
              En utilisant Atomic Flix, vous vous engagez à :
            </Text>

            <View style={styles.rulesList}>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleIcon}>✅</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.boldText}>Respecter les lois</Text> en vigueur dans votre pays
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleIcon}>✅</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.boldText}>Utiliser l'app personnellement</Text> et de manière raisonnable
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleIcon}>✅</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.boldText}>Respecter les créateurs</Text> de contenu et leurs droits
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleIcon}>❌</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.boldText}>NE PAS</Text> utiliser l'app pour des activités commerciales
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleIcon}>❌</Text>
                <Text style={styles.ruleText}>
                  <Text style={styles.boldText}>NE PAS</Text> tenter de pirater ou endommager l'application
                </Text>
              </View>
            </View>
          </View>

          {/* Intellectual Property */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>©️</Text>
              <Text style={styles.sectionTitle}>Propriété Intellectuelle</Text>
            </View>
            
            <Text style={styles.text}>
              <Text style={styles.boldText}>Atomic Flix</Text> respecte scrupuleusement les droits d'auteur :
            </Text>

            <View style={styles.ipList}>
              <Text style={styles.ipItem}>🎨 L'application et son design sont protégés par le droit d'auteur</Text>
              <Text style={styles.ipItem}>📺 Le contenu anime/manga appartient à leurs créateurs respectifs</Text>
              <Text style={styles.ipItem}>🔗 Nous ne faisons que référencer le contenu disponible publiquement</Text>
              <Text style={styles.ipItem}>⚡ Notre rôle se limite à faciliter la découverte de contenu</Text>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ <Text style={styles.boldText}>Avertissement :</Text> Respectez toujours les lois sur le droit d'auteur 
                de votre pays lors de l'accès au contenu.
              </Text>
            </View>
          </View>

          {/* Disclaimers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>⚠️</Text>
              <Text style={styles.sectionTitle}>Limitations et Responsabilités</Text>
            </View>
            
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerTitle}>🛡️ Service "Tel Quel"</Text>
              <Text style={styles.disclaimerText}>
                Atomic Flix est fourni "tel quel" sans garantie. Nous nous efforçons de maintenir un service de qualité, 
                mais ne pouvons garantir une disponibilité 100% ni l'exactitude de toutes les informations.
              </Text>
            </View>

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerTitle}>🔗 Contenu Externe</Text>
              <Text style={styles.disclaimerText}>
                L'application référence du contenu externe sur lequel nous n'avons aucun contrôle. 
                Nous ne sommes pas responsables de la disponibilité ou du contenu des sites tiers.
              </Text>
            </View>

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerTitle}>📱 Compatibilité</Text>
              <Text style={styles.disclaimerText}>
                L'application est optimisée pour les versions récentes d'Android et iOS. 
                Certaines fonctionnalités peuvent ne pas être disponibles sur les anciens appareils.
              </Text>
            </View>
          </View>

          {/* Updates */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔄</Text>
              <Text style={styles.sectionTitle}>Mises à Jour</Text>
            </View>
            
            <Text style={styles.text}>
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes 
              vous seront notifiées via l'application.
            </Text>

            <View style={styles.updateBox}>
              <Text style={styles.updateText}>
                📅 <Text style={styles.boldText}>Dernière modification :</Text> {lastUpdated}{'\n'}
                📱 <Text style={styles.boldText}>Version de l'app :</Text> 1.0.0{'\n'}
                ✅ <Text style={styles.boldText}>Statut :</Text> Conditions en vigueur
              </Text>
            </View>
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📧</Text>
              <Text style={styles.sectionTitle}>Contact et Support</Text>
            </View>
            
            <Text style={styles.text}>
              Pour toute question concernant ces conditions d'utilisation ou l'utilisation d'Atomic Flix :
            </Text>

            <View style={styles.contactBox}>
              <Text style={styles.contactText}>
                🚀 <Text style={styles.boldText}>Application :</Text> Atomic Flix - Découverte d'Animes & Mangas{'\n'}
                🆓 <Text style={styles.boldText}>Service :</Text> 100% Gratuit et sans publicité{'\n'}
                🔒 <Text style={styles.boldText}>Vie privée :</Text> Stockage local uniquement
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
              <Text style={styles.acceptButtonText}>J'accepte ces conditions</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

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
  featureList: {
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },
  rulesList: {
    marginBottom: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 10,
  },
  ruleIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 2,
  },
  ruleText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 22,
    flex: 1,
  },
  ipList: {
    marginBottom: 16,
  },
  ipItem: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },
  warningBox: {
    backgroundColor: COLORS.badges.manga + '20',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.badges.manga,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  disclaimerBox: {
    backgroundColor: COLORS.primary + '40',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.card,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  updateBox: {
    backgroundColor: COLORS.accent + '20',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  updateText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  contactBox: {
    backgroundColor: COLORS.secondary + '30',
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

export default TermsOfServiceScreen;