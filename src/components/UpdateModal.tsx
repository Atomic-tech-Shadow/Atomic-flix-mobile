import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AppUpdate {
  version: string;
  changelog: string;
  downloadUrl: string;
  isRequired: boolean;
  releaseDate: string;
}

interface UpdateModalProps {
  visible: boolean;
  update: AppUpdate | null;
  onUpdate: () => void;
  onLater: () => void;
  onIgnore?: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  update,
  onUpdate,
  onLater,
  onIgnore,
}) => {
  if (!update) return null;

  const handleUpdate = async () => {
    try {
      await Linking.openURL(update.downloadUrl);
      onUpdate();
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Impossible d\'ouvrir le lien de téléchargement. Veuillez vérifier votre connexion.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatChangelog = (changelog: string) => {
    return changelog
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.startsWith('- ') ? line : `• ${line}`)
      .join('\n');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={update.isRequired ? undefined : onLater}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.updateIcon}>🎉</Text>
            <Text style={styles.title}>Nouvelle version disponible</Text>
            <Text style={styles.version}>ATOMIC FLIX {update.version}</Text>
            <Text style={styles.releaseDate}>
              Publiée le {formatDate(update.releaseDate)}
            </Text>
          </View>

          {/* Changelog */}
          <ScrollView style={styles.changelogContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.changelogTitle}>✨ Nouveautés :</Text>
            <Text style={styles.changelogText}>
              {formatChangelog(update.changelog)}
            </Text>
          </ScrollView>

          {/* Boutons */}
          <View style={styles.buttonsContainer}>
            {/* Bouton principal Mettre à jour */}
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00bcd4', '#0ea5e9']}
                style={styles.updateButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.updateButtonText}>
                  📥 Télécharger maintenant
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Boutons secondaires */}
            {!update.isRequired && (
              <View style={styles.secondaryButtonsContainer}>
                <TouchableOpacity
                  style={styles.laterButton}
                  onPress={onLater}
                  activeOpacity={0.8}
                >
                  <Text style={styles.laterButtonText}>⏰ Plus tard</Text>
                </TouchableOpacity>

                {onIgnore && (
                  <TouchableOpacity
                    style={styles.ignoreButton}
                    onPress={onIgnore}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.ignoreButtonText}>🚫 Ignorer cette version</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Message mise à jour obligatoire */}
            {update.isRequired && (
              <View style={styles.requiredContainer}>
                <Text style={styles.requiredText}>
                  ⚠️ Cette mise à jour est obligatoire pour continuer à utiliser l'application
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 188, 212, 0.3)',
    maxHeight: '80%',
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  updateIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  version: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00bcd4',
    textAlign: 'center',
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  changelogContainer: {
    maxHeight: 200,
    paddingHorizontal: 24,
    marginVertical: 8,
  },
  changelogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00bcd4',
    marginBottom: 12,
  },
  changelogText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  updateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 12,
  },
  updateButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  laterButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#00bcd4',
    fontSize: 14,
    fontWeight: '600',
  },
  ignoreButton: {
    flex: 1,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  ignoreButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  requiredContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  requiredText: {
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default UpdateModal;