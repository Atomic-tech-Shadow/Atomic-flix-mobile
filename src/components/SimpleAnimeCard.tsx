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
  onRemove?: () => void;
  showRemoveButton?: boolean;
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
  index,
  onRemove,
  showRemoveButton = false
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
        
        {/* Bouton de suppression Overlay */}
        {showRemoveButton && onRemove && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={24} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Badge de temps/heure (si fourni par badge prop) */}
      {badge ? (
        <View style={[styles.timeBadge, { backgroundColor: badgeColor || COLORS.secondary }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}

      {/* Bouton de suppression spécifique pour l'historique (sous le drapeau) */}
      {showRemoveButton && onRemove && (
        <TouchableOpacity 
          style={styles.historyRemoveButtonUnderFlag}
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={18} color={COLORS.error} />
        </TouchableOpacity>
      )}

      {/* Nouveaux badges isFin et isReporte et Langue */}
      <View style={styles.dynamicBadgesContainer}>
        {languageBadge ? (
          <View style={styles.flagContainer}>
            <Text style={styles.miniBadgeText}>{languageBadge.includes('🇫🇷') || languageBadge.includes('VF') ? '🇫🇷' : languageBadge.includes('🇯🇵') || languageBadge.includes('VO') ? '🇯🇵' : languageBadge.includes('🇺🇸') || languageBadge.includes('VA') ? '🇺🇸' : languageBadge}</Text>
          </View>
        ) : null}
        {badge === undefined && (anime.infoText || anime.currentSeason || anime.currentEpisode || anime.seasonPart) ? (
          <View style={[styles.miniBadge, { backgroundColor: COLORS.badges.anime }]}>
            <Text style={styles.miniBadgeText}>
              {anime.infoText || `${anime.currentSeason ? `S${anime.currentSeason.toString().padStart(2, '0')}` : ''}${anime.seasonPart ? `P${anime.seasonPart}` : ''}${anime.currentEpisode ? `E${anime.currentEpisode.toString().padStart(2, '0')}` : ''}`}
            </Text>
          </View>
        ) : null}
        {anime.isReporte ? (
          <View style={[styles.miniBadge, { backgroundColor: '#FFA502' }]}>
            <Text style={styles.miniBadgeText}>REPORTE</Text>
          </View>
        ) : null}
        {anime.isFin ? (
          <View style={[styles.miniBadge, { backgroundColor: '#FF4757' }]}>
            <Text style={styles.miniBadgeText}>FIN</Text>
          </View>
        ) : null}
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
  timeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    // Effet de lueur holographique
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ perspective: 100 }, { rotateX: '10deg' }],
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    gap: 4,
    zIndex: 10,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    // Effet néon
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 3,
  },
  miniBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  flagContainer: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    display: 'none', // Masqué au profit du nouveau bouton sous le drapeau
  },
  historyRemoveButtonUnderFlag: {
    position: 'absolute',
    top: 32, // Réduit de 35 à 32 pour rapprocher de l'icône du drapeau
    right: 6,
    zIndex: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 26, // Légèrement plus petit
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
});

export default SimpleAnimeCard;
