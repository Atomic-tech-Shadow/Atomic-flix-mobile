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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { SearchResult } from '../types/index';
import type { RootStackParamList } from '../navigation/AppNavigator';
import SharedHeader from '../components/SharedHeader';
import NotificationService from '../utils/notificationService';

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
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Configuration API identique au site web
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';
  
  // Service de notifications
  const notificationService = NotificationService.getInstance();

  // Charger les animes trending au démarrage et initialiser les notifications
  useEffect(() => {
    loadTrendingAnimes();
    initializeNotifications();
    
    // Nettoyer les anciennes notifications au démarrage
    notificationService.cleanOldNotifications();
  }, []);

  // Initialiser les paramètres de notification
  const initializeNotifications = async () => {
    try {
      const settings = await notificationService.getSettings();
      setNotificationsEnabled(settings.enabled);
      
      const unreadCount = await notificationService.getUnreadCount();
      setUnreadNotifications(unreadCount);
      
      // Écouter les changements de notifications
      const unsubscribe = notificationService.addListener((notifications) => {
        const unread = notifications.filter(n => !n.read).length;
        setUnreadNotifications(unread);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
      return undefined;
    }
  };

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

  // Charger tout le contenu trending depuis l'API et détecter les nouveaux épisodes
  const loadTrendingAnimes = async () => {
    try {
      const response = await apiRequest('/api/trending');
      
      if (response && response.success && response.results) {
        const newContent = response.results.slice(0, 24);
        
        // Détecter les nouveaux épisodes avant de mettre à jour l'état
        await notificationService.detectNewEpisodes(newContent);
        
        // Afficher tous les types de contenu de l'API : animes, mangas, films
        setTrendingAnimes(newContent);
        console.log('Contenu trending chargé:', newContent.length, 'éléments');
        
        // Mettre à jour le compteur de notifications non lues
        const unreadCount = await notificationService.getUnreadCount();
        setUnreadNotifications(unreadCount);
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
      const response = await apiRequest(`/api/search?q=${encodeURIComponent(query)}`);
      
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

  // Naviguer vers la page dédiée (anime ou manga) (identique au site web)
  const loadAnimeDetails = async (animeId: string, contentType?: string) => {
    // Détecter si c'est un manga pour rediriger vers le lecteur approprié
    if (contentType === 'manga') {
      navigation.navigate('MangaReader', { mangaUrl: animeId, mangaTitle: 'Manga' });
    } else {
      navigation.navigate('AnimeDetail', { animeUrl: animeId, animeTitle: 'Anime' });
    }
  };

  // Gérer la recherche en temps réel (identique au site web)
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

  const handleSearchPress = () => {
    // Active l'affichage de la barre de recherche
    setShowSearchBar(true);
    setSearchQuery('');
  };

  // Gérer l'activation/désactivation des notifications
  const handleNotificationPress = async () => {
    try {
      const currentSettings = await notificationService.getSettings();
      const newSettings = {
        ...currentSettings,
        enabled: !currentSettings.enabled
      };
      
      await notificationService.saveSettings(newSettings);
      setNotificationsEnabled(newSettings.enabled);
      
      if (newSettings.enabled) {
        // Marquer toutes les notifications comme lues quand on active
        await notificationService.markAllAsRead();
        setUnreadNotifications(0);
      }
    } catch (error) {
      console.error('Erreur gestion notifications:', error);
    }
  };

  // Vérifier périodiquement les nouveaux épisodes (toutes les 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (notificationsEnabled) {
        loadTrendingAnimes();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  // Composant Carte Anime optimisé avec React.memo
  const renderAnimeCard = React.useCallback((anime: SearchResult, index: number) => (
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
          loadingIndicatorSource={require('../../assets/atomic-flix-logo.png')}
          fadeDuration={200}
          onError={(e) => {
            console.log('Erreur image:', anime.image);
          }}
        />
        
        {/* Badge type de contenu (identique au site web) */}
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
  ), []);

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
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        decelerationRate="normal"
        bounces={true}
        bouncesZoom={false}
        alwaysBounceVertical={false}
        nestedScrollEnabled={true}
      >
        <SharedHeader 
          showBackButton={false}
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
        />
        
        {/* Barre de recherche locale (identique au site web) */}
        {showSearchBar && (
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#00bcd4" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher des animes..."
                placeholderTextColor="#6b7280"
                autoFocus
              />
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setShowSearchBar(false);
                }}
                style={styles.clearSearchButton}
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Résultats de recherche (identique au site web) */}
        {loading && searchQuery && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00bcd4" />
            <Text style={styles.loadingText}>Recherche en cours...</Text>
          </View>
        )}
        
        {searchResults.length > 0 && !loading && (
          <View style={styles.searchResultsGrid}>
            {searchResults.map((anime, index) => renderAnimeCard(anime, index))}
          </View>
        )}

        {!searchQuery && !searchResults.length && (
          <View>
            {/* Section Héro - Nouvelle Saison (identique au site web) */}
            <View style={styles.heroSection}>
              {/* Images d'animes en mosaïque visible en haut */}
              <View style={styles.heroMosaicContainer}>
                {trendingAnimes.slice(0, 8).map((anime, index) => (
                  <View
                    key={`hero-mosaic-${index}`}
                    style={styles.heroMosaicImage}
                  >
                    <Image
                      source={{ uri: anime.image }}
                      style={styles.heroMosaicImageContent}
                      resizeMode="cover"
                      onError={(e) => {
                        console.log('Hero image error:', anime.image);
                      }}
                    />
                  </View>
                ))}
              </View>

              {/* Contenu principal */}
              <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)', '#000000']}
                style={styles.heroContent}
              >
                <Image 
                  source={require('../../assets/atomic-flix-logo.png')}
                  style={styles.heroLogo}
                  resizeMode="contain"
                />
                <Text style={styles.heroSubtitle}>
                  Plongez dans l'univers infini{'\n'}des animes et mangas !
                </Text>
              </LinearGradient>
            </View>

            {/* Section Animes Trending (identique au site web) */}
            {trendingAnimes.length > 0 && (
              <View style={styles.trendingSection}>
                <View style={styles.trendingSectionHeader}>
                  <Text style={styles.trendingSectionTitle}>
                    📢 Nouveaux épisodes ajoutés
                  </Text>
                </View>
                <View style={styles.trendingGrid}>
                  {trendingAnimes.map((anime, index) => renderAnimeCard(anime, index))}
                </View>
              </View>
            )}

            {/* Message de chargement */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00bcd4" />
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            )}

            {/* Message d'erreur */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setError(null);
                    loadTrendingAnimes();
                  }}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Message vide si pas de contenu trending et pas de chargement */}
            {!loading && !error && trendingAnimes.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun contenu trending trouvé</Text>
                <TouchableOpacity 
                  onPress={() => loadTrendingAnimes()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Charger le contenu trending</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
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
  


  // Recherche
  searchBarContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,188,212,0.2)',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchText: {
    color: '#6b7280',
    fontSize: 16,
  },

  // Hero Section
  heroSection: {
    height: 300,
    position: 'relative',
    marginBottom: 20,
    backgroundColor: '#0A0A1A',
    borderRadius: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  heroMosaicContainer: {
    flexDirection: 'row',
    height: 96,
  },
  heroMosaicImage: {
    flex: 1,
    marginHorizontal: -1,
  },
  heroMosaicImageContent: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
  },
  heroLogo: {
    width: 200,
    height: 60,
    marginBottom: 12,
    borderRadius: 100, // Pour rendre le logo rond
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 28,
  },


  // Section Trending
  trendingSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  trendingSectionHeader: {
    marginBottom: 16,
  },
  trendingSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  // Cards Anime optimisées pour les performances
  animeCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImageContainer: {
    position: 'relative',
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
  },
  contentBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mangaBadge: {
    backgroundColor: '#f97316',
  },
  movieBadge: {
    backgroundColor: '#8b5cf6',
  },
  animeBadge: {
    backgroundColor: '#00bcd4',
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
    height: 100,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  typeText: {
    color: '#00bcd4',
    fontSize: 12,
    fontWeight: '500',
  },

  // États
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#00bcd4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default HomeScreen;