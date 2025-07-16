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
import SharedHeader from '../components/SharedHeader';

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

  // Charger les données de l'anime (identique au code web)
  const loadAnimeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Extraire l'ID de l'anime depuis l'URL
      const animeId = animeUrl.split('/').pop() || animeUrl;
      console.log('Chargement des détails pour:', animeId);
      
      // Appeler directement l'API externe comme dans le code web
      const apiResponse = await apiRequest(`/api/anime/${animeId}`);
      
      if (!apiResponse || !apiResponse.success) {
        const errorMsg = apiResponse?.error || apiResponse?.message || 'Anime non trouvé dans la base de données';
        throw new Error(errorMsg);
      }
      
      setAnimeData(apiResponse.data);
      
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



  // État de chargement
  if (loading && !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#0a0a1a" />
        <SharedHeader showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00bcd4" />
          <Text style={styles.loadingText}>Chargement des détails de l'anime...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // État d'erreur
  if (error && !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#0a0a1a" />
        <SharedHeader showBackButton={true} />
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
        <StatusBar style="light" backgroundColor="#0a0a1a" />
        <SharedHeader showBackButton={true} />
        <View style={styles.errorContainer}>
          <Ionicons name="search" size={48} color="#6b7280" />
          <Text style={styles.errorText}>Anime non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00bcd4']}
            tintColor="#00bcd4"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header mobile avec overlay */}
        <View style={styles.heroContainer}>
          <SharedHeader showBackButton={true} />
          
          {/* Image de fond fullscreen comme dans le design */}
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: animeData.image }}
              style={styles.heroImage}
              resizeMode="cover"
              onError={(e) => {
                console.log('Erreur image hero:', animeData.image);
              }}
            />
            
            {/* Gradient overlay pour le contenu */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', 'rgba(10,10,26,0.95)']}
              style={styles.heroGradient}
            />
            
            {/* Contenu overlay exactement comme dans l'image */}
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{animeData.title}</Text>
              
              {/* Badges d'informations exactement comme dans l'image */}
              <View style={styles.heroBadges}>
                <View style={styles.heroBadge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText}>{animeData.seasons.length} saisons</Text>
                </View>
                <View style={[styles.heroBadge, styles.yearBadge]}>
                  <View style={[styles.badgeDot, styles.yearDot]} />
                  <Text style={styles.badgeText}>{animeData.year || '2000'}</Text>
                </View>
              </View>
              
              {/* Badge Anime comme dans l'image */}
              <View style={styles.animeBadgeContainer}>
                <View style={styles.animeBadge}>
                  <Text style={styles.animeBadgeText}>Anime</Text>
                </View>
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


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a', // Dark blue exact comme le site
  },
  scrollView: {
    flex: 1,
  },
  
  // Header mobile exact
  mobileHeader: {
    backgroundColor: 'rgba(10,10,26,0.95)',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
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
    backgroundColor: '#00bcd4',
    position: 'absolute',
  },
  atomicRingSmall: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#00bcd4',
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
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  flixTextMobile: {
    color: '#00bcd4',
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
  // Hero Section exactement comme dans l'image
  heroContainer: {
    position: 'relative',
    height: height * 0.7, // 70% de la hauteur de l'écran
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
    bottom: 40,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroBadges: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,188,212,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  yearBadge: {
    backgroundColor: 'rgba(59,130,246,0.3)',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00bcd4',
    marginRight: 8,
  },
  yearDot: {
    backgroundColor: '#3b82f6',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  animeBadgeContainer: {
    alignSelf: 'flex-start',
  },
  animeBadge: {
    backgroundColor: '#00bcd4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  animeBadgeText: {
    color: '#ffffff',
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
    color: '#ffffff',
    marginLeft: 8,
  },
  synopsisContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  synopsisText: {
    color: '#d1d5db',
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
    color: '#888888',
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
    backgroundColor: '#00bcd4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

export default AnimeDetailScreen;