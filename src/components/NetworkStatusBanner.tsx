import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/newColors';

interface NetworkStatusBannerProps {
  isVisible: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  isVisible,
  onRetry,
  onDismiss
}) => {
  const [slideAnim] = React.useState(new Animated.Value(-80));

  React.useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -80,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [isVisible, slideAnim]);

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="wifi-outline" size={24} color={COLORS.text.primary} />
          <View style={styles.offlineIndicator} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Connexion interrompue</Text>
          <Text style={styles.subtitle}>Vérifiez votre connexion internet</Text>
        </View>

        <View style={styles.actionsContainer}>
          {onRetry && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
          )}
          
          {onDismiss && (
            <TouchableOpacity 
              style={styles.dismissButton}
              onPress={onDismiss}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: COLORS.error, // Rouge atomique
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text.primary + '33',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16, // Account for status bar
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  offlineIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text.primary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    color: COLORS.text.primary + 'E6',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButton: {
    padding: 8,
    marginRight: 4,
    borderRadius: 20,
    backgroundColor: COLORS.text.primary + '33',
  },
  dismissButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.text.primary + '1A',
  },
});

export default NetworkStatusBanner;