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
      marginBottom: 20,
      marginTop: 10,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(168, 85, 247, 0.05)',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: 'rgba(168, 85, 247, 0.2)',
      // Effet 3D Holographique
      transform: [{ perspective: 1000 }, { rotateX: '10deg' }],
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
    },
    iconBox: {
      marginRight: 12,
      fontSize: 24,
      textShadowColor: colors.secondary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 15,
    },
    titleText: {
      fontSize: 22,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 3,
      textTransform: 'uppercase',
      // Lueur Holographique
      textShadowColor: colors.secondary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 20,
    },
    hologramLine: {
      position: 'absolute',
      bottom: -2,
      height: 2,
      width: '80%',
      backgroundColor: colors.secondary,
      opacity: 0.6,
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
        <Text style={styles.titleText}>{displayTitle}</Text>
        <View style={styles.hologramLine} />
      </View>
    </View>
  );
};

export default SectionTitle;
