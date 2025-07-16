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
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';

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

  // États pour les données (identiques au site web)
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

  // Fonction pour les requêtes API (identique au site web)
  const apiRequest = async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

  // Charger les épisodes de la saison (identique au site web)
  const loadSeasonEpisodes = async (autoLoadEpisode = false) => {
    try {
      setEpisodeLoading(true);
      setError(null);

      const extractedId = animeUrl.split('/').pop() || animeUrl;
      const languageCode = selectedLanguage.toLowerCase();
      
      console.log('Chargement épisodes pour:', extractedId, 'saison:', seasonData.value, 'langue:', selectedLanguage);
      
      const data = await apiRequest(`/api/episodes/${extractedId}?season=${seasonData.value}&language=${languageCode}`);
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
          const episodeUrl = ep.url || `https://anime-sama.fr/catalogue/${extractedId}/${seasonData.value}/${languageCode}/episode-${episodeNumber}`;
          
          return {
            id: `${extractedId}-${seasonData.value}-ep${episodeNumber}-${languageCode}`,
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
        
        // Sélectionner le premier épisode
        const firstEpisode = formattedEpisodes[0];
        console.log('Premier épisode sélectionné:', firstEpisode.title);
        setSelectedEpisode(firstEpisode);
        
        // Auto-charger l'épisode avec l'API embed
        if (autoLoadEpisode) {
          await loadEpisodeSources(firstEpisode);
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

  // Charger les sources d'un épisode (identique au site web)
  const loadEpisodeSources = async (episode: Episode) => {
    if (!episode) return;
    
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
          animeTitle: animeTitle,
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

  // Navigation entre épisodes (identique au site web)
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

  // Changer de langue (identique au site web)
  const changeLanguage = (newLanguage: 'VF' | 'VOSTFR') => {
    setSelectedLanguage(newLanguage);
    // Recharger les épisodes avec la nouvelle langue
    loadSeasonEpisodes(true);
  };

  // Changer de serveur
  const changeServer = (serverIndex: number) => {
    setSelectedPlayer(serverIndex);
  };

  // Charger les données au démarrage
  useEffect(() => {
    if (animeUrl && seasonData) {
      setLoading(true);
      loadSeasonEpisodes(true).finally(() => setLoading(false));
    }
  }, [animeUrl, seasonData]);

  // Refresh control
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSeasonEpisodes(true);
    setRefreshing(false);
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
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {animeTitle}
        </Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>
          {seasonData.name}
        </Text>
      </View>
    </View>
  );

  // Composant Contrôles épisode
  const renderEpisodeControls = () => (
    <View style={styles.controlsContainer}>
      {/* Sélection de la langue */}
      <View style={styles.languageContainer}>
        <Text style={styles.controlLabel}>Langue:</Text>
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              selectedLanguage === 'VF' && styles.languageButtonActive
            ]}
            onPress={() => changeLanguage('VF')}
          >
            <Text style={[
              styles.languageButtonText,
              selectedLanguage === 'VF' && styles.languageButtonTextActive
            ]}>VF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              selectedLanguage === 'VOSTFR' && styles.languageButtonActive
            ]}
            onPress={() => changeLanguage('VOSTFR')}
          >
            <Text style={[
              styles.languageButtonText,
              selectedLanguage === 'VOSTFR' && styles.languageButtonTextActive
            ]}>VOSTFR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation épisodes */}
      <View style={styles.episodeNavigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            (!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0) && styles.navButtonDisabled
          ]}
          onPress={() => navigateEpisode('prev')}
          disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
        >
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
          <Text style={styles.navButtonText}>Précédent</Text>
        </TouchableOpacity>

        <View style={styles.episodeInfo}>
          <Text style={styles.episodeTitle}>
            {selectedEpisode ? selectedEpisode.title : 'Aucun épisode'}
          </Text>
          <Text style={styles.episodeNumber}>
            {selectedEpisode ? `Épisode ${selectedEpisode.episodeNumber}` : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            (!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1) && styles.navButtonDisabled
          ]}
          onPress={() => navigateEpisode('next')}
          disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1}
        >
          <Text style={styles.navButtonText}>Suivant</Text>
          <Ionicons name="chevron-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Composant Sélection serveur
  const renderServerSelection = () => (
    <View style={styles.serverContainer}>
      <Text style={styles.controlLabel}>Serveur:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serverScroll}>
        {episodeDetails?.sources.map((source, index) => (
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

  // Composant Lecteur vidéo
  const renderVideoPlayer = () => {
    if (!episodeDetails?.sources[selectedPlayer]) {
      return (
        <View style={styles.playerContainer}>
          <View style={styles.playerPlaceholder}>
            <Ionicons name="play-circle" size={64} color="#6b7280" />
            <Text style={styles.placeholderText}>Aucune source disponible</Text>
          </View>
        </View>
      );
    }

    const currentSource = episodeDetails.sources[selectedPlayer];
    
    return (
      <View style={styles.playerContainer}>
        <WebView
          source={{ uri: currentSource.url }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#00ffff" />
              <Text style={styles.loadingText}>Chargement du lecteur...</Text>
            </View>
          )}
          onError={(error) => {
            console.error('Erreur WebView:', error);
            setError('Erreur lors du chargement du lecteur vidéo');
          }}
        />
      </View>
    );
  };

  // Composant Liste épisodes
  const renderEpisodeList = () => (
    <View style={styles.episodeListContainer}>
      <Text style={styles.controlLabel}>Épisodes ({episodes.length}):</Text>
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

  // État de chargement
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ffff" />
          <Text style={styles.loadingText}>Chargement du lecteur...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // État d'erreur
  if (error && !episodeDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadSeasonEpisodes(true)}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
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
        {/* Contrôles épisode */}
        {renderEpisodeControls()}

        {/* Lecteur vidéo */}
        {renderVideoPlayer()}

        {/* Sélection serveur */}
        {episodeDetails && renderServerSelection()}

        {/* Liste épisodes */}
        {episodes.length > 0 && renderEpisodeList()}

        {/* Message d'erreur */}
        {error && (
          <View style={styles.errorBanner}>
            <View style={styles.errorBannerContent}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" style={styles.errorIcon} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
            <TouchableOpacity style={styles.errorRetryButton} onPress={() => loadSeasonEpisodes(true)}>
              <Text style={styles.errorRetryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* État de chargement épisode */}
        {episodeLoading && (
          <View style={styles.episodeLoadingContainer}>
            <ActivityIndicator size="large" color="#00ffff" />
            <Text style={styles.loadingText}>Chargement de l'épisode...</Text>
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#00ffff',
    marginTop: 2,
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
  controlsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  languageContainer: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00ffff',
    marginBottom: 8,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  languageButtonActive: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderColor: '#00ffff',
  },
  languageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  languageButtonTextActive: {
    color: '#00ffff',
  },
  episodeNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    opacity: 0.5,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  episodeInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  episodeNumber: {
    fontSize: 14,
    color: '#00ffff',
    textAlign: 'center',
  },
  playerContainer: {
    height: 250,
    backgroundColor: '#000000',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  playerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderText: {
    color: '#6b7280',
    marginTop: 16,
    fontSize: 16,
  },
  serverContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  serverScroll: {
    flexDirection: 'row',
  },
  serverButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  serverButtonActive: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderColor: '#00ffff',
  },
  serverButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  serverButtonTextActive: {
    color: '#00ffff',
  },
  episodeListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  episodeScroll: {
    flexDirection: 'row',
  },
  episodeItem: {
    width: 120,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  episodeItemActive: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderColor: '#00ffff',
  },
  episodeItemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  episodeItemNumberActive: {
    color: '#00ffff',
  },
  episodeItemTitle: {
    fontSize: 12,
    color: '#d1d5db',
    lineHeight: 16,
  },
  episodeItemTitleActive: {
    color: '#ffffff',
  },
  errorBanner: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
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
  episodeLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
});

export default AnimePlayerScreen;