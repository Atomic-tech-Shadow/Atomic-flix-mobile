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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import Constants from 'expo-constants';

import { COLORS } from '../constants/newColors';

const packageJson = require('../../package.json');

interface DrawerContentProps extends DrawerContentComponentProps {}

const DrawerContent: React.FC<DrawerContentProps> = ({ navigation }) => {
  const { colors, getGradient } = useTheme();
  const appVersion = packageJson.version;

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
    // Utiliser HomeStack comme cible si la route est Home
    const targetRoute = route === 'Home' ? 'HomeStack' : route;
    navigation.navigate(targetRoute);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.gradient, { backgroundColor: colors.background.primary }]}>
        {/* Header moderne du drawer */}
        <View style={[
          styles.header,
          {
            backgroundColor: colors.background.card,
          }
        ]}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/atomic-flix-logo-new.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.appVersion, { color: colors.text.secondary }]}>v3.1.0</Text>
        </View>

        {/* Menu items modernes */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.background.card,
                  borderLeftColor: colors.secondary,
                }
              ]}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.6}
            >
              <View style={styles.menuItemContent}>
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: `${colors.secondary}15` }
                ]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={28} 
                    color={colors.secondary} 
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, { color: colors.text.primary }]}>{item.title}</Text>
                  <Text style={[styles.menuDescription, { color: colors.text.secondary }]}>{item.description}</Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={colors.secondary}
                  style={styles.chevron}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={[
          styles.footer,
          {
            borderTopColor: colors.secondary,
            shadowColor: colors.secondary,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
          }
        ]}>
          <Text style={[styles.footerText, { color: colors.text.primary }]}>Dev: cid AKUE</Text>
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>© 2026 ATOMIC FLIX</Text>
          <Text style={[styles.footerSubtext, { color: colors.text.muted }]}>La meilleure app pour les otakus</Text>
        </View>
      </View>
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
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    logoContainer: {
      width: '100%',
      height: 80,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 5,
    },
    logoImage: {
      width: '70%',
      height: '70%',
    },
    appVersion: {
      fontSize: 11,
      fontWeight: '600',
      color: COLORS.text.muted,
      letterSpacing: 2,
    },
    menuContainer: {
      flex: 1,
      paddingVertical: 20,
      paddingHorizontal: 15,
    },
    menuItem: {
      marginVertical: 2,
      borderRadius: 12,
      overflow: 'hidden',
    },
    menuItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      gap: 15,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    menuTextContainer: {
      flex: 1,
    },
    menuTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    menuDescription: {
      fontSize: 12,
      opacity: 0.5,
      marginTop: 2,
    },
    chevron: {
      opacity: 0.2,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 25,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    footerText: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    footerSubtext: {
      fontSize: 10,
      textAlign: 'center',
      opacity: 0.4,
    },
});

export default DrawerContent;