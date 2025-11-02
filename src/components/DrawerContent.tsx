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
import { useTheme } from '../contexts/ThemeContext';
import Constants from 'expo-constants';

interface DrawerContentProps extends DrawerContentComponentProps {}

const DrawerContent: React.FC<DrawerContentProps> = ({ navigation }) => {
  const { colors, getGradient } = useTheme();
  const appVersion = Constants.expoConfig?.version || '2.0.0';

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
      <LinearGradient
        colors={getGradient('primary')}
        style={styles.gradient}
      >
        {/* Header du drawer */}
        <View style={[
          styles.header,
          {
            borderBottomColor: colors.secondary,
            shadowColor: colors.secondary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
          }
        ]}>
          <Image 
            source={require('../../assets/atomic-flix-logo-new.png')}
            style={[
              styles.logoImage,
              {
                borderColor: colors.secondary,
                shadowColor: colors.secondary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 20,
              }
            ]}
            resizeMode="contain"
          />
          <Text style={[
            styles.appName,
            {
              color: colors.text.primary,
              textShadowColor: colors.secondary,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 10,
            }
          ]}>ATOMIC FLIX</Text>
          <Text style={[styles.appVersion, { color: colors.text.secondary }]}>Version {appVersion}</Text>
        </View>

        {/* Menu items */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.background.card,
                  borderColor: colors.secondary,
                  shadowColor: colors.secondary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.7,
                  shadowRadius: 10,
                  elevation: 10,
                }
              ]}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <Ionicons 
                  name={item.icon as any} 
                  size={24} 
                  color={colors.text.primary} 
                  style={styles.menuIcon}
                />
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, { color: colors.text.primary }]}>{item.title}</Text>
                  <Text style={[styles.menuDescription, { color: colors.text.secondary }]}>{item.description}</Text>
                </View>
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
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>
            © 2025 ATOMIC FLIX
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.text.muted }]}>
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
    borderBottomWidth: 2,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
    borderWidth: 3,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  appVersion: {
    fontSize: 12,
    opacity: 0.9,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
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
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 2,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  footerSubtext: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default DrawerContent;