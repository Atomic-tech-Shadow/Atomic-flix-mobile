import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { COLORS } from '../constants/newColors';

const { height } = Dimensions.get('window');

interface AnimeDetailHeroProps {
  title: string;
  image: string;
  progressInfo: string;
  correspondence: string;
  genres: string[];
}

const AnimeDetailHero: React.FC<AnimeDetailHeroProps> = ({
  title,
  image,
  progressInfo,
  correspondence,
  genres
}) => {
  return (
    <View style={styles.container}>
      {/* Image DIRECTE sans progressive rendering pour netteté maximale */}
      <Image
        source={{ uri: image }}
        style={styles.image}
        resizeMode="cover"
        fadeDuration={200}
      />
      
      {/* Contenu SEULEMENT en bas - position absolute */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Progrès: {progressInfo}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Correspondance: {correspondence}</Text>
          </View>
          {genres && genres.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Genre: {genres.join(', ')}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: height * 0.35,
    overflow: 'hidden',
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
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'column',
    gap: 4,
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: COLORS.text.primary,
    fontSize: 10,
    fontWeight: '500',
  },
});

export default AnimeDetailHero;
