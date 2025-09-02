import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import OptimizedTouchable from './OptimizedTouchable';
import { COLORS } from '../constants/newColors';

interface AnimeCardProps {
  anime: {
    id?: string;
    title: string;
    image: string;
    language?: any;
    url?: string;
    contentType?: string;
  };
  index: number;
  onPress: () => void;
  style?: any;
  badgeText?: string;
  badgeStyle?: any;
}

/**
 * 🔥 Carte d'anime optimisée avec React.memo pour éviter les re-renders
 * Utilise des animations natives et des optimisations d'images
 */
const MemoizedAnimeCard: React.FC<AnimeCardProps> = memo(({
  anime,
  index,
  onPress,
  style,
  badgeText,
  badgeStyle
}) => {
  const getLanguageBadge = (language: any): string => {
    if (!language) return 'VO';
    if (language.vf) return 'VF';
    if (language.vostfr) return 'VOSTFR';
    if (language.vjstfr) return 'VJSTFR';
    return 'VO';
  };

  return (
    <OptimizedTouchable
      key={`anime-${anime.id || anime.title.replace(/\s+/g, '-')}-${index}`}
      style={[styles.card, style]}
      onPress={onPress}
      scaleOnPress={true}
      scaleFactor={0.98}
    >
      <Image
        source={{ uri: anime.image }}
        style={styles.cardImage}
        resizeMode="cover"
        fadeDuration={200}
      />
      
      {/* Badge personnalisé ou badge langue */}
      {badgeText ? (
        <View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      ) : anime.language && (
        <View style={styles.languageBadge}>
          <Text style={styles.languageBadgeText}>
            {getLanguageBadge(anime.language)}
          </Text>
        </View>
      )}
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {anime.title}
          </Text>
        </View>
      </LinearGradient>
    </OptimizedTouchable>
  );
}, (prevProps, nextProps) => {
  // Comparaison optimisée pour éviter les re-renders inutiles
  return (
    prevProps.anime.id === nextProps.anime.id &&
    prevProps.anime.title === nextProps.anime.title &&
    prevProps.anime.image === nextProps.anime.image &&
    prevProps.index === nextProps.index
  );
});

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 180,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
  },
  badgeText: {
    color: COLORS.text.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  languageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 188, 212, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
  },
  languageBadgeText: {
    color: COLORS.text.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  cardTitle: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default MemoizedAnimeCard;