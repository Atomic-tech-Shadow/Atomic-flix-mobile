import React, { memo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import OptimizedTouchable from './OptimizedTouchable';
import { COLORS, getThemedColors } from '../constants/newColors';
import { getLanguageBadgeText } from '../utils/languageUtils';
import { useTheme } from '../contexts/ThemeContext';

const getValidImageUrl = (anime: any): string | null => {
  if (!anime) return null;
  const imageUrl = anime.image;
  if (imageUrl && imageUrl.startsWith('https')) {
    return imageUrl;
  }
  const animeId = anime.animeId || anime.id;
  if (animeId && typeof animeId === 'string' && !animeId.includes('/') && !animeId.includes('http')) {
    return `https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/${animeId}.jpg`;
  }
  if (imageUrl && imageUrl.startsWith('/')) {
    return `https://anime-sama.tv${imageUrl}`;
  }
  return imageUrl || null;
};

interface AnimeCardProps {
  anime: {
    id?: string;
    animeId?: string;
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
  const imageUrl = getValidImageUrl(anime);
  
  const handleImageError = (e: any) => {
    const errorMsg = e.nativeEvent.error || 'Erreur inconnue';
    console.warn(`[Image Error] MemoizedAnimeCard: "${anime.title}"`, {
      url: imageUrl,
      error: errorMsg,
      animeId: anime.id || anime.url
    });
  };

  // Les cartes doivent toujours avoir un fond sombre pour un bon affichage des images
  const darkColors = getThemedColors(true);
  
  const dynamicStyles = StyleSheet.create({
    cardWrapper: {
      backgroundColor: darkColors.background.secondary,
    },
  });

  return (
    <View style={[styles.cardWrapper, dynamicStyles.cardWrapper, style]}>
      <OptimizedTouchable
        key={`anime-${anime.id || anime.title.replace(/\s+/g, '-')}-${index}`}
        style={styles.card}
        onPress={onPress}
        scaleOnPress={true}
        scaleFactor={0.98}
      >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl || '' }}
          style={styles.cardImage}
          resizeMode="cover"
          fadeDuration={0}
          onError={handleImageError}
        />
        {!imageUrl && (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={32} color={COLORS.text.muted} />
          </View>
        )}
      </View>
      
      {/* Badge personnalisé ou badge langue */}
      {badgeText ? (
        <View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      ) : anime.language && (
        <View style={styles.languageBadge}>
          <Text style={styles.languageBadgeText}>
            {getLanguageBadgeText(anime.language)}
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
    </View>
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
  cardWrapper: {
    width: 120,
    height: 180,
    marginRight: 12,
    borderRadius: 8,
    zIndex: 10000,
    position: 'relative',
    // Effet de glow cosmique sur le wrapper
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden', // Gardé ici pour couper les coins de l'image
    // Bordure néon violette - Effet "I am Atomic"
    borderWidth: 2,
    borderColor: COLORS.border.glow, // Violet néon intense
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: COLORS.background.secondary,
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.badges.atomic, // Violet éclatant
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
    // Effet glow sur les badges
    shadowColor: COLORS.badges.atomic,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border.atomic,
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
    backgroundColor: COLORS.badges.vostfr, // Violet pour badges langue
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
    // Effet glow violet pour badges langue
    shadowColor: COLORS.badges.vostfr,
    shadowOpacity: 0.5,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.secondary,
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