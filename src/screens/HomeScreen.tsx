import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Modal,
} from 'react-native';
import OptimizedScrollView from '../components/OptimizedScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useDrawerStatus } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import { SearchResult } from '../types/index';
import type { RootStackParamList, DrawerParamList } from '../navigation/AppNavigator';
import SharedHeader from '../components/SharedHeader';
import { COLORS, textStyles, interactiveStyles } from '../constants/newColors';
import CosmicBackground from '../components/CosmicBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { NotificationPanel } from '../components/NotificationPanel';
import { useNotifications } from '../hooks/useNotifications';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { PushNotification } from '../types/notifications';
import { historyService, WatchHistoryItem } from '../services/HistoryService';
import { getLanguageBadgeText } from '../utils/languageUtils';
import NetworkStatusBanner from '../components/NetworkStatusBanner';
import StartIOAdBanner from '../components/StartIOAdBanner';
import { apiGetWithCache } from '../utils/apiWithRetry';


type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');


// Interface pour les réponses API (identique au site web)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: ApiResponse<any>;
}

// Interface pour les nouveaux épisodes de l'API /recent
interface RecentEpisode {
  animeId: string;
  animeTitle: string;
  season: number;
  episode: number;
  language: string;
  isFinale: boolean;
  isVFCrunchyroll: boolean;
  url: string;
  image: string;
  badgeInfo: string;
  addedAt: string;
  type: string;
}

// Interface pour la réponse de l'API /recent
interface RecentEpisodesResponse {
  success: boolean;
  count: number;
  recentEpisodes: RecentEpisode[];
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classiquesAnimes, setClassiquesAnimes] = useState<SearchResult[]>([]);
  const [pepitesAnimes, setPepitesAnimes] = useState<SearchResult[]>([]);
  const [nouveauxEpisodes, setNouveauxEpisodes] = useState<SearchResult[]>([]);
  const [recommendationsAnimes, setRecommendationsAnimes] = useState<SearchResult[]>([]);
  const [planningAnimes, setPlanningAnimes] = useState<SearchResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentlyWatching, setCurrentlyWatching] = useState<WatchHistoryItem[]>([]);
  
  // Hook pour les notifications
  const {
    notifications,
    unreadCount,
    isInitialized: notificationsInitialized,
    detectNewContent,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  // Hook pour détecter la connexion internet
  const {
    isOnline,
    isOffline,
    showOfflineBanner,
    hideBanner,
    checkConnection,
    networkState
  } = useNetworkStatus();


  // Configuration API identique au site web
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';


  // Fonction utilitaire pour obtenir le badge de langue
  const getLanguageBadge = (language: any): string => {
    if (!language) return 'VO';
    if (language.vf) return 'VF';
    if (language.vostfr) return 'VOSTFR';
    if (language.vjstfr) return 'VJSTFR';
    return 'VO';
  };

  // Charger l'historique de visionnage
  const loadWatchHistory = async () => {
    try {
      const history = await historyService.getCurrentlyWatching();
      setCurrentlyWatching(history);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setCurrentlyWatching([]);
    }
  };

  // Charger tout le contenu au démarrage
  useEffect(() => {
    const initializeApp = async () => {
      // Charger le contenu initial et l'historique
      await Promise.all([
        loadAllInitialContent(),
        loadWatchHistory(),
      ]);
    };
    
    initializeApp();
  }, []);

  // Fonction centralisée pour charger tout le contenu initial
  const loadAllInitialContent = async () => {
    setInitialLoading(true);
    try {
      // Charger le contenu populaire (Légendaires et Pépites), les nouveaux épisodes, les recommandations et le planning
      await Promise.all([
        loadPopularAnimes(),
        loadRecentEpisodes(),
        loadRecommendations(),
        loadPlanning(),
        loadWatchHistory(),
      ]);
    } catch (error) {
    } finally {
      setInitialLoading(false);
    }
  };

  // Détecter les nouveaux contenus pour les notifications quand le contenu est chargé
  useEffect(() => {
    if (notificationsInitialized && nouveauxEpisodes.length > 0) {
      detectNewContent(nouveauxEpisodes);
    }
  }, [notificationsInitialized, nouveauxEpisodes, detectNewContent]);




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
        if (attempt >= maxRetries) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };


  // Charger le contenu populaire (classiques et pépites) depuis l'API
  const loadPopularAnimes = async () => {
    try {
      const response = await apiRequest('/api/popular');

      if (response && response.success && response.categories) {
        // Extraire les classiques et pépites de l'API
        const classiques = response.categories.classiques?.anime || [];
        const pepites = response.categories.pepites?.anime || [];
        
        setClassiquesAnimes(classiques);
        setPepitesAnimes(pepites);
      } else {
        setClassiquesAnimes([]);
        setPepitesAnimes([]);
      }
    } catch (error) {
      setClassiquesAnimes([]);
      setPepitesAnimes([]);
    }
  };

  // Charger les nouveaux épisodes depuis l'API /recent
  const loadRecentEpisodes = async () => {
    try {
      const response: RecentEpisodesResponse = await apiRequest('/api/recent');

      if (response && response.success && response.recentEpisodes) {
        // Convertir les données de l'API en format SearchResult
        const recentEpisodes: SearchResult[] = response.recentEpisodes.slice(0, 15).map((episode: RecentEpisode) => ({
          id: episode.animeId,
          animeId: episode.animeId,
          title: episode.animeTitle,
          image: episode.image,
          url: episode.url,
          contentType: 'anime',
          type: episode.type,
          currentSeason: episode.season,
          currentEpisode: episode.episode,
          episodeInfo: episode.badgeInfo,
          language: {
            name: episode.language,
            code: episode.language.toLowerCase(),
            fullName: episode.language,
            flag: episode.language.includes('VF') ? '🇫🇷' : 
                  episode.language === 'VA' ? '🇺🇸' : '🇯🇵',
            priority: 1
          },
          addedAt: episode.addedAt
        }));
        
        setNouveauxEpisodes(recentEpisodes);
      } else {
        setNouveauxEpisodes([]);
      }
    } catch (error) {
      console.error('Erreur chargement nouveaux épisodes:', error);
      setNouveauxEpisodes([]);
    }
  };


  // Recherche d'animes (identique au site web)
  const searchAnimes = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setError(null);

    try {
      const response = await apiRequest(`/api/search?query=${encodeURIComponent(query)}`);

      if (response && response.success) {
        const results = response.animes || response.results || [];
        if (Array.isArray(results)) {
          // Afficher tout le contenu de l'API : animes, mangas, films, etc.
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } else {
        throw new Error('Réponse API invalide');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de recherche';

      if (errorMessage.includes('504') || errorMessage.includes('timeout')) {
        setError('Le serveur anime-sama-scraper.vercel.app ne répond pas actuellement. Veuillez réessayer plus tard.');
      } else if (errorMessage.includes('500')) {
        setError('Erreur temporaire du serveur. Veuillez réessayer dans quelques instants.');
      } else {
        setError('Impossible de rechercher les animes. Vérifiez votre connexion internet.');
      }
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Naviguer vers la page dédiée (anime ou manga) (identique au site web)
  const loadAnimeDetails = async (animeId: string, contentType?: string, animeTitle: string = 'Anime') => {
    
    // Vérifier que l'ID n'est pas vide
    if (!animeId || animeId === 'undefined') {
      setError('Erreur: ID anime introuvable');
      return;
    }
    
    // Si l'ID est une URL complète, extraire seulement l'ID propre
    let cleanId = animeId;
    if (animeId.includes('anime-sama.fr')) {
      // Extraire l'ID depuis l'URL : /catalogue/kaoru-hana-wa-rin-to-saku/saison1/vostfr/
      const urlParts = animeId.split('/');
      const catalogueIndex = urlParts.findIndex(part => part === 'catalogue');
      if (catalogueIndex !== -1 && urlParts[catalogueIndex + 1]) {
        cleanId = urlParts[catalogueIndex + 1];
      }
    }
    
    
    // Détecter si c'est un manga pour rediriger vers le lecteur approprié
    if (contentType === 'manga') {
      navigation.navigate('MangaReader', { mangaUrl: cleanId, mangaTitle: 'Manga' });
    } else {
      navigation.navigate('AnimeDetail', { animeUrl: cleanId, animeTitle: animeTitle });
    }
  };

  // 🚀 Nouvelle fonction pour naviguer directement vers l'épisode depuis les "Nouveaux épisodes"
  const loadEpisodeDirectly = async (anime: SearchResult) => {
    
    let cleanId = anime.animeId || anime.id || anime.url;
    if (!cleanId || cleanId === 'undefined') {
      setError('Erreur: ID anime introuvable');
      return;
    }
    
    // Nettoyer l'ID si c'est une URL complète pour obtenir l'animeId
    if (cleanId.includes('anime-sama.fr')) {
      const urlParts = cleanId.split('/');
      const catalogueIndex = urlParts.findIndex(part => part === 'catalogue');
      if (catalogueIndex !== -1 && urlParts[catalogueIndex + 1]) {
        cleanId = urlParts[catalogueIndex + 1];
      }
    }

    try {
      // 🎯 Récupérer les vraies données de saisons depuis l'API pour éviter les erreurs saga/saison
      const animeDetails = await apiRequest(`/api/anime/${cleanId}`);
      
      if (animeDetails && animeDetails.success && animeDetails.data && animeDetails.data.seasons) {
        const seasons = animeDetails.data.seasons;
        
        // Extraire le numéro de saison depuis l'ID si currentSeason est null
        let targetSeasonNumber = anime.currentSeason;
        
        if (!targetSeasonNumber && anime.id) {
          // Essayer d'extraire depuis l'ID : "one-piece-saison11-vostfr-" -> 11
          const seasonMatch = anime.id.match(/saison(\d+)/i);
          if (seasonMatch) {
            targetSeasonNumber = parseInt(seasonMatch[1], 10);
          }
        }
        
        // Fallback si toujours pas trouvé
        if (!targetSeasonNumber) {
          targetSeasonNumber = 1;
        }
        
        let matchingSeason = null;
        
        // 1. Essayer de matcher par number exact d'abord
        matchingSeason = seasons.find((s: any) => s.number === targetSeasonNumber);
        
        // 2. Si pas trouvé par number, essayer par value et name avec logique précise
        if (!matchingSeason) {
          matchingSeason = seasons.find((s: any) => {
            const value = s.value?.toLowerCase() || '';
            const name = s.name?.toLowerCase() || '';
            
            // Détection si c'est un anime avec structure "saga"
            const hasSagaStructure = value.includes('saga') || name.includes('saga');
            
            if (hasSagaStructure) {
              // Pour One Piece et autres animes "saga" : chercher saga exacte
              return value === `saga${targetSeasonNumber}` || 
                     value === `saga-${targetSeasonNumber}` ||
                     value === `saga_${targetSeasonNumber}` ||
                     name.toLowerCase() === `saga ${targetSeasonNumber}` ||
                     name.toLowerCase() === `saga${targetSeasonNumber}`;
            } else {
              // Pour animes classiques "saison" : chercher saison exacte
              return value === `saison${targetSeasonNumber}` || 
                     value === `saison-${targetSeasonNumber}` ||
                     value === `saison_${targetSeasonNumber}` ||
                     name.toLowerCase() === `saison ${targetSeasonNumber}` ||
                     name.toLowerCase() === `saison${targetSeasonNumber}`;
            }
          });
        }
        
        // 3. Si toujours pas trouvé, chercher avec matching partiel mais plus strict
        if (!matchingSeason) {
          matchingSeason = seasons.find((s: any) => {
            const value = s.value?.toLowerCase() || '';
            const name = s.name?.toLowerCase() || '';
            
            // Matching partiel mais uniquement si le numéro suit directement
            return (value.includes(`saga${targetSeasonNumber}`) && value.charAt(value.indexOf(`saga${targetSeasonNumber}`) + `saga${targetSeasonNumber}`.length) === '-') ||
                   (value.includes(`saison${targetSeasonNumber}`) && value.charAt(value.indexOf(`saison${targetSeasonNumber}`) + `saison${targetSeasonNumber}`.length) === '-') ||
                   name.includes(`saga ${targetSeasonNumber}`) ||
                   name.includes(`saison ${targetSeasonNumber}`);
          });
        }
        
        // Log détaillé du matching si en mode debug
        if (matchingSeason && __DEV__) {
          console.log('Saison trouvée:', {
            number: matchingSeason.number, 
            value: matchingSeason.value, 
            name: matchingSeason.name,
            targetWas: targetSeasonNumber
          });
        }
        
        // Si toujours pas trouvé, prendre la première saison disponible
        if (!matchingSeason && seasons.length > 0) {
          matchingSeason = seasons[0];
        }
        
        if (matchingSeason) {
          // Naviguer avec les vraies données de saison de l'API
          navigation.navigate('AnimePlayer', { 
            animeUrl: cleanId, 
            animeTitle: anime.title,
            seasonData: matchingSeason,
            initialEpisode: anime.currentEpisode,
            initialLanguage: anime.language?.code?.toUpperCase() as 'VF' | 'VOSTFR' || 'VOSTFR'
          });
          return;
        }
      }
    } catch (apiError) {
      console.error('Erreur chargement anime details:', apiError);
    }

    // Fallback : utiliser les données de base si l'API échoue
    const fallbackSeasonData = {
      number: anime.currentSeason || 1,
      name: `Saison ${anime.currentSeason || 1}`,
      value: `saison${anime.currentSeason || 1}`,
      languages: [anime.language?.name || "VOSTFR"],
      episodeCount: anime.currentEpisode || 12,
      url: cleanId,
      available: true
    };

    // Naviguer avec les données de fallback
    navigation.navigate('AnimePlayer', { 
      animeUrl: cleanId, 
      animeTitle: anime.title,
      seasonData: fallbackSeasonData,
      initialEpisode: anime.currentEpisode,
      initialLanguage: (anime.language?.name as 'VF' | 'VOSTFR') || (anime.language?.code?.toUpperCase() as 'VF' | 'VOSTFR') || 'VOSTFR'
    });
  };

  // Charger les recommandations depuis l'API
  const loadRecommendations = async () => {
    try {
      const response = await apiRequest('/api/recommendations');

      if (response && response.success && response.data) {
        // Convertir les données de l'API en format SearchResult
        const recommendations: SearchResult[] = response.data.slice(0, 20).map((anime: any) => ({
          id: anime.id,
          animeId: anime.id,
          title: anime.title,
          image: anime.image,
          url: anime.url,
          contentType: anime.contentType || 'anime',
          type: anime.contentType || 'anime',
          genres: anime.genres || [],
          language: {
            name: anime.languages && anime.languages[0] ? anime.languages[0] : 'VOSTFR',
            code: anime.languages && anime.languages[0] ? anime.languages[0].toLowerCase() : 'vostfr',
            fullName: anime.languages && anime.languages[0] ? anime.languages[0] : 'VOSTFR',
            flag: anime.languages && anime.languages[0] && anime.languages[0].includes('VF') ? '🇫🇷' : 
                  anime.languages && anime.languages[0] === 'VA' ? '🇺🇸' : '🇯🇵',
            priority: 1
          },
          category: 'recommendation'
        }));
        
        setRecommendationsAnimes(recommendations);
      } else {
        setRecommendationsAnimes([]);
      }
    } catch (error) {
      console.error('Erreur chargement recommandations:', error);
      setRecommendationsAnimes([]);
    }
  };

  // Charger le planning du jour depuis l'API
  const loadPlanning = async () => {
    try {
      const response = await apiRequest('/api/planning');

      if (response && response.success && response.items) {
        // Convertir les données de l'API en format SearchResult
        const planning: SearchResult[] = response.items.slice(0, 15).map((item: any) => ({
          id: `${item.animeId}-${item.language}`,
          animeId: item.animeId,
          title: item.title,
          image: item.image,
          url: item.url,
          contentType: item.type || 'anime',
          type: item.type || 'anime',
          language: {
            name: item.language,
            code: item.language.toLowerCase(),
            fullName: item.language,
            flag: item.language.includes('VF') ? '🇫🇷' : 
                  item.language === 'VA' ? '🇺🇸' : '🇯🇵',
            priority: 1
          },
          releaseTime: item.releaseTime,
          day: item.day,
          status: item.status,
          category: 'planning'
        }));
        
        setPlanningAnimes(planning);
      } else {
        setPlanningAnimes([]);
      }
    } catch (error) {
      console.error('Erreur chargement planning:', error);
      setPlanningAnimes([]);
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
      return undefined;
    }
  }, [searchQuery]);

  // Navigation vers un épisode depuis l'historique
  const resumeWatching = async (historyItem: WatchHistoryItem) => {
    try {
      // 🎯 Récupérer les vraies données de saisons depuis l'API pour éviter les erreurs saga/saison
      const animeDetails = await apiRequest(`/api/anime/${historyItem.animeId}`);
      
      if (animeDetails && animeDetails.success && animeDetails.data && animeDetails.data.seasons) {
        const seasons = animeDetails.data.seasons;
        
        // Extraire le numéro de saison depuis l'ID d'historique si disponible
        let targetSeasonNumber = 1; // Fallback par défaut
        
        // Essayer d'extraire depuis l'ID anime : "one-piece-saison11-vostfr" -> 11
        if (historyItem.animeId) {
          const seasonMatch = historyItem.animeId.match(/saison(\d+)|saga(\d+)/i);
          if (seasonMatch) {
            targetSeasonNumber = parseInt(seasonMatch[1] || seasonMatch[2], 10);
          }
        }
        
        let matchingSeason = null;
        
        // 1. Essayer de matcher par number exact d'abord
        matchingSeason = seasons.find((s: any) => s.number === targetSeasonNumber);
        
        // 2. Si pas trouvé par number, essayer par value et name avec logique saga/saison
        if (!matchingSeason) {
          matchingSeason = seasons.find((s: any) => {
            const value = s.value?.toLowerCase() || '';
            const name = s.name?.toLowerCase() || '';
            
            // Détection si c'est un anime avec structure "saga"
            const hasSagaStructure = value.includes('saga') || name.includes('saga');
            
            if (hasSagaStructure) {
              // Pour One Piece et autres animes "saga" : chercher saga exacte
              return value === `saga${targetSeasonNumber}` || 
                     value === `saga-${targetSeasonNumber}` ||
                     value === `saga_${targetSeasonNumber}` ||
                     name.toLowerCase() === `saga ${targetSeasonNumber}` ||
                     name.toLowerCase() === `saga${targetSeasonNumber}`;
            } else {
              // Pour animes classiques "saison" : chercher saison exacte
              return value === `saison${targetSeasonNumber}` || 
                     value === `saison-${targetSeasonNumber}` ||
                     value === `saison_${targetSeasonNumber}` ||
                     name.toLowerCase() === `saison ${targetSeasonNumber}` ||
                     name.toLowerCase() === `saison${targetSeasonNumber}`;
            }
          });
        }
        
        // 3. Si toujours pas trouvé, prendre la première saison disponible
        if (!matchingSeason && seasons.length > 0) {
          matchingSeason = seasons[0];
          console.log('🔄 Saga/Saison non trouvée pour historique, utilisation de la première saison:', matchingSeason.name);
        }
        
        if (matchingSeason) {
          // Naviguer avec les vraies données de saison de l'API
          navigation.navigate('AnimePlayer', {
            animeUrl: `https://anime-sama.fr/catalogue/${historyItem.animeId}`,
            seasonData: matchingSeason,
            animeTitle: historyItem.animeTitle,
            initialEpisode: historyItem.episodeNumber,
            initialLanguage: historyItem.language as 'VF' | 'VOSTFR',
          });
          return;
        }
      }
    } catch (apiError) {
      console.error('❌ Erreur chargement anime details pour historique:', apiError);
    }

    // Fallback : navigation avec seasonData null si l'API échoue
    navigation.navigate('AnimePlayer', {
      animeUrl: `https://anime-sama.fr/catalogue/${historyItem.animeId}`,
      seasonData: null, // Sera déterminé automatiquement
      animeTitle: historyItem.animeTitle,
      initialEpisode: historyItem.episodeNumber,
      initialLanguage: historyItem.language as 'VF' | 'VOSTFR',
    });
  };

  // Supprimer un élément de l'historique
  const removeFromHistory = async (historyItem: WatchHistoryItem) => {
    await historyService.removeFromHistory(historyItem.id);
    // Recharger l'historique
    await loadWatchHistory();
  };

  // Refresh control
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllInitialContent();
    setRefreshing(false);
  };

  const handleSearchPress = () => {
    // Active l'affichage de la barre de recherche
    setShowSearchBar(true);
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  // Gestionnaire pour ouvrir le panneau de notifications
  const handleNotificationPress = () => {
    setShowNotifications(true);
  };

  // Gestionnaire pour ouvrir le menu drawer
  const handleMenuPress = () => {
    (navigation as any).openDrawer();
  };

  // Gestionnaire pour les actions des notifications
  const handleNotificationItemPress = (notification: PushNotification) => {
    // Marquer comme lue
    markAsRead(notification.id);
    
    // Navigation selon le type de contenu
    if (notification.data?.screen && notification.data?.params) {
      setShowNotifications(false);
      
      if (notification.data.screen === 'AnimeDetail') {
        navigation.navigate('AnimeDetail', notification.data.params);
      } else if (notification.data.screen === 'MangaReader') {
        navigation.navigate('MangaReader', notification.data.params);
      }
    }
  };


  // Fonction pour extraire la langue depuis l'objet language de l'API
  const getLanguageFromAPI = (anime: SearchResult) => {
    // Utiliser l'objet language de l'API si disponible
    if (anime.language && anime.language.name) {
      return anime.language.name; // VOSTFR, VF, etc.
    }
    return null;
  };

  // Composant Carte Anime optimisé avec React.memo
  const renderAnimeCard = React.useCallback((anime: SearchResult, index: number) => {
    // Utiliser la langue directement depuis l'objet language de l'API
    const detectedLanguage = getLanguageFromAPI(anime);
    
    // Le titre est déjà propre dans la nouvelle API
    const realTitle = anime.title;
    
    // L'API n'envoie plus d'infos d'épisode dans le titre, utiliser d'autres champs si disponibles
    const episodeInfo = null; // Supprimer car plus dans l'API
    
    return (
      <TouchableOpacity
        key={anime.id || index}
        style={styles.animeCard}
        onPress={() => loadAnimeDetails(anime.id, anime.contentType || anime.type, anime.title)}
        activeOpacity={0.8}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: anime.image }}
            style={styles.cardImage}
            resizeMode="cover"
            loadingIndicatorSource={require('../../assets/atomic-flix-logo.png')}
            fadeDuration={200}
            onError={(e) => {}}
          />

          {/* Badge type de contenu (identique au site web) */}
          <View style={[
            styles.contentBadge,
            anime.contentType === 'manga' ? styles.mangaBadge :
            anime.contentType === 'film' || anime.contentType === 'movie' ? styles.movieBadge :
            styles.animeBadge
          ]}>
            <Text style={styles.badgeText}>
              {anime.contentType === 'manga' ? 'MANGA' :
               anime.contentType === 'film' || anime.contentType === 'movie' ? 'FILM' :
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
                <Text style={styles.languageText}>{detectedLanguage}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  // Composant Carte Anime Horizontale pour la section Nouveaux épisodes
  const renderTrendingAnimeCard = React.useCallback((anime: SearchResult, index: number) => {
    // Utiliser la langue directement depuis l'objet language de l'API
    const detectedLanguage = getLanguageFromAPI(anime);
    
    return (
      <TouchableOpacity
        key={`trending-${anime.id || anime.url || anime.title.replace(/\s+/g, '-')}-${index}`}
        style={styles.horizontalCard}
        onPress={() => loadEpisodeDirectly(anime)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: anime.image }}
          style={styles.horizontalCardImage}
          resizeMode="cover"
          onError={(e) => {}}
        />

        {/* Badge épisode NOUVEAU sur l'image */}
        {anime.episodeInfo && (
          <View style={styles.newEpisodeBadge}>
            <Text style={styles.newEpisodeBadgeText}>NOUVEAU</Text>
          </View>
        )}

        <LinearGradient
          colors={['transparent', COLORS.primary + 'CC']}
          style={styles.horizontalCardGradient}
        >
          <View style={styles.horizontalCardContent}>
            <Text style={styles.horizontalCardTitle} numberOfLines={2}>
              {anime.title}
            </Text>
            {/* Badge info épisode + langue */}
            <View style={styles.horizontalCardMeta}>
              {anime.episodeInfo && (
                <View style={styles.episodeInfoBadge}>
                  <Text style={styles.episodeInfoText}>
                    {anime.episodeInfo}
                  </Text>
                </View>
              )}
              {detectedLanguage && (
                <View style={styles.horizontalCardBadge}>
                  <Text style={styles.horizontalCardBadgeText}>
                    {detectedLanguage}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, []);

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor={COLORS.primary} />

      {/* Bannière de statut réseau */}
      <NetworkStatusBanner
        isVisible={showOfflineBanner}
        onRetry={async () => {
          const isConnected = await checkConnection();
          if (isConnected) {
            await loadAllInitialContent();
          }
        }}
        onDismiss={hideBanner}
      />

      {/* Header fixe au-dessus du contenu */}
      <View style={styles.headerContainer}>
        <SharedHeader 
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
          onMenuPress={handleMenuPress}
        />
      </View>

      <OptimizedScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.secondary]}
            tintColor={COLORS.secondary}
          />
        }
      >
        {/* Barre de recherche locale (identique au site web) */}
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

        {/* Résultats de recherche (identique au site web) */}
        {searchLoading && searchQuery && (
          <View style={styles.loadingContainer}>
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

        {/* Message d'erreur de recherche */}
        {error && searchQuery && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              onPress={() => {
                setError(null);
                searchAnimes(searchQuery);
              }}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Réessayer la recherche</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Message si aucun résultat */}
        {searchQuery && !searchLoading && searchResults.length === 0 && !error && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun résultat trouvé pour "{searchQuery}"</Text>
          </View>
        )}

        {!searchQuery && !searchResults.length && (
          <View>
            {/* Section Héro - Nouvelle Saison (identique au site web) */}
            <View style={styles.heroSection}>
              {/* Images d'animes en mosaïque visible en haut */}
              <View style={styles.heroMosaicContainer}>
                {classiquesAnimes.slice(0, 8).map((anime, index) => (
                  <View
                    key={`hero-mosaic-${index}`}
                    style={styles.heroMosaicImage}
                  >
                    <Image
                      source={{ uri: anime.image }}
                      style={styles.heroMosaicImageContent}
                      resizeMode="cover"
                      onError={(e) => {}}
                    />
                  </View>
                ))}
              </View>

              {/* Contenu principal */}
              <LinearGradient
                colors={[
                  'rgba(0,0,0,0.6)', 
                  'rgba(168, 85, 247, 0.15)', 
                  'rgba(219, 39, 119, 0.1)', 
                  'rgba(168, 85, 247, 0.05)',
                  'rgba(0,0,0,0.9)'
                ]}
                style={styles.heroContent}
              >
                <Text style={[styles.heroSubtitle, textStyles.shadowTitle]}>
                  I AM ATOMIC{'\n'}PLONGEZ DANS L'UNIVERS INFINI
                </Text>
                
                {/* Drapeaux décoratifs dans les coins */}
                <Text style={styles.heroFlagLeft}>🎌</Text>
                <Text style={styles.heroFlagRight}>🎌</Text>
              </LinearGradient>
            </View>

            {/* Section Historique - REPRENEZ VOTRE VISIONNAGE */}
            {currentlyWatching.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>🎯 CONTINUER À REGARDER</Text>
                </View>
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.historyScrollContainer}
                >
                  {currentlyWatching.map((historyItem, index) => (
                    <TouchableOpacity
                      key={historyItem.id}
                      style={styles.historyCard}
                      onPress={() => resumeWatching(historyItem)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.historyImageContainer}>
                        <Image 
                          source={{ uri: historyItem.animeImage || 'https://via.placeholder.com/200x280' }}
                          style={styles.historyImage}
                          resizeMode="cover"
                        />
                        {/* Bouton de suppression */}
                        <TouchableOpacity 
                          style={styles.historyRemoveButton}
                          onPress={() => removeFromHistory(historyItem)}
                        >
                          <Ionicons name="close" size={16} color={COLORS.text.primary} />
                        </TouchableOpacity>
                        
                        {/* Barre de progression */}
                        <View style={styles.progressBarContainer}>
                          <View 
                            style={[
                              styles.progressBar, 
                              { 
                                width: `${historyService.calculateProgress(historyItem.watchDuration, historyItem.totalDuration)}%` 
                              }
                            ]} 
                          />
                        </View>
                      </View>
                      
                      <View style={styles.historyContent}>
                        <Text style={styles.historyAnimeTitle} numberOfLines={2}>
                          {historyItem.animeTitle}
                        </Text>
                        <Text style={styles.historyEpisodeInfo}>
                          {historyItem.seasonName || historyService.extractSeasonInfo(historyItem.animeId).seasonName}
                        </Text>
                        <View style={styles.historyBadgeContainer}>
                          <View style={[styles.historyLanguageBadge, { backgroundColor: historyItem.language === 'VF' ? COLORS.badges.vf : COLORS.badges.vostfr }]}>
                            <Text style={styles.historyLanguageText}>
                              {getLanguageBadgeText(historyItem.language)}
                            </Text>
                          </View>
                          <View style={[styles.historyEpisodeBadge, { backgroundColor: COLORS.secondary }]}>
                            <Text style={styles.historyEpisodeText}>Épisode {historyItem.episodeNumber}</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </OptimizedScrollView>
              </View>
            )}

            {/* Section Nouveaux épisodes - 1ère position */}
            {nouveauxEpisodes.length > 0 && (
              <View style={styles.horizontalSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🔥 Nouveaux épisodes</Text>
                </View>
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                  contentContainerStyle={styles.horizontalScrollContainer}
                >
                  {nouveauxEpisodes.map((anime, index) => renderTrendingAnimeCard(anime, index))}
                </OptimizedScrollView>
              </View>
            )}

            {/* Section Sorties aujourd'hui - 2ème position planning immédiat */}
            {planningAnimes.length > 0 && (
              <View style={styles.horizontalSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>⏰ Sorties aujourd'hui</Text>
                </View>
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                  style={styles.horizontalScroll}
                  decelerationRate={0.985}
                  snapToInterval={128}
                  snapToAlignment="start"
                  directionalLockEnabled={true}
                  scrollEventThrottle={4}
                  removeClippedSubviews={true}
                  bounces={true}
                  bouncesZoom={false}
                  overScrollMode="auto"
                  disableIntervalMomentum={true}
                >
                  {planningAnimes.map((anime, index) => (
                    <TouchableOpacity
                      key={`planning-${anime.id || anime.url || anime.title.replace(/\s+/g, '-')}-${index}`}
                      style={styles.planningCard}
                      onPress={() => loadAnimeDetails(anime.id || anime.url, anime.contentType, anime.title)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: anime.image }}
                        style={styles.horizontalCardImage}
                        resizeMode="cover"
                      />
                      {/* Badge PLANNING avec heure sur l'image */}
                      <View style={styles.planningBadge}>
                        <Text style={styles.planningBadgeText}>
                          {anime.releaseTime && anime.releaseTime !== '?' ? anime.releaseTime : 'PLANNING'}
                        </Text>
                      </View>
                      <LinearGradient
                        colors={['transparent', COLORS.primary + 'CC']}
                        style={styles.horizontalCardGradient}
                      >
                        <View style={styles.horizontalCardContent}>
                          <Text style={styles.horizontalCardTitle} numberOfLines={2}>
                            {anime.title}
                          </Text>
                          {anime.language && (
                            <View style={styles.horizontalCardBadge}>
                              <Text style={styles.horizontalCardBadgeText}>
                                {anime.language.name}
                              </Text>
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </OptimizedScrollView>
              </View>
            )}

            {/* Section Classiques - 3ème position valeurs sûres */}
            {classiquesAnimes.length > 0 && (
              <View style={styles.horizontalSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>👑 Légendaires</Text>
                </View>
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                  style={styles.horizontalScroll}
                  decelerationRate={0.985}
                  snapToInterval={128}
                  snapToAlignment="start"
                  directionalLockEnabled={true}
                  scrollEventThrottle={4}
                  removeClippedSubviews={true}
                  bounces={true}
                  bouncesZoom={false}
                  overScrollMode="auto"
                  disableIntervalMomentum={true}
                >
                  {classiquesAnimes.map((anime, index) => (
                    <TouchableOpacity
                      key={`classique-${anime.id || index}`}
                      style={styles.legendaryCard}
                      onPress={() => loadAnimeDetails(anime.id || anime.url, anime.contentType, anime.title)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: anime.image }}
                        style={styles.horizontalCardImage}
                        resizeMode="cover"
                      />
                      {/* Badge CLASSIQUE sur l'image */}
                      <View style={styles.classicBadge}>
                        <Text style={styles.classicBadgeText}>★ CLASSIQUE</Text>
                      </View>
                      <LinearGradient
                        colors={['transparent', COLORS.primary + 'CC']}
                        style={styles.horizontalCardGradient}
                      >
                        <View style={styles.horizontalCardContent}>
                          <Text style={styles.horizontalCardTitle} numberOfLines={2}>
                            {anime.title}
                          </Text>
                          {anime.language && (
                            <View style={styles.horizontalCardBadge}>
                              <Text style={styles.horizontalCardBadgeText}>
                                {getLanguageBadge(anime.language)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </OptimizedScrollView>
              </View>
            )}

            {/* Section Pépites - 4ème position exploration */}
            {pepitesAnimes.length > 0 && (
              <View style={styles.horizontalSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>💎 Pépites cachées</Text>
                </View>
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                  style={styles.horizontalScroll}
                  decelerationRate={0.985}
                  snapToInterval={128}
                  snapToAlignment="start"
                  directionalLockEnabled={true}
                  scrollEventThrottle={4}
                  removeClippedSubviews={true}
                  bounces={true}
                  bouncesZoom={false}
                  overScrollMode="auto"
                  disableIntervalMomentum={true}
                >
                  {pepitesAnimes.map((anime, index) => (
                    <TouchableOpacity
                      key={`pepite-${anime.id || index}`}
                      style={styles.gemCard}
                      onPress={() => loadAnimeDetails(anime.id || anime.url, anime.contentType, anime.title)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: anime.image }}
                        style={styles.horizontalCardImage}
                        resizeMode="cover"
                      />
                      {/* Badge RARE sur l'image */}
                      <View style={styles.rareBadge}>
                        <Text style={styles.rareBadgeText}>💎 RARE</Text>
                      </View>
                      <LinearGradient
                        colors={['transparent', COLORS.primary + 'CC']}
                        style={styles.horizontalCardGradient}
                      >
                        <View style={styles.horizontalCardContent}>
                          <Text style={styles.horizontalCardTitle} numberOfLines={2}>
                            {anime.title}
                          </Text>
                          {anime.language && (
                            <View style={styles.horizontalCardBadge}>
                              <Text style={styles.horizontalCardBadgeText}>
                                {getLanguageBadge(anime.language)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </OptimizedScrollView>
              </View>
            )}




            {/* Section Recommandations - Position après Historique */}
            {recommendationsAnimes.length > 0 && (
              <View style={styles.horizontalSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🎯 Recommandations</Text>
                </View>
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                  style={styles.horizontalScroll}
                  decelerationRate={0.985}
                  snapToInterval={128}
                  snapToAlignment="start"
                  directionalLockEnabled={true}
                  scrollEventThrottle={4}
                  removeClippedSubviews={true}
                  bounces={true}
                  bouncesZoom={false}
                  overScrollMode="auto"
                  disableIntervalMomentum={true}
                >
                  {recommendationsAnimes.map((anime, index) => (
                    <TouchableOpacity
                      key={`recommendation-${anime.id || index}`}
                      style={styles.recommendationCard}
                      onPress={() => loadAnimeDetails(anime.id || anime.url, anime.contentType, anime.title)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: anime.image }}
                        style={styles.horizontalCardImage}
                        resizeMode="cover"
                      />
                      {/* Badge RECOMMANDÉ sur l'image */}
                      <View style={styles.recommendationBadge}>
                        <Text style={styles.recommendationBadgeText}>🎯 RECOMMANDÉ</Text>
                      </View>
                      <LinearGradient
                        colors={['transparent', COLORS.primary + 'CC']}
                        style={styles.horizontalCardGradient}
                      >
                        <View style={styles.horizontalCardContent}>
                          <Text style={styles.horizontalCardTitle} numberOfLines={2}>
                            {anime.title}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </OptimizedScrollView>
              </View>
            )}

            {/* Chargement initial unique */}
            {initialLoading && (
              <View style={styles.loadingContainer}>
                <LoadingSpinner 
                  message="Chargement de l'univers des animes..." 
                  size="large"
                  color={COLORS.secondary}
                />
              </View>
            )}

            {/* Message d'erreur */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setError(null);
                    loadPopularAnimes();
                  }}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Message vide si pas de contenu et pas de chargement */}
            {!initialLoading && !error && classiquesAnimes.length === 0 && pepitesAnimes.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun contenu trouvé</Text>
                <TouchableOpacity 
                  onPress={() => loadPopularAnimes()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Charger le contenu</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </OptimizedScrollView>

      {/* Modal des notifications */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifications(false)}
      >
        <SafeAreaView style={styles.notificationModalContainer}>
          {/* Header de la modal */}
          <View style={styles.notificationModalHeader}>
            <Text style={styles.notificationModalTitle}>Notifications</Text>
            <TouchableOpacity
              onPress={() => setShowNotifications(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Panneau de notifications */}
          <NotificationPanel
            notifications={notifications}
            onNotificationPress={handleNotificationItemPress}
            onMarkAllRead={markAllAsRead}
            onRefresh={refreshNotifications}
            isRefreshing={false}
          />
        </SafeAreaView>
      </Modal>

      {/* Banner publicitaire Start.io en bas de l'écran */}
      <StartIOAdBanner 
        position="bottom" 
        visible={true}
        style={{ zIndex: 100 }}
      />

      </SafeAreaView>
    </CosmicBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Fond cosmique "I am Atomic"
  },
  headerContainer: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: COLORS.secondary, // Cyan du logo
  },
  scrollView: {
    flex: 1,
  },



  // Recherche
  searchBarContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.text.primary + '1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Contour néon pour barre de recherche
    borderWidth: 2,
    borderColor: COLORS.border.secondary, // Violet néon
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 16,
    marginLeft: 12,
  },
  clearSearchButton: {
    padding: 4,
    borderRadius: 6,
    // Contour néon pour bouton clear search
    borderWidth: 2,
    borderColor: COLORS.border.focus, // Magenta atomique
    backgroundColor: COLORS.badges.manga + '1A',
    shadowColor: COLORS.badges.hot,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  clearSearchText: {
    color: COLORS.text.muted,
    fontSize: 16,
  },

  // Hero Section - Effet "I am Atomic"
  heroSection: {
    height: 180,
    position: 'relative',
    marginBottom: 20,
    backgroundColor: COLORS.background.secondary, // Fond noir légèrement visible
    borderRadius: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    // Contour néon cosmique puissant pour hero
    borderWidth: 3,
    borderColor: COLORS.border.glow, // Violet néon intense
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },
  heroMosaicContainer: {
    flexDirection: 'row',
    height: 90, // 50% de la hauteur totale (180px)
  },
  heroMosaicImage: {
    flex: 1,
    marginHorizontal: -1,
  },
  heroMosaicImageContent: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90, // 50% de la hauteur totale (180px)
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center', // Contenu centré par défaut
    justifyContent: 'center', // Contenu centré verticalement
  },
  heroLogo: {
    width: 48,
    height: 48,
    borderRadius: 24, // Logo parfaitement rond (la moitié de width/height)
    position: 'absolute',
    bottom: 16,
    right: 16, // Positionné dans l'angle inférieur droit
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  heroFlagLeft: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    fontSize: 28,
  },
  heroFlagRight: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    fontSize: 28,
  },


  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  // Cards Anime optimisées pour les performances - Effet "I am Atomic"
  animeCard: {
    width: (width - 48) / 2,
    minHeight: 200, // minHeight au lieu de height fixe
    height: 'auto', // Hauteur automatique pour s'adapter au contenu
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.background.secondary, // Fond légèrement visible sur noir
    // Bordures néon cosmiques
    borderWidth: 2,
    borderColor: COLORS.border.glow, // Violet néon intense
    // Effet de glow atomique puissant
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 12,
  },
  cardImageContainer: {
    position: 'relative',
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  contentBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mangaBadge: {
    backgroundColor: COLORS.badges.manga,
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
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    ...textStyles.cardTitle,
    marginBottom: 8,
    lineHeight: 18,
    minHeight: 54,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  languageBadge: {
    backgroundColor: COLORS.badges.vostfr + '33', // Violet avec transparence
    borderWidth: 1,
    borderColor: COLORS.badges.vostfr,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-end',
    // Effet glow violet pour badges langue
    shadowColor: COLORS.badges.vostfr,
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  languageText: {
    color: COLORS.text.primary,
    fontSize: 9,
    fontWeight: '600',
  },

  // États
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: COLORS.text.muted,
    marginTop: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  errorText: {
    color: COLORS.text.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: COLORS.text.muted,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Styles pour le modal Telegram avec effet blur
  telegramModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  telegramModalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.background.modal,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },

  // Styles pour les sections horizontales (Classiques et Pépites)
  horizontalSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary, // Couleur cyan du nouveau logo
    textShadowColor: 'rgba(0, 212, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  horizontalScrollContainer: {
    paddingRight: 16,
  },
  horizontalCard: {
    width: 120,
    height: 180,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.background.secondary, // Fond légèrement visible sur noir
    // Bordures néon violettes - Effet cosmique
    borderWidth: 2,
    borderColor: COLORS.border.glow, // Violet néon intense - cohérent avec les autres cartes
    // Effet de glow atomique
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  // Badge NOUVEAU pour les nouveaux épisodes - Style atomique
  newEpisodeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.badges.new, // Vert émeraude atomique
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
    // Effet glow sur badge NOUVEAU
    shadowColor: COLORS.badges.new,
    shadowOpacity: 0.6,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border.focus,
  },
  newEpisodeBadgeText: {
    color: COLORS.text.primary, // Blanc éclatant - cohérent avec le système
    fontSize: 9,
    fontWeight: 'bold',
    // Effet de lueur pour le texte du badge
    textShadowColor: COLORS.badges.new,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  // Meta info pour les cartes horizontales
  horizontalCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  episodeInfoBadge: {
    backgroundColor: COLORS.badges.new + '33', // Vert émeraude avec transparence
    borderWidth: 1,
    borderColor: COLORS.badges.new,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    // Effet glow vert pour badges épisode
    shadowColor: COLORS.badges.new,
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  episodeInfoText: {
    color: COLORS.states.active, // Cyan éclatant pour meilleur contraste
    fontSize: 9,
    fontWeight: '600',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  horizontalCardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  horizontalCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  horizontalCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  horizontalCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary, // Blanc éclatant - cohérent avec le système
    marginBottom: 4,
    lineHeight: 14,
    // Effet de lueur atomique sur le titre
    textShadowColor: COLORS.badges.atomic,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  horizontalCardBadge: {
    backgroundColor: COLORS.badges.vostfr + '33', // Violet avec transparence
    borderWidth: 1,
    borderColor: COLORS.badges.vostfr,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    // Effet glow violet pour badges horizontaux
    shadowColor: COLORS.badges.vostfr,
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  horizontalCardBadgeText: {
    color: COLORS.text.primary, // Blanc éclatant pour meilleure lisibilité
    fontSize: 8,
    fontWeight: '600',
    // Effet de lueur pour le texte des badges langue
    textShadowColor: COLORS.badges.vostfr,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },



  // Styles pour les cartes spécialisées
  legendaryCard: {
    width: 120,
    height: 180,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A', // Fond légèrement visible
    // Bordure or atomique pour légendaires
    borderWidth: 2,
    borderColor: COLORS.badges.legendary, // Or atomique
    // Effet glow or intense pour légendaires
    shadowColor: COLORS.badges.legendary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 12,
  },
  gemCard: {
    width: 120,
    height: 180,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: COLORS.border.primary, // Bordure violette pour pépites rares
  },

  // Badges spécialisés sur les images
  releaseBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 193, 7, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  releaseBadgeText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  classicBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  classicBadgeText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  rareBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
  },
  rareBadgeText: {
    color: COLORS.text.primary,
    fontSize: 8,
    fontWeight: 'bold',
  },
  vintageCard: {
    width: 120,
    height: 180,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: COLORS.badges.manga + '66', // Bordure magenta avec transparence pour vintage
  },
  vintageBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.badges.manga, // Magenta atomique pour vintage
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
    // Effet glow magenta pour badges vintage
    shadowColor: COLORS.badges.manga,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.focus,
  },
  vintageBadgeText: {
    color: COLORS.text.primary,
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Styles pour l'historique intelligent
  smartCard: {
    width: 120,
    marginRight: 15,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.background.card,
    elevation: 3,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },


  // Styles pour les cartes de recommandations
  recommendationCard: {
    width: 120,
    height: 180,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    elevation: 8,
    shadowColor: COLORS.badges.trending, // Ombre violette atomique pour recommandations
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5, // Glow plus intense
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.badges.trending + '66', // Bordure violette avec transparence pour recommandations
  },
  recommendationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.badges.trending, // Violet néon pour recommandations
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    // Effet glow violet pour badges recommandation
    shadowColor: COLORS.badges.trending,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.glow,
    zIndex: 1,
  },
  recommendationBadgeText: {
    color: COLORS.text.primary, // Blanc éclatant pour meilleure lisibilité
    fontSize: 8,
    fontWeight: 'bold',
    // Effet de lueur pour le texte des badges recommandation
    textShadowColor: COLORS.badges.trending,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // Styles pour les cartes de planning
  planningCard: {
    width: 120,
    height: 180,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    elevation: 8,
    shadowColor: COLORS.text.atomic, // Ombre dorée atomique pour planning
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6, // Glow plus intense
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.text.atomic, // Bordure dorée atomique pour planning
  },
  planningBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.text.atomic, // Or atomique pour planning
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 1,
    // Effet glow doré pour badges planning
    shadowColor: COLORS.text.atomic,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.focus,
  },
  planningBadgeText: {
    color: COLORS.text.shadow, // Couleur sombre pour contraste sur fond doré
    fontSize: 8,
    fontWeight: 'bold',
    // Effet de lueur pour le texte du badge planning
    textShadowColor: COLORS.text.atomic,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // Styles pour la modal de notifications
  notificationModalContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  notificationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: COLORS.primary,
  },
  notificationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Styles pour la section historique
  historySection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary, // Couleur cyan du nouveau logo
    textShadowColor: 'rgba(0, 212, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  historyScrollContainer: {
    paddingRight: 16,
  },
  historyCard: {
    width: 160,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    marginRight: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border.card, // Lueur violette subtile - cohérent avec le système
  },
  historyImageContainer: {
    position: 'relative',
    height: 120,
  },
  historyImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  historyRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.secondary,
  },
  historyContent: {
    padding: 12,
    gap: 8,
  },
  historyAnimeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  historyEpisodeInfo: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  historyBadgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  historyLanguageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flex: 1,
  },
  historyLanguageText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  historyEpisodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flex: 2,
  },
  historyEpisodeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
  },

});

export default HomeScreen;