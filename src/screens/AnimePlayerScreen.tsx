import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import SharedHeader from '../components/SharedHeader';

type AnimePlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimePlayer'>;
type AnimePlayerScreenRouteProp = RouteProp<RootStackParamList, 'AnimePlayer'>;

const { width, height } = Dimensions.get('window');

// Interfaces pour les épisodes et sources vidéo (identiques au site web)
interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
  streamingSources?: VideoSource[];
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

interface EpisodeDetails {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  sources: VideoSource[];
  availableServers: string[];
  url: string;
}

const AnimePlayerScreen: React.FC = () => {
  const navigation = useNavigation<AnimePlayerScreenNavigationProp>();
  const route = useRoute<AnimePlayerScreenRouteProp>();
  const { animeUrl, seasonData, animeTitle } = route.params;

  // États pour les données (basés sur le code web fonctionnel)
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>('VOSTFR');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

  // Fonction pour les requêtes API (identique au code web)
  const apiRequest = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Service externe indisponible: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  };

  // Charger les détails d'un anime via l'API externe (du code web)
  const getAnimeDetails = async (animeId: string) => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/api/anime/${animeId}`);
      
      if (!response || !response.success) {
        console.error('Erreur API anime details:', response);
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('Erreur chargement anime API:', error);
      return null;
    }
  };

  // Charger les épisodes via API externe (du code web)
  const loadSeasonEpisodes = async (season: Season, autoLoadEpisode = false) => {
    if (!animeData) {
      console.log('Pas de données anime disponibles pour charger les épisodes');
      return;
    }
    
    try {
      setEpisodeLoading(true);
      setError(null);
      const languageCode = selectedLanguage.toLowerCase();
      
      console.log('Chargement épisodes pour:', animeData.id, 'saison:', season.value, 'langue:', selectedLanguage);
      
      const data = await apiRequest(`${API_BASE_URL}/api/episodes/${animeData.id}?season=${season.value}&language=${languageCode}`);
      console.log('Épisodes reçus de l\'API:', data);
      
      if (!data || !data.success) {
        console.error('Erreur API épisodes:', data);
        setError('Erreur lors du chargement des épisodes depuis l\'API');
        return;
      }
      
      if (data.episodes && Array.isArray(data.episodes) && data.episodes.length > 0) {
        const formattedEpisodes: Episode[] = data.episodes.map((ep: any, index: number) => {
          const episodeNumber = ep.number || (index + 1);
          const episodeTitle = ep.title || `Épisode ${episodeNumber}`;
          const episodeUrl = ep.url || `https://anime-sama.fr/catalogue/${animeData.id}/${season.value}/${languageCode}/episode-${episodeNumber}`;
          
          return {
            id: `${animeData.id}-${season.value}-ep${episodeNumber}-${languageCode}`,
            title: episodeTitle,
            episodeNumber: episodeNumber,
            url: episodeUrl,
            language: data.language ? data.language.toUpperCase() : selectedLanguage.toUpperCase(),
            available: ep.available !== false,
            streamingSources: ep.streamingSources || []
          };
        });
        
        console.log('Épisodes formatés depuis API:', formattedEpisodes.length);
        setEpisodes(formattedEpisodes);
        
        let episodeToSelect = formattedEpisodes[0];
        setSelectedEpisode(episodeToSelect);
        
        if (autoLoadEpisode) {
          loadEpisodeSources(episodeToSelect);
        }
      } else {
        setError('Aucun épisode trouvé pour cette saison et langue');
      }
    } catch (err) {
      console.error('Erreur chargement épisodes API:', err);
      setError('Erreur lors du chargement des épisodes depuis l\'API');
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Charger les sources d'un épisode (du code web)
  const loadEpisodeSources = async (episode: Episode) => {
    if (!episode || !animeData) return;
    
    try {
      setEpisodeLoading(true);
      setError(null);
      
      console.log('Récupération sources streaming pour épisode:', episode.episodeNumber);
      
      const response = await fetch(`${API_BASE_URL}/api/embed?url=${encodeURIComponent(episode.url)}`);
      
      if (!response.ok) {
        console.error(`Erreur API embed: ${response.status}`);
        setError('Erreur lors du chargement des sources de streaming');
        return;
      }
      
      const embedData = await response.json();
      console.log('Sources streaming reçues de l\'API:', embedData);
      
      if (embedData.success && embedData.sources && embedData.sources.length > 0) {
        setEpisodeDetails({
          id: episode.id,
          title: episode.title,
          animeTitle: animeData.title,
          episodeNumber: episode.episodeNumber,
          sources: embedData.sources,
          availableServers: embedData.sources.map((s: any) => s.server),
          url: episode.url
        });
        setSelectedPlayer(0);
        console.log('Sources streaming chargées:', embedData.sources.length, 'serveurs disponibles');
      } else {
        console.error('Aucune source trouvée dans la réponse API');
        setError('Aucune source de streaming disponible pour cet épisode');
      }
    } catch (err) {
      console.error('Erreur récupération sources API:', err);
      setError('Erreur lors du chargement des sources de streaming');
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Navigation entre épisodes (du code web)
  const navigateEpisode = async (direction: 'prev' | 'next') => {
    if (!selectedEpisode) return;
    
    const currentIndex = episodes.findIndex(ep => ep.id === selectedEpisode.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < episodes.length) {
      const newEpisode = episodes[newIndex];
      setSelectedEpisode(newEpisode);
      loadEpisodeSources(newEpisode);
    }
  };

  // Changer de langue (du code web)
  const changeLanguage = (newLanguage: 'VF' | 'VOSTFR') => {
    setSelectedLanguage(newLanguage);
    if (selectedSeason && animeData) {
      loadSeasonEpisodes(selectedSeason, true);
    }
  };

  // Changer de serveur 
  const changeServer = (serverIndex: number) => {
    setSelectedPlayer(serverIndex);
  };

  // Charger les données au démarrage (du code web)
  useEffect(() => {
    if (!animeUrl || !seasonData || !animeTitle) return;
    
    const loadAnimeData = async () => {
      try {
        setLoading(true);
        
        // Extraire l'ID depuis l'URL
        const animeId = animeUrl.split('/').pop() || animeUrl;
        
        // Charger les données de base de l'anime
        const animeResponse = await getAnimeDetails(animeId);
        
        if (animeResponse && animeResponse.success && animeResponse.data) {
          const anime = animeResponse.data;
          setAnimeData(anime);
          
          // Utiliser les données de la saison passées en paramètre
          setSelectedSeason(seasonData);
          
          // Charger les épisodes pour cette saison
          await loadSeasonEpisodes(seasonData, true);
        } else {
          // Fallback: créer un objet anime basique si l'API échoue
          const basicAnime: AnimeData = {
            id: animeId,
            title: animeTitle,
            synopsis: '',
            image: `https://img.anime-sama.fr/catalogue/${animeId}/cover.jpg`,
            genres: [],
            status: '',
            year: '',
            seasons: [seasonData],
            url: animeUrl
          };
          setAnimeData(basicAnime);
          setSelectedSeason(seasonData);
          
          // Charger les épisodes même avec les données basiques
          await loadSeasonEpisodes(seasonData, true);
        }
      } catch (err) {
        console.error('Erreur chargement anime:', err);
        setError('Erreur lors du chargement de l\'anime');
      } finally {
        setLoading(false);
      }
    };

    loadAnimeData();
  }, [animeUrl, seasonData, animeTitle]);



  // Hero Section avec image de fond et titre (utilise les vraies données)
  const renderHeroSection = () => (
    <View style={styles.heroContainer}>
      <Image
        source={{ uri: animeData?.image || `https://img.anime-sama.fr/catalogue/${animeUrl.split('/').pop()}/cover.jpg` }}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(10,10,26,0.9)']}
        style={styles.heroGradient}
      />
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{animeData?.title || animeTitle}</Text>
        <Text style={styles.heroSubtitle}>{selectedSeason?.name || 'SAISON 1'}</Text>
      </View>
    </View>
  );

  // Section sélecteurs de langue (utilise les vraies données)
  const renderLanguageSelectors = () => (
    <View style={styles.languageContainer}>
      <TouchableOpacity
        style={[styles.languageButton, selectedLanguage === 'VOSTFR' && styles.languageButtonActive]}
        onPress={() => changeLanguage('VOSTFR')}
      >
        <Text style={[styles.languageText, selectedLanguage === 'VOSTFR' && styles.languageTextActive]}>VO</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.languageButton, selectedLanguage === 'VF' && styles.languageButtonActive]}
        onPress={() => changeLanguage('VF')}
      >
        <Text style={[styles.languageText, selectedLanguage === 'VF' && styles.languageTextActive]}>VF</Text>
      </TouchableOpacity>
    </View>
  );

  // Dropdowns pour épisode et serveur (utilise les vraies données)
  const renderDropdowns = () => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.dropdownText}>ÉPISODE {selectedEpisode?.episodeNumber || 1}</Text>
        <Ionicons name="chevron-down" size={20} color="#ffffff" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.dropdownText}>
          SERVER {(selectedPlayer + 1)} ({episodeDetails?.sources[selectedPlayer]?.quality || 'HD'})
        </Text>
        <Ionicons name="chevron-down" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  // Section "Dernière sélection" 
  const renderLastSelection = () => (
    <View style={styles.lastSelectionContainer}>
      <Text style={styles.lastSelectionLabel}>
        DERNIÈRE SÉLECTION : ÉPISODE {selectedEpisode?.episodeNumber || 1}
      </Text>
    </View>
  );

  // Lecteur vidéo avec WebView ou message (utilise les vraies données)
  const renderVideoPlayer = () => (
    <View style={styles.videoPlayerContainer}>
      <View style={styles.videoPlayerHeader}>
        <Text style={styles.videoPlayerTitle}>{animeData?.title || animeTitle}</Text>
        <Text style={styles.videoPlayerSubtitle}>
          Episode {selectedEpisode?.episodeNumber || 1} • Server {(selectedPlayer + 1)} • {episodeDetails?.sources[selectedPlayer]?.quality || 'HD'}
        </Text>
      </View>
      
      <View style={styles.videoPlayerContent}>
        {episodeDetails?.sources[selectedPlayer]?.url ? (
          <WebView
            source={{ uri: episodeDetails.sources[selectedPlayer].url }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#00bcd4" />
                <Text style={styles.loadingText}>Chargement du lecteur...</Text>
              </View>
            )}
            onError={(error) => {
              console.error('Erreur WebView:', error);
              setError('Erreur lors du chargement du lecteur vidéo');
            }}
          />
        ) : (
          <Text style={styles.sandboxMessage}>
            {episodeLoading ? 'Chargement...' : 'This video is not\navailable due to\nsandboxed iframe!'}
          </Text>
        )}
      </View>
      
      <View style={styles.videoControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => navigateEpisode('prev')}
          disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.downloadButton}>
          <Ionicons name="download" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => navigateEpisode('next')}
          disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1}
        >
          <Ionicons name="chevron-forward" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Liste des serveurs disponibles
  const renderServerSelection = () => {
    if (!episodeDetails?.sources || episodeDetails.sources.length === 0) return null;
    
    return (
      <View style={styles.serverContainer}>
        <Text style={styles.serverLabel}>Serveurs disponibles:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serverScroll}>
          {episodeDetails.sources.map((source, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.serverButton,
                selectedPlayer === index && styles.serverButtonActive
              ]}
              onPress={() => changeServer(index)}
            >
              <Text style={[
                styles.serverButtonText,
                selectedPlayer === index && styles.serverButtonTextActive
              ]}>
                {source.server} ({source.quality})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Liste des épisodes disponibles
  const renderEpisodeList = () => {
    if (!episodes || episodes.length === 0) return null;
    
    return (
      <View style={styles.episodeListContainer}>
        <Text style={styles.episodeLabel}>Épisodes ({episodes.length}):</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.episodeScroll}>
          {episodes.map((episode, index) => (
            <TouchableOpacity
              key={episode.id}
              style={[
                styles.episodeItem,
                selectedEpisode?.id === episode.id && styles.episodeItemActive
              ]}
              onPress={() => {
                setSelectedEpisode(episode);
                loadEpisodeSources(episode);
              }}
            >
              <Text style={[
                styles.episodeItemNumber,
                selectedEpisode?.id === episode.id && styles.episodeItemNumberActive
              ]}>
                {episode.episodeNumber}
              </Text>
              <Text style={[
                styles.episodeItemTitle,
                selectedEpisode?.id === episode.id && styles.episodeItemTitleActive
              ]} numberOfLines={2}>
                {episode.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      
      {/* Header mobile ATOMIC FLIX */}
      <SharedHeader 
        showBackButton={false} 
        onSearchPress={() => navigation.navigate('Home')}
        onNotificationPress={() => console.log('Notifications pressed from AnimePlayer')}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(false)}
            colors={['#00bcd4']}
            tintColor="#00bcd4"
          />
        }
      >
        {/* Hero Section avec image de fond */}
        {renderHeroSection()}
        
        {/* Sélecteurs de langue VO/VF */}
        {renderLanguageSelectors()}
        
        {/* Dropdowns épisode et serveur */}
        {renderDropdowns()}
        
        {/* Section dernière sélection */}
        {renderLastSelection()}
        
        {/* Lecteur vidéo */}
        {renderVideoPlayer()}
        
        {/* Sélection serveur */}
        {renderServerSelection()}
        
        {/* Liste épisodes */}
        {renderEpisodeList()}
        
        {/* Message d'erreur */}
        {error && (
          <View style={styles.errorBanner}>
            <View style={styles.errorBannerContent}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" style={styles.errorIcon} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
            <TouchableOpacity style={styles.errorRetryButton} onPress={() => {
              if (selectedSeason && animeData) {
                loadSeasonEpisodes(selectedSeason, true);
              }
            }}>
              <Text style={styles.errorRetryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* État de chargement épisode */}
        {episodeLoading && (
          <View style={styles.episodeLoadingContainer}>
            <ActivityIndicator size="large" color="#00bcd4" />
            <Text style={styles.loadingText}>Chargement de l'épisode...</Text>
          </View>
        )}
        
        {/* Footer avec texte ATOMIC */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🔮I AM ATOMIC🔮</Text>
          <Text style={styles.footerSubtext}>Trop de pub? 3 Changez de lecteur.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header mobile ATOMIC FLIX (identique aux autres écrans)
  mobileHeader: {
    backgroundColor: '#0a0a1a',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 188, 212, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atomicIcon: {
    marginRight: 8,
  },
  atomicSymbolSmall: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  atomicCoreSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00bcd4',
  },
  atomicRingSmall: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#00bcd4',
  },
  ringSmall1: {
    transform: [{ rotate: '45deg' }],
  },
  logoTextMobile: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  atomicTextMobile: {
    color: '#ffffff',
  },
  flixTextMobile: {
    color: '#00bcd4',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  
  // Hero section avec image de fond
  heroContainer: {
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // Sélecteurs de langue VO/VF
  languageContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333366',
  },
  languageButtonActive: {
    backgroundColor: '#003d82',
    borderColor: '#00bcd4',
  },
  languageText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  languageTextActive: {
    color: '#ffffff',
  },
  
  // Dropdowns pour épisode et serveur
  dropdownContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00bcd4',
  },
  dropdownText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Section dernière sélection
  lastSelectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  lastSelectionLabel: {
    fontSize: 12,
    color: '#cccccc',
    fontWeight: '600',
  },
  
  // Lecteur vidéo
  videoPlayerContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333366',
    overflow: 'hidden',
  },
  videoPlayerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333366',
  },
  videoPlayerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  videoPlayerSubtitle: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4,
  },
  videoPlayerContent: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a1a',
  },
  sandboxMessage: {
    fontSize: 18,
    color: '#00bcd4',
    textAlign: 'center',
    fontWeight: '600',
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#1a1a2e',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#003d82',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Footer
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // WebView et chargement
  webView: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  
  // Serveurs
  serverContainer: {
    marginTop: 15,
    paddingHorizontal: 16,
  },
  serverLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  serverScroll: {
    flexDirection: 'row',
  },
  serverButton: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  serverButtonActive: {
    backgroundColor: '#00bcd4',
    borderColor: '#00bcd4',
  },
  serverButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  serverButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Épisodes
  episodeListContainer: {
    marginTop: 15,
    paddingHorizontal: 16,
  },
  episodeLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  episodeScroll: {
    flexDirection: 'row',
  },
  episodeItem: {
    backgroundColor: '#1a1a2e',
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  episodeItemActive: {
    backgroundColor: '#00bcd4',
    borderColor: '#00bcd4',
  },
  episodeItemNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  episodeItemNumberActive: {
    color: '#ffffff',
  },
  episodeItemTitle: {
    color: '#cccccc',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  episodeItemTitleActive: {
    color: '#ffffff',
  },
  
  // Chargement épisode
  episodeLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: 15,
  },
  
  // Erreurs
  errorBanner: {
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    marginTop: 15,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorBannerText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  errorRetryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  errorRetryText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AnimePlayerScreen;