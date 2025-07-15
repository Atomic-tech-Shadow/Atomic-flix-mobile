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
} from 'react-native';
// Note: WebView nécessite installation manuelle avec --legacy-peer-deps
// import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Episode, VideoSource, EpisodeDetails } from '../types/index';
import type { RootStackParamList } from '../navigation/AppNavigator';

type AnimePlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimePlayer'>;
type AnimePlayerScreenRouteProp = RouteProp<RootStackParamList, 'AnimePlayer'>;

const { width, height } = Dimensions.get('window');

// Reproduction exacte de anime-player.tsx
const AnimePlayerScreen: React.FC = () => {
  const navigation = useNavigation<AnimePlayerScreenNavigationProp>();
  const route = useRoute<AnimePlayerScreenRouteProp>();
  const { animeUrl, seasonData, animeTitle } = route.params;

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [currentSources, setCurrentSources] = useState<VideoSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration API identique au site web
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

  // Fonction API identique au site web
  const apiRequest = async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  };

  // Charger les épisodes de la saison (identique au site web)
  const loadSeasonEpisodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const extractedId = animeUrl.split('/').pop() || animeUrl;
      const languageCode = 'vf'; // Par défaut VF

      console.log('Chargement épisodes pour:', extractedId, 'saison:', seasonData.value);

      const response = await apiRequest(`/api/episodes/${extractedId}?season=${seasonData.value}&language=${languageCode}`);
      console.log('Épisodes reçus:', response);

      if (response && response.success && response.episodes) {
        const formattedEpisodes = response.episodes.map((ep: any, index: number) => {
          const episodeNumber = ep.number || (index + 1);
          const episodeTitle = ep.title || `Épisode ${episodeNumber}`;

          return {
            id: `${extractedId}-${seasonData.value}-ep${episodeNumber}-${languageCode}`,
            title: episodeTitle,
            episodeNumber: episodeNumber,
            url: ep.url || `https://anime-sama.fr/catalogue/${extractedId}/${seasonData.value}/${languageCode}/episode-${episodeNumber}`,
            language: languageCode.toUpperCase(),
            available: ep.available !== false,
            streamingSources: ep.streamingSources || []
          };
        });

        setEpisodes(formattedEpisodes);

        if (formattedEpisodes.length > 0) {
          await loadEpisodeSources(formattedEpisodes[0]);
        }
      } else {
        setError('Aucun épisode trouvé pour cette saison');
      }
    } catch (error) {
      console.error('Erreur chargement épisodes:', error);
      setError('Erreur lors du chargement des épisodes');
    } finally {
      setLoading(false);
    }
  };

  // Charger les sources d'un épisode (identique au site web)
  const loadEpisodeSources = async (episode: Episode) => {
    if (!episode) return;

    try {
      setEpisodeLoading(true);
      setCurrentEpisode(episode);
      setCurrentSources([]);
      setSelectedSource(null);

      console.log('Récupération sources streaming pour épisode:', episode.episodeNumber);

      const response = await apiRequest(`/api/embed?url=${encodeURIComponent(episode.url)}`);
      console.log('Sources streaming reçues:', response);

      if (response && response.success && response.sources && response.sources.length > 0) {
        setCurrentSources(response.sources);
        setSelectedSource(response.sources[0]);
        console.log('Sources streaming chargées:', response.sources.length, 'serveurs disponibles');
      } else {
        console.error('Aucune source trouvée dans la réponse API');
        setError('Aucune source de streaming disponible pour cet épisode');
      }
    } catch (error) {
      console.error('Erreur récupération sources API:', error);
      setError('Erreur lors du chargement des sources de streaming');
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Effet initial
  useEffect(() => {
    loadSeasonEpisodes();
  }, []);

  // Composant Header avec navigation
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {animeTitle}
        </Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>
          {seasonData.name} • {currentEpisode ? `Épisode ${currentEpisode.episodeNumber}` : 'Chargement...'}
        </Text>
      </View>
    </View>
  );

  // Composant Lecteur Vidéo Simple (Compatible Android 5.0+)
  const renderVideoPlayer = () => {
    if (!selectedSource) {
      return (
        <View style={styles.playerContainer}>
          <View style={styles.playerPlaceholder}>
            <Ionicons name="play-circle" size={64} color="#6b7280" />
            <Text style={styles.placeholderText}>
              {episodeLoading ? 'Chargement...' : 'Sélectionnez un épisode'}
            </Text>
          </View>
        </View>
      );
    }

    // Lecteur iframe simple - Compatible Android 5.0+
    return (
      <View style={styles.playerContainer}>
        <View style={styles.iframeContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              // Ouvrir dans le navigateur externe
              Alert.alert(
                'Lecture vidéo',
                'Ouvrir la vidéo dans le navigateur ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { 
                    text: 'Ouvrir', 
                    onPress: () => {
                      // Linking.openURL(selectedSource.url);
                      console.log('Ouverture URL:', selectedSource.url);
                    }
                  }
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle" size={80} color="#00ffff" />
          </TouchableOpacity>

          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>
              {currentEpisode ? `Épisode ${currentEpisode.episodeNumber}` : 'Vidéo'}
            </Text>
            <Text style={styles.videoServer}>
              {selectedSource.server || 'Serveur de streaming'}
            </Text>
            {selectedSource.quality && (
              <Text style={styles.videoQuality}>
                Qualité: {selectedSource.quality}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  // Composant Sélecteur de Serveurs
  const renderServerSelector = () => {
    if (currentSources.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="server" size={20} color="#00ffff" />
          <Text style={styles.sectionTitle}>
            Serveurs disponibles ({currentSources.length})
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.serversContainer}>
            {currentSources.map((source, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.serverButton,
                  selectedSource?.url === source.url && styles.serverButtonActive
                ]}
                onPress={() => setSelectedSource(source)}
                activeOpacity={0.8}
              >
                <View style={styles.serverButtonContent}>
                  <Ionicons 
                    name="play" 
                    size={16} 
                    color={selectedSource?.url === source.url ? "#ffffff" : "#00ffff"} 
                  />
                  <Text style={[
                    styles.serverButtonText,
                    selectedSource?.url === source.url && styles.serverButtonTextActive
                  ]}>
                    {source.server || `Serveur ${index + 1}`}
                  </Text>
                </View>
                {source.quality && (
                  <Text style={styles.serverQuality}>{source.quality}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Composant Liste des Épisodes
  const renderEpisodesList = () => {
    if (episodes.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list" size={20} color="#00ffff" />
          <Text style={styles.sectionTitle}>
            Épisodes ({episodes.length})
          </Text>
        </View>

        <View style={styles.episodesGrid}>
          {episodes.map((episode, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.episodeButton,
                currentEpisode?.episodeNumber === episode.episodeNumber && styles.episodeButtonActive,
                !episode.available && styles.episodeButtonDisabled
              ]}
              onPress={() => episode.available ? loadEpisodeSources(episode) : null}
              disabled={!episode.available || episodeLoading}
              activeOpacity={0.8}
            >
              <View style={styles.episodeButtonContent}>
                <View style={styles.episodeIcon}>
                  {episodeLoading && currentEpisode?.episodeNumber === episode.episodeNumber ? (
                    <ActivityIndicator size="small" color="#00ffff" />
                  ) : (
                    <Ionicons 
                      name={episode.available ? "play" : "lock-closed"} 
                      size={16} 
                      color={
                        currentEpisode?.episodeNumber === episode.episodeNumber 
                          ? "#ffffff" 
                          : episode.available 
                            ? "#00ffff" 
                            : "#6b7280"
                      } 
                    />
                  )}
                </View>

                <View style={styles.episodeInfo}>
                  <Text style={[
                    styles.episodeNumber,
                    currentEpisode?.episodeNumber === episode.episodeNumber && styles.episodeNumberActive,
                    !episode.available && styles.episodeNumberDisabled
                  ]}>
                    Épisode {episode.episodeNumber}
                  </Text>

                  {episode.title && (
                    <Text style={[
                      styles.episodeTitle,
                      currentEpisode?.episodeNumber === episode.episodeNumber && styles.episodeTitleActive,
                      !episode.available && styles.episodeTitleDisabled
                    ]} numberOfLines={1}>
                      {episode.title}
                    </Text>
                  )}
                </View>
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
          <Text style={styles.loadingText}>Chargement des épisodes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSeasonEpisodes}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a0a" />

      <View style={styles.content}>
        {renderHeader()}
        {renderVideoPlayer()}

        <ScrollView 
          style={styles.controlsScrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderServerSelector()}
          {renderEpisodesList()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(10,10,10,0.95)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  playerContainer: {
    height: height * 0.25,
    backgroundColor: '#000000',
    position: 'relative',
  },
  iframeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  videoInfo: {
    alignItems: 'center',
  },
  videoTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoServer: {
    color: '#00ffff',
    fontSize: 14,
    marginBottom: 4,
  },
  videoQuality: {
    color: '#9ca3af',
    fontSize: 12,
  },
  playerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderText: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 16,
  },
  controlsScrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  serversContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  serverButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
    minWidth: 100,
  },
  serverButtonActive: {
    backgroundColor: '#00ffff',
    borderColor: '#00ffff',
  },
  serverButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverButtonText: {
    color: '#00ffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  serverButtonTextActive: {
    color: '#ffffff',
  },
  serverQuality: {
    color: '#9ca3af',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  episodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  episodeButton: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  episodeButtonActive: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderColor: '#00ffff',
  },
  episodeButtonDisabled: {
    opacity: 0.5,
    borderColor: 'rgba(107,114,128,0.2)',
  },
  episodeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  episodeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  episodeNumberActive: {
    color: '#00ffff',
  },
  episodeNumberDisabled: {
    color: '#6b7280',
  },
  episodeTitle: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  episodeTitleActive: {
    color: '#d1d5db',
  },
  episodeTitleDisabled: {
    color: '#6b7280',
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

export default AnimePlayerScreen;