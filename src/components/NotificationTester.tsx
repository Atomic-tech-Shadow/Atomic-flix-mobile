import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import TrendingNotificationService from '../services/TrendingNotificationService';

interface NotificationTesterProps {
  isVisible?: boolean;
}

const NotificationTester: React.FC<NotificationTesterProps> = ({ isVisible = false }) => {
  const trendingService = TrendingNotificationService.getInstance();

  const handleTestNotification = async () => {
    try {
      await trendingService.sendTestNotification();
      Alert.alert(
        'Test envoyé',
        'Une notification de test devrait apparaître dans quelques secondes.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer la notification de test.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleCheckPermissions = async () => {
    try {
      const status = await trendingService.getPermissionStatus();
      let message = '';
      
      switch (status) {
        case 'granted':
          message = 'Notifications autorisées et prêtes';
          break;
        case 'can_ask':
          message = 'Permissions pas encore demandées';
          break;
        case 'denied':
          message = 'Notifications refusées par l\'utilisateur';
          break;
        case 'error':
          message = 'Erreur lors de la vérification';
          break;
        default:
          message = 'Statut inconnu';
      }
      
      Alert.alert(
        'Statut des notifications',
        message,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible de vérifier les permissions.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Notifications Trending</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleTestNotification}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>🧪 Tester Notification</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={handleCheckPermissions}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>📋 Vérifier Permissions</Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>
        Note: Les notifications ne fonctionnent que sur appareil physique
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  title: {
    color: '#00bcd4',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00bcd4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0, 188, 212, 0.3)',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  note: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default NotificationTester;