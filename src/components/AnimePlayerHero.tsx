import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { COLORS } from '../constants/newColors';

const { height } = Dimensions.get('window');

interface AnimePlayerHeroProps {
  title: string;
  image: string;
  seasonName?: string;
}

const AnimePlayerHero: React.FC<AnimePlayerHeroProps> = ({
  title,
  image,
  seasonName
}) => {
  return (
    <View style={styles.container}>
      {/* Image DIRECTE sans progressive rendering pour netteté maximale */}
      <Image
        source={{ uri: image }}
        style={[styles.image, { width: '100%', height: 200 }]}
        resizeMode="cover"
        fadeDuration={200}
      />
      
      {/* Contenu SEULEMENT en bas - position absolute */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {seasonName && (
          <Text style={styles.season}>{seasonName}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 200,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.secondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  season: {
    fontSize: 18,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
  },
});

export default AnimePlayerHero;
