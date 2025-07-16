import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SharedHeaderProps {
  showBackButton?: boolean;
  onSearchPress?: () => void;
}

const SharedHeader: React.FC<SharedHeaderProps> = ({ 
  showBackButton = false,
  onSearchPress 
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.mobileHeader}>
      <View style={styles.headerRow}>
        {/* Logo ATOMIC FLIX avec symbole atomique */}
        <View style={styles.logoSection}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
          <Image 
            source={require('../../assets/atomic-flix-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Icônes navigation droite */}
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={onSearchPress}
          >
            <Ionicons name="search" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="notifications" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="menu" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Header mobile exact
  mobileHeader: {
    backgroundColor: '#0a0a1a',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  logoImage: {
    width: 120,
    height: 35,
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default SharedHeader;