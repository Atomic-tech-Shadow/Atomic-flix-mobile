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
  FlatList,
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
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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

  // Charger les animes trending au démarrage (identique au site web)
  useEffect(() => {
    loadTrendingAnimes();
  }, []);

  // Charger tout le contenu trending depuis l'API (identique au site web)
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
    }
  }, [searchQuery]);

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

  // Header exact comme le site mobile ATOMIC FLIX
  const renderMobileHeader = () => (
    <View style={styles.mobileHeader}>
      <View style={styles.headerRow}>
        {/* Logo ATOMIC FLIX avec symbole atomique */}
        <View style={styles.logoSection}>
          <View style={styles.atomicIcon}>
            <View style={styles.atomicSymbolSmall}>
              <View style={styles.atomicCoreSmall} />
              <View style={[styles.atomicRingSmall, styles.ringSmall1]} />
            </View>
          </View>
          <Text style={styles.logoTextMobile}>
            <Text style={styles.atomicTextMobile}>ATOMIC</Text>
            <Text style={styles.flixTextMobile}>FLIX</Text>
          </Text>
        </View>

        {/* Icônes navigation droite */}
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => setIsSearchVisible(true)}
          >
            <Ionicons name="search" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="notifications" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => setIsMenuVisible(true)}
          >
            <Ionicons name="menu" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Modal de recherche plein écran
  const renderSearchModal = () => (
    <Modal
      visible={isSearchVisible}
      animationType="slide"
      onRequestClose={() => setIsSearchVisible(false)}
    >
      <View style={styles.searchModal}>
        <View style={styles.searchModalHeader}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#00ffff" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un anime..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
            />
          </View>
          <TouchableOpacity 
            onPress={() => setIsSearchVisible(false)}
            style={styles.closeSearchButton}
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.searchResults}>
          {searchResults.length > 0 ? (
            <View style={styles.animeGrid}>
              {searchResults.map((anime, index) => renderAnimeCard(anime, index))}
            </View>
          ) : (
            <View style={styles.emptySearchContainer}>
              <Ionicons name="search" size={48} color="#374151" />
              <Text style={styles.emptySearchText}>
                {searchQuery ? 'Aucun résultat trouvé' : 'Recherchez vos animes favoris'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  // Navigation drawer exacte comme le site
  const renderNavigationDrawer = () => (
    <Modal
      visible={isMenuVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsMenuVisible(false)}
    >
      <View style={styles.drawerOverlay}>
        <TouchableOpacity 
          style={styles.drawerBackdrop}
          onPress={() => setIsMenuVisible(false)}
        />
        <View style={styles.drawerContent}>
          <View style={styles.drawerHeader}>
            <TouchableOpacity 
              onPress={() => setIsMenuVisible(false)}
              style={styles.closeDrawerButton}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.drawerMenu}>
            <TouchableOpacity 
              style={styles.drawerMenuItem}
              onPress={() => {
                setIsMenuVisible(false);
                // Navigation vers Accueil
              }}
            >
              <Ionicons name="home" size={20} color="#ffffff" />
              <Text style={styles.drawerMenuText}>Accueil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.drawerMenuItem}
              onPress={() => {
                setIsMenuVisible(false);
                // Navigation vers Animes
              }}
            >
              <Ionicons name="tv" size={20} color="#ffffff" />
              <Text style={styles.drawerMenuText}>Animes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.drawerMenuItem}
              onPress={() => {
                setIsMenuVisible(false);
                // Navigation vers Mangas
              }}
            >
              <Ionicons name="book" size={20} color="#ffffff" />
              <Text style={styles.drawerMenuText}>Mangas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.drawerMenuItem}
              onPress={() => {
                setIsMenuVisible(false);
                navigation.navigate('About');
              }}
            >
              <Ionicons name="information-circle" size={20} color="#ffffff" />
              <Text style={styles.drawerMenuText}>À propos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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

  // Hero Banner exactement comme le site mobile ATOMIC FLIX
  const renderMobileHeroSection = () => (
    <View style={styles.mobileHeroSection}>
      {/* Mosaïque d'images d'animes en horizontal */}
      <View style={styles.mobileHeroBanner}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.mobileHeroImages}
          contentContainerStyle={styles.mobileHeroImagesContainer}
        >
          {trendingAnimes.length > 0 ? (
            trendingAnimes.slice(0, 6).map((anime, index) => (
              <Image
                key={index}
                source={{ uri: anime.image }}
                style={styles.mobileHeroImage}
                resizeMode="cover"
              />
            ))
          ) : (
            // Images placeholder style site mobile
            Array.from({length: 6}).map((_, index) => (
              <View key={index} style={[styles.mobileHeroImage, styles.mobileHeroImagePlaceholder]}>
                <Ionicons name="image" size={32} color="#4a5568" />
              </View>
            ))
          )}
        </ScrollView>
        
        {/* Gradient overlay pour le texte */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
          style={styles.mobileHeroGradient}
        />
      </View>
      
      {/* Contenu central exact du site */}
      <View style={styles.mobileHeroContent}>
        <Text style={styles.mobileHeroTitle}>ATOMIC FLIX</Text>
        <Text style={styles.mobileHeroSubtitle}>
          Plongez dans l'univers infini{'\n'}des animes et mangas !
        </Text>
        
        {/* Logo atomique en bas à droite */}
        <View style={styles.mobileHeroLogoPosition}>
          <View style={styles.mobileAtomicSymbol}>
            <View style={styles.mobileAtomicCore} />
            <View style={[styles.mobileAtomicRing, styles.mobileRing1]} />
          </View>
        </View>
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
        {renderMobileHeader()}
        
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadTrendingAnimes}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hero Banner mobile exact */}
        {!searchQuery.trim() && renderMobileHeroSection()}

        {/* Section Nouveaux épisodes avec icône exacte */}
        {!searchQuery.trim() && (
          <View style={styles.mobileSection}>
            <View style={styles.mobileSectionHeader}>
              <Ionicons name="film" size={20} color="#00bcd4" />
              <Text style={styles.mobileSectionTitle}>Nouveaux épisodes ajoutés</Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00bcd4" />
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : trendingAnimes.length > 0 ? (
              <View style={styles.mobileAnimeGrid}>
                {trendingAnimes.map((anime, index) => renderAnimeCard(anime, index))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="tv" size={48} color="#374151" />
                <Text style={styles.emptyText}>Aucun contenu disponible</Text>
              </View>
            )}
          </View>
        )}

        {/* Résultats de recherche */}
        {searchQuery.trim() && (
          <View style={styles.mobileSection}>
            <View style={styles.mobileSectionHeader}>
              <Ionicons name="search" size={20} color="#00bcd4" />
              <Text style={styles.mobileSectionTitle}>Résultats de recherche</Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00bcd4" />
                <Text style={styles.loadingText}>Recherche en cours...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <View style={styles.mobileAnimeGrid}>
                {searchResults.map((anime, index) => renderAnimeCard(anime, index))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color="#374151" />
                <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
              </View>
            )}
          </View>
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
      
      {/* Modals */}
      {renderSearchModal()}
      {renderNavigationDrawer()}
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
    backgroundColor: '#0a0a1a',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
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
  
  // Hero Section Mobile
  mobileHeroSection: {
    height: 300,
    position: 'relative',
    marginBottom: 20,
  },
  mobileHeroBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mobileHeroImages: {
    flex: 1,
  },
  mobileHeroImagesContainer: {
    flexDirection: 'row',
  },
  mobileHeroImage: {
    width: 120,
    height: 300,
    marginRight: 2,
  },
  mobileHeroImagePlaceholder: {
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileHeroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  mobileHeroContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  mobileHeroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 8,
  },
  mobileHeroSubtitle: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
    lineHeight: 24,
  },
  mobileHeroLogoPosition: {
    position: 'absolute',
    bottom: -20,
    right: 20,
  },
  mobileAtomicSymbol: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileAtomicCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00bcd4',
    position: 'absolute',
  },
  mobileAtomicRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#00bcd4',
    borderRadius: 50,
  },
  mobileRing1: {
    width: 24,
    height: 24,
  },
  
  // Section Nouveaux épisodes
  mobileSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
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
  mobileAnimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  // Cards Anime
  animeCard: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  contentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  animeBadge: {
    backgroundColor: '#00bcd4',
  },
  mangaBadge: {
    backgroundColor: '#ff6b6b',
  },
  movieBadge: {
    backgroundColor: '#4ecdc4',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    color: '#00bcd4',
    fontSize: 12,
  },
  typeText: {
    color: '#888888',
    fontSize: 12,
  },
  
  // Modals
  searchModal: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  closeSearchButton: {
    padding: 8,
    marginLeft: 12,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Navigation Drawer
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawerBackdrop: {
    flex: 1,
  },
  drawerContent: {
    backgroundColor: '#0a0a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeDrawerButton: {
    padding: 8,
  },
  drawerMenu: {
    paddingHorizontal: 20,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  drawerMenuText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 16,
  },
  
  // États et erreurs
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#888888',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#888888',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  emptySearchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptySearchText: {
    color: '#888888',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#2a1f1f',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00bcd4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  // Styles manquants pour compatibilité avec les anciennes sections
  animeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default HomeScreen;