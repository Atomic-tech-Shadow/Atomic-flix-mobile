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

// Reproduction exacte de anime-sama.tsx
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [trendingAnimes, setTrendingAnimes] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Configuration API identique au site web
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

  // Fonction API identique au site web
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
      setLoading(true);
      setError(null);
      
      console.log('Tentative de chargement des trending animes...');
      const response = await apiRequest('/api/trending');
      console.log('Réponse complète API trending:', JSON.stringify(response, null, 2));
      
      if (response && response.success && response.results) {
        console.log('Nombre d\'animes reçus:', response.results.length);
        setTrendingAnimes(response.results.slice(0, 24));
      } else {
        console.warn('Réponse API trending inattendue:', response);
        setError('Service anime-sama-scraper temporairement indisponible');
        setTrendingAnimes([]);
      }
    } catch (error) {
      console.error('Erreur détaillée trending animes:', error);
      setError('Impossible de charger les animes trending');
      setTrendingAnimes([]);
    } finally {
      setLoading(false);
    }
  };

  // Recherche d'animes (identique au site web)
  const searchAnimes = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchLoading(true);
      setError(null);
      
      const response = await apiRequest(`/api/search?query=${encodeURIComponent(query.trim())}`);
      console.log('Search response:', response);
      
      if (response && response.success && response.results) {
        setSearchResults(response.results);
      } else {
        console.warn('Réponse API search inattendue:', response);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erreur search animes:', error);
      setError('Erreur lors de la recherche');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Navigation vers détails anime
  const navigateToAnime = (anime: SearchResult) => {
    navigation.navigate('AnimeDetail', {
      animeUrl: anime.url,
      animeTitle: anime.title,
    });
  };

  // Refresh control
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrendingAnimes();
    setRefreshing(false);
  };

  // Effet initial identique au site web
  useEffect(() => {
    loadTrendingAnimes();
  }, []);

  // Effet de recherche avec debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAnimes(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Composant Header avec logo ATOMIC FLIX
  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e']}
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
            <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un anime..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchLoading && (
              <ActivityIndicator size="small" color="#00ffff" style={styles.searchLoading} />
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Composant Carte Anime (identique au design web)
  const renderAnimeCard = (anime: SearchResult, index: number) => (
    <TouchableOpacity
      key={anime.id || index}
      style={styles.animeCard}
      onPress={() => navigateToAnime(anime)}
      activeOpacity={0.8}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: anime.image }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        />
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {anime.title?.replace(/\n/g, ' ').replace(/\t/g, ' ').trim()}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.statusText}>
            {anime.status || 'En cours'}
          </Text>
          <Text style={styles.typeText}>
            {anime.contentType || 'anime'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Composant Section avec titre
  const renderSection = (title: string, data: SearchResult[], isLoading: boolean) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons 
          name={title.includes('Recherche') ? 'search' : 'flame'} 
          size={20} 
          color="#00ffff" 
        />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ffff" />
          <Text style={styles.loadingText}>Chargement...</Text>
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
        {!searchQuery.trim() && (
          <View style={styles.heroSection}>
            {/* Images d'animes en mosaïque */}
            <View style={styles.heroBanner}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heroImages}>
                {trendingAnimes.length > 0 ? (
                  trendingAnimes.slice(0, 10).map((anime, index) => (
                    <Image
                      key={index}
                      source={{ uri: anime.image }}
                      style={styles.heroImage}
                      resizeMode="cover"
                      onError={(e) => console.log('Erreur chargement image:', anime.image)}
                    />
                  ))
                ) : (
                  // Placeholder images si pas de données
                  Array.from({length: 5}).map((_, index) => (
                    <View key={index} style={[styles.heroImage, {backgroundColor: '#1a1a2e'}]}>
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
        )}

        {/* Résultats de recherche */}
        {searchQuery.trim() && (
          renderSection(
            `🔍 Résultats de recherche pour "${searchQuery}"`,
            searchResults,
            searchLoading
          )
        )}

        {/* Contenu trending si pas de recherche */}
        {!searchQuery.trim() && (
          renderSection(
            '📥 Nouveaux épisodes ajoutés',
            trendingAnimes,
            loading
          )
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
    borderColor: 'rgba(0,255,255,0.3)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  searchLoading: {
    marginLeft: 8,
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
    fontSize: 20, // text-xl web
    fontWeight: 'bold',
    color: '#00ffff', // atomic-gradient-text (cyan)
    marginLeft: 8,
  },
  animeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // pas space-between pour respecter gap du web
    paddingHorizontal: 8, // match le padding du site web
  },
  animeCard: {
    width: width > 1280 ? (width - 64) / 6 - 12 : // xl:grid-cols-6 web avec gap
          width > 1024 ? (width - 64) / 5 - 12 : // lg:grid-cols-5 web avec gap
          width > 768 ? (width - 64) / 4 - 12 :   // md:grid-cols-4 web avec gap
          width > 640 ? (width - 64) / 3 - 12 :   // sm:grid-cols-3 web avec gap
          (width - 64) / 2 - 12,                  // grid-cols-2 web avec gap
    marginBottom: 12, // gap-3 web (12px)
    marginRight: 12,  // gap-3 web (12px)
    borderRadius: 8,  // rounded-lg web
    overflow: 'hidden',
    position: 'relative', // pour overlay du hover effect
  },
  cardImageContainer: {
    position: 'relative',
    height: width > 768 ? 288 : // md:h-72 web (288px)
           width > 640 ? 256 :   // sm:h-64 web (256px)
           224,                  // h-56 web (224px)
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
    height: 60,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16, // p-4 web
    backgroundColor: 'rgba(0,0,0,0.8)', // bg-gradient-to-t from-black/95 web
  },
  cardTitle: {
    fontSize: 14, // text-sm web
    fontWeight: '600', // font-semibold web
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 18, // leading-tight web
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between', // justify-between web
    alignItems: 'center',
  },
  statusBadge: {
    // Pas de badge, juste le texte comme le web
  },
  statusText: {
    fontSize: 12, // text-xs web
    color: '#d1d5db', // text-gray-300 web
    fontWeight: '400',
    textTransform: 'uppercase', // uppercase web
    letterSpacing: 1, // tracking-wide web
  },
  typeText: {
    fontSize: 12, // text-xs web
    color: 'rgba(0,255,255,0.8)', // text-cyan-400/80 web
    fontWeight: '500', // font-medium web
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 16,
  },
  // Styles pour la bannière héro (dimensions identiques au site web)
  heroSection: {
    marginHorizontal: 8, // margin px-2 web
    marginBottom: 32, // mb-8 web
    borderRadius: 16, // rounded-2xl web
    overflow: 'hidden',
    backgroundColor: '#0a0a1a',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.2)',
  },
  heroBanner: {
    height: width > 768 ? 128 : 96, // h-24 md:h-32 web (96px/128px)
    position: 'relative',
  },
  heroImages: {
    height: width > 768 ? 128 : 96,
  },
  heroImage: {
    width: (width - 16) / 8, // flex-1 divisé par 8 images comme le web
    height: width > 768 ? 128 : 96,
    marginRight: -2, // marginLeft: '-2px' web
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: width > 768 ? 128 : 96,
  },
  heroContent: {
    paddingHorizontal: width > 768 ? 48 : 24, // px-6 md:px-12 web
    paddingVertical: width > 768 ? 48 : 32, // py-8 md:py-12 web
    alignItems: 'center',
  },
  heroTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // mb-2 web
  },
  heroTitle: {
    fontSize: width > 768 ? 48 : 30, // text-3xl md:text-5xl web (30px/48px)
    fontWeight: 'bold',
    color: '#00ffff',
    marginRight: 12,
  },
  heroLogo: {
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#ff00ff',
    position: 'absolute',
  },
  atomicRingSmall: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#ff00ff',
    borderRadius: 50,
  },
  ringSmall1: {
    width: 16,
    height: 16,
  },
  heroSubtitle: {
    fontSize: width > 768 ? 20 : 18, // text-lg md:text-xl web (18px/20px)
    color: '#e5e7eb', // text-gray-200 web
    textAlign: 'center',
    lineHeight: width > 768 ? 28 : 24,
    fontWeight: '300', // font-light web
    marginBottom: 16, // mb-4 web
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: '#00ffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: '#000000',
    fontWeight: '600',
  },
});

export default HomeScreen;