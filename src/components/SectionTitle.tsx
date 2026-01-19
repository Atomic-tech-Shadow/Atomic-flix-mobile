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
      backgroundColor: 'rgba(168, 85, 247, 0.12)',
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'rgba(168, 85, 247, 0.4)',
      // Effet 3D Holographique plus poussé
      transform: [
        { perspective: 1000 }, 
        { rotateX: '15deg' }, 
        { rotateY: '-10deg' },
        { skewX: '-2deg' }
      ],
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 15,
    },
    iconBox: {
      marginRight: 15,
      fontSize: 28,
      textShadowColor: colors.secondary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 20,
    },
    titleText: {
      fontSize: 24,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 4,
      textTransform: 'uppercase',
      // Lueur Holographique intense
      textShadowColor: colors.secondary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 25,
    },
    hologramLine: {
      position: 'absolute',
      bottom: -3,
      height: 3,
      width: '90%',
      backgroundColor: colors.secondary,
      opacity: 0.8,
      borderRadius: 2,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 10,
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
