import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/newColors';
import { NotificationSettings as SettingsType } from '../types/notifications';
import { Ionicons } from '@expo/vector-icons';

interface NotificationSettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
  onTestNotification: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onSettingsChange,
  onTestNotification
}) => {
  const updateSetting = (key: keyof SettingsType, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const SettingRow: React.FC<{
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon: string;
    disabled?: boolean;
  }> = ({ title, description, value, onValueChange, icon, disabled = false }) => (
    <View style={[styles.settingRow, disabled && styles.disabledRow]}>
      <View style={styles.settingContent}>
        <View style={styles.settingHeader}>
          <Ionicons name={icon as any} size={20} color={COLORS.text.accent} />
          <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.settingDescription, disabled && styles.disabledText]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: 'rgba(255, 255, 255, 0.2)',
          true: COLORS.secondary
        }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Paramètres des notifications</Text>
          <Text style={styles.subtitle}>
            Personnalisez vos notifications pour ne rien manquer
          </Text>
        </View>

        {/* Paramètres généraux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Général</Text>
          
          <SettingRow
            title="Notifications activées"
            description="Activer/désactiver toutes les notifications push"
            value={settings.enabled}
            onValueChange={(value) => updateSetting('enabled', value)}
            icon="notifications"
          />
        </View>

        {/* Types de contenu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types de contenu</Text>
          
          <SettingRow
            title="📺 Nouveaux épisodes"
            description="Être notifié quand un nouvel épisode sort"
            value={settings.newEpisodes}
            onValueChange={(value) => updateSetting('newEpisodes', value)}
            icon="tv"
            disabled={!settings.enabled}
          />
          
          <SettingRow
            title="📖 Nouveaux chapitres manga"
            description="Être notifié des nouveaux chapitres de manga"
            value={settings.newMangas}
            onValueChange={(value) => updateSetting('newMangas', value)}
            icon="book"
            disabled={!settings.enabled}
          />
          
          <SettingRow
            title="🎬 Nouveaux films"
            description="Être notifié des nouveaux films disponibles"
            value={settings.newFilms}
            onValueChange={(value) => updateSetting('newFilms', value)}
            icon="film"
            disabled={!settings.enabled}
          />
          
          <SettingRow
            title="⏰ Planning et rappels"
            description="Rappels pour les sorties programmées"
            value={settings.planning}
            onValueChange={(value) => updateSetting('planning', value)}
            icon="calendar"
            disabled={!settings.enabled}
          />
        </View>

        {/* Paramètres d'expérience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expérience</Text>
          
          <SettingRow
            title="🔊 Sons"
            description="Jouer un son lors de la réception"
            value={settings.sound}
            onValueChange={(value) => updateSetting('sound', value)}
            icon="volume-high"
            disabled={!settings.enabled}
          />
          
          <SettingRow
            title="📳 Vibrations"
            description="Vibrer lors de la réception"
            value={settings.vibration}
            onValueChange={(value) => updateSetting('vibration', value)}
            icon="phone-portrait"
            disabled={!settings.enabled}
          />
        </View>

        {/* Test des notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test</Text>
          <TouchableOpacity
            style={[styles.testButton, !settings.enabled && styles.disabledButton]}
            onPress={onTestNotification}
            disabled={!settings.enabled}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
            <Text style={styles.testButtonText}>
              Envoyer une notification de test
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.accent,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  disabledRow: {
    opacity: 0.5,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 10,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginLeft: 30,
  },
  disabledText: {
    color: COLORS.text.muted,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});