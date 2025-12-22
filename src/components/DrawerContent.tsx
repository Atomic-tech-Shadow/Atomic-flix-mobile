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
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.gradient, { backgroundColor: colors.background.primary }]}>
        {/* Header moderne du drawer */}
        <View style={[
          styles.header,
          {
            backgroundColor: colors.background.card,
            borderBottomColor: colors.secondary,
          }
        ]}>
          <View style={[
            styles.logoContainer,
            {
              backgroundColor: colors.secondary,
              shadowColor: colors.secondary,
            }
          ]}>
            <Image 
              source={require('../../assets/atomic-flix-logo-new.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[
            styles.appName,
            { color: colors.text.primary }
          ]}>ATOMIC FLIX</Text>
          <Text style={[styles.appVersion, { color: colors.text.secondary }]}>v{appVersion}</Text>
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
          <Text style={[styles.footerText, { color: colors.text.secondary }]}>
            © 2025 ATOMIC FLIX
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.text.muted }]}>
            La meilleure app pour les otakus
          </Text>
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
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 2,
  },
  appVersion: {
    fontSize: 12,
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  menuItem: {
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  menuDescription: {
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.8,
  },
  chevron: {
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default DrawerContent;