import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationService from '../services/pushNotifications';
import UserService from '../services/userService';

interface NotificationSettingsProps {
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [updateNotifications, setUpdateNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userIdValue = await UserService.getUserId();
      setUserId(userIdValue);
      
      const notifEnabled = await AsyncStorage.getItem('@notification_enabled');
      const updateNotifEnabled = await AsyncStorage.getItem('@update_notifications');
      
      setNotificationsEnabled(notifEnabled !== 'false');
      setUpdateNotifications(updateNotifEnabled !== 'false');
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      const userIdValue = await UserService.getUserId();
      
      if (enabled) {
        const success = await PushNotificationService.registerPushToken(userIdValue);
        if (success) {
          setNotificationsEnabled(true);
          await AsyncStorage.setItem('@notification_enabled', 'true');
          Alert.alert('Succès', 'Notifications activées !');
        } else {
          Alert.alert('Erreur', 'Impossible d\'activer les notifications. Vérifiez vos permissions.');
        }
      } else {
        await PushNotificationService.unregisterPushToken(userIdValue);
        setNotificationsEnabled(false);
        await AsyncStorage.setItem('@notification_enabled', 'false');
        Alert.alert('Succès', 'Notifications désactivées.');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la modification des paramètres.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUpdateNotifications = async (enabled: boolean) => {
    try {
      setUpdateNotifications(enabled);
      await AsyncStorage.setItem('@update_notifications', enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Error toggling update notifications:', error);
    }
  };

  const testNotification = async () => {
    Alert.alert(
      'Test de notification',
      'Une notification de test sera envoyée si les notifications sont activées.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.header}
      >
        <Text style={styles.title}>Paramètres de notification</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        {/* ID Utilisateur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations utilisateur</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userIdText}>ID: {userId}</Text>
            <Text style={styles.userIdSubText}>
              Cet identifiant unique permet de vous envoyer des notifications personnalisées
            </Text>
          </View>
        </View>

        {/* Notifications générales */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notifications push</Text>
              <Text style={styles.settingDescription}>
                Recevoir les notifications de l'application
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              disabled={isLoading}
              trackColor={{ false: '#767577', true: '#00bcd4' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Notifications de mise à jour */}
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notifications de mise à jour</Text>
              <Text style={styles.settingDescription}>
                Être averti des nouvelles versions de l'application
              </Text>
            </View>
            <Switch
              value={updateNotifications && notificationsEnabled}
              onValueChange={toggleUpdateNotifications}
              disabled={!notificationsEnabled}
              trackColor={{ false: '#767577', true: '#00bcd4' }}
              thumbColor={updateNotifications ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Test notification */}
        <TouchableOpacity
          style={[styles.testButton, { opacity: notificationsEnabled ? 1 : 0.5 }]}
          onPress={testNotification}
          disabled={!notificationsEnabled}
        >
          <Text style={styles.testButtonText}>Tester les notifications</Text>
        </TouchableOpacity>

        {/* Informations */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ Informations importantes</Text>
          <Text style={styles.infoText}>
            • Les notifications ne fonctionnent que sur des appareils physiques{'\n'}
            • Vous devez autoriser les notifications dans les paramètres de votre appareil{'\n'}
            • Les notifications de mise à jour vous aident à rester à jour avec les dernières fonctionnalités
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
  },
  userIdText: {
    color: '#00bcd4',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  userIdSubText: {
    color: '#aaaaaa',
    fontSize: 12,
    lineHeight: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 13,
    color: '#aaaaaa',
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: '#00bcd4',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginVertical: 15,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#aaaaaa',
    lineHeight: 18,
  },
});

export default NotificationSettings;