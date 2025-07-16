import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { SearchResult } from '../types/index';
import type { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

// Interface pour les réponses API (identique au site web)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: ApiResponse<any>;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingAnimes, setTrendingAnimes] = useState<SearchResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Configuration API identique au site web
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

  // Fonction pour les requêtes API avec retry (identique au site web)
  const apiRequest = async (endpoint: string, options = {}) => {
    const maxRetries = 2;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        attempt++;
        console.log(`Tentative ${attempt}/${maxRetries} échouée:`, error);
        
        if (attempt >= maxRetries) {
          console.error('Erreur API après', maxRetries, 'tentatives:', error);
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  // Charger les animes trending (identique au site web)
  const loadTrendingAnimes = async () => {
    try {
      const response = await apiRequest('/api/trending');
      
      if (response && response.success && response.results) {
        // Afficher tous les types de contenu de l'API : animes, mangas, films
        setTrendingAnimes(response.results.slice(0, 24)); // Augmenter le nombre d'éléments affichés
        console.log('Contenu trending chargé:', response.results.length, 'éléments');
      } else {
        console.warn('Réponse API trending échouée:', response);
        setTrendingAnimes([]);
      }
    } catch (error) {
      console.error('Erreur chargement trending:', error);
      setTrendingAnimes([]);
    }
  };

  // Recherche d'animes (identique au site web)
  const searchAnimes = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(`/api/search?query=${encodeURIComponent(query)}`);
      
      if (response && response.success) {
        const results = response.results || [];
        if (Array.isArray(results)) {
          // Afficher tout le contenu de l'API : animes, mangas, films, etc.
          setSearchResults(results);
        } else {
          console.warn('Pas de résultats dans la réponse:', response);
          setSearchResults([]);
        }
      } else {
        throw new Error('Réponse API invalide');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de recherche';
      console.error('Erreur recherche:', errorMessage);
      
      if (errorMessage.includes('504') || errorMessage.includes('timeout')) {
        setError('Le serveur anime-sama-scraper.vercel.app ne répond pas actuellement. Veuillez réessayer plus tard.');
      } else if (errorMessage.includes('500')) {
        setError('Erreur temporaire du serveur. Veuillez réessayer dans quelques instants.');
      } else {
        setError('Impossible de rechercher les animes. Vérifiez votre connexion internet.');
      }
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Naviguer vers la page dédiée (anime ou manga) - identique au site web
  const loadAnimeDetails = async (animeId: string, contentType?: string) => {
    // Détecter si c'est un manga pour rediriger vers le lecteur approprié
    if (contentType === 'manga') {
      navigation.navigate('MangaReader', {
        mangaUrl: animeId,
        mangaTitle: 'Manga'
      });
    } else {
      navigation.navigate('AnimeDetail', {
        animeUrl: animeId,
        animeTitle: 'Anime'
      });
    }
  };

  // Charger les animes trending au démarrage
  useEffect(() => {
    loadTrendingAnimes();
  }, []);

  // Gérer la recherche en temps réel
  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        searchAnimes(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      return undefined;
    }
  }, [searchQuery]);

  // Refresh control
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrendingAnimes();
    setRefreshing(false);
  };

  // Composant Header avec logo ATOMIC FLIX
  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['#0A0A1A', '#1a1a2e']}
        style={styles.headerGradient}
      >
        {/* Logo ATOMIC FLIX */}
        <View style={styles.logoContainer}>
          <View style={styles.atomicSymbol}>
            <View style={styles.atomicCore} />
            <View style={[styles.atomicRing, styles.ring1]} />
            <View style={[styles.atomicRing, styles.ring2]} />
          </View>
          <Text style={styles.logoText}>
            <Text style={styles.atomicText}>ATOMIC</Text>
            <Text style={styles.flixText}> FLIX</Text>
          </Text>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#00ffff" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher des animes..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Composant Carte Anime (inspiré du design web)
  const renderAnimeCard = (anime: SearchResult, index: number) => (
    <TouchableOpacity
      key={anime.id || index}
      style={styles.animeCard}
      onPress={() => loadAnimeDetails(anime.id, anime.type)}
      activeOpacity={0.8}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: anime.image }}
          style={styles.cardImage}
          resizeMode="cover"
          onError={(e) => {
            console.log('Erreur image:', anime.image);
          }}
        />
        
        {/* Badge type de contenu */}
        <View style={[
          styles.contentBadge,
          anime.type === 'manga' ? styles.mangaBadge :
          anime.type === 'film' || anime.type === 'movie' ? styles.movieBadge :
          styles.animeBadge
        ]}>
          <Text style={styles.badgeText}>
            {anime.type === 'manga' ? 'MANGA' :
             anime.type === 'film' || anime.type === 'movie' ? 'FILM' :
             'ANIME'}
          </Text>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.95)']}
          style={styles.cardGradient}
        />
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {anime.title}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.statusText}>
            {anime.status || 'En cours'}
          </Text>
          <Text style={styles.typeText}>
            #{index + 1}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Bannière héro (inspirée du design web)
  const renderHeroSection = () => (
    <View style={styles.heroSection}>
      {/* Images d'animes en mosaïque */}
      <View style={styles.heroBanner}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heroImages}>
          {trendingAnimes.length > 0 ? (
            trendingAnimes.slice(0, 8).map((anime, index) => (
              <View key={index} style={styles.heroImageContainer}>
                <Image
                  source={{ uri: anime.image }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </View>
            ))
          ) : (
            // Placeholder images si pas de données
            Array.from({length: 8}).map((_, index) => (
              <View key={index} style={[styles.heroImageContainer, styles.placeholderImage]}>
                <Ionicons name="image" size={24} color="#6b7280" />
              </View>
            ))
          )}
        </ScrollView>
        <LinearGradient
          colors={['transparent', 'rgba(10,10,26,0.9)', 'rgba(10,10,26,1)']}
          style={styles.heroGradient}
        />
      </View>
      
      {/* Contenu de la bannière */}
      <View style={styles.heroContent}>
        <View style={styles.heroTitleContainer}>
          <Text style={styles.heroTitle}>ATOMIC FLIX</Text>
          <View style={styles.heroLogo}>
            <View style={styles.atomicSymbolSmall}>
              <View style={styles.atomicCoreSmall} />
              <View style={[styles.atomicRingSmall, styles.ringSmall1]} />
            </View>
          </View>
        </View>
        <Text style={styles.heroSubtitle}>
          Plongez dans l'univers infini{'\n'}des animes et mangas !
        </Text>
      </View>
    </View>
  );

  // Composant Section avec titre
  const renderSection = (title: string, data: SearchResult[], isLoading: boolean) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ffff" />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      ) : data.length > 0 ? (
        <View style={styles.animeGrid}>
          {data.map((anime, index) => renderAnimeCard(anime, index))}
        </View>
      ) : title.includes('Recherche') ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color="#374151" />
          <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
      
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
        {renderHeader()}
        
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadTrendingAnimes}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bannière héro si pas de recherche */}
        {!searchQuery.trim() && renderHeroSection()}

        {/* Résultats de recherche */}
        {searchQuery.trim() && (
          renderSection(
            `🔍 Résultats de recherche pour "${searchQuery}"`,
            searchResults,
            loading
          )
        )}

        {/* Contenu trending si pas de recherche */}
        {!searchQuery.trim() && (
          renderSection(
            '📢 Nouveaux épisodes ajoutés',
            trendingAnimes,
            loading
          )
        )}

        {/* Message de chargement */}
        {loading && !searchQuery.trim() && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ffff" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}

        {/* Message vide si pas de contenu trending et pas de chargement */}
        {!loading && !error && trendingAnimes.length === 0 && !searchQuery.trim() && (
          <View style={styles.emptyContainer}>
            <Ionicons name="tv" size={48} color="#374151" />
            <Text style={styles.emptyText}>Aucun contenu trending trouvé</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadTrendingAnimes()}>
              <Text style={styles.retryText}>Charger le contenu trending</Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  atomicSymbol: {
    width: 40,
    height: 40,
    marginRight: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atomicCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ffff',
    position: 'absolute',
  },
  atomicRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00ffff',
    borderRadius: 50,
  },
  ring1: {
    width: 24,
    height: 24,
  },
  ring2: {
    width: 36,
    height: 36,
    opacity: 0.6,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  atomicText: {
    color: '#00ffff',
  },
  flixText: {
    color: '#ff00ff',
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
  },
  heroSection: {
    marginBottom: 32,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0A0A1A',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.2)',
  },
  heroBanner: {
    position: 'relative',
    height: 120,
  },
  heroImages: {
    flexDirection: 'row',
  },
  heroImageContainer: {
    width: width / 8,
    height: 120,
    marginRight: 2,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  placeholderImage: {
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  heroTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ffff',
  },
  heroLogo: {
    marginLeft: 12,
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
    backgroundColor: '#00ffff',
    position: 'absolute',
  },
  atomicRingSmall: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#00ffff',
    borderRadius: 50,
  },
  ringSmall1: {
    width: 16,
    height: 16,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffff',
    marginLeft: 8,
  },
  animeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animeCard: {
    width: width > 768 ? (width - 64) / 4 - 8 :
          width > 640 ? (width - 64) / 3 - 8 :
          (width - 64) / 2 - 8,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImageContainer: {
    position: 'relative',
    height: width > 768 ? 200 : 180,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  contentBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  mangaBadge: {
    backgroundColor: 'rgba(249,115,22,0.8)',
    borderColor: '#f97316',
  },
  movieBadge: {
    backgroundColor: 'rgba(168,85,247,0.8)',
    borderColor: '#a855f7',
  },
  animeBadge: {
    backgroundColor: 'rgba(6,182,212,0.8)',
    borderColor: '#06b6d4',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#d1d5db',
    textTransform: 'uppercase',
  },
  typeText: {
    fontSize: 12,
    color: 'rgba(0,255,255,0.8)',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  retryText: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;