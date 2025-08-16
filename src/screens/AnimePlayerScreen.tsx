import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import OptimizedScrollView from '../components/OptimizedScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Episode, VideoSource, Season, AnimeData, EpisodeDetails } from '../types';
import SharedHeader from '../components/SharedHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, textStyles, interactiveStyles } from '../constants/newColors';
import ViewingHistoryService from '../services/ViewingHistoryService';

type AnimePlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimePlayer'>;
type AnimePlayerScreenRouteProp = RouteProp<RootStackParamList, 'AnimePlayer'>;

interface Props {
  navigation: AnimePlayerScreenNavigationProp;
  route: AnimePlayerScreenRouteProp;
}

const { width, height } = Dimensions.get('window');

const AnimePlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { animeUrl, seasonData, animeTitle, initialEpisode, initialLanguage } = route.params;

  // États pour les données
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(seasonData || null);
  const [selectedLanguage, setSelectedLanguage] = useState<'VF' | 'VOSTFR'>(initialLanguage || 'VOSTFR');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [serverError, setServerError] = useState<boolean>(false);

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
      throw error;
    }
  };

  // Fonction pour charger les détails d'un anime via l'API externe
  const getAnimeDetails = async (animeId: string) => {
    try {
      const response = await apiRequest(`https://anime-sama-scraper.vercel.app/api/anime/${animeId}`);

      if (!response || !response.success) {
        return null;
      }

      return response;
    } catch (error) {
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

        // 🎯 Sélectionner l'épisode spécifique si fourni depuis navigation directe, sinon le premier
        const episodeToSelect = initialEpisode 
          ? formattedEpisodes.find(ep => ep.episodeNumber === initialEpisode) || formattedEpisodes[0]
          : formattedEpisodes[0];
        setSelectedEpisode(episodeToSelect);

        if (autoLoadEpisode) {
          loadEpisodeSources(episodeToSelect);
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

      const data = await apiRequest(`https://anime-sama-scraper.vercel.app/api/episodes/${animeData.id}?season=${season.value}&language=${languageCode}`);

      if (!data || !data.success) {
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

        setEpisodes(formattedEpisodes);

        // 🎯 Sélectionner l'épisode spécifique si fourni depuis navigation directe, sinon le premier
        const episodeToSelect = initialEpisode 
          ? formattedEpisodes.find(ep => ep.episodeNumber === initialEpisode) || formattedEpisodes[0]
          : formattedEpisodes[0];
        setSelectedEpisode(episodeToSelect);

        // Auto-charger l'épisode spécifique avec l'API embed
        if (autoLoadEpisode) {
          loadEpisodeSources(episodeToSelect);
        }
      } else {
        setError('Aucun épisode trouvé pour cette saison et langue');
      }
    } catch (err) {
      setError('Erreur lors du chargement des épisodes depuis l\'API');
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Fonction pour charger les sources d'un épisode
  const loadEpisodeSources = async (episode: Episode) => {
    try {
      setEpisodeLoading(true);

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

        // 📈 Ajouter à l'historique quand l'épisode est chargé avec succès
        const historyService = ViewingHistoryService.getInstance();
        const animeId = animeUrl.split('/').pop() || animeUrl;
        
        await historyService.addToHistory({
          animeId,
          animeTitle,
          animeImage: animeData?.image || '',
          season: selectedSeason?.name || '',
          episode: `Épisode ${episode.episodeNumber}`,
          episodeTitle: episode.title,
          contentType: 'ANIME'
        });

        // Ne pas resetter selectedPlayer pour préserver le choix utilisateur
        // setSelectedPlayer(0); // SUPPRIMÉ: causait le bug de retour serveur 1
      } else {
        setError('Aucune source de streaming trouvée pour cet épisode');
      }
    } catch (embedError) {
      setError('Erreur lors du chargement des sources de streaming');
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Variable supprimée : pendingEpisodeReload n'est plus nécessaire avec le nouveau système fluide

  // Fonction pour changer de langue (version optimisée pour changement fluide)
  const changeLanguage = async (newLang: 'VF' | 'VOSTFR') => {
    if (newLang === selectedLanguage || !selectedSeason || !animeData) return;

    // Sauvegarder l'épisode actuel pour le recharger après le changement de langue
    const currentEpisodeNumber = selectedEpisode?.episodeNumber;
    
    // 🚀 Changer immédiatement la langue pour un feedback visuel instantané
    setSelectedLanguage(newLang);
    
    // 🔥 Vider immédiatement la liste d'épisodes pour un changement visuel instantané
    setEpisodes([]);
    setSelectedEpisode(null);
    setEpisodeDetails(null);
    
    // Montrer un indicateur de chargement pendant le changement
    setEpisodeLoading(true);
    
    try {
      // Charger les nouveaux épisodes avec la nouvelle langue en arrière-plan
      const languageCode = newLang.toLowerCase();
      
      const data = await apiRequest(`https://anime-sama-scraper.vercel.app/api/episodes/${animeData.id}?season=${selectedSeason.value}&language=${languageCode}`);

      if (data && data.success && data.episodes && Array.isArray(data.episodes) && data.episodes.length > 0) {
        const formattedEpisodes: Episode[] = data.episodes.map((ep: any, index: number) => {
          const episodeNumber = ep.number || (index + 1);
          const episodeTitle = ep.title || `Épisode ${episodeNumber}`;
          const episodeUrl = ep.url || `https://anime-sama.fr/catalogue/${animeData.id}/${selectedSeason.value}/${languageCode}/episode-${episodeNumber}`;

          return {
            id: `${animeData.id}-${selectedSeason.value}-ep${episodeNumber}-${languageCode}`,
            title: episodeTitle,
            episodeNumber: episodeNumber,
            url: episodeUrl,
            language: newLang,
            available: ep.available !== false,
            streamingSources: ep.streamingSources || []
          };
        });

        // ✨ Mettre à jour les épisodes avec la nouvelle langue
        setEpisodes(formattedEpisodes);
        
        // Chercher l'épisode équivalent dans la nouvelle langue
        const equivalentEpisode = currentEpisodeNumber 
          ? formattedEpisodes.find(ep => ep.episodeNumber === currentEpisodeNumber)
          : formattedEpisodes[0];
        
        if (equivalentEpisode) {
          setSelectedEpisode(equivalentEpisode);
          // Charger immédiatement les sources pour l'épisode équivalent
          await loadEpisodeSources(equivalentEpisode);
        } else {
          // Si l'épisode n'existe pas dans la nouvelle langue, prendre le premier
          const firstEpisode = formattedEpisodes[0];
          setSelectedEpisode(firstEpisode);
          await loadEpisodeSources(firstEpisode);
        }
      } else {
        setError(`Aucun épisode trouvé en ${newLang} pour cette saison`);
        // Garder la langue sélectionnée même s'il n'y a pas d'épisodes
        // L'utilisateur peut voir qu'il n'y a pas de contenu disponible
      }
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
      setError('Erreur lors du changement de langue');
      // En cas d'erreur, garder la nouvelle langue mais sans épisodes
      // L'utilisateur peut réessayer ou changer manuellement
    } finally {
      setEpisodeLoading(false);
    }
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
    loadEpisodeSources(newEpisode); // L'historique sera automatiquement mis à jour dans loadEpisodeSources
  };

  // ✨ Effet supprimé : le changement de langue est maintenant géré directement dans changeLanguage()

  // Effet pour maintenir l'écran allumé pendant la lecture et permettre l'orientation libre
  useEffect(() => {
    if (episodeDetails && episodeDetails.sources && episodeDetails.sources.length > 0) {
      // Activer le wake lock quand une vidéo est disponible
      activateKeepAwake();

      // Permettre toutes les orientations pour une meilleure expérience vidéo
      ScreenOrientation.unlockAsync();
    } else {
      // Revenir au mode portrait quand il n'y a pas de vidéo
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }

    // Nettoyer le wake lock quand le composant se démonte ou quand il n'y a plus de vidéo
    return () => {
      deactivateKeepAwake();
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [episodeDetails]);

  // Effet pour désactiver le wake lock et rétablir l'orientation quand on quitte l'écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      deactivateKeepAwake();
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    });

    return unsubscribe;
  }, [navigation]);

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

          // Sélectionner la langue par défaut ou utiliser initialLanguage si fournie
          if (seasonToSelect && seasonToSelect.languages) {
            let defaultLanguage: 'VF' | 'VOSTFR';
            
            // Utiliser initialLanguage si fournie et disponible, sinon fallback
            if (initialLanguage && seasonToSelect.languages.includes(initialLanguage)) {
              defaultLanguage = initialLanguage;
            } else {
              // Fallback vers VOSTFR ou VF selon disponibilité
              defaultLanguage = seasonToSelect.languages.includes('VOSTFR') ? 'VOSTFR' : 
                               seasonToSelect.languages.includes('VF') ? 'VF' : 'VOSTFR';
            }

            setSelectedLanguage(defaultLanguage);

            // Charger les épisodes immédiatement après avoir défini animeData
            await loadSeasonEpisodesWithData(animeInfo, seasonToSelect, defaultLanguage, true);
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
    if (selectedSeason && animeData) {
      await loadSeasonEpisodesWithData(animeData, selectedSeason, selectedLanguage, true);
    }
    setRefreshing(false);
  };

  // Fonction de retry
  const retryLoad = () => {
    setError(null);
    if (selectedSeason && animeData) {
      loadSeasonEpisodesWithData(animeData, selectedSeason, selectedLanguage, true);
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
          {serverError ? (
            // 🚨 Message d'erreur de serveur personnalisé
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={48} color="#ef4444" />
              <Text style={styles.errorText}>Serveur temporairement indisponible</Text>
              <Text style={styles.errorMessageText}>Choisissez un autre serveur pour continuer</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => {
                  setServerError(false);
                  if (webViewRef.current) {
                    webViewRef.current.reload();
                  }
                }}
              >
                <Text style={styles.retryButtonText}>Réessayer ce serveur</Text>
              </TouchableOpacity>
            </View>
          ) : (
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
              onShouldStartLoadWithRequest={(request) => {
                return true;
              }}
              onNavigationStateChange={(navState) => {
                // Détecter les erreurs de chargement
                if (navState.title?.includes('404') || navState.title?.includes('Error') || navState.title?.includes('Erreur')) {
                  setServerError(true);
                }
              }}
              onError={(syntheticEvent) => {
                console.log('WebView error detected');
                setServerError(true);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.log('WebView HTTP error: ', nativeEvent.statusCode);
                // Les erreurs HTTP indiquent souvent un serveur down
                if (nativeEvent.statusCode >= 400) {
                  setServerError(true);
                }
              }}
              onLoadStart={() => {
                setEpisodeLoading(true);
                setServerError(false); // Reset l'erreur au début du chargement
              }}
              onLoadEnd={() => {
                setEpisodeLoading(false);
              }}
              renderError={() => (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning-outline" size={48} color="#ef4444" />
                  <Text style={styles.errorText}>Serveur temporairement indisponible</Text>
                  <Text style={styles.errorMessageText}>Choisissez un autre serveur pour continuer</Text>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => {
                      setServerError(false);
                      if (webViewRef.current) {
                        webViewRef.current.reload();
                      }
                    }}
                  >
                    <Text style={styles.retryButtonText}>Réessayer ce serveur</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {episodeLoading && !serverError && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#00bcd4" />
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        {/* Header fixe toujours visible */}
        <View style={styles.headerContainer}>
          <SharedHeader />
        </View>

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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        {/* Header fixe toujours visible */}
        <View style={styles.headerContainer}>
          <SharedHeader />
        </View>

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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        {/* Header fixe toujours visible */}
        <View style={styles.headerContainer}>
          <SharedHeader />
        </View>

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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header fixe au-dessus du contenu */}
      <View style={styles.headerContainer}>
        <SharedHeader />
      </View>

      <OptimizedScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00bcd4" />
        }
        showsVerticalScrollIndicator={false}
        // Optimisations pour scroll fluide
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
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
        {/* Sélecteur de langue - Style simplifié */}
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
                {/* Fond drapeau personnalisé */}
                {(lang === 'VF' || lang === 'VF1' || lang === 'VF2') ? (
                  // Drapeau français tricolore pour toutes les versions françaises
                  <View style={styles.flagBackground}>
                    <View style={styles.frenchFlagStripe1} />
                    <View style={styles.frenchFlagStripe2} />
                    <View style={styles.frenchFlagStripe3} />
                  </View>
                ) : lang === 'VA' ? (
                  // Drapeau américain authentique pour Version Américaine
                  <View style={styles.flagBackground}>
                    {/* Rayures rouges et blanches */}
                    <View style={styles.americanStripe1} />
                    <View style={styles.americanStripe2} />
                    <View style={styles.americanStripe3} />
                    <View style={styles.americanStripe4} />
                    <View style={styles.americanStripe5} />
                    <View style={styles.americanStripe6} />
                    <View style={styles.americanStripe7} />
                    {/* Canton bleu avec effet étoiles */}
                    <View style={styles.americanCanton} />
                  </View>
                ) : (
                  // Drapeau japonais pour VOSTFR et autres
                  <View style={styles.flagBackground}>
                    <View style={styles.japaneseFlagBg} />
                    <View style={styles.japaneseRedCircle} />
                  </View>
                )}
                {/* Texte de langue au centre */}
                <Text style={[
                  styles.languageText,
                  selectedLanguage === lang && styles.languageTextActive
                ]}>
                  {(lang === 'VF' || lang === 'VF1' || lang === 'VF2') ? 'VF' : 
                   lang === 'VA' ? 'VA' :
                   lang === 'VOSTFR' ? 'VO' : 
                   lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Sélecteurs en grille 2 colonnes - Style simplifié */}
        {episodes.length > 0 && (
          <View style={styles.selectorsGrid}>
            {/* Sélecteur d'épisode */}
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
                dropdownIconColor={COLORS.secondary}
                itemStyle={{ 
                  color: COLORS.text.primary, 
                  fontSize: 16, 
                  fontWeight: 'bold',
                  backgroundColor: COLORS.primary
                }}
                mode="dropdown"
              >
                {episodes.length > 0 ? (
                  episodes.map((episode) => (
                    <Picker.Item
                      key={episode.id}
                      label={`ÉPISODE ${episode.episodeNumber}`}
                      value={episode.id}
                    />
                  ))
                ) : (
                  <Picker.Item
                    label="Aucun épisode disponible"
                    value=""
                  />
                )}
              </Picker>
            </View>

            {/* Sélecteur de serveur */}
            <View style={styles.pickerContainer}>
              {episodeDetails && episodeDetails.sources.length > 0 ? (
                <Picker
                  selectedValue={selectedPlayer.toString()}
                  onValueChange={(itemValue) => {
                    const newServerIndex = parseInt(itemValue as string);
                    setSelectedPlayer(newServerIndex);
                    // 🔄 Réinitialiser l'erreur de serveur lors du changement
                    setServerError(false);
                    // Forcer le rechargement de la WebView avec le nouveau serveur
                    if (webViewRef.current) {
                      webViewRef.current.reload();
                    }
                  }}
                  style={styles.picker}
                  dropdownIconColor={COLORS.secondary}
                  itemStyle={{ 
                    color: COLORS.text.primary, 
                    fontSize: 16, 
                    fontWeight: 'bold',
                    backgroundColor: COLORS.primary
                  }}
                  mode="dropdown"
                >
                  {episodeDetails.sources.map((source, index) => (
                    <Picker.Item
                      key={`server-${index}-${source.server}`}
                      label={`SERVER ${index + 1} (${source.quality?.toUpperCase() || 'HD'})`}
                      value={index.toString()}
                    />
                  ))}
                </Picker>
              ) : (
                <Picker
                  selectedValue=""
                  onValueChange={() => {}}
                  style={styles.picker}
                  dropdownIconColor={COLORS.secondary}
                  itemStyle={{ 
                    color: COLORS.text.primary, 
                    fontSize: 16, 
                    fontWeight: 'bold',
                    backgroundColor: COLORS.primary
                  }}
                  mode="dropdown"
                >
                  <Picker.Item
                    label="AUCUN SERVEUR DISPONIBLE"
                    value=""
                  />
                </Picker>
              )}
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
                onPress={() => alert('Fonction non disponible - URLs de streaming protégées')}
                disabled={!episodeDetails || episodeDetails.sources.length === 0}
                activeOpacity={0.7}
              >
                <Ionicons name="download" size={24} color="#ffffff" />
              </TouchableOpacity>


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
      </OptimizedScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: COLORS.primary,
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
    ...textStyles.heroTitle,
    marginBottom: 4,
  },
  bannerSeason: {
    fontSize: 18, // Équivalent à text-lg
    color: COLORS.text.secondary,
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
    color: COLORS.text.muted,
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
    color: COLORS.text.error,
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
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageSelector: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'flex-start',
    gap: 16,
  },
  languageButton: {
    width: 48, // Bouton carré 48x48 comme spécifié
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#00bcd4',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    opacity: 0.5, // 50% d'opacité par défaut
  },
  languageButtonActive: {
    opacity: 1, // 100% d'opacité quand actif
    // Suppression des changements de couleur et effets
  },
  languageFlag: {
    position: 'absolute',
    fontSize: 40,
    opacity: 1,
    zIndex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    lineHeight: 44,
  },
  languageText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 2,
    position: 'relative',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  languageTextActive: {
    // Accent stratégique pour langue active
    color: COLORS.states.active, // Cyan éclatant pour état actif
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 2,
    position: 'relative',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.states.active, // Bordure cyan pour accent
    overflow: 'hidden',
  },

  episodeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
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
    borderBottomColor: COLORS.primary,
  },
  dropdownLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flex: 1,
  },
  picker: {
    color: '#ffffff',
    backgroundColor: 'transparent',
    fontSize: 16,
    fontWeight: 'bold',
    height: 56,
    marginVertical: 0,
    paddingHorizontal: 16,
    marginLeft: -8,
    marginRight: -8,
  },
  selectorsGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  videoPlayerWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginHorizontal: 16,
    marginVertical: 8,
  },

  lastSelectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  lastSelectionText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  lastSelectionValue: {
    color: COLORS.text.primary,
  },
  lastSelectionLabel: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  atomicMessageContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
  },
  atomicMessageBold: {
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  atomicMessageText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  atomicMessageSubtext: {
    color: COLORS.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },

  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    backgroundColor: `${COLORS.error}33`,
    gap: 12,
  },
  errorMessageText: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 14,
  },

  // Styles pour la navigation et le téléchargement
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginVertical: 12,
  },
  navButtonCustom: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  downloadButtonCustom: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#00bcd4',
    borderWidth: 2,
    borderColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  customNavButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  navButtonDisabled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.text.muted,
    opacity: 0.5,
  },
  downloadContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: COLORS.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  downloadMenu: {
    position: 'absolute',
    top: 55,
    backgroundColor: COLORS.primary,
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
  flagBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 48, // Dimensions exactes du bouton carré 48x48
    height: 48,
    opacity: 0.6,
  },
  // Drapeau français tricolore
  frenchFlagStripe1: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '33.33%',
    backgroundColor: '#0055A4', // Bleu France
  },
  frenchFlagStripe2: {
    position: 'absolute',
    left: '33.33%',
    top: 0,
    bottom: 0,
    width: '33.33%',
    backgroundColor: '#FFFFFF', // Blanc France
  },
  frenchFlagStripe3: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '33.33%',
    backgroundColor: '#EF4135', // Rouge France
  },
  // Drapeau japonais
  japaneseFlagBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF', // Fond blanc
  },
  japaneseRedCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24, // Ajusté pour les nouvelles proportions 80x48
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BC002D', // Rouge japonais
    transform: [
      { translateX: -12 },
      { translateY: -12 }
    ],
  },
  // Drapeau américain authentique avec rayures
  americanStripe1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Math.floor(48 / 7), // Première rayure rouge
    backgroundColor: '#B22234',
  },
  americanStripe2: {
    position: 'absolute',
    top: Math.floor(48 / 7),
    left: 0,
    right: 0,
    height: Math.floor(48 / 7), // Rayure blanche
    backgroundColor: '#FFFFFF',
  },
  americanStripe3: {
    position: 'absolute',
    top: Math.floor(48 / 7) * 2,
    left: 0,
    right: 0,
    height: Math.floor(48 / 7), // Rayure rouge
    backgroundColor: '#B22234',
  },
  americanStripe4: {
    position: 'absolute',
    top: Math.floor(48 / 7) * 3,
    left: 0,
    right: 0,
    height: Math.floor(48 / 7), // Rayure blanche
    backgroundColor: '#FFFFFF',
  },
  americanStripe5: {
    position: 'absolute',
    top: Math.floor(48 / 7) * 4,
    left: 0,
    right: 0,
    height: Math.floor(48 / 7), // Rayure rouge
    backgroundColor: '#B22234',
  },
  americanStripe6: {
    position: 'absolute',
    top: Math.floor(48 / 7) * 5,
    left: 0,
    right: 0,
    height: Math.floor(48 / 7), // Rayure blanche
    backgroundColor: '#FFFFFF',
  },
  americanStripe7: {
    position: 'absolute',
    top: Math.floor(48 / 7) * 6,
    left: 0,
    right: 0,
    height: 48 - Math.floor(48 / 7) * 6, // Dernière rayure rouge (ajustée)
    backgroundColor: '#B22234',
  },
  americanCanton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 19, // 40% de 48px pour format carré
    height: 29, // 60% de 48px
    backgroundColor: '#3C3B6E', // Bleu américain
    // Effet étoiles simulé avec des points
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderStyle: 'dotted',
  },

});

export default AnimePlayerScreen;