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
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Episode, VideoSource, Season, AnimeData, EpisodeDetails } from '../types';
import SharedHeader from '../components/SharedHeader';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
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

  // Fonction séparée pour charger les épisodes avec les données anime
  const loadSeasonEpisodesWithData = async (animeInfo: AnimeData, season: Season, language: 'VF' | 'VOSTFR', autoLoadEpisode = false) => {
    try {
      setEpisodeLoading(true);
      const languageCode = language.toLowerCase();
      
      const data = await apiRequest(`https://anime-sama-scraper.vercel.app/api/episodes/${animeInfo.id}?season=${season.value}&language=${languageCode}`);
      
      if (data && data.success && data.episodes && Array.isArray(data.episodes) && data.episodes.length > 0) {
        const formattedEpisodes: Episode[] = data.episodes.map((ep: any, index: number) => {
          const episodeNumber = ep.number || (index + 1);
          const episodeTitle = ep.title || `Épisode ${episodeNumber}`;
          const episodeUrl = ep.url || `https://anime-sama.fr/catalogue/${animeInfo.id}/${season.value}/${languageCode}/episode-${episodeNumber}`;
          
          return {
            id: `${animeInfo.id}-${season.value}-ep${episodeNumber}-${languageCode}`,
            title: episodeTitle,
            episodeNumber: episodeNumber,
            url: episodeUrl,
            language: language,
            available: ep.available !== false,
            streamingSources: ep.streamingSources || []
          };
        });
        
        setEpisodes(formattedEpisodes);
        setSelectedEpisode(formattedEpisodes[0]);
        
        if (autoLoadEpisode) {
          loadEpisodeSources(formattedEpisodes[0]);
        }
      } else {
        setError('Aucun épisode trouvé pour cette saison');
      }
    } catch (err) {
      setError('Erreur lors du chargement des épisodes');
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Fonction pour charger les épisodes via API externe
  const loadSeasonEpisodes = async (season: Season, autoLoadEpisode = false) => {
    if (!animeData) {
      return;
    }
    
    await loadSeasonEpisodesWithData(animeData, season, selectedLanguage, autoLoadEpisode);
    
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
        setError(null);
        
        // Extraire l'ID de l'anime depuis l'URL
        const animeId = animeUrl.split('/').pop()?.replace(/\.html$/, '') || animeUrl;
        
        // Charger les données de base de l'anime
        const response = await getAnimeDetails(animeId);
        
        if (response && response.success && response.data) {
          const animeInfo = response.data;
          setAnimeData(animeInfo);
          
          // Utiliser la saison passée en paramètre ou la première disponible
          const seasonToSelect = seasonData || animeInfo.seasons[0];
          setSelectedSeason(seasonToSelect);
          
          // Sélectionner la langue par défaut
          if (seasonToSelect && seasonToSelect.languages) {
            const defaultLanguage = seasonToSelect.languages.includes('VF') ? 'VF' : 
                                  seasonToSelect.languages.includes('VOSTFR') ? 'VOSTFR' : 'VF';
            
            setSelectedLanguage(defaultLanguage as 'VF' | 'VOSTFR');
            
            // Charger les épisodes immédiatement après avoir défini animeData
            setTimeout(async () => {
              await loadSeasonEpisodesWithData(animeInfo, seasonToSelect, defaultLanguage as 'VF' | 'VOSTFR', true);
            }, 100);
          } else {
            setError('Aucune langue disponible pour cette saison');
          }
        } else {
          setError('Impossible de charger les données de l\'anime');
        }
      } catch (err) {
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
          <LoadingSpinner 
            message="Chargement du lecteur..." 
            size="large"
            color="#00bcd4"
          />
        </View>
      );
    }

    const currentSource = episodeDetails.sources[selectedPlayer];
    
    return (
      <View style={styles.videoPlayerWrapper}>
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
          
          {/* Overlay avec informations de l'épisode - Style anime-sama */}
          <View style={styles.videoOverlay}>
            <View style={styles.videoInfoContainer}>
              <Text style={styles.videoAnimeTitle} numberOfLines={1}>
                {episodeDetails.animeTitle}
              </Text>
              <Text style={styles.videoEpisodeInfo} numberOfLines={1}>
                Épisode {episodeDetails.episodeNumber} • {currentSource.server} • {currentSource.quality}
              </Text>
            </View>
          </View>
          
          {episodeLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#00bcd4" />
            </View>
          )}
        </View>
      </View>
    );
  };



  // Fonction pour télécharger la vidéo - Identique au web
  const downloadVideo = (quality: 'faible' | 'moyenne' | 'HD') => {
    if (!episodeDetails || !episodeDetails.sources[selectedPlayer]) {
      Alert.alert('Erreur', 'Aucune source vidéo disponible pour le téléchargement.');
      return;
    }
    
    const qualityText = quality === 'faible' ? '360p' : quality === 'moyenne' ? '720p' : '1080p';
    const source = episodeDetails.sources[selectedPlayer];
    
    Alert.alert(
      'Téléchargement',
      `Téléchargement de ${episodeDetails.animeTitle} - Épisode ${episodeDetails.episodeNumber} en qualité ${qualityText}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Télécharger', 
          onPress: () => {
            // Fermer le menu
            setShowDownloadMenu(false);
            
            // Simuler le téléchargement (à implémenter selon les besoins)
            Alert.alert(
              'Téléchargement commencé',
              `Le téléchargement de l'épisode ${episodeDetails.episodeNumber} en ${qualityText} depuis ${source.server} a commencé.`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.loadingContainer}>
          <LoadingSpinner 
            message="Chargement de l'anime..." 
            size="large"
            color="#00bcd4"
          />
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
      
      {/* Bannière avec titre de la saison - Pleine largeur comme le web */}
      <View style={styles.bannerContainer}>
        {animeData?.image && (
          <Image
            source={{ uri: animeData.image }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.bannerOverlay} />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{animeData.title}</Text>
          <Text style={styles.bannerSeason}>{selectedSeason?.name}</Text>
        </View>
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
                      <View style={[styles.flagStripe, { backgroundColor: '#1d4ed8' }]} />
                      <View style={[styles.flagStripe, { backgroundColor: '#ffffff' }]} />
                      <View style={[styles.flagStripe, { backgroundColor: '#dc2626' }]} />
                    </View>
                  ) : (
                    <View style={styles.japaneseFlag}>
                      <View style={styles.japaneseCircle}>
                        <View style={styles.japaneseRedCircle} />
                      </View>
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

        {/* Sélecteurs en grille 2 colonnes - Style anime-sama */}
        {episodes.length > 0 && (
          <View style={styles.selectorsGrid}>
            {/* Sélecteur d'épisode */}
            <View style={styles.selectorHalf}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedEpisode?.id || ''}
                  onValueChange={(itemValue) => {
                    const episode = episodes.find(ep => ep.id === itemValue);
                    if (episode) {
                      setSelectedEpisode(episode);
                      loadEpisodeSources(episode);
                    }
                  }}
                  style={styles.picker}
                  dropdownIconColor="#ffffff"
                >
                  {episodes.map((episode) => (
                    <Picker.Item
                      key={episode.id}
                      label={`ÉPISODE ${episode.episodeNumber}`}
                      value={episode.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Sélecteur de serveur - Toujours visible avec placeholder */}
            <View style={styles.selectorHalf}>
              <View style={styles.pickerContainer}>
                {episodeDetails && episodeDetails.sources.length > 0 ? (
                  <Picker
                    selectedValue={selectedPlayer.toString()}
                    onValueChange={(itemValue) => setSelectedPlayer(parseInt(itemValue as string))}
                    style={styles.picker}
                    dropdownIconColor="#ffffff"
                  >
                    {episodeDetails.sources.map((source, index) => (
                      <Picker.Item
                        key={`server-${index}-${source.server}`}
                        label={`${source.server} (${source.quality})`}
                        value={index.toString()}
                      />
                    ))}
                  </Picker>
                ) : (
                  <Picker
                    selectedValue=""
                    onValueChange={() => {}}
                    style={styles.picker}
                    dropdownIconColor="#ffffff"
                    enabled={false}
                  >
                    <Picker.Item
                      label="Chargement des serveurs..."
                      value=""
                    />
                  </Picker>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Dernière sélection - Style anime-sama */}
        {selectedEpisode && (
          <View style={styles.lastSelectionContainer}>
            <Text style={styles.lastSelectionText}>
              <Text style={styles.lastSelectionLabel}>DERNIÈRE SÉLECTION : </Text>
              <Text style={styles.lastSelectionValue}>ÉPISODE {selectedEpisode.episodeNumber}</Text>
            </Text>
          </View>
        )}

        {/* Lecteur vidéo */}
        {renderVideoPlayer()}

        {/* Navigation entre épisodes - Style anime-sama identique au web */}
        {episodes.length > 0 && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.navButtonCustom,
                (!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0) && styles.navButtonDisabled
              ]}
              onPress={() => navigateEpisode('prev')}
              disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === 0}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.downloadContainer}>
              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  (!episodeDetails || episodeDetails.sources.length === 0) && styles.navButtonDisabled
                ]}
                onPress={() => setShowDownloadMenu(!showDownloadMenu)}
                disabled={!episodeDetails || episodeDetails.sources.length === 0}
                activeOpacity={0.7}
              >
                <Ionicons name="download" size={24} color="#ffffff" />
              </TouchableOpacity>
              
              {/* Menu de téléchargement */}
              {showDownloadMenu && episodeDetails && (
                <View style={styles.downloadMenu}>
                  <View style={styles.downloadMenuHeader}>
                    <Text style={styles.downloadMenuTitle}>Télécharger en :</Text>
                  </View>
                  <View style={styles.downloadMenuContent}>
                    <TouchableOpacity
                      style={styles.downloadMenuItem}
                      onPress={() => downloadVideo('faible')}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.qualityIndicator, { backgroundColor: '#eab308' }]} />
                      <Text style={styles.downloadMenuText}>Qualité Faible (360p)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.downloadMenuItem}
                      onPress={() => downloadVideo('moyenne')}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.qualityIndicator, { backgroundColor: '#3b82f6' }]} />
                      <Text style={styles.downloadMenuText}>Qualité Moyenne (720p)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.downloadMenuItem}
                      onPress={() => downloadVideo('HD')}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.qualityIndicator, { backgroundColor: '#10b981' }]} />
                      <Text style={styles.downloadMenuText}>Qualité HD (1080p)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={[
                styles.navButtonCustom,
                (!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1) && styles.navButtonDisabled
              ]}
              onPress={() => navigateEpisode('next')}
              disabled={!selectedEpisode || episodes.findIndex(ep => ep.id === selectedEpisode.id) === episodes.length - 1}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Message d'erreur de pub - Style anime-sama */}
        {selectedEpisode && (
          <View style={styles.atomicMessageContainer}>
            <Text style={styles.atomicMessageText}>⚛️I AM ATOMIC⚛️</Text>
            <Text style={styles.atomicMessageSubtext}>
              <Text style={styles.atomicMessageBold}>Trop de pub🙄? Changez de lecteur.</Text>
            </Text>
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
  bannerContainer: {
    position: 'relative',
    height: 200, // Équivalent à h-48 (192px) ou h-56 (224px)
    overflow: 'hidden',
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Équivalent à bg-black/60
  },
  bannerContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  bannerTitle: {
    fontSize: 24, // Équivalent à text-2xl
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  bannerSeason: {
    fontSize: 18, // Équivalent à text-lg
    color: '#d1d5db', // Équivalent à text-gray-300
    textTransform: 'uppercase',
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
    minWidth: 80,
    minHeight: 60,
  },
  languageButtonActive: {
    borderColor: '#ffffff',
  },
  flagBackground: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 6,
  },
  frenchFlag: {
    backgroundColor: '#ffffff',
  },
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dc2626',
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
  dropdownContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  dropdownLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  picker: {
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
  selectorsGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectorHalf: {
    flex: 1,
  },
  videoPlayerWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#374151',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  videoOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  videoInfoContainer: {
    flexDirection: 'column',
  },
  videoAnimeTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  videoEpisodeInfo: {
    color: '#d1d5db',
    fontSize: 12,
    marginTop: 2,
  },
  lastSelectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  lastSelectionText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  lastSelectionLabel: {
    fontWeight: 'bold',
  },
  lastSelectionValue: {
    color: '#ffffff',
  },
  atomicMessageContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  atomicMessageText: {
    color: '#d1d5db',
    fontSize: 14,
    textAlign: 'center',
  },
  atomicMessageSubtext: {
    color: '#d1d5db',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  atomicMessageBold: {
    fontWeight: 'bold',
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
  
  // Styles pour la navigation et le téléchargement
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 10,
  },
  navButtonCustom: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  navButtonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
  },
  downloadContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#00bcd4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  downloadMenu: {
    position: 'absolute',
    top: 55,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  downloadMenuHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  downloadMenuTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  downloadMenuContent: {
    paddingVertical: 8,
  },
  downloadMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  qualityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  downloadMenuText: {
    color: '#ffffff',
    fontSize: 14,
  },
});

export default AnimePlayerScreen;