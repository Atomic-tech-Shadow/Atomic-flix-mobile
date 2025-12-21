import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.heroContainer}>
      <View style={styles.heroImageContainer}>
        <ImageWithPlaceholder
          uri={image}
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', COLORS.primary + '4D', COLORS.primary + 'CC', COLORS.primary]}
          style={styles.heroGradient}
        />
        
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{title}</Text>
          
          <View style={styles.heroBadgesCompact}>
            <View style={styles.heroBadgeSmall}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Progrès: {progressInfo}</Text>
            </View>
            <View style={styles.heroBadgeSmall}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Correspondance: {correspondence}</Text>
            </View>
            {genres && genres.length > 0 && (
              <View style={[styles.heroBadgeSmall, styles.genreBadge]}>
                <View style={[styles.badgeDot, styles.genreDot]} />
                <Text style={styles.badgeText}>
                  Genre: {genres.join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    position: 'relative',
    height: height * 0.35,
    backgroundColor: 'transparent',
  },
  heroImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  heroBadgesCompact: {
    alignItems: 'flex-start',
    marginBottom: 8,
    marginTop: 8,
    maxWidth: '75%',
  },
  heroBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.primary}cc`,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginBottom: 3,
    borderWidth: 1,
    borderColor: `${COLORS.accent}66`,
    alignSelf: 'flex-start',
    maxWidth: '90%',
    flexWrap: 'wrap',
  },
  badgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginRight: 6,
    marginTop: 4,
  },
  badgeText: {
    color: COLORS.text.primary,
    fontSize: 10,
    fontWeight: '500',
  },
  genreBadge: {
    backgroundColor: `${COLORS.badges.atomic}66`,
    borderColor: COLORS.badges.atomic,
  },
  genreDot: {
    backgroundColor: COLORS.badges.atomic,
  },
});

export default AnimeDetailHero;
