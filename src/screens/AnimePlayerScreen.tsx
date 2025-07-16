import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Episode, VideoSource, Season, AnimeData, EpisodeDetails } from '../types';
import SharedHeader from '../components/SharedHeader';

type AnimePlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimePlayer'>;
type AnimePlayerScreenRouteProp = RouteProp<RootStackParamList, 'AnimePlayer'>;

interface Props {
  navigation: AnimePlayerScreenNavigationProp;
  route: AnimePlayerScreenRouteProp;
}

const { width, height } = Dimensions.get('window');

const AnimePlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { animeUrl, seasonData, animeTitle } = route.params;
  
  // États pour les données
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(seasonData || null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>('VF');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Fonction pour les requêtes API externes
  const apiRequest = async (endpoint: string, timeoutMs = 20000) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ATOMIC-FLIX-MOBILE/1.0',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Service externe indisponible: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  };

  // Fonction pour charger les détails d'un anime via l'API externe
  const getAnimeDetails = async (animeId: string) => {
    try {
      const response = await apiRequest(`https://anime-sama-scraper.vercel.app/api/anime/${animeId}`);
      
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

  // Fonction pour charger les épisodes via API externe
  const loadSeasonEpisodes = async (season: Season, autoLoadEpisode = false) => {
    if (!animeData) {
      console.log('Pas de données anime disponibles pour charger les épisodes');
      return;
    }
    
    try {
      setEpisodeLoading(true);
      const languageCode = selectedLanguage.toLowerCase();
      
      console.log('Chargement épisodes pour:', animeData.id, 'saison:', season.value, 'langue:', selectedLanguage);
      
      const data = await apiRequest(`https://anime-sama-scraper.vercel.app/api/episodes/${animeData.id}?season=${season.value}&language=${languageCode}`);
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
        
        // Sélectionner le premier épisode
        const episodeToSelect = formattedEpisodes[0];
        console.log('Épisode sélectionné:', episodeToSelect.title);
        setSelectedEpisode(episodeToSelect);
        
        // Auto-charger l'épisode avec l'API embed
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

  // Fonction pour charger les sources d'un épisode
  const loadEpisodeSources = async (episode: Episode) => {
    try {
      setEpisodeLoading(true);
      console.log('Chargement sources pour épisode:', episode.title);
      
      const response = await apiRequest(`https://anime-sama-scraper.vercel.app/api/embed?url=${encodeURIComponent(episode.url)}`);
      
      if (response && response.success && response.sources && response.sources.length > 0) {
        setEpisodeDetails({
          id: episode.id,
          title: episode.title,
          animeTitle: animeTitle,
          episodeNumber: episode.episodeNumber,
          sources: response.sources,
          availableServers: response.sources.map((s: any) => s.server),
          url: episode.url
        });
        setSelectedPlayer(0); // Reset au premier serveur
        console.log('Sources chargées:', response.sources.length, 'serveurs');
      } else {
        console.warn('Aucune source trouvée dans la réponse embed:', response);
        setError('Aucune source de streaming trouvée pour cet épisode');
      }
    } catch (embedError) {
      console.error('Erreur chargement sources embed:', embedError);
      setError('Erreur lors du chargement des sources de streaming');
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Fonction pour changer de langue
  const changeLanguage = async (newLang: 'VF' | 'VOSTFR') => {
    if (newLang === selectedLanguage || !selectedSeason) return;
    
    setSelectedLanguage(newLang);
    setEpisodes([]);
    setSelectedEpisode(null);
    setEpisodeDetails(null);
    
    // Recharger les épisodes avec la nouvelle langue
    await loadSeasonEpisodes(selectedSeason, true);
  };

  // Navigation entre épisodes
  const navigateEpisode = (direction: 'prev' | 'next') => {
    if (!selectedEpisode || episodes.length === 0) return;
    
    const currentIndex = episodes.findIndex(ep => ep.id === selectedEpisode.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : episodes.length - 1;
    } else {
      newIndex = currentIndex < episodes.length - 1 ? currentIndex + 1 : 0;
    }
    
    const newEpisode = episodes[newIndex];
    setSelectedEpisode(newEpisode);
    loadEpisodeSources(newEpisode);
  };

  // Charger les données de l'anime
  useEffect(() => {
    const loadAnimeData = async () => {
      try {
        setLoading(true);
        
        // Extraire l'ID de l'anime depuis l'URL
        const animeId = animeUrl.split('/').pop() || animeUrl;
        
        // Charger les données de base de l'anime
        const animeData = await getAnimeDetails(animeId);
        
        if (animeData && animeData.success && animeData.data) {
          setAnimeData(animeData.data);
          
          // Utiliser la saison passée en paramètre ou la première disponible
          const seasonToSelect = seasonData || animeData.data.seasons[0];
          setSelectedSeason(seasonToSelect);
          
          // Sélectionner la langue par défaut
          if (seasonToSelect && seasonToSelect.languages) {
            const defaultLanguage = seasonToSelect.languages.includes('VF') ? 'VF' : 
                                  seasonToSelect.languages.includes('VOSTFR') ? 'VOSTFR' : 
                                  seasonToSelect.languages[0] || 'VF';
            
            setSelectedLanguage(defaultLanguage as 'VF' | 'VOSTFR');
            
            // Charger les épisodes avec la langue par défaut
            await loadSeasonEpisodes(seasonToSelect, true);
          }
        } else {
          setError('Erreur lors du chargement des données de l\'anime');
        }
      } catch (err) {
        console.error('Erreur chargement anime:', err);
        setError('Erreur lors du chargement de l\'anime');
      } finally {
        setLoading(false);
      }
    };

    loadAnimeData();
  }, [animeUrl, seasonData]);

  // Fonction de rafraîchissement
  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedSeason) {
      await loadSeasonEpisodes(selectedSeason, true);
    }
    setRefreshing(false);
  };

  // Fonction de retry
  const retryLoad = () => {
    setError(null);
    if (selectedSeason) {
      loadSeasonEpisodes(selectedSeason, true);
    }
  };

  // Rendu du lecteur vidéo
  const renderVideoPlayer = () => {
    if (!episodeDetails || !episodeDetails.sources[selectedPlayer]) {
      return (
        <View style={styles.videoContainer}>
          <ActivityIndicator size="large" color="#00bcd4" />
          <Text style={styles.loadingText}>Chargement du lecteur...</Text>
        </View>
      );
    }

    const currentSource = episodeDetails.sources[selectedPlayer];
    
    return (
      <View style={styles.videoContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: currentSource.url }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onError={(error) => {
            console.error('Erreur WebView:', error);
            setError('Erreur du lecteur vidéo');
          }}
          onLoadStart={() => setEpisodeLoading(true)}
          onLoadEnd={() => setEpisodeLoading(false)}
          renderError={() => (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={48} color="#ef4444" />
              <Text style={styles.errorText}>Erreur du lecteur</Text>
              <TouchableOpacity style={styles.retryButton} onPress={retryLoad}>
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        {episodeLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00bcd4" />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00bcd4" />
          <Text style={styles.loadingText}>Chargement de l'anime...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryLoad}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Anime non trouvé</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryLoad}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header avec SharedHeader */}
      <SharedHeader />
      
      {/* Titre de l'anime et saison */}
      <View style={styles.titleContainer}>
        <Text style={styles.animeTitle} numberOfLines={1}>{animeTitle}</Text>
        <Text style={styles.seasonTitle} numberOfLines={1}>{selectedSeason?.name}</Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00bcd4" />
        }
      >
        {/* Sélecteur de langue */}
        {selectedSeason && selectedSeason.languages.length > 1 && (
          <View style={styles.languageSelector}>
            {selectedSeason.languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  selectedLanguage === lang && styles.languageButtonActive
                ]}
                onPress={() => changeLanguage(lang as 'VF' | 'VOSTFR')}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.flagBackground,
                  lang === 'VF' ? styles.frenchFlag : styles.japaneseFlag
                ]}>
                  {lang === 'VF' ? (
                    <View style={styles.frenchFlagStripes}>
                      <View style={[styles.flagStripe, { backgroundColor: '#003f7f' }]} />
                      <View style={[styles.flagStripe, { backgroundColor: '#ffffff' }]} />
                      <View style={[styles.flagStripe, { backgroundColor: '#ed2939' }]} />
                    </View>
                  ) : (
                    <View style={styles.japaneseCircle}>
                      <View style={styles.japaneseRedCircle} />
                    </View>
                  )}
                </View>
                <Text style={styles.languageText}>
                  {lang === 'VOSTFR' ? 'VO' : lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Navigation et info épisode */}
        {selectedEpisode && (
          <View style={styles.episodeControls}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateEpisode('prev')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeTitle} numberOfLines={1}>
                {selectedEpisode.title}
              </Text>
              <Text style={styles.episodeNumber}>
                ÉPISODE {selectedEpisode.episodeNumber}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateEpisode('next')}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Lecteur vidéo */}
        {renderVideoPlayer()}

        {/* Sélection serveur */}
        {episodeDetails && episodeDetails.sources.length > 1 && (
          <View style={styles.serverSelector}>
            <Text style={styles.serverTitle}>SERVEURS DISPONIBLES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.serverList}>
                {episodeDetails.sources.map((source, index) => (
                  <TouchableOpacity
                    key={`server-${index}`}
                    style={[
                      styles.serverButton,
                      selectedPlayer === index && styles.serverButtonActive
                    ]}
                    onPress={() => setSelectedPlayer(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.serverButtonText,
                      selectedPlayer === index && styles.serverButtonTextActive
                    ]}>
                      {source.server}
                    </Text>
                    <Text style={[
                      styles.serverQuality,
                      selectedPlayer === index && styles.serverQualityActive
                    ]}>
                      {source.quality}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Liste des épisodes */}
        {episodes.length > 0 && (
          <View style={styles.episodeList}>
            <Text style={styles.episodeListTitle}>ÉPISODES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.episodeListContainer}>
                {episodes.map((episode) => (
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
                    activeOpacity={0.7}
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
              </View>
            </ScrollView>
          </View>
        )}

        {/* Message d'erreur */}
        {error && (
          <View style={styles.errorMessage}>
            <Ionicons name="warning-outline" size={24} color="#ef4444" />
            <Text style={styles.errorMessageText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryLoad}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
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
    backgroundColor: '#0f172a',
  },
  titleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  animeTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  seasonTitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00bcd4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  languageButton: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#64748b',
    overflow: 'hidden',
  },
  languageButtonActive: {
    borderColor: '#ffffff',
  },
  flagBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  frenchFlag: {},
  japaneseFlag: {
    backgroundColor: '#ffffff',
  },
  frenchFlagStripes: {
    flexDirection: 'row',
    flex: 1,
  },
  flagStripe: {
    flex: 1,
  },
  japaneseCircle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  japaneseRedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#bc002d',
  },
  languageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  episodeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 22,
  },
  episodeInfo: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  episodeTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  episodeNumber: {
    color: '#00bcd4',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  videoContainer: {
    height: (width * 9) / 16, // Aspect ratio 16:9
    backgroundColor: '#000000',
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  serverSelector: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  serverTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  serverList: {
    flexDirection: 'row',
    gap: 12,
  },
  serverButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#64748b',
    backgroundColor: '#1e293b',
  },
  serverButtonActive: {
    borderColor: '#00bcd4',
    backgroundColor: '#00bcd4',
  },
  serverButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  serverButtonTextActive: {
    color: '#ffffff',
  },
  serverQuality: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  serverQualityActive: {
    color: '#ffffff',
  },
  episodeList: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  episodeListTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  episodeListContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  episodeItem: {
    width: 120,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#64748b',
    backgroundColor: '#1e293b',
  },
  episodeItemActive: {
    borderColor: '#00bcd4',
    backgroundColor: '#00bcd4',
  },
  episodeItemNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  episodeItemNumberActive: {
    color: '#ffffff',
  },
  episodeItemTitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  episodeItemTitleActive: {
    color: '#ffffff',
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#7f1d1d',
    gap: 12,
  },
  errorMessageText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
});

export default AnimePlayerScreen;