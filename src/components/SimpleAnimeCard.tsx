import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS } from '../constants/newColors';
import { Ionicons } from '@expo/vector-icons';

interface SimpleAnimeCardProps {
  anime: any;
  onPress: () => void;
  badge?: string;
  badgeColor?: string;
  languageBadge?: string;
  index: number;
}

const getValidImageUrl = (imageUrl: string | undefined): string | null => {
  if (!imageUrl) return null;
  
  // Si c'est déjà une URL absolue, retourner telle quelle
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si c'est une URL relative, ajouter la base
  if (imageUrl.startsWith('/')) {
    return `https://anime-sama.si${imageUrl}`;
  }
  
  // Sinon invalide
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
  const [imageError, setImageError] = useState(false);
  const imageUrl = useMemo(() => getValidImageUrl(anime?.image), [anime?.image]);
  
  return (
    <TouchableOpacity
      key={`simple-${anime.id || anime.url || anime.title}-${index}`}
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {!imageError && imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: 120, height: 180 }]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image" size={40} color={COLORS.text.muted} />
          <Text style={styles.placeholderText}>{anime?.title || 'Image'}</Text>
        </View>
      )}
      
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
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.text.muted,
    fontSize: 8,
    marginTop: 4,
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
