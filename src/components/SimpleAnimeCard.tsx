import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/newColors';

interface SimpleAnimeCardProps {
  anime: any;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
  languageBadge?: string;
  index: number;
}

const getValidImageUrl = (anime: any): string | null => {
  if (!anime) return null;

  const imageUrl = anime.image;

  // 1. Si l'image est déjà une URL complète, on l'utilise après nettoyage
  if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
    let finalUrl = imageUrl;
    if (finalUrl.startsWith('http://cdn.statically.io')) {
      finalUrl = finalUrl.replace('http://', 'https://');
    }
    return finalUrl;
  }

  // 2. Tenter de construire l'URL Statically à partir de l'ID
  const animeId = anime.animeId || anime.id;
  if (animeId && typeof animeId === 'string' && !animeId.includes('/') && !animeId.includes('http')) {
    return `https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/${animeId}.jpg`;
  }
  
  // 3. URLs relatives
  if (imageUrl && imageUrl.startsWith('/')) {
    return `https://anime-sama.tv${imageUrl}`;
  }
  
  return null;
};

const SimpleAnimeCard: React.FC<SimpleAnimeCardProps> = ({
  anime,
  onPress,
  badge,
  badgeColor,
  languageBadge,
  index
}) => {
  const imageUrl = getValidImageUrl(anime);
  
  const handleImageError = (e: any) => {
    const errorMsg = e.nativeEvent.error || 'Erreur inconnue';
    console.warn(`[Image Error] SimpleAnimeCard: "${anime.title}"`, {
      url: imageUrl,
      error: errorMsg,
      animeId: anime.id || anime.url
    });
    // On pourrait ajouter un état local ici pour afficher l'erreur sur l'UI si besoin
  };

  return (
    <TouchableOpacity
      key={`simple-${anime.id || anime.url || anime.title}-${index}`}
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl || '' }}
          style={styles.image}
          resizeMode="cover"
          onError={handleImageError}
        />
        {!imageUrl && (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={32} color={COLORS.text.muted} />
          </View>
        )}
      </View>
      
      {/* Badge de langue en haut à gauche */}
      {languageBadge && (
        <View style={[styles.languageBadge, { backgroundColor: COLORS.badges.atomic }]}>
          <Text style={styles.badgeText}>{languageBadge}</Text>
        </View>
      )}

      {/* Badge simple en haut à droite */}
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor || COLORS.badges.atomic }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {/* Titre en bas avec gradient */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {anime.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 180,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.background.card,
    borderWidth: 2,
    borderColor: COLORS.border.glow,
  },
  image: {
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 2,
  },
  languageBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 2,
  },
  badgeText: {
    color: COLORS.text.primary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default SimpleAnimeCard;
