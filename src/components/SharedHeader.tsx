import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/newColors';
import GlobalSearchModal from './GlobalSearchModal';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SharedHeaderProps {
  onSearchPress?: () => void;
}

const SharedHeader: React.FC<SharedHeaderProps> = ({ 
  onSearchPress
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showGlobalSearchModal, setShowGlobalSearchModal] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));

  const handleSearchPress = () => {
    // Si un onSearchPress spécifique est fourni (comme dans HomeScreen), l'utiliser
    if (onSearchPress) {
      onSearchPress();
    } else {
      // Sinon, ouvrir le modal de recherche globale
      setShowGlobalSearchModal(true);
    }
  };

  const handleMenuPress = () => {
    setShowMenuDrawer(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenuDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowMenuDrawer(false);
    });
  };

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    closeMenuDrawer();
    // Navigation avec vérification des paramètres requis
    switch (screenName) {
      case 'Home':
      case 'About':
      case 'NotFound':
      case 'PrivacyPolicy':
      case 'TermsOfService':
        navigation.navigate(screenName);
        break;
      default:
        // Pour les écrans qui nécessitent des paramètres, naviguer vers Home par défaut
        navigation.navigate('Home');
        break;
    }
  };

  // Utiliser la version d'app.json via Constants Expo
  const appVersion = Constants.expoConfig?.version || '3.7.0';

  return (
    <View style={styles.mobileHeader}>
      <View style={styles.headerRow}>
        <View style={styles.logoSection}>
          <Image 
            source={require('../../assets/atomic-flix-logo-new.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primary, COLORS.accent]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.logoTextGradient}
          >
            <Text style={styles.logoText}>ATOMIC FLIX</Text>
          </LinearGradient>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={handleSearchPress}
          >
            <Ionicons name="search" size={22} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={handleMenuPress}
          >
            <Ionicons name="menu" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showMenuDrawer}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenuDrawer}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity 
            style={styles.drawerBackground}
            onPress={closeMenuDrawer}
          />
          <Animated.View 
            style={[
              styles.drawerContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <View style={styles.drawerHeader}>
              <Image 
                source={require('../../assets/atomic-flix-logo-new.png')}
                style={styles.drawerLogo}
                resizeMode="contain"
              />
              <LinearGradient
                colors={[COLORS.secondary, COLORS.primary, COLORS.secondary]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.drawerTitleGradient}
              >
                <Text style={styles.drawerTitle}>ATOMIC FLIX</Text>
              </LinearGradient>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeMenuDrawer}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View style={styles.menuItems}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToScreen('Home')}
              >
                <Ionicons name="home" size={20} color={COLORS.secondary} />
                <Text style={styles.menuItemText}>Accueil</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToScreen('About')}
              >
                <Ionicons name="information-circle" size={20} color={COLORS.secondary} />
                <Text style={styles.menuItemText}>À propos</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToScreen('PrivacyPolicy')}
              >
                <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
                <Text style={styles.menuItemText}>Politique de confidentialité</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigateToScreen('TermsOfService')}
              >
                <Ionicons name="document-text" size={20} color={COLORS.secondary} />
                <Text style={styles.menuItemText}>Conditions d'utilisation</Text>
              </TouchableOpacity>
            </View>

            {/* Footer du menu */}
            <View style={styles.drawerFooter}>
              <Text style={styles.footerText}>Version {appVersion}</Text>
              <Text style={styles.footerSubtext}>Développé par Cid AKUE</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal de recherche globale */}
      <GlobalSearchModal
        visible={showGlobalSearchModal}
        onClose={() => setShowGlobalSearchModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Header mobile exact
  mobileHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 35,
    height: 35,
    borderRadius: 60, // Pour rendre le logo rond
    marginRight: 8,
  },
  logoTextGradient: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 188, 212, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Styles pour le menu drawer
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  drawerBackground: {
    flex: 1,
  },
  drawerContainer: {
    width: 280,
    backgroundColor: COLORS.primary, // Violet du logo
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: COLORS.secondary, // Cyan du logo
    paddingTop: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent, // Rose du logo
  },
  drawerLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  drawerTitleGradient: {
    flex: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 188, 212, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 8,
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.card,
  },
  menuItemText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 15,
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.card,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default SharedHeader;