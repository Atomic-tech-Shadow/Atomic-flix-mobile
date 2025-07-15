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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { AnimeData, Season } from '../types/index';
import type { RootStackParamList } from '../navigation/AppNavigator';

type AnimeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimeDetail'>;
type AnimeDetailScreenRouteProp = RouteProp<RootStackParamList, 'AnimeDetail'>;

const { width, height } = Dimensions.get('window');

// Reproduction exacte de anime.tsx
const AnimeDetailScreen: React.FC = () => {
  const navigation = useNavigation<AnimeDetailScreenNavigationProp>();
  const route = useRoute<AnimeDetailScreenRouteProp>();
  const { animeUrl, animeTitle } = route.params;

  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration API identique au site web
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

  // Fonction API identique au site web
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
      
      const extractedId = animeUrl.split('/').pop() || animeUrl;
      console.log('Chargement anime ID:', extractedId);
      
      const response = await apiRequest(`/api/anime/${extractedId}`);
      console.log('Réponse anime:', response);
      
      if (response && response.success && response.data) {
        setAnimeData(response.data);
      } else {
        console.error('Réponse API anime invalide:', response);
        setError('Impossible de charger les données de l\'anime');
      }
    } catch (error) {
      console.error('Erreur chargement anime:', error);
      setError('Erreur lors du chargement de l\'anime');
    } finally {
      setLoading(false);
    }
  };

  // Navigation vers le lecteur (identique au site web)
  const goToPlayer = (season: Season) => {
    if (!animeData) return;

    navigation.navigate('AnimePlayer', {
      animeUrl: animeData.url,
      seasonData: season,
      animeTitle: animeData.title,
    });
  };

  // Effet initial
  useEffect(() => {
    loadAnimeData();
  }, [animeUrl]);

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

  // Composant Banner principal
  const renderBanner = () => {
    if (!animeData) return null;

    return (
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: animeData.image }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)', '#0a0a0a']}
          style={styles.bannerGradient}
        />
        
        <View style={styles.bannerContent}>
          <Image
            source={{ uri: animeData.image }}
            style={styles.posterImage}
            resizeMode="cover"
          />
          
          <View style={styles.bannerInfo}>
            <Text style={styles.animeTitle}>{animeData.title}</Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{animeData.status}</Text>
              </View>
              {animeData.year && (
                <Text style={styles.yearText}>{animeData.year}</Text>
              )}
            </View>

            <View style={styles.genresContainer}>
              {animeData.genres.slice(0, 3).map((genre, index) => (
                <View key={index} style={styles.genreBadge}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Composant Synopsis
  const renderSynopsis = () => {
    if (!animeData?.synopsis) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={20} color="#00ffff" />
          <Text style={styles.sectionTitle}>Synopsis</Text>
        </View>
        <Text style={styles.synopsisText}>{animeData.synopsis}</Text>
      </View>
    );
  };

  // Composant Grille des Saisons
  const renderSeasons = () => {
    if (!animeData?.seasons || animeData.seasons.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="play-circle" size={20} color="#00ffff" />
          <Text style={styles.sectionTitle}>
            Saisons disponibles ({animeData.seasons.length})
          </Text>
        </View>
        
        <View style={styles.seasonsGrid}>
          {animeData.seasons.map((season, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.seasonCard,
                !season.available && styles.seasonCardDisabled
              ]}
              onPress={() => season.available ? goToPlayer(season) : null}
              disabled={!season.available}
              activeOpacity={0.8}
            >
              <View style={styles.seasonCardContent}>
                <View style={styles.seasonIcon}>
                  <Ionicons 
                    name={season.available ? "play" : "lock-closed"} 
                    size={24} 
                    color={season.available ? "#00ffff" : "#6b7280"} 
                  />
                </View>
                
                <View style={styles.seasonInfo}>
                  <Text style={[
                    styles.seasonName,
                    !season.available && styles.seasonNameDisabled
                  ]}>
                    {season.name}
                  </Text>
                  
                  <Text style={[
                    styles.seasonMeta,
                    !season.available && styles.seasonMetaDisabled
                  ]}>
                    {season.episodeCount} épisodes
                  </Text>
                  
                  <View style={styles.seasonLanguages}>
                    {season.languages.map((lang, langIndex) => (
                      <View key={langIndex} style={styles.languageBadge}>
                        <Text style={styles.languageText}>{lang}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {season.available && (
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // État de chargement
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ffff" />
          <Text style={styles.loadingText}>Chargement de l'anime...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // État d'erreur
  if (error || !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>
            {error || 'Impossible de charger les données de l\'anime'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAnimeData}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderBanner()}
        {renderSynopsis()}
        {renderSeasons()}
      </ScrollView>

      {/* Header flottant */}
      <View style={styles.floatingHeader}>
        {renderHeader()}
      </View>
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
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(10,10,10,0.9)',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bannerContainer: {
    position: 'relative',
    height: height * 0.5,
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
    height: '60%',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
  },
  posterImage: {
    width: 120,
    height: 170,
    borderRadius: 12,
    marginRight: 16,
  },
  bannerInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  animeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 28,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  statusText: {
    color: '#00ffff',
    fontWeight: '600',
    fontSize: 12,
  },
  yearText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  genreText: {
    color: '#d1d5db',
    fontSize: 10,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  synopsisText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  seasonsGrid: {
    gap: 12,
  },
  seasonCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
    overflow: 'hidden',
  },
  seasonCardDisabled: {
    opacity: 0.5,
    borderColor: 'rgba(107,114,128,0.2)',
  },
  seasonCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  seasonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  seasonInfo: {
    flex: 1,
  },
  seasonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  seasonNameDisabled: {
    color: '#6b7280',
  },
  seasonMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  seasonMetaDisabled: {
    color: '#6b7280',
  },
  seasonLanguages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageBadge: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  languageText: {
    color: '#00ffff',
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default AnimeDetailScreen;