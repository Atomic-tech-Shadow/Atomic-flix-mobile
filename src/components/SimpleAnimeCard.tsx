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
  return anime.image || null;
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

      {/* Nouveaux badges isFin et isReporte */}
      <View style={styles.dynamicBadgesContainer}>
        {anime.isFin && (
          <View style={[styles.miniBadge, { backgroundColor: '#FF4757' }]}>
            <Text style={styles.miniBadgeText}>FIN</Text>
          </View>
        )}
        {anime.isReporte && (
          <View style={[styles.miniBadge, { backgroundColor: '#FFA502' }]}>
            <Text style={styles.miniBadgeText}>REPORTE</Text>
          </View>
        )}
        {(anime.currentSeason || anime.currentEpisode || anime.seasonPart) && (
          <View style={[styles.miniBadge, { backgroundColor: COLORS.badges.anime }]}>
            <Text style={styles.miniBadgeText}>
              {anime.currentSeason ? `S${anime.currentSeason.toString().padStart(2, '0')}` : ''}
              {anime.seasonPart ? `P${anime.seasonPart}` : ''}
              {anime.currentEpisode ? `E${anime.currentEpisode.toString().padStart(2, '0')}` : ''}
            </Text>
          </View>
        )}
      </View>

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
  dynamicBadgesContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 3,
    zIndex: 2,
  },
  miniBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  miniBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default SimpleAnimeCard;
