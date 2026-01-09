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
import { getThemedTextStyles, interactiveStyles } from '../constants/newColors';
import { useTheme } from '../contexts/ThemeContext';
import CosmicBackground from '../components/CosmicBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../hooks/useNotifications';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { PushNotification } from '../types/notifications';
import { historyService, WatchHistoryItem } from '../services/HistoryService';
import { getLanguageBadgeText } from '../utils/languageUtils';
import NetworkStatusBanner from '../components/NetworkStatusBanner';
import { apiGetWithCache, apiRequestWithRetry, ErrorType } from '../utils/apiWithRetry';
import OfflineErrorCard from '../components/OfflineErrorCard';
import ServerErrorCard from '../components/ServerErrorCard';
import SimpleAnimeCard from '../components/SimpleAnimeCard';
import SectionTitle from '../components/SectionTitle';
import { formatAddedDate, formatPlanningTime } from '../utils/dateFormatter';


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
  seasonPart: number;
  episode: number | null;
  language: string;
  url: string;
  image: string;
  addedAt: string;
  type: string;
  isFin?: boolean;
  isReporte?: boolean;
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
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [classiquesAnimes, setClassiquesAnimes] = useState<SearchResult[]>([]);
  const [pepitesAnimes, setPepitesAnimes] = useState<SearchResult[]>([]);
  const [nouveauxEpisodes, setNouveauxEpisodes] = useState<SearchResult[]>([]);
  const [recommendationsAnimes, setRecommendationsAnimes] = useState<SearchResult[]>([]);
  const [planningAnimes, setPlanningAnimes] = useState<SearchResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
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

  // Hook pour le thème
  const { isDark, colors, getOverlayGradient } = useTheme();
  const COLORS = colors;
  const textStyles = getThemedTextStyles(isDark);

  // Configuration API identique au site web
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';
  const SITE_BASE_URL = 'https://anime-sama.tv';


  // Fonction utilitaire pour obtenir le badge de langue
  const getLanguageBadge = (language: any): string | undefined => {
    if (!language) return undefined;
    if (typeof language === 'string') {
      const upper = language.toUpperCase();
      if (upper.includes('VF')) return 'VF 🇫🇷';
      if (upper.includes('VO')) return 'VO 🇯🇵';
      return upper;
    }
    if (language.vf) return 'VF 🇫🇷';
    if (language.vostfr || language.vjstfr) return 'VO 🇯🇵';
    if (language.name) {
      const upper = language.name.toUpperCase();
      if (upper.includes('VF')) return 'VF 🇫🇷';
      if (upper.includes('VO')) return 'VO 🇯🇵';
      return upper;
    }
    return undefined;
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

  useEffect(() => {
    const setupNavigationBar = async () => {
      try {
        // Logique de navigation bar désactivée pour le web
      } catch (e) {
        console.warn('NavigationBar non supporté sur cette plateforme');
      }
    };
    setupNavigationBar();

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
        const [popular, recent, recommendations, planning] = await Promise.all([
          apiRequest('/api/popular').catch(() => null),
          apiRequest('/api/recent').catch(() => null),
          apiRequest('/api/recommendations').catch(() => null),
          apiRequest('/api/planning').catch(() => null)
        ]);

        // Traitement populaire
        if (popular && popular.categories) {
          const classiquesData = (popular.categories.classiques?.anime || []).map((anime: any) => ({
            ...anime,
            id: anime.id || anime.url,
            image: anime.image || `https://raw.githubusercontent.com/Anime-Sama/IMG/img/contenu/${anime.id}.jpg`
            // Pas de badge forcé VOSTFR ici, on laisse l'API décider
          }));
          const pepitesData = (popular.categories.pepites?.anime || []).map((anime: any) => ({
            ...anime,
            id: anime.id || anime.url,
            image: anime.image || `https://raw.githubusercontent.com/Anime-Sama/IMG/img/contenu/${anime.id}.jpg`
            // Pas de badge forcé VOSTFR ici, on laisse l'API décider
          }));
          setClassiquesAnimes(classiquesData);
          setPepitesAnimes(pepitesData);
        }

        // Traitement récents
        if (recent && recent.recentEpisodes) {
          const formattedRecent = recent.recentEpisodes.slice(0, 15).map((ep: any) => ({
            ...ep,
            id: ep.animeId,
            title: ep.animeTitle,
            contentType: 'anime',
            image: ep.image || `https://raw.githubusercontent.com/Anime-Sama/IMG/img/contenu/${ep.animeId}.jpg`,
            currentSeason: ep.season,
            currentEpisode: ep.episode,
            isFin: ep.isFin,
            isReporte: ep.isReporte,
            language: {
              name: ep.language,
              code: (ep.language || '').toLowerCase(),
              fullName: ep.language,
              flag: (ep.language || '').includes('VF') ? '🇫🇷' : ep.language === 'VA' ? '🇺🇸' : '🇯🇵',
              priority: 1,
              badgeText: (ep.language || '').includes('VF') ? 'VF 🇫🇷' : 'VO 🇯🇵'
            }
          }));
          setNouveauxEpisodes(formattedRecent);
        }

        // Traitement recommandations
        const recData = recommendations?.data || recommendations;
        if (Array.isArray(recData)) {
          const formattedRecs = recData.slice(0, 20).map((anime: any) => ({
            ...anime,
            id: anime.id || anime.url,
            contentType: anime.contentType || 'anime',
            image: anime.image || `https://raw.githubusercontent.com/Anime-Sama/IMG/img/contenu/${anime.id}.jpg`,
            language: {
              name: anime.languages?.[0] || 'VOSTFR',
              code: (anime.languages?.[0] || 'VOSTFR').toLowerCase(),
              fullName: anime.languages?.[0] || 'VOSTFR',
              flag: anime.languages?.[0]?.includes('VF') ? '🇫🇷' : anime.languages?.[0] === 'VA' ? '🇺🇸' : '🇯🇵',
              priority: 1,
              badgeText: (anime.languages?.[0] || '').includes('VF') ? 'VF 🇫🇷' : 'VO 🇯🇵'
            }
          }));
          setRecommendationsAnimes(formattedRecs);
        }

        // Traitement planning
        if (planning && planning.items) {
          const formattedPlanning = planning.items.slice(0, 15).map((item: any) => ({
            ...item,
            id: item.animeId,
            contentType: item.type || 'anime',
            isFin: item.isFin,
            isReporte: item.isReporte,
            planningTime: item.planningTime, // Ajout du temps de diffusion
            language: {
              name: item.language,
              code: (item.language || '').toLowerCase(),
              fullName: item.language,
              flag: (item.language || '').includes('VF') ? '🇫🇷' : item.language === 'VA' ? '🇺🇸' : '🇯🇵',
              priority: 1,
              badgeText: (item.language || '').includes('VF') ? 'VF 🇫🇷' : 'VO 🇯🇵'
            }
          }));
          setPlanningAnimes(formattedPlanning);
        }

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




  // Fonction pour les requêtes API avec retry et détection du type d'erreur
  const apiRequest = async (endpoint: string, options = {}) => {
    const result = await apiRequestWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      ...options
    });

    if (!result.success) {
      setErrorType(result.errorType || 'unknown');
      throw new Error(result.error || 'Erreur API');
    }

    return result.data;
  };


  // Charger le contenu populaire (classiques et pépites) depuis l'API
  const loadPopularAnimes = async () => {
    try {
      const response = await apiRequest('/api/popular');
      console.log('📊 API /popular réponse complète:', response);

      if (response && response.categories) {
        // Convertir les données de l'API en format SearchResult
        const classiques: SearchResult[] = (response.categories.classiques?.anime || []).map((anime: any) => ({
          ...anime,
          image: anime.image || `https://raw.githubusercontent.com/Anime-Sama/IMG/img/contenu/${anime.id}.jpg`
        }));
        const pepites: SearchResult[] = (response.categories.pepites?.anime || []).map((anime: any) => ({
          ...anime,
          image: anime.image || `https://raw.githubusercontent.com/Anime-Sama/IMG/img/contenu/${anime.id}.jpg`
        }));
        
        console.log('👑 Classiques trouvés:', classiques.length, classiques);
        console.log('💎 Pépites trouvées:', pepites.length, pepites);
        
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
      console.log('🔥 API /recent réponse complète:', response);
      console.log('📋 Nombre d\'épisodes reçus:', response?.recentEpisodes?.length);
      if (response?.recentEpisodes && response.recentEpisodes.length > 0) {
        console.log('🎬 Premier épisode:', response.recentEpisodes[0]);
      }

      if (response && response.recentEpisodes) {
        // Convertir les données de l'API en format SearchResult
        const recentEpisodes: SearchResult[] = response.recentEpisodes.slice(0, 15).map((episode: RecentEpisode) => ({
          ...episode,
          id: episode.animeId,
          title: episode.animeTitle,
          contentType: 'anime',
          image: episode.image || `https://raw.githubusercontent.com/Anime-Sama/IMG/img/contenu/${episode.animeId}.jpg`,
          currentSeason: episode.season,
          currentEpisode: episode.episode || undefined,
          seasonPart: episode.seasonPart || undefined,
          isFin: episode.isFin,
          isReporte: episode.isReporte,
          language: {
            name: episode.language,
            code: episode.language.toLowerCase(),
            fullName: episode.language,
            flag: episode.language.includes('VF') ? '🇫🇷' : 
                  episode.language === 'VA' ? '🇺🇸' : '🇯🇵',
            priority: 1
          },
        }));
        
        console.log('✅ Nouveaux épisodes convertis:', recentEpisodes.length);
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
    setErrorType(null);

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
    if (animeId.includes('anime-sama.si')) {
      // Extraire l'ID depuis l'URL : /catalogue/kaoru-hana-wa-rin-to-saku/saison1/vostfr/
      const urlParts = animeId.split('/');
      const catalogueIndex = urlParts.findIndex(part => part === 'catalogue');
      if (catalogueIndex !== -1 && urlParts[catalogueIndex + 1]) {
        cleanId = urlParts[catalogueIndex + 1];
      }
    }
    
    
    // Détecter si c'est un manga - Masqué car désactivé
    if (contentType === 'anime' || contentType === 'film' || contentType === 'movie' || !contentType) {
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
    if (cleanId.includes('anime-sama.si')) {
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
      // La réponse est {"success": true, "data": [...], "metadata": {...}}
      const dataArray = response?.data || response;
      console.log('💭 API /recommendations data array:', dataArray);
      console.log('📋 Nombre de recommandations reçues:', Array.isArray(dataArray) ? dataArray.length : 'N/A');

      if (dataArray && Array.isArray(dataArray) && dataArray.length > 0) {
        console.log('🎬 Première recommandation:', dataArray[0]);
        // Convertir les données de l'API en format SearchResult
        const recommendations: SearchResult[] = dataArray.slice(0, 20).map((anime: any) => ({
          ...anime,
          contentType: anime.contentType || 'anime',
          image: anime.image || `https://raw.githubusercontent.com/Anime-Sama/IMG/img/contenu/${anime.id}.jpg`,
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
        
        console.log('✅ Recommandations converties:', recommendations.length);
        setRecommendationsAnimes(recommendations);
      } else {
        console.warn('⚠️ Réponse recommandations vide ou invalide');
        setRecommendationsAnimes([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement recommandations:', error);
      setRecommendationsAnimes([]);
    }
  };

  // Charger le planning du jour depuis l'API
  const loadPlanning = async () => {
    try {
      const response = await apiRequest('/api/planning');
      console.log('📅 API /planning réponse complète:', response);
      console.log('📋 Nombre d\'items planning reçus:', response?.items?.length || 'N/A');
      if (response?.items && response.items.length > 0) {
        console.log('🎬 Premier item planning:', response.items[0]);
      }

      if (response && response.items) {
        // Convertir les données de l'API en format SearchResult
        const planning: SearchResult[] = response.items.slice(0, 15).map((item: any) => ({
          ...item,
          id: item.animeId,
          contentType: item.type || 'anime',
          language: {
            name: item.language,
            code: item.language.toLowerCase(),
            fullName: item.language,
            flag: item.language.includes('VF') ? '🇫🇷' : 
                  item.language === 'VA' ? '🇺🇸' : '🇯🇵',
            priority: 1
          },
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
            animeUrl: historyItem.animeId,
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
      animeUrl: historyItem.animeId,
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

  // Gestionnaire pour les notifications (icône)
  const handleNotificationPress = () => {
    // Icône de notification - juste pour afficher le badge
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
      if (notification.data.screen === 'AnimeDetail') {
        navigation.navigate('AnimeDetail', notification.data.params);
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
            fadeDuration={200}
            onError={(e) => {}}
          />

          {/* Badge type de contenu (identique au site web) */}
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

  // Styles  
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
    backgroundColor: COLORS.primary, // Fond opaque pour masquer les lignes rouges
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
    zIndex: 10000, // Au-dessus des lignes rouges pour les masquer
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
    padding: 12,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 18,
    marginBottom: 8,
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  languageBadge: {
    backgroundColor: COLORS.secondary, // Cyan cohérent
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  languageText: {
    color: COLORS.text.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Sections horizontales
  horizontalSection: {
    marginBottom: 24,
    paddingLeft: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary, // Couleur cyan du nouveau logo
    // Ombre de texte néon pour intensité atomique
    textShadowColor: 'rgba(0, 212, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  horizontalScroll: {
    marginBottom: 8,
  },
  horizontalScrollContainer: {
    paddingRight: 16,
  },

  // Cards horizontales - Effet "I am Atomic"
  horizontalCard: {
    width: 116,
    height: 164,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
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
  horizontalCardImage: {
    width: '100%',
    height: '100%',
  },
  horizontalCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
  },
  horizontalCardContent: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
  },
  horizontalCardTitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
    ...textStyles.shadowTitle,
  },
  horizontalCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  horizontalCardBadge: {
    backgroundColor: COLORS.secondary, // Cyan cohérent
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  horizontalCardBadgeText: {
    color: COLORS.text.primary,
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Badges spéciaux
  newEpisodeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: COLORS.badges.nouveau, // Violet cosmique
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.border.secondary,
  },
  newEpisodeBadgeText: {
    color: COLORS.text.primary,
    fontSize: 8,
    fontWeight: 'bold',
  },

  episodeInfoBadge: {
    backgroundColor: COLORS.accent, // Magenta atomique
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: '70%',
  },
  episodeInfoText: {
    color: COLORS.text.primary,
    fontSize: 8,
    fontWeight: 'bold',
  },

  // États de chargement et erreur
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.secondary, // Cyan cohérent
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    // Effet néon pour bouton retry
    borderWidth: 2,
    borderColor: COLORS.border.secondary,
    shadowColor: COLORS.badges.atomic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
  },
  retryText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 64,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.text.muted,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Cartes spéciales avec effets uniques
  legendaryCard: {
    width: 116,
    height: 164,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    // Contour doré pour légendaires
    borderWidth: 2,
    borderColor: COLORS.badges.legendary,
    shadowColor: COLORS.badges.legendary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },

  classicBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    backgroundColor: COLORS.badges.legendary, // Fond doré
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: COLORS.badges.legendary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.focus,
  },
  classicBadgeText: {
    color: COLORS.text.shadow, // Couleur sombre pour contraste sur fond doré
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    // Effet de lueur pour le texte du badge
    textShadowColor: COLORS.text.atomic,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  gemCard: {
    width: 116,
    height: 164,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    // Contour bleu diamant pour pépites
    borderWidth: 2,
    borderColor: COLORS.badges.premium,
    shadowColor: COLORS.badges.premium,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },

  rareBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    backgroundColor: COLORS.badges.premium, // Fond premium
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: COLORS.badges.premium,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.focus,
  },
  rareBadgeText: {
    color: COLORS.text.shadow, // Couleur sombre pour contraste sur fond premium
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    // Effet de lueur pour le texte du badge
    textShadowColor: COLORS.text.atomic,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  planningCard: {
    width: 116,
    height: 164,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    // Contour doré pour planning
    borderWidth: 2,
    borderColor: COLORS.badges.planning,
    shadowColor: COLORS.badges.planning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },

  recommendationCard: {
    width: 116,
    height: 164,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    // Contour cyan pour recommandations
    borderWidth: 2,
    borderColor: COLORS.badges.trending,
    shadowColor: COLORS.badges.trending,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },

  recommendationBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    backgroundColor: COLORS.badges.trending, // Fond cyan
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: COLORS.badges.trending,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.focus,
  },
  recommendationBadgeText: {
    color: COLORS.text.shadow, // Couleur sombre pour contraste sur fond doré
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    // Effet de lueur pour le texte du badge planning
    textShadowColor: COLORS.text.atomic,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  planningBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    backgroundColor: COLORS.badges.planning, // Fond doré
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: COLORS.badges.planning,
    shadowOffset: { width: 0, height: 0 },
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

  return (
    <CosmicBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor={COLORS.primary} />

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
                colors={getOverlayGradient() as any}
                style={styles.heroContent}
              >
                <Text style={[styles.heroSubtitle, textStyles.shadowTitle]}>
                  BINGE TOUT L'ANIME QUE TU VEUX{'\n'}GRATUIT • HD • SANS LIMITE
                </Text>
                
                {/* Drapeaux décoratifs dans les coins */}
                <Text style={styles.heroFlagLeft}>🎌</Text>
                <Text style={styles.heroFlagRight}>🎌</Text>
              </LinearGradient>
            </View>

            {/* Section Historique - REPRENEZ VOTRE VISIONNAGE */}
            {currentlyWatching.length > 0 && (
              <View style={styles.horizontalSection}>
                <SectionTitle title="🎯 CONTINUER À REGARDER" colors={COLORS} />
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                >
                  {currentlyWatching.map((historyItem, index) => (
                    <SimpleAnimeCard
                      key={`history-${historyItem.id}-${index}`}
                      anime={{
                        title: historyItem.animeTitle,
                        image: historyItem.animeImage || 'https://via.placeholder.com/200x280',
                        id: historyItem.id,
                        language: historyItem.language // Passer la langue brute
                      }}
                      badge={`S${historyItem.seasonNumber || 1}E${historyItem.episodeNumber}`}
                      badgeColor={COLORS.secondary}
                      languageBadge={getLanguageBadge(historyItem.language)} // Utiliser la fonction de formatage
                      index={index}
                      onPress={() => resumeWatching(historyItem)}
                    />
                  ))}
                </OptimizedScrollView>
              </View>
            )}

            {/* Section Nouveaux épisodes - 1ère position */}
            {nouveauxEpisodes.length > 0 && (
              <View style={styles.horizontalSection}>
                <SectionTitle title="🔥 Nouveaux épisodes" colors={COLORS} />
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                  contentContainerStyle={styles.horizontalScrollContainer}
                >
                  {nouveauxEpisodes.map((anime, index) => (
                    <SimpleAnimeCard
                      key={`new-${anime.id}-${anime.language?.name || index}-${index}`}
                      anime={anime}
                      badge={`S${anime.currentSeason || 1}${anime.currentEpisode ? `E${anime.currentEpisode}` : ''}`}
                      badgeColor={COLORS.badges.hot}
                      languageBadge={getLanguageBadge(anime.language)}
                      index={index}
                      onPress={() => loadEpisodeDirectly(anime)}
                    />
                  ))}
                </OptimizedScrollView>
              </View>
            )}

            {/* Section Sorties aujourd'hui - 2ème position planning immédiat */}
            {planningAnimes.length > 0 && (
              <View style={styles.horizontalSection}>
                <SectionTitle title="⏰ Sorties aujourd'hui" colors={COLORS} />
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                  style={styles.horizontalScroll}
                >
                  {planningAnimes.map((anime, index) => (
                    <SimpleAnimeCard
                      key={`planning-${anime.id || index}-${index}`}
                      anime={{
                        ...anime,
                        // Forcer la suppression des infos de saison/épisode pour cette section
                        currentSeason: undefined,
                        currentEpisode: undefined,
                        seasonPart: undefined
                      }}
                      badge={anime.releaseTime ? `⏰ ${anime.releaseTime}` : '⏰'}
                      badgeColor={COLORS.secondary}
                      languageBadge={getLanguageBadge(anime.language)}
                      index={index}
                      onPress={() => loadAnimeDetails(anime.animeId || anime.url, anime.contentType, anime.title)}
                    />
                  ))}
                </OptimizedScrollView>
              </View>
            )}

            {/* Section Classiques - 3ème position valeurs sûres */}
            {classiquesAnimes.length > 0 && (
              <View style={styles.horizontalSection}>
                <SectionTitle title="👑 Légendaires" colors={COLORS} />
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                  style={styles.horizontalScroll}
                >
                  {classiquesAnimes.map((anime, index) => (
                    <SimpleAnimeCard
                      key={`classique-${anime.id || index}-${index}`}
                      anime={anime}
                      badge="★ CLASSIQUE"
                      badgeColor={COLORS.badges.atomic}
                      languageBadge={getLanguageBadge(anime.language)}
                      index={index}
                      onPress={() => loadAnimeDetails(anime.id || anime.url, anime.contentType, anime.title)}
                    />
                  ))}
                </OptimizedScrollView>
              </View>
            )}

            {/* Section Pépites - 4ème position exploration */}
            {pepitesAnimes.length > 0 && (
              <View style={styles.horizontalSection}>
                <SectionTitle title="💎 Pépites cachées" colors={COLORS} />
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                  style={styles.horizontalScroll}
                >
                  {pepitesAnimes.map((anime, index) => (
                    <SimpleAnimeCard
                      key={`pepite-${anime.id || index}-${index}`}
                      anime={anime}
                      badge="💎 RARE"
                      badgeColor={COLORS.badges.manga}
                      languageBadge={getLanguageBadge(anime.language)}
                      index={index}
                      onPress={() => loadAnimeDetails(anime.id || anime.url, anime.contentType, anime.title)}
                    />
                  ))}
                </OptimizedScrollView>
              </View>
            )}




            {/* Section Recommandations - Position après Historique */}
            {recommendationsAnimes.length > 0 && (
              <View style={styles.horizontalSection}>
                <SectionTitle title="🎯 Recommandations" colors={COLORS} />
                <OptimizedScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScrollContainer}
                  style={styles.horizontalScroll}
                >
                  {recommendationsAnimes.map((anime, index) => (
                    <SimpleAnimeCard
                      key={`recommendation-${anime.id || index}-${index}`}
                      anime={anime}
                      badge="🎯 RECOM."
                      badgeColor={COLORS.secondary}
                      languageBadge={getLanguageBadge(anime.language)}
                      index={index}
                      onPress={() => loadAnimeDetails(anime.id || anime.url, anime.contentType, anime.title)}
                    />
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

            {/* Message d'erreur selon le type */}
            {error && errorType === 'server' && (
              <ServerErrorCard 
                onRetry={() => {
                  setError(null);
                  setErrorType(null);
                  loadPopularAnimes();
                }}
              />
            )}
            
            {error && errorType === 'network' && (
              <OfflineErrorCard 
                onRetry={() => {
                  setError(null);
                  setErrorType(null);
                  loadPopularAnimes();
                }}
              />
            )}

            {error && errorType !== 'server' && errorType !== 'network' && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setError(null);
                    setErrorType(null);
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
              <ServerErrorCard 
                onRetry={() => loadPopularAnimes()}
              />
            )}
          </View>
        )}
      </OptimizedScrollView>


      </SafeAreaView>
    </CosmicBackground>
  );
};

export default HomeScreen;
