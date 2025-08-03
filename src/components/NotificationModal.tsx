import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EpisodeNotification } from '../utils/notificationService';

const { width } = Dimensions.get('window');

interface NotificationModalProps {
  visible: boolean;
  notifications: EpisodeNotification[];
  onClose: () => void;
  onNotificationPress: (notification: EpisodeNotification) => void;
  onMarkAllRead: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  notifications,
  onClose,
  onNotificationPress,
  onMarkAllRead,
}) => {
  const unreadNotifications = notifications.filter(n => !n.read);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'anime': return '📺';
      case 'manga': return '📖';
      case 'film': return '🎬';
      default: return '📺';
    }
  };

  const renderNotification = (notification: EpisodeNotification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification
      ]}
      onPress={() => onNotificationPress(notification)}
    >
      {/* Image de l'anime/manga */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: notification.image }}
          style={styles.animeImage}
          resizeMode="cover"
        />
        <View style={styles.typeOverlay}>
          <Text style={styles.typeEmoji}>
            {getTypeEmoji(notification.type)}
          </Text>
        </View>
      </View>

      {/* Contenu de la notification */}
      <View style={styles.notificationContent}>
        <View style={styles.titleRow}>
          <Text style={styles.animeTitle} numberOfLines={2}>
            {notification.animeTitle}
          </Text>
          {!notification.read && (
            <View style={styles.unreadDot} />
          )}
        </View>

        {notification.episodeInfo && (
          <View style={styles.episodeInfoContainer}>
            <Ionicons name="play-circle" size={16} color="#00D4FF" />
            <Text style={styles.episodeInfo}>
              {notification.episodeInfo}
            </Text>
          </View>
        )}

        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>

        <Text style={styles.timestamp}>
          {formatTime(notification.timestamp)}
        </Text>
      </View>

      {/* Icône de lecture */}
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadNotifications.length > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {unreadNotifications.length}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerActions}>
            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={onMarkAllRead}
              >
                <Text style={styles.markAllText}>Tout lire</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Liste des notifications */}
        <ScrollView
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={64} color="#666" />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptySubtitle}>
                Activez les notifications pour être informé des nouveaux épisodes
              </Text>
            </View>
          ) : (
            notifications.map(renderNotification)
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  markAllText: {
    color: '#00bcd4',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  unreadNotification: {
    backgroundColor: '#1e1e3a',
    borderLeftWidth: 3,
    borderLeftColor: '#00bcd4',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  animeImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  typeOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeEmoji: {
    fontSize: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#00bcd4',
    borderRadius: 4,
    marginTop: 4,
  },
  episodeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  episodeInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00bcd4',
    marginLeft: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 4,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 12,
    color: '#888888',
  },
  playButton: {
    padding: 8,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
});

export default NotificationModal;