import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/newColors';
import Constants from 'expo-constants';

interface DrawerContentProps extends DrawerContentComponentProps {}

const DrawerContent: React.FC<DrawerContentProps> = ({ navigation }) => {
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const menuItems = [
    {
      id: 'home',
      title: 'Accueil',
      icon: 'home-outline',
      route: 'Home',
      description: 'Découvrir les animes'
    },
    {
      id: 'about',
      title: 'À propos',
      icon: 'information-circle-outline',
      route: 'About',
      description: 'Informations sur l\'app'
    },
    {
      id: 'privacy',
      title: 'Confidentialité',
      icon: 'shield-checkmark-outline',
      route: 'PrivacyPolicy',
      description: 'Politique de confidentialité'
    },
    {
      id: 'terms',
      title: 'Conditions d\'utilisation',
      icon: 'document-text-outline',
      route: 'TermsOfService',
      description: 'Conditions générales'
    }
  ];

  const handleMenuPress = (route: string) => {
    navigation.closeDrawer();
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradient}
      >
        {/* Header du drawer */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/atomic-flix-logo-new.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>ATOMIC FLIX</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
        </View>

        {/* Menu items */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <Ionicons 
                  name={item.icon as any} 
                  size={24} 
                  color={COLORS.text.primary} 
                  style={styles.menuIcon}
                />
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 ATOMIC FLIX
          </Text>
          <Text style={styles.footerSubtext}>
            La meilleure app pour les otakus
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
    // Contour néon pour logo dans le drawer
    borderWidth: 3,
    borderColor: COLORS.border.glow,
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  appVersion: {
    fontSize: 12,
    color: COLORS.text.secondary,
    opacity: 0.8,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    // Contour néon pour items du drawer
    borderWidth: 2,
    borderColor: COLORS.border.secondary,
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  footerSubtext: {
    fontSize: 10,
    color: COLORS.text.muted,
    textAlign: 'center',
  },
});

export default DrawerContent;