import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/newColors';
import ImageWithPlaceholder from './ImageWithPlaceholder';

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
      {/* Image nette directement - pas de wrappers supplémentaires */}
      <ImageWithPlaceholder
        uri={image}
        style={styles.image}
        resizeMode="cover"
        fadeDuration={200}
      />
      
      {/* Overlay gradient simple en bas */}
      <View style={styles.overlay} />
      
      {/* Contenu textuel par-dessus */}
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
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'column',
    gap: 4,
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: COLORS.text.primary,
    fontSize: 10,
    fontWeight: '500',
  },
});

export default AnimeDetailHero;
