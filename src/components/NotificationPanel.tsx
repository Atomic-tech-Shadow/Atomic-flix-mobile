import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../constants/newColors';
import { PushNotification } from '../types/notifications';

interface NotificationPanelProps {
  notifications: PushNotification[];
  onNotificationPress: (notification: PushNotification) => void;
  onMarkAllRead: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onSettingsPress?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onNotificationPress,
  onMarkAllRead,
  onRefresh,
  isRefreshing = false,
  onSettingsPress
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'episode': return '📺';
      case 'manga': return '📖';
      case 'film': return '🎬';
      case 'planning': return '⏰';
      default: return '📺';
    }
  };

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}j`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return 'maintenant';
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'episode': return '#8B5DFF';
      case 'manga': return '#FF6B9D';
      case 'film': return '#00D4FF';
      case 'planning': return '#9CA3AF';
      default: return '#8B5DFF';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header avec actions */}
      <View style={styles.header}>
        <Text style={styles.title}>
          🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        <View style={styles.headerActions}>
          {onSettingsPress && (
            <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
              <Text style={styles.settingsText}>⚙️</Text>
            </TouchableOpacity>
          )}
          {unreadCount > 0 && (
            <TouchableOpacity onPress={onMarkAllRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Tout marquer lu</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Liste des notifications */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.secondary}
            colors={[COLORS.secondary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySubtitle}>
              Les nouvelles notifications apparaîtront ici
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.unreadItem
              ]}
              onPress={() => onNotificationPress(notification)}
            >
              <View style={styles.notificationContent}>
                {/* Image et icône de type */}
                <View style={styles.imageContainer}>
                  {notification.image ? (
                    <Image
                      source={{ uri: notification.image }}
                      style={styles.notificationImage}
                    />
                  ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: getTypeColor(notification.type) }]}>
                      <Text style={styles.placeholderText}>
                        {getTypeIcon(notification.type)}
                      </Text>
                    </View>
                  )}
                  
                  {/* Badge de type */}
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(notification.type) }]}>
                    <Text style={styles.typeBadgeText}>
                      {getTypeIcon(notification.type)}
                    </Text>
                  </View>
                </View>

                {/* Contenu textuel */}
                <View style={styles.textContent}>
                  <Text style={[styles.notificationTitle, !notification.read && styles.unreadTitle]}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationBody} numberOfLines={2}>
                    {notification.body}
                  </Text>
                  <Text style={styles.timestamp}>
                    {getTimeAgo(notification.timestamp)}
                  </Text>
                </View>

                {/* Indicateur non lu */}
                {!notification.read && (
                  <View style={styles.unreadIndicator} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
  },
  settingsText: {
    fontSize: 16,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
  },
  markAllText: {
    color: COLORS.text.accent,
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  unreadItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  notificationImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  typeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  typeBadgeText: {
    fontSize: 10,
  },
  textContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  unreadTitle: {
    color: COLORS.text.accent,
  },
  notificationBody: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginLeft: 8,
    alignSelf: 'center',
  },
});