import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SectionTitleProps {
  title: string;
  icon?: string;
  colors: any;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, icon = 'pencil', colors }) => {
  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
      marginHorizontal: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.surface,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 4,
      borderBottomWidth: 2,
      borderBottomColor: colors.secondary,
    },
    iconBox: {
      marginRight: 10,
    },
    titleText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      letterSpacing: 1,
      flex: 1,
    },
    underline: {
      height: 2,
      backgroundColor: colors.secondary,
      marginTop: 8,
      borderRadius: 1,
    },
  });

  // Extraire l'emoji du titre s'il en a un
  const emojiRegex = /^(\p{Emoji})\s+(.+)$/u;
  const match = title.match(emojiRegex);
  const displayEmoji = match ? match[1] : '✏️';
  const displayTitle = match ? match[2] : title;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.iconBox}>{displayEmoji}</Text>
        <Text style={styles.titleText}>{displayTitle.toUpperCase()}</Text>
      </View>
      <View style={styles.underline} />
    </View>
  );
};

export default SectionTitle;
