import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/newColors';

interface NotificationBadgeProps {
  count: number;
  onPress: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  onPress
}) => {
  if (count === 0) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.text}>
          {count > 99 ? '99+' : count.toString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  text: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});