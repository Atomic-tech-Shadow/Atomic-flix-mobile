import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import OptimizedScrollView from '../components/OptimizedScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList, DrawerParamList } from '../navigation/AppNavigator';
import { COLORS, textStyles, interactiveStyles } from '../constants/newColors';
import SharedHeader from '../components/SharedHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { animeAPI } from '../utils/animeAPI';
import { useNotifications } from '../hooks/useNotifications';

type AnimeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimeDetail'> & DrawerNavigationProp<DrawerParamList>;
type AnimeDetailScreenRouteProp = RouteProp<RootStackParamList, 'AnimeDetail'>;

const { width, height } = Dimensions.get('window');

// Interfaces pour les épisodes et sources vidéo (identiques au site web)
interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
}

interface VideoSource {
  url: string;
  server: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
}

interface Season {
  number: number;
  name: string;
  value: string;
  languages: string[];
  episodeCount: number;
  url: string;
  available: boolean;
}

interface AnimeData {
  id: string;
  title: string;
  synopsis: string;
  image: string;
  genres: string[];
  status: string;
  progressInfo: string;
  correspondence: string;
  year: string;
  seasons: Season[];
  url: string;
}

// Interfaces pour les détails d'épisode et réponses API
interface EpisodeDetails {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  sources: VideoSource[];
  availableServers: string[];
  url: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: any;
}

const AnimeDetailScreen: React.FC = () => {
  const navigation = useNavigation<AnimeDetailScreenNavigationProp>();
  const route = useRoute<AnimeDetailScreenRouteProp>();
  const { animeUrl, animeTitle } = route.params;

  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Hook pour les notifications
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();



  // Charger les données de l'anime (exactement comme le code web)
  const loadAnimeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Extraire l'ID de l'anime depuis l'URL exactement comme dans le code web
      const animeId = animeUrl.split('/').pop() || animeUrl;

      
      // Appeler directement animeAPI.getDetails comme dans le code web
      const apiResponse = await animeAPI.getDetails(animeId);
      
      if (!apiResponse || !apiResponse.success) {
        const errorMsg = apiResponse?.error || apiResponse?.message || 'Anime non trouvé dans la base de données';
        throw new Error(errorMsg);
      }
      
      setAnimeData(apiResponse.data);
      
    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      
      if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
        setError('Le serveur met trop de temps à répondre. Cet anime pourrait nécessiter plus de temps de traitement.');
      } else if (errorMessage.includes('500')) {
        setError('Erreur temporaire du serveur. Veuillez réessayer.');
      } else if (errorMessage.includes('404') || errorMessage.includes('non trouvé')) {
        setError('Cet anime n\'a pas été trouvé. Vérifiez l\'orthographe ou essayez un autre anime.');
      } else {
        setError(`Impossible de charger l'anime: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigation vers la page de lecteur appropriée (identique au site web)
  const goToPlayer = async (season: Season) => {
    if (!animeUrl || !animeData) return;
    
    
    // Vérifier si c'est un manga/scan basé sur le nom de la saison
    const isManga = season.name.toLowerCase().includes('scan') || 
                   season.name.toLowerCase().includes('manga') ||
                   season.name.toLowerCase().includes('tome') ||
                   season.name.toLowerCase().includes('chapitre');
    
    if (isManga) {
      // Rediriger vers le lecteur de manga
      navigation.navigate('MangaReader', {
        mangaUrl: animeUrl,
        mangaTitle: animeTitle
      });
    } else {
      // Rediriger vers le lecteur vidéo
      navigation.navigate('AnimePlayer', {
        animeUrl: animeUrl,
        seasonData: season,
        animeTitle: animeTitle
      });
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    if (animeUrl) {
      loadAnimeData();
    }
  }, [animeUrl]);

  // Refresh control
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimeData();
    setRefreshing(false);
  };

  // Retry function
  const retryLoad = () => {
    loadAnimeData();
  };



  // État de chargement
  if (loading && !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <SharedHeader 
          onSearchPress={() => navigation.navigate('Home')}
          onNotificationPress={() => setShowNotifications(true)}
          onMenuPress={() => navigation.openDrawer()}
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner 
            message="Chargement des détails de l'anime..." 
            size="large"
            color="#00bcd4"
          />
        </View>
      </SafeAreaView>
    );
  }

  // État d'erreur
  if (error && !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <SharedHeader 
          onSearchPress={() => navigation.navigate('Home')}
          onNotificationPress={() => setShowNotifications(true)}
          onMenuPress={() => navigation.openDrawer()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.text.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryLoad}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Anime non trouvé
  if (!animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <SharedHeader 
          onSearchPress={() => navigation.navigate('Home')}
          onNotificationPress={() => setShowNotifications(true)}
          onMenuPress={() => navigation.openDrawer()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="search" size={48} color={COLORS.text.muted} />
          <Text style={styles.errorText}>Anime non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      
      {/* Header fixe au-dessus du contenu */}
      <View style={styles.headerContainer}>
        <SharedHeader 
          onSearchPress={() => navigation.navigate('Home')}
          onNotificationPress={() => setShowNotifications(true)}
          onMenuPress={() => navigation.openDrawer()}
        />
      </View>
      
      <OptimizedScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00bcd4']}
            tintColor="#00bcd4"
          />
        }
      >
        {/* Image hero ajustée */}
        <View style={styles.heroContainer}>
          {/* Image de fond avec hauteur réduite */}
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: animeData.image }}
              style={styles.heroImage}
              resizeMode="cover"
              onError={(e) => {}}
            />
            
            {/* Gradient overlay pour le contenu */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', 'rgba(10,10,26,0.95)']}
              style={styles.heroGradient}
            />
            
            {/* Contenu overlay exactement comme dans l'image */}
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{animeData.title}</Text>
              
              {/* Badges compacts alignés à gauche */}
              <View style={styles.heroBadgesCompact}>
                <View style={styles.heroBadgeSmall}>
                  <View style={styles.badgeDotSmall} />
                  <Text style={styles.badgeTextSmall}>Progrès: {animeData.progressInfo}</Text>
                </View>
                <View style={styles.heroBadgeSmall}>
                  <View style={styles.badgeDotSmall} />
                  <Text style={styles.badgeTextSmall}>Correspondance: {animeData.correspondence}</Text>
                </View>
                {animeData.genres && animeData.genres.length > 0 && (
                  <View style={[styles.heroBadgeSmall, styles.genreBadge]}>
                    <View style={[styles.badgeDotSmall, styles.genreDot]} />
                    <Text style={styles.badgeTextSmall}>
                      Genre: {animeData.genres.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
              

            </View>
          </View>
        </View>

        {/* Section Synopsis exactement comme dans l'image */}
        <View style={styles.mobileSection}>
          <View style={styles.mobileSectionHeader}>
            <Ionicons name="document-text" size={20} color="#00bcd4" />
            <Text style={styles.mobileSectionTitle}>Synopsis</Text>
          </View>
          
          <View style={styles.synopsisContainer}>
            <Text style={styles.synopsisText}>{animeData.synopsis}</Text>
          </View>
        </View>



        {/* Section Saisons exactement comme le code web */}
        <View style={styles.mobileSection}>
          <View style={styles.mobileSectionHeader}>
            <Ionicons name="film" size={20} color="#00bcd4" />
            <Text style={styles.mobileSectionTitle}>Saisons et Films</Text>
          </View>
          
          {/* Grid 2 colonnes comme le code web */}
          <View style={styles.seasonsGrid}>
            {animeData.seasons.map((season, index) => {
              const isManga = season.name.toLowerCase().includes('scan') || 
                             season.name.toLowerCase().includes('manga') ||
                             season.name.toLowerCase().includes('tome') ||
                             season.name.toLowerCase().includes('chapitre');
              
              return (
                <TouchableOpacity
                  key={`season-${index}-${season.name}`}
                  style={[
                    styles.seasonCard,
                    isManga ? styles.seasonCardManga : styles.seasonCardAnime
                  ]}
                  onPress={() => goToPlayer(season)}
                  activeOpacity={0.8}
                >
                  {/* Image de fond exactement comme le code web */}
                  <Image
                    source={{ uri: animeData.image }}
                    style={styles.seasonCardBackground}
                    resizeMode="cover"
                  />
                  
                  {/* Overlay dark exactement comme le code web */}
                  <View style={styles.seasonCardOverlay} />
                  
                  {/* Contenu centré exactement comme le code web */}
                  <View style={styles.seasonCardContent}>
                    <Text style={styles.seasonCardTitle}>{season.name}</Text>
                    
                    {/* Badge type exactement comme le code web */}
                    {isManga ? (
                      <Text style={styles.seasonCardBadgeManga}>📖 MANGA</Text>
                    ) : (
                      <Text style={styles.seasonCardBadgeAnime}>🎥 ANIME</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>


      </OptimizedScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  
  // Header mobile exact
  mobileHeader: {
    backgroundColor: `${COLORS.background.primary}f2`,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atomicIcon: {
    marginRight: 8,
  },
  atomicSymbolSmall: {
    width: 24,
    height: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atomicCoreSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    position: 'absolute',
  },
  atomicRingSmall: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 50,
  },
  ringSmall1: {
    width: 16,
    height: 16,
  },
  logoTextMobile: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  atomicTextMobile: {
    color: COLORS.text.primary,
    fontFamily: 'monospace',
  },
  flixTextMobile: {
    color: COLORS.accent,
    fontFamily: 'monospace',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Header fixe
  headerContainer: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: COLORS.background.primary,
  },
  // Hero Section réduite pour laisser place au header
  heroContainer: {
    position: 'relative',
    height: height * 0.35, // 35% de la hauteur de l'écran au lieu de 50%
  },
  heroImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    bottom: 20, // Plus proche du bas
    left: 20,
    right: 20,
    alignItems: 'flex-start', // Tout aligné à gauche
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    ...textStyles.heroTitle,
    marginBottom: 16,
  },
  heroBadgesCompact: {
    alignItems: 'flex-start', // Alignés à gauche
    marginBottom: 8, // Réduit l'espace en bas
    marginTop: 8, // Petit espace après le titre
    maxWidth: '75%', // Plus compact pour garder l'image visible
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
  yearBadge: {
    backgroundColor: 'rgba(139,92,246,0.3)', // Violet cohérent avec app
    borderColor: 'rgba(139,92,246,0.5)',
  },
  badgeDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginRight: 4,
    flexShrink: 0,
  },
  genreBadge: {
    borderColor: 'rgba(139,92,246,0.4)',
  },
  genreDot: {
    backgroundColor: '#8b5cf6', // Violet pour le genre
  },
  badgeTextSmall: {
    ...textStyles.cardTitle,
    fontSize: 10,
    fontWeight: '500',
    flexShrink: 1,
    lineHeight: 14,
  },
  animeBadgeContainer: {
    alignSelf: 'flex-start',
  },
  animeBadge: {
    backgroundColor: '#00bcd4', // Cyan cohérent
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  animeBadgeMain: {
    backgroundColor: '#00bcd4', // Cyan principal de l'app
    borderWidth: 1,
    borderColor: 'rgba(0,188,212,0.6)',
  },
  animeBadgeText: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Section Synopsis mobile
  mobileSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  mobileSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mobileSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  synopsisContainer: {
    backgroundColor: `${COLORS.primary}99`,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${COLORS.text.primary}1a`,
  },
  synopsisText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 22,
  },
  

  
  // États de chargement et erreur
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    color: COLORS.text.secondary,
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  errorText: {
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Saisons Grid exactement comme le code web
  seasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  seasonCard: {
    width: '47%', // Pour 2 colonnes avec gap
    height: 112, // h-28 du code web = 112px
    borderRadius: 16, // rounded-2xl
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
  },
  seasonCardAnime: {
    borderColor: COLORS.accent,
  },
  seasonCardManga: {
    borderColor: COLORS.badges.manga,
  },
  seasonCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  seasonCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', // bg-black/60
  },
  seasonCardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  seasonCardTitle: {
    ...textStyles.cardTitle,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  seasonCardBadgeAnime: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '600',
  },
  seasonCardBadgeManga: {
    color: COLORS.badges.manga,
    fontSize: 10,
    fontWeight: '600',
  },

});

export default AnimeDetailScreen;