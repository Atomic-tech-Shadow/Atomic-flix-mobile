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
      justifyContent: 'flex-start',
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
      paddingVertical: 8,
      borderRadius: 4,
    },
    iconBox: {
      marginRight: 10,
      fontSize: 22,
    },
    titleText: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.secondary,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      textShadowColor: 'rgba(0, 212, 255, 0.5)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
    },
    underline: {
      height: 3,
      width: 40,
      backgroundColor: colors.secondary,
      marginTop: -4,
      borderRadius: 2,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 5,
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
        <Text style={styles.titleText}>{displayTitle}</Text>
      </View>
      <View style={styles.underline} />
    </View>
  );
};

export default SectionTitle;
