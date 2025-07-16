import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';

type AnimeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimeDetail'>;
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

  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

  // Fonction pour les requêtes API avec timeout (identique au site web)
  const apiRequest = async (endpoint: string, timeoutMs = 20000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      console.log('Requête API:', endpoint);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout: La requête a pris trop de temps');
      }
      throw error;
    }
  };

  // Charger les données de l'anime (identique au site web)
  const loadAnimeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Chargement des détails pour:', animeUrl);
      const response = await apiRequest(`/api/anime/${encodeURIComponent(animeUrl)}`);
      
      if (!response || !response.success) {
        const errorMsg = response?.error || response?.message || 'Anime non trouvé dans la base de données';
        throw new Error(errorMsg);
      }
      
      setAnimeData(response.data);
      
    } catch (err) {
      console.error('Erreur chargement anime:', err);
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
  const goToPlayer = (season: Season) => {
    if (!animeUrl) return;
    
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

  // Composant Header avec navigation
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {animeTitle}
      </Text>
    </View>
  );

  // État de chargement
  if (loading && !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ffff" />
          <Text style={styles.loadingText}>Chargement des détails de l'anime...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // État d'erreur
  if (error && !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
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
        <StatusBar style="light" />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="search" size={48} color="#6b7280" />
          <Text style={styles.errorText}>Anime non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00ffff']}
            tintColor="#00ffff"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de l'anime */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: animeData.image }}
            style={styles.bannerImage}
            resizeMode="cover"
            onError={(e) => {
              console.log('Erreur image banner:', animeData.image);
            }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
            style={styles.bannerGradient}
          />
          
          <View style={styles.bannerContent}>
            <Text style={styles.animeTitle}>{animeData.title}</Text>
            
            {/* Informations intégrées */}
            <View style={styles.infoContainer}>
              <View style={styles.infoBadge}>
                <View style={styles.infoDot} />
                <Text style={styles.infoText}>
                  {animeData.seasons.length} saisons
                </Text>
              </View>
              <View style={[styles.infoBadge, styles.yearBadge]}>
                <View style={[styles.infoDot, styles.yearDot]} />
                <Text style={[styles.infoText, styles.yearText]}>{animeData.year}</Text>
              </View>
            </View>
            
            {/* Genres */}
            <View style={styles.genresContainer}>
              {animeData.genres.map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Synopsis */}
        <View style={styles.synopsisContainer}>
          <View style={styles.synopsisCard}>
            <Text style={styles.synopsisTitle}>📖 Synopsis</Text>
            <Text style={styles.synopsisText}>{animeData.synopsis}</Text>
          </View>
        </View>

        {/* Message d'erreur/info avec possibilité de réessayer */}
        {error && (
          <View style={styles.errorBanner}>
            <View style={styles.errorBannerContent}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" style={styles.errorIcon} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
            <TouchableOpacity style={styles.errorRetryButton} onPress={retryLoad}>
              <Text style={styles.errorRetryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sélection des saisons */}
        <View style={styles.seasonsContainer}>
          <Text style={styles.seasonsTitle}>🎬 Saisons et Films</Text>
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
                    isManga ? styles.mangaCard : styles.animeCard
                  ]}
                  onPress={() => goToPlayer(season)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: animeData.image }}
                    style={styles.seasonImage}
                    resizeMode="cover"
                  />
                  <View style={styles.seasonOverlay} />
                  
                  <View style={styles.seasonContent}>
                    <Text style={styles.seasonName} numberOfLines={2}>
                      {season.name}
                    </Text>
                    <View style={styles.seasonBadge}>
                      <Text style={styles.seasonBadgeText}>
                        {isManga ? '📖 MANGA' : '🎥 ANIME'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    color: '#6b7280',
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
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  retryText: {
    color: '#00ffff',
    fontSize: 16,
    fontWeight: '500',
  },
  bannerContainer: {
    position: 'relative',
    height: 280,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 20,
  },
  animeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6,182,212,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  yearBadge: {
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06b6d4',
    marginRight: 8,
  },
  yearDot: {
    backgroundColor: '#3b82f6',
  },
  infoText: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '500',
  },
  yearText: {
    color: '#93c5fd',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: 'rgba(6,182,212,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: '#67e8f9',
    fontSize: 12,
  },
  synopsisContainer: {
    padding: 16,
    paddingTop: 24,
  },
  synopsisCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  synopsisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00ffff',
    marginBottom: 12,
  },
  synopsisText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  errorBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorIcon: {
    marginRight: 8,
    flexShrink: 0,
  },
  errorBannerText: {
    color: '#fca5a5',
    fontSize: 14,
    flex: 1,
  },
  errorRetryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  errorRetryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  seasonsContainer: {
    padding: 16,
  },
  seasonsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 16,
  },
  seasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seasonCard: {
    width: (width - 48) / 2,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    borderWidth: 2,
  },
  animeCard: {
    borderColor: '#06b6d4',
  },
  mangaCard: {
    borderColor: '#f97316',
  },
  seasonImage: {
    width: '100%',
    height: '100%',
  },
  seasonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  seasonContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seasonName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  seasonBadge: {
    marginTop: 4,
  },
  seasonBadgeText: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AnimeDetailScreen;