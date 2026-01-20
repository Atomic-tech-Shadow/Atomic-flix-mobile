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
  TextInput,
  Linking,
} from 'react-native';
import OptimizedScrollView from '../components/OptimizedScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { SearchResult } from '../types/index';
import { RootStackParamList, DrawerParamList } from '../navigation/AppNavigator';
import { Episode, VideoSource, Season, AnimeData, EpisodeDetails } from '../types';
import SharedHeader from '../components/SharedHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimePlayerHero from '../components/AnimePlayerHero';
import { getThemedColors, getThemedTextStyles, interactiveStyles } from '../constants/newColors';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import { historyService } from '../services/HistoryService';
import { LinearGradient } from 'expo-linear-gradient';
import { normalizeLanguageForAPI, extractLanguageInfo } from '../utils/languageUtils';

type AnimePlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimePlayer'> & DrawerNavigationProp<DrawerParamList>;
type AnimePlayerScreenRouteProp = RouteProp<RootStackParamList, 'AnimePlayer'>;

interface Props {
  navigation: AnimePlayerScreenNavigationProp;
  route: AnimePlayerScreenRouteProp;
}

const { width, height } = Dimensions.get('window');

const AnimePlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { 
    animeUrl, 
    seasonData, 
    animeTitle, 
    initialEpisode, 
    initialLanguage,
    seasonNumber,
    episodeNumber,
    language 
  } = route.params;

  // États pour les données
  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    language || initialLanguage || 'VOSTFR'
  );
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(
    (seasonData as Season | null) || (seasonNumber ? { 
      name: `Saison ${seasonNumber}`, 
      value: String(seasonNumber), 
      number: Number(seasonNumber),
      languages: [language || initialLanguage || 'VOSTFR'],
      episodeCount: 0,
      url: '',
      available: true
    } as Season : null)
  );
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [serverError, setServerError] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Hook pour les notifications
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  // Hook pour le thème
  const { isDark, colors } = useTheme();
  const COLORS = colors;
  const textStyles = getThemedTextStyles(isDark);

  // Styles
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
    bannerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text.primaryBold,
      marginBottom: 4,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10
    },
    bannerSeason: {
      fontSize: 18,
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
      backgroundColor: COLORS.secondary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: COLORS.text.primaryBold,
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
      width: 48, 
      height: 48,
      borderRadius: 8,
      backgroundColor: COLORS.background.secondary,
      borderWidth: 2,
      borderColor: COLORS.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      opacity: 0.5, 
      padding: 8,
    },
  languageButtonActive: {
    opacity: 1, // 100% d'opacité quand actif
    // Suppression des changements de couleur et effets
  },
  languageFlag: {
    position: 'absolute',
    fontSize: 24,
    opacity: 1,
    zIndex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    lineHeight: 44,
  },
  languageTextPicker: {
    color: COLORS.text.primary,
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
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  episodeNumber: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  videoContainer: {
    height: (width * 9) / 16, // Aspect ratio 16:9
    backgroundColor: COLORS.primary,
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
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
    pickerContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: COLORS.secondary,
      height: 56,
      justifyContent: 'center',
      overflow: 'hidden',
      elevation: 6,
      shadowColor: COLORS.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      flex: 1,
      // Effet 3D léger
      transform: [{ perspective: 1000 }, { rotateY: '-2deg' }],
    },
    picker: {
      color: COLORS.text.primary,
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
      // Effet 3D pour la zone de sélection
      transform: [{ perspective: 1000 }, { rotateX: '2deg' }],
    },
    videoPlayerWrapper: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 2.5,
      borderColor: COLORS.secondary,
      marginHorizontal: 16,
      marginVertical: 12,
      backgroundColor: '#000',
      // Effet 3D "Cinéma"
      transform: [{ perspective: 1200 }, { rotateX: '1deg' }],
      shadowColor: COLORS.secondary,
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.6,
      shadowRadius: 25,
      elevation: 15,
    },
    searchBarContainer: {
      padding: 16,
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
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.secondary,
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
    backgroundColor: COLORS.background.secondary,
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
    borderBottomColor: COLORS.border.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  downloadMenuTitle: {
    color: COLORS.text.primary,
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
    color: COLORS.text.primary,
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

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchInput: {
      flex: 1,
      color: COLORS.text.primary,
      fontSize: 16,
      marginLeft: 12,
    },
    clearSearchButton: {
      padding: 4,
    },
    clearSearchText: {
      color: COLORS.text.muted,
      fontSize: 18,
    },
  loadingSearchContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  emptySearchContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptySearchText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  animeCard: {
    width: (width - 48) / 2,
    minHeight: 200,
    height: 'auto',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}cc`,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 160,
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
    height: 40,
  },
  cardContent: {
    padding: 12,
    flex: 1,
  },
  cardTitle: {
    ...textStyles.cardTitle,
    fontSize: 14,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  languageBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  languageTextSearch: {
    color: COLORS.text.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  movieBadge: {
    backgroundColor: COLORS.badges.film,
  },
  animeBadge: {
    backgroundColor: COLORS.badges.anime,
  },
  badgeText: {
    color: COLORS.text.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },

});

  // États pour le tracking de visionnage
  const [watchStartTime, setWatchStartTime] = useState<Date | null>(null);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [episodeDuration, setEpisodeDuration] = useState(0);
  const [lastSavedPosition, setLastSavedPosition] = useState(0);

  // États pour la recherche locale
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

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

  const getAnimeDetails = async (animeId: string) => {
    try {
      const response = await apiRequest(`https://anime-sama-scraper.vercel.app/api/anime/${animeId}`);
      return response;
    } catch (error) {
      return null;
    }
  };

  const loadSeasonEpisodesWithData = async (animeInfo: AnimeData, season: Season, language: string, autoLoadEpisode = false) => {
    try {
      setEpisodeLoading(true);
      setError(null);
      const languageCode = normalizeLanguageForAPI(language);

      // 🎯 Récupérer les épisodes avec l'option includeSources pour éviter une requête supplémentaire
      const response = await apiRequest(`https://anime-sama-scraper.vercel.app/api/episodes/${animeInfo.id}?season=${season.value}&language=${languageCode}&includeSources=true`);
      
      const data = response && response.success ? response : { success: true, episodes: response?.episodes || response?.data || [] };

      if (data && data.success) {
        const episodesList = Array.isArray(data.episodes) ? data.episodes : (Array.isArray(data.data) ? data.data : []);
        
        if (episodesList.length > 0) {
          const formattedEpisodes: Episode[] = episodesList.map((ep: any, index: number) => {
            const episodeNumber = ep.number || ep.episodeNumber || (index + 1);
            const episodeTitle = ep.title || `Épisode ${episodeNumber}`;
            return {
              id: ep.id || `${animeInfo.id}-${season.value}-ep${episodeNumber}-${languageCode}`,
              title: episodeTitle,
              episodeNumber: episodeNumber,
              url: ep.url || `https://anime-sama.tv/catalogue/${animeInfo.id}/${season.value}/${languageCode}/episode-${episodeNumber}`,
              language: language,
              available: ep.available !== false,
              streamingSources: ep.streamingSources || ep.sources || []
            };
          });

          setEpisodes(formattedEpisodes);

          // Sélectionner l'épisode spécifique
          const episodeToSelect = initialEpisode 
            ? formattedEpisodes.find(ep => ep.episodeNumber === initialEpisode) || formattedEpisodes[0]
            : formattedEpisodes[0];

          if (episodeToSelect) {
            setSelectedEpisode(episodeToSelect);
            if (autoLoadEpisode) {
              await loadEpisodeSources(episodeToSelect);
            }
          }
        } else {
          setError('Aucun épisode trouvé pour cette saison');
        }
      } else {
        setError('Erreur lors du chargement des épisodes');
      }
    } catch (e) {
      console.error('Erreur chargement épisodes:', e);
      setError('Erreur de connexion au serveur');
    } finally {
      setEpisodeLoading(false);
    }
  };

  const loadEpisodeSources = async (episode: Episode) => {
    try {
      // Arrêter le tracking précédent
      if (watchStartTime) {
        await stopWatchTracking();
      }

      setEpisodeLoading(true);
      setServerError(false);
      
      // 🚀 Optimisation : Utiliser les sources déjà présentes dans l'épisode si disponibles
      if (episode.streamingSources && episode.streamingSources.length > 0) {
        const prioritizedSources = prioritizeSibnetServer(episode.streamingSources);
        
        setEpisodeDetails({
          id: episode.id,
          title: episode.title,
          animeTitle: animeTitle,
          episodeNumber: episode.episodeNumber,
          sources: prioritizedSources,
          availableServers: [...new Set(prioritizedSources.map((s: any) => s.server))],
          url: episode.url
        });
        
        await saveWatchHistory(episode, 0, 0, 0);
        return;
      }

      // Si pas de sources, tenter de les charger via l'API embed
      const response = await apiRequest(`https://anime-sama-scraper.vercel.app/api/embed?url=${encodeURIComponent(episode.url)}`);
      
      const data = response && response.success ? response : { success: true, sources: response?.sources || response?.data || [] };

      if (data && data.success && data.sources && data.sources.length > 0) {
        const prioritizedSources = prioritizeSibnetServer(data.sources);
        
        setEpisodeDetails({
          id: episode.id,
          title: episode.title,
          animeTitle: animeTitle,
          episodeNumber: episode.episodeNumber,
          sources: prioritizedSources,
          availableServers: [...new Set(prioritizedSources.map((s: any) => s.server))],
          url: episode.url
        });

        await saveWatchHistory(episode, 0, 0, 0);
      } else {
        setError('Aucune source de streaming trouvée pour cet épisode');
      }
    } catch (e) {
      console.error('Erreur sources:', e);
      setServerError(true);
    } finally {
      setEpisodeLoading(false);
    }
  };

  // Fonction pour charger les épisodes via API externe
  const loadSeasonEpisodes = async (season: Season, autoLoadEpisode = false) => {
    if (!animeData) return;
    await loadSeasonEpisodesWithData(animeData, season, selectedLanguage, autoLoadEpisode);
  };

  // Fonction pour sauvegarder l'historique de visionnage
  const saveWatchHistory = async (episode: Episode, watchDuration: number = 0, totalDuration: number = 0, lastPosition: number = 0) => {
    if (!animeData || !episode) return;

    try {
      // Extraire l'information de saison/saga
      const seasonInfo = historyService.extractSeasonInfo(animeData.id);
      
      // Priorité aux données de la saison sélectionnée
      const currentSeasonData = selectedSeason || seasonData;
      
      let seasonName = seasonInfo.seasonName;
      let seasonNumber = seasonInfo.seasonNumber;

      if (currentSeasonData) {
        seasonName = currentSeasonData.name || `Saison ${currentSeasonData.number}`;
        seasonNumber = currentSeasonData.number !== undefined ? currentSeasonData.number : seasonInfo.seasonNumber;
      }

      await historyService.saveWatchHistory({
        animeId: animeData.id,
        animeTitle: animeTitle,
        animeImage: animeData.image,
        episodeNumber: episode.episodeNumber,
        episodeTitle: episode.title,
        language: selectedLanguage,
        watchDuration,
        totalDuration,
        isCompleted: watchDuration > 0 && totalDuration > 0 && (watchDuration / totalDuration) >= 0.8,
        lastPosition,
        seasonName,
        seasonNumber,
      });
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error);
    }
  };

  // Fonction pour démarrer le tracking de visionnage
  const startWatchTracking = () => {
    setWatchStartTime(new Date());
    setTotalWatchTime(0);
  };

  // Fonction pour arrêter le tracking et sauvegarder
  const stopWatchTracking = async () => {
    if (watchStartTime && selectedEpisode) {
      const watchDuration = Math.floor((new Date().getTime() - watchStartTime.getTime()) / 1000);
      const newTotalWatchTime = totalWatchTime + watchDuration;
      
      await saveWatchHistory(
        selectedEpisode,
        newTotalWatchTime,
        episodeDuration,
        newTotalWatchTime
      );
      
      setWatchStartTime(null);
      setTotalWatchTime(newTotalWatchTime);
    }
  };

  // Fonction pour charger les sources d'un épisode
  // Fonction pour prioriser le serveur sibnet
  const prioritizeSibnetServer = (sources: any[]) => {
    if (!sources || sources.length === 0) return sources;
    
    // Séparer les sources sibnet et les autres
    const sibnetSources = sources.filter(source => 
      source.server && source.server.toLowerCase().includes('sibnet')
    );
    const otherSources = sources.filter(source => 
      !source.server || !source.server.toLowerCase().includes('sibnet')
    );
    
    // Retourner sibnet en premier, puis les autres
    return [...sibnetSources, ...otherSources];
  };

  // Variable supprimée : pendingEpisodeReload n'est plus nécessaire avec le nouveau système fluide

  // Fonction pour changer de langue (version optimisée pour changement fluide)
  const changeLanguage = async (newLang: string) => {
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
      const languageCode = normalizeLanguageForAPI(newLang);
      
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

  // Fonction pour rechercher des animes (identique aux autres écrans)
  const searchAnimes = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);

    try {
      const response = await apiRequest(`https://anime-sama-scraper.vercel.app/api/search?query=${encodeURIComponent(query)}`);

      if (response && response.success) {
        const results = response.animes || response.results || [];
        if (Array.isArray(results)) {
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } else {
        throw new Error('Réponse API invalide');
      }
    } catch (err) {
      console.error('Erreur recherche:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Navigation vers un anime depuis les résultats de recherche
  const loadAnimeDetails = async (animeId: string, contentType?: string) => {
    if (!animeId || animeId === 'undefined') {
      return;
    }
    
    let cleanId = animeId;
    if (animeId.includes('anime-sama.si')) {
      const urlParts = animeId.split('/');
      const catalogueIndex = urlParts.findIndex(part => part === 'catalogue');
      if (catalogueIndex !== -1 && urlParts[catalogueIndex + 1]) {
        cleanId = urlParts[catalogueIndex + 1];
      }
    }
    
    if (contentType === 'anime') {
      navigation.navigate('AnimeDetail', { animeUrl: cleanId, animeTitle: 'Anime' });
    }
  };

  const handleSearchPress = () => {
    setShowSearchBar(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Effet pour la recherche en temps réel avec debouncing
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

  // Effet pour sauvegarder l'historique périodiquement
  useEffect(() => {
    if (!watchStartTime || !selectedEpisode) return;

    const interval = setInterval(async () => {
      const currentWatchDuration = Math.floor((new Date().getTime() - watchStartTime.getTime()) / 1000);
      const newTotalWatchTime = totalWatchTime + currentWatchDuration;
      
      // Sauvegarder toutes les 30 secondes
      await saveWatchHistory(
        selectedEpisode,
        newTotalWatchTime,
        episodeDuration,
        lastSavedPosition
      );
    }, 30000); // Sauvegarder toutes les 30 secondes

    return () => clearInterval(interval);
  }, [watchStartTime, selectedEpisode, totalWatchTime, episodeDuration, lastSavedPosition]);

  // Effet pour désactiver le wake lock et rétablir l'orientation quand on quitte l'écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async () => {
      // Sauvegarder l'historique une dernière fois avant de quitter
      await stopWatchTracking();
      deactivateKeepAwake();
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    });

    return unsubscribe;
  }, [navigation]);

  // Charger les données de l'anime
  useEffect(() => {
    if (episodeNumber && episodes.length > 0) {
      const episode = episodes.find(ep => (ep as any).episodeNumber === Number(episodeNumber));
      if (episode) {
        setSelectedEpisode(episode);
      }
    }
  }, [episodeNumber, episodes]);

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

  // Fonction de recherche locale avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearchLoading(true);
        try {
          const response = await apiRequest(`/api/search?query=${encodeURIComponent(searchQuery)}`);
          
          if (response && response.success) {
            const results = response.animes || response.results || [];
            if (Array.isArray(results)) {
              setSearchResults(results);
            } else {
              setSearchResults([]);
            }
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);


  // Fonction pour extraire la langue depuis l'objet language de l'API
  const getLanguageFromAPI = (anime: SearchResult) => {
    if (anime.language && anime.language.name) {
      return anime.language.name;
    }
    return null;
  };

  // Composant Carte Anime pour les résultats de recherche
  const renderAnimeCard = React.useCallback((anime: SearchResult, index: number) => {
    const detectedLanguage = getLanguageFromAPI(anime);
    const realTitle = anime.title;
    
    return (
      <TouchableOpacity
        key={anime.id || index}
        style={styles.animeCard}
        onPress={() => loadAnimeDetails(anime.id || anime.url || 'unknown', anime.contentType || anime.type || 'anime')}
        activeOpacity={0.8}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: anime.image }}
            style={styles.cardImage}
            resizeMode="cover"
            fadeDuration={200}
            onError={(e) => {}}
          />

          <View style={[
            styles.contentBadge,
            anime.contentType === 'film' || anime.contentType === 'movie' ? styles.movieBadge :
            styles.animeBadge
          ]}>
            <Text style={styles.badgeText}>
              {anime.contentType === 'film' || anime.contentType === 'movie' ? 'FILM' :
               'ANIME'}
            </Text>
          </View>

          <LinearGradient
            colors={['transparent', COLORS.primary]}
            style={styles.cardGradient}
          />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={3}>
            {realTitle}
          </Text>
          <View style={styles.cardMeta}>
            {detectedLanguage && (
              <View style={styles.languageBadge}>
                <Text style={styles.languageTextSearch}>{detectedLanguage}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  // Rendu du lecteur vidéo
  const renderVideoPlayer = () => {
    if (!episodeDetails || !episodeDetails.sources || !episodeDetails.sources[selectedPlayer]) {
      return (
        <View style={styles.videoContainer}>
          <LoadingSpinner 
            message="Chargement du lecteur..." 
            size="large"
            color={COLORS.secondary}
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
              <Ionicons name="warning-outline" size={48} color={COLORS.text.error} />
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
              setSupportMultipleWindows={false}
              originWhitelist={['*']}
              allowFileAccess={false}
              allowUniversalAccessFromFileURLs={false}
              mixedContentMode="never"
              injectedJavaScriptBeforeContentLoaded={`
                (function() {
                  const initialUrl = '${currentSource.url}';
                  let redirectAttempts = 0;
                  
                  // Bloquer window.location
                  const originalLocation = window.location;
                  Object.defineProperty(window, 'location', {
                    get: function() { return originalLocation; },
                    set: function(value) { 
                      redirectAttempts++;
                      console.warn('Tentative de redirection #' + redirectAttempts + ' bloquée:', value);
                      return false;
                    },
                    configurable: false
                  });
                  
                  // Bloquer window.open avec force
                  const originalOpen = window.open;
                  window.open = function(url, target, features) {
                    redirectAttempts++;
                    console.warn('window.open bloqué (#' + redirectAttempts + '):', url);
                    return null;
                  };
                  
                  // Bloquer window.location.href
                  Object.defineProperty(window.location, 'href', {
                    get: function() { return initialUrl; },
                    set: function(value) {
                      redirectAttempts++;
                      console.warn('location.href bloqué (#' + redirectAttempts + '):', value);
                      return false;
                    },
                    configurable: false
                  });
                  
                  // Bloquer window.location.replace
                  window.location.replace = function(url) {
                    redirectAttempts++;
                    console.warn('location.replace bloqué (#' + redirectAttempts + '):', url);
                    return false;
                  };
                  
                  // Bloquer window.location.assign
                  window.location.assign = function(url) {
                    redirectAttempts++;
                    console.warn('location.assign bloqué (#' + redirectAttempts + '):', url);
                    return false;
                  };
                  
                  // Intercepter et bloquer tous les clics globalement avec capture
                  document.addEventListener('click', function(e) {
                    // Bloquer ALL les clics sauf sur les éléments du lecteur vidéo
                    const target = e.target;
                    
                    // Vérifier si c'est un lien
                    const link = target.closest('a');
                    if (link) {
                      const href = link.getAttribute('href');
                      if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
                        console.warn('Clic sur lien bloqué:', href);
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                      }
                    }
                    
                    // Vérifier si c'est un bouton suspect (play redirection)
                    const button = target.closest('button');
                    if (button) {
                      const onclick = button.getAttribute('onclick');
                      const dataHref = button.getAttribute('data-href');
                      if ((onclick && (onclick.includes('location') || onclick.includes('open'))) || dataHref) {
                        console.warn('Clic sur bouton redirection bloqué');
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                      }
                    }
                  }, true);
                  
                  // Bloquer les form submissions
                  document.addEventListener('submit', function(e) {
                    const action = e.target.getAttribute('action');
                    if (action && !action.startsWith('javascript:')) {
                      console.warn('Submission de formulaire bloquée:', action);
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      return false;
                    }
                  }, true);
                  
                  // Bloquer les tentatives d'ajout d'event listeners de redirection
                  const originalAddEventListener = document.addEventListener;
                  document.addEventListener = function(type, listener, options) {
                    if (type === 'click' || type === 'touchstart') {
                      const wrappedListener = function(e) {
                        try {
                          if (e.target.getAttribute && (e.target.getAttribute('data-redirect') || e.target.getAttribute('onclick'))) {
                            return false;
                          }
                          return listener.call(this, e);
                        } catch(err) {
                          return false;
                        }
                      };
                      return originalAddEventListener.call(this, type, wrappedListener, options);
                    }
                    return originalAddEventListener.call(this, type, listener, options);
                  };
                })();
              `}
              onShouldStartLoadWithRequest={(request) => {
                const requestUrl = request.url;
                const initialUrl = currentSource.url;
                
                // ❌ BLOQUER LES DEEPLINKS DANGEREUX
                const blockedSchemes = ['tel:', 'mailto:', 'sms:', 'market://', 'intent://', 'android-app://', 'itms://', 'itms-apps://'];
                const isBlockedScheme = blockedSchemes.some(scheme => requestUrl.toLowerCase().startsWith(scheme));
                
                if (isBlockedScheme) {
                  console.warn('🚫 Deeplink bloqué - schéma interdit:', requestUrl);
                  return false;
                }
                
                // Liste complète des domaines/patterns autorisés pour les lecteurs vidéo intégrés
                const allowedDomains = [
                  // Serveurs vidéo principaux
                  'sibnet.ru',
                  'video.sibnet.ru',
                  'smoothpre.com',
                  'vidmoly.to',
                  'sendvid.com',
                  'dailymotion.com',
                  'youtube.com',
                  'youtu.be',
                  'vimeo.com',
                  'mp4upload.com',
                  'streamtape.com',
                  'kwik.cx',
                  'okru',
                  'netu.tv',
                  'dropload.io',
                  // Domaines de confiance pour sécurité
                  'anime-sama.fr',
                  'anime-sama.eu',
                  'cloudflare.com',
                  'hcaptcha.com',
                  'recaptcha.net',
                  'google.com',
                  // CDN et images
                  'cdn.statically.io',
                ];
                
                try {
                  const requestUrlObj = new URL(requestUrl);
                  const initialUrlObj = new URL(initialUrl);
                  
                  // ✅ Permettre les URLs du même domaine
                  if (requestUrlObj.hostname === initialUrlObj.hostname) {
                    console.log('✅ Même domaine autorisé:', requestUrl);
                    return true;
                  }
                  
                  // ✅ Permettre les domaines autorisés uniquement
                  const hostname = requestUrlObj.hostname.toLowerCase();
                  const isAllowed = allowedDomains.some(domain => 
                    hostname === domain || hostname.endsWith('.' + domain)
                  );
                  
                  if (isAllowed) {
                    console.log('✅ Domaine autorisé:', requestUrl);
                    return true;
                  }
                  
                  // ❌ Bloquer tout autre domaine
                  console.log('🚫 Domaine non autorisé bloqué:', requestUrl);
                  return false;
                  
                } catch (e) {
                  // ❌ Si parsing URL échoue, bloquer par défaut (sécurité)
                  if (requestUrl.startsWith('http://') || requestUrl.startsWith('https://')) {
                    console.log('✅ URL HTTP/HTTPS acceptée:', requestUrl);
                    return true;
                  }
                  console.log('🚫 URL invalide bloquée:', requestUrl);
                  return false;
                }
              }}
              onOpenWindow={(event) => {
                // Bloquer les tentatives d'ouverture de nouvelles fenêtres/pop-ups
                console.warn('⛔ Tentative d\'ouverture de fenêtre bloquée:', event.nativeEvent?.targetUrl);
                return false;
              }}
              onNavigationStateChange={(navState) => {
                // Détecter les erreurs de chargement
                if (navState.title?.includes('404') || navState.title?.includes('Error') || navState.title?.includes('Erreur')) {
                  setServerError(true);
                }
              }}
              onError={(syntheticEvent) => {
                setServerError(true);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                // Les erreurs HTTP indiquent souvent un serveur down
                if (nativeEvent.statusCode >= 400) {
                  setServerError(true);
                }
              }}
              onLoadStart={() => {
                setEpisodeLoading(true);
                setServerError(false); // Reset l'erreur au début du chargement
                // Démarrer le tracking quand la vidéo commence à charger
                startWatchTracking();
              }}
              onLoadEnd={() => {
                setEpisodeLoading(false);
              }}
              onMessage={(event) => {
                // Écouter les messages du WebView pour tracker la progression
                try {
                  const message = JSON.parse(event.nativeEvent.data);
                  if (message.type === 'videoProgress') {
                    setEpisodeDuration(message.duration || 0);
                    setLastSavedPosition(message.currentTime || 0);
                  }
                } catch (error) {
                  // Ignorer les messages non-JSON
                }
              }}
              renderError={() => (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning-outline" size={48} color={COLORS.text.error} />
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
              <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={COLORS.primary} />

        {/* Header fixe toujours visible */}
        <View style={styles.headerContainer}>
          <SharedHeader 
          onSearchPress={() => setShowSearchBar(!showSearchBar)}
          onNotificationPress={() => setShowNotifications(true)}
          onMenuPress={() => navigation.openDrawer()}
        />
        </View>

        <View style={styles.loadingContainer}>
          <LoadingSpinner 
            message="Chargement de l'anime..." 
            size="large"
            color={COLORS.secondary}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !animeData) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={COLORS.primary} />

        {/* Header fixe toujours visible */}
        <View style={styles.headerContainer}>
          <SharedHeader 
          onSearchPress={() => setShowSearchBar(!showSearchBar)}
          onNotificationPress={() => setShowNotifications(true)}
          onMenuPress={() => navigation.openDrawer()}
        />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color={COLORS.text.error} />
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
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={COLORS.primary} />

        {/* Header fixe toujours visible */}
        <View style={styles.headerContainer}>
          <SharedHeader 
          onSearchPress={() => setShowSearchBar(!showSearchBar)}
          onNotificationPress={() => setShowNotifications(true)}
          onMenuPress={() => navigation.openDrawer()}
        />
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
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={COLORS.primary} />

      {/* Header fixe au-dessus du contenu */}
      <View style={styles.headerContainer}>
        <SharedHeader 
          onSearchPress={() => setShowSearchBar(!showSearchBar)}
          onNotificationPress={() => setShowNotifications(true)}
          onMenuPress={() => navigation.openDrawer()}
        />
      </View>

      <OptimizedScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />
        }
        showsVerticalScrollIndicator={false}
        // Optimisations pour scroll fluide
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {/* Barre de recherche locale */}
        {showSearchBar && (
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={COLORS.secondary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher des animes..."
                placeholderTextColor={COLORS.text.muted}
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

        {/* Résultats de recherche */}
        {searchLoading && searchQuery && (
          <View style={styles.loadingSearchContainer}>
            <LoadingSpinner 
              message="Recherche en cours..." 
              size="large"
              color={COLORS.primary}
            />
          </View>
        )}

        {searchResults.length > 0 && !searchLoading && (
          <View style={styles.searchResultsGrid}>
            {searchResults.map((anime, index) => renderAnimeCard(anime, index))}
          </View>
        )}

        {searchQuery && !searchLoading && searchResults.length === 0 && (
          <View style={styles.emptySearchContainer}>
            <Text style={styles.emptySearchText}>Aucun résultat trouvé pour "{searchQuery}"</Text>
          </View>
        )}

        {animeData && (
          <AnimePlayerHero
            title={animeData.title}
            image={animeData.image}
            seasonName={selectedSeason?.name}
          />
        )}
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
                onPress={() => changeLanguage(lang)}
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
                  styles.languageTextPicker,
                  selectedLanguage === lang && styles.languageTextActive
                ]}>
                  {lang === 'VOSTFR' ? 'VOST' : lang}
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
                      label={`${source.server?.toUpperCase() || `SERVER ${index + 1}`} (${source.quality?.toUpperCase() || 'HD'})`}
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
              <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
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
                <Ionicons name="download" size={24} color={COLORS.text.primary} />
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
              <Ionicons name="chevron-forward" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
        )}


        {/* Message d'erreur */}
        {error && (
          <View style={styles.errorMessage}>
            <Ionicons name="warning-outline" size={24} color={COLORS.text.error} />
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


export default AnimePlayerScreen;
