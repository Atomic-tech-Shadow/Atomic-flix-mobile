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
import { Ionicons } from '@expo/vector-icons';

import { SearchResult } from '../types/index';
import type { RootStackParamList } from '../navigation/AppNavigator';
import SharedHeader from '../components/SharedHeader';
import { COLORS } from '../constants/newColors';
import LoadingSpinner from '../components/LoadingSpinner';
import NotificationService from '../utils/notificationService';
import TrendingNotificationService from '../services/TrendingNotificationService';
import PlanningNotificationService from '../services/PlanningNotificationService';
import TelegramVerification from '../components/TelegramVerification';
import { animeAPI } from '../utils/animeAPI';

import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width, height } = Dimensions.get('window');

// Interface pour les réponses API (identique au site web)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: ApiResponse<any>;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendingAnimes, setTrendingAnimes] = useState<SearchResult[]>([]);
  const [classiquesAnimes, setClassiquesAnimes] = useState<SearchResult[]>([]);
  const [pepitesAnimes, setPepitesAnimes] = useState<SearchResult[]>([]);
  const [planningAnimes, setPlanningAnimes] = useState<SearchResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showTelegramModal, setShowTelegramModal] = useState(false);


  // Configuration API identique au site web
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

  // Services de notifications
  const notificationService = NotificationService.getInstance();
  const trendingNotificationService = TrendingNotificationService.getInstance();
  const planningNotificationService = PlanningNotificationService.getInstance();

  // Fonction utilitaire pour obtenir le badge de langue
  const getLanguageBadge = (language: any): string => {
    if (!language) return 'VO';
    if (language.vf) return 'VF';
    if (language.vostfr) return 'VOSTFR';
    if (language.vjstfr) return 'VJSTFR';
    return 'VO';
  };

  // Charger tout le contenu au démarrage
  useEffect(() => {
    loadAllInitialContent();
    initializeNotifications();
    checkTelegramVerification();

    // Nettoyer les anciennes notifications au démarrage
    notificationService.cleanOldNotifications();
  }, []);

  // Fonction centralisée pour charger tout le contenu initial
  const loadAllInitialContent = async () => {
    setInitialLoading(true);
    try {
      // Charger tout en parallèle
      await Promise.all([
        loadTrendingAnimes(),
        loadPopularAnimes(),
        loadPlanningAnimes()
      ]);
    } catch (error) {
      console.error('Erreur chargement initial:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Vérifier si l'utilisateur a déjà validé Telegram
  const checkTelegramVerification = async () => {
    try {
      const verified = await AsyncStorage.getItem('telegram_verified');
      if (verified !== 'true') {
        setShowTelegramModal(true);
      }
    } catch (error) {
      console.log('Erreur lors de la vérification Telegram:', error);
      setShowTelegramModal(true);
    }
  };

  // Gestionnaire de fermeture du modal Telegram
  const handleTelegramVerified = () => {
    setShowTelegramModal(false);
  };

  // Initialiser les paramètres de notification
  const initializeNotifications = async () => {
    try {
      // Initialiser les notifications push
      await notificationService.initializePushNotifications();
      
      // Initialiser le service de notifications trending
      await trendingNotificationService.initialize();
      
      // Initialiser le service de notifications planning
      await planningNotificationService.initialize();
      
      // Configurer les listeners de navigation
      trendingNotificationService.setupNotificationListeners(navigation);
      
      const settings = await notificationService.getSettings();
      setNotificationsEnabled(settings.enabled);

      const unreadCount = await notificationService.getUnreadCount();
      setUnreadNotifications(unreadCount);

      // Écouter les changements de notifications
      const unsubscribe = notificationService.addListener((notifications) => {
        const unread = notifications.filter(n => !n.read).length;
        setUnreadNotifications(unread);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
      return undefined;
    }
  };

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

  // Charger tout le contenu trending depuis l'API et détecter les nouveaux épisodes
  const loadTrendingAnimes = async () => {
    try {
      const response = await apiRequest('/api/trending');

      if (response && response.success && response.results) {
        const newContent = response.results.slice(0, 24);

        // Détecter les nouveaux épisodes avant de mettre à jour l'état
        await notificationService.detectNewEpisodes(newContent);
        
        // Vérifier nouvelles tendances et envoyer notifications si besoin
        await trendingNotificationService.checkForNewTrending(newContent);

        // Afficher tous les types de contenu de l'API : animes, mangas, films
        setTrendingAnimes(newContent);

        // Mettre à jour le compteur de notifications non lues
        const unreadCount = await notificationService.getUnreadCount();
        setUnreadNotifications(unreadCount);
      } else {
        setTrendingAnimes([]);
      }
    } catch (error) {
      setTrendingAnimes([]);
    }
  };

  // Charger le contenu populaire (classiques et pépites) depuis l'API
  const loadPopularAnimes = async () => {
    try {
      const response = await apiRequest('/api/popular');

      if (response && response.success && response.categories) {
        // Extraire les classiques et les pépites de la nouvelle structure API
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

  // Charger le planning des animes prévus depuis l'API
  const loadPlanningAnimes = async () => {
    try {
      const response = await animeAPI.getPlanning();

      if (response && response.success && response.data) {
        // Adapter les données du planning au format SearchResult
        const planningData = response.data.map((anime: any) => ({
          id: anime.animeId,
          url: anime.animeId,
          title: anime.title,
          image: anime.image,
          contentType: 'anime',
          language: { 
            vf: anime.language === 'VF',
            vostfr: anime.language === 'VOSTFR',
            vjstfr: anime.language === 'VJSTFR'
          },
          releaseTime: anime.releaseTime,
          isVFCrunchyroll: anime.isVFCrunchyroll,
          planningType: anime.type
        }));

        setPlanningAnimes(planningData.slice(0, 20)); // Limiter à 20 animes
        
        // Programmer les notifications planning si les notifications sont activées
        if (notificationsEnabled) {
          await planningNotificationService.schedulePlanningNotifications(planningData.slice(0, 15));
        }
      } else {
        setPlanningAnimes([]);
      }
    } catch (error) {
      console.error('Erreur chargement planning:', error);
      setPlanningAnimes([]);
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
        const results = response.results || [];
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
  const loadAnimeDetails = async (animeId: string, contentType?: string) => {
    console.log('🎯 loadAnimeDetails called with:', { animeId, contentType });
    
    // Vérifier que l'ID n'est pas vide
    if (!animeId || animeId === 'undefined') {
      console.error('❌ ID anime invalide:', animeId);
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
    
    console.log('🔄 ID nettoyé:', cleanId);
    
    // Détecter si c'est un manga pour rediriger vers le lecteur approprié
    if (contentType === 'manga') {
      navigation.navigate('MangaReader', { mangaUrl: cleanId, mangaTitle: 'Manga' });
    } else {
      navigation.navigate('AnimeDetail', { animeUrl: cleanId, animeTitle: 'Anime' });
    }
  };

  // 🚀 Nouvelle fonction pour naviguer directement vers l'épisode depuis les "Nouveaux épisodes"
  const loadEpisodeDirectly = async (anime: SearchResult) => {
    console.log('🎬 loadEpisodeDirectly called with:', anime);
    
    let cleanId = anime.animeId || anime.id || anime.url;
    if (!cleanId || cleanId === 'undefined') {
      console.error('❌ ID anime invalide:', cleanId);
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
            console.log('🎯 Saison extraite depuis ID:', { 
              animeId: anime.id, 
              extractedSeason: targetSeasonNumber 
            });
          }
        }
        
        // Fallback si toujours pas trouvé
        if (!targetSeasonNumber) {
          targetSeasonNumber = 1;
        }
        console.log('🔍 Recherche saison/saga:', { 
          targetSeasonNumber, 
          animeTitle: anime.title,
          availableSeasons: seasons.map((s: any) => ({ number: s.number, value: s.value, name: s.name })) 
        });
        
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
        
        // Log détaillé du matching
        if (matchingSeason) {
          console.log('✅ Saison/saga trouvée:', { 
            number: matchingSeason.number, 
            value: matchingSeason.value, 
            name: matchingSeason.name,
            targetWas: targetSeasonNumber
          });
        } else {
          console.log('❌ Aucune saison/saga correspondante trouvée pour:', targetSeasonNumber);
          // Log toutes les saisons disponibles pour debug
          seasons.forEach((s: any, index: number) => {
            console.log(`Option ${index + 1}:`, { number: s.number, value: s.value, name: s.name });
          });
        }
        
        // Si toujours pas trouvé, prendre la première saison disponible
        if (!matchingSeason && seasons.length > 0) {
          matchingSeason = seasons[0];
        }
        
        if (matchingSeason) {
          console.log('🎬 Navigation avec vraie saison API:', { 
            animeUrl: cleanId, 
            animeTitle: anime.title,
            seasonData: matchingSeason,
            currentEpisode: anime.currentEpisode,
            language: anime.language?.name,
            episodeInfo: anime.episodeInfo
          });

          // Naviguer avec les vraies données de saison de l'API
          navigation.navigate('AnimePlayer', { 
            animeUrl: cleanId, 
            animeTitle: anime.title,
            seasonData: matchingSeason,
            // 🔥 Paramètres additionnels pour navigation précise
            initialEpisode: anime.currentEpisode,
            initialLanguage: anime.language?.code?.toUpperCase() as 'VF' | 'VOSTFR' || 'VOSTFR'
          });
          return;
        }
      }
    } catch (apiError) {
      console.log('⚠️ Erreur API, utilisation fallback seasonData:', apiError);
    }

    // 🔄 Fallback : utiliser les données de base si l'API échoue
    const fallbackSeasonData = {
      number: anime.currentSeason || 1,
      name: `Saison ${anime.currentSeason || 1}`,
      value: `saison${anime.currentSeason || 1}`,
      languages: [anime.language?.name || "VOSTFR"],
      episodeCount: anime.currentEpisode || 12,
      url: cleanId,
      available: true
    };

    console.log('🎬 Navigation fallback avec données construites:', { 
      animeUrl: cleanId, 
      animeTitle: anime.title,
      seasonData: fallbackSeasonData,
      currentEpisode: anime.currentEpisode,
      language: anime.language?.name
    });

    // Naviguer avec les données de fallback
    navigation.navigate('AnimePlayer', { 
      animeUrl: cleanId, 
      animeTitle: anime.title,
      seasonData: fallbackSeasonData,
      initialEpisode: anime.currentEpisode,
      initialLanguage: anime.language?.code?.toUpperCase() as 'VF' | 'VOSTFR' || 'VOSTFR'
    });
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

  // Refresh control
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllInitialContent();
    
    // Reprogrammer les notifications planning après refresh si activées
    if (notificationsEnabled && planningAnimes.length > 0) {
      const planningData = planningAnimes.map(anime => ({
        id: anime.id,
        title: anime.title,
        releaseTime: anime.releaseTime || '',
        language: getLanguageBadge(anime.language),
        image: anime.image,
        animeId: anime.id,
        url: anime.url
      }));
      await planningNotificationService.schedulePlanningNotifications(planningData.slice(0, 15));
    }
    
    setRefreshing(false);
  };

  const handleSearchPress = () => {
    // Active l'affichage de la barre de recherche
    setShowSearchBar(true);
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  // Gérer l'activation/désactivation des notifications
  const handleNotificationPress = async () => {
    try {
      const currentSettings = await notificationService.getSettings();
      const newSettings = {
        ...currentSettings,
        enabled: !currentSettings.enabled
      };

      await notificationService.saveSettings(newSettings);
      setNotificationsEnabled(newSettings.enabled);

      if (newSettings.enabled) {
        // Marquer toutes les notifications comme lues quand on active
        await notificationService.markAllAsRead();
        setUnreadNotifications(0);
        
        // Reprogrammer les notifications planning
        if (planningAnimes.length > 0) {
          const planningData = planningAnimes.map(anime => ({
            id: anime.id,
            title: anime.title,
            releaseTime: anime.releaseTime || '',
            language: getLanguageBadge(anime.language),
            image: anime.image,
            animeId: anime.id,
            url: anime.url
          }));
          await planningNotificationService.schedulePlanningNotifications(planningData.slice(0, 15));
        }
      } else {
        // Annuler toutes les notifications planning si désactivées
        await planningNotificationService.cancelAllPlanningNotifications();
      }
    } catch (error) {
      console.error('Erreur gestion notifications:', error);
    }
  };

  // Vérifier périodiquement les nouveaux épisodes (toutes les 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (notificationsEnabled) {
        loadTrendingAnimes();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [notificationsEnabled]);

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
        onPress={() => loadAnimeDetails(anime.id, anime.contentType || anime.type)}
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
            colors={['transparent', 'rgba(0,0,0,0.95)']}
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
        key={`trending-${anime.id || index}`}
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
          colors={['transparent', 'rgba(0,0,0,0.8)']}
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />

      {/* Header fixe au-dessus du contenu */}
      <View style={styles.headerContainer}>
        <SharedHeader 
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
        />
      </View>

      <OptimizedScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00bcd4']}
            tintColor="#00bcd4"
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
                placeholderTextColor="#6b7280"
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
                {(classiquesAnimes.length > 0 ? classiquesAnimes : trendingAnimes).slice(0, 8).map((anime, index) => (
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
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)', '#000000']}
                style={styles.heroContent}
              >
                <Text style={styles.heroSubtitle}>
                  Plongez dans l'univers infini{'\n'}des animes et mangas !
                </Text>
                <Image 
                  source={require('../../assets/atomic-flix-logo-new.png')}
                  style={styles.heroLogo}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>

            {/* Section Animes Trending avec scroll horizontal */}
            {trendingAnimes.length > 0 && (
              <View style={styles.horizontalSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    📺 Nouveaux épisodes
                  </Text>
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
                  {trendingAnimes.map((anime, index) => renderTrendingAnimeCard(anime, index))}
                </OptimizedScrollView>
              </View>
            )}

            {/* Section Planning - 2ème position pour urgence temporelle */}
            {planningAnimes.length > 0 && (
              <View style={styles.horizontalSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🕐 Sorties cette semaine</Text>
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
                      key={`planning-${anime.id || anime.title.replace(/\s+/g, '-')}-${index}`}
                      style={styles.planningCard}
                      onPress={() => loadAnimeDetails(anime.id || anime.url, anime.contentType)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: anime.image }}
                        style={styles.horizontalCardImage}
                        resizeMode="cover"
                      />
                      {/* Badge SORTIE sur l'image */}
                      <View style={styles.releaseBadge}>
                        <Text style={styles.releaseBadgeText}>SORTIE</Text>
                      </View>
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={styles.horizontalCardGradient}
                      >
                        <View style={styles.planningCardContent}>
                          <Text style={styles.horizontalCardTitle} numberOfLines={2}>
                            {anime.title}
                          </Text>
                          <View style={styles.planningInfoRow}>
                            {anime.releaseTime && (
                              <View style={styles.planningTimeBadge}>
                                <Text style={styles.planningTimeText}>
                                  ⏰ {anime.releaseTime}
                                </Text>
                              </View>
                            )}
                            {anime.language && (
                              <View style={styles.horizontalCardBadge}>
                                <Text style={styles.horizontalCardBadgeText}>
                                  {getLanguageBadge(anime.language)}
                                </Text>
                              </View>
                            )}
                          </View>
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
                      onPress={() => loadAnimeDetails(anime.id || anime.url, anime.contentType)}
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
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
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
                      onPress={() => loadAnimeDetails(anime.id || anime.url, anime.contentType)}
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
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
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

            {/* Chargement initial unique */}
            {initialLoading && (
              <View style={styles.loadingContainer}>
                <LoadingSpinner 
                  message="Chargement de l'univers des animes..." 
                  size="large"
                  color="#00bcd4"
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
                    loadTrendingAnimes();
                  }}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Message vide si pas de contenu trending et pas de chargement */}
            {!initialLoading && !error && trendingAnimes.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun contenu trending trouvé</Text>
                <TouchableOpacity 
                  onPress={() => loadTrendingAnimes()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Charger le contenu trending</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </OptimizedScrollView>

      {/* Modal de vérification Telegram avec effet blur */}
      {showTelegramModal && (
        <View style={styles.telegramModalOverlay}>
          <BlurView intensity={50} style={styles.blurView}>
            <View style={styles.telegramModalContainer}>
              <TelegramVerification onVerified={handleTelegramVerified} />
            </View>
          </BlurView>
        </View>
      )}


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Violet principal du logo
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,188,212,0.2)',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchText: {
    color: '#6b7280',
    fontSize: 16,
  },

  // Hero Section
  heroSection: {
    height: 180,
    position: 'relative',
    marginBottom: 20,
    backgroundColor: COLORS.accent, // Rose du logo
    borderRadius: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fond léger pour le contraste
    borderWidth: 2,
    borderColor: 'rgba(0, 188, 212, 0.3)', // Bordure cyan subtile
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },


  // Section Trending
  trendingSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  trendingSectionHeader: {
    marginBottom: 16,
  },
  trendingSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  // Cards Anime optimisées pour les performances
  animeCard: {
    width: (width - 48) / 2,
    minHeight: 200, // minHeight au lieu de height fixe
    height: 'auto', // Hauteur automatique pour s'adapter au contenu
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    color: '#ffffff',
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
    color: '#ffffff',
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
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  languageText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '600',
  },

  // États
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#ef4444',
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
    color: '#ffffff',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6b7280',
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
    backgroundColor: COLORS.primary,
  },
  // Badge NOUVEAU pour les nouveaux épisodes
  newEpisodeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  newEpisodeBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  // Meta info pour les cartes horizontales
  horizontalCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  episodeInfoBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  episodeInfoText: {
    color: COLORS.secondary,
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
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 14,
  },
  horizontalCardBadge: {
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
    borderWidth: 1,
    borderColor: '#00bcd4',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  horizontalCardBadgeText: {
    color: '#00bcd4',
    fontSize: 8,
    fontWeight: '600',
  },

  // Styles pour les badges de contenu des cartes trending
  trendingContentBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendingBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Styles pour la section Planning
  planningCard: {
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
    borderColor: 'rgba(255, 193, 7, 0.3)', // Bordure dorée pour différencier du planning
  },
  planningCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  planningInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  planningTimeBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderWidth: 1,
    borderColor: '#ffc107',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
  },
  planningTimeText: {
    color: '#ffc107',
    fontSize: 8,
    fontWeight: '600',
  },

  // Styles pour les cartes spécialisées
  legendaryCard: {
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
    borderColor: 'rgba(255, 215, 0, 0.4)', // Bordure dorée pour légendaires
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
    color: '#000000',
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
    color: '#000000',
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
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },

});

export default HomeScreen;