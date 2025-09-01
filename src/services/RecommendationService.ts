import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewingHistoryService, { ViewingHistoryItem } from './ViewingHistoryService';
import { SearchResult } from '../types';

export interface RecommendationItem extends SearchResult {
  recommendationReason: string;
  recommendationScore: number; // 0-100
  basedOn?: string; // Ce qui a influencé cette recommandation
}

class RecommendationService {
  private static instance: RecommendationService;
  private readonly CACHE_KEY = '@atomic_flix_recommendations_cache';
  private readonly CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 heures

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  // Générer des recommandations intelligentes basées sur l'historique
  async generateRecommendations(
    trendingData: SearchResult[] = [],
    popularData: SearchResult[] = [],
    planningData: SearchResult[] = []
  ): Promise<RecommendationItem[]> {
    try {
      // Vérifier le cache d'abord
      const cached = await this.getCachedRecommendations();
      if (cached.length > 0) {
        return cached;
      }

      const historyService = ViewingHistoryService.getInstance();
      const userHistory = await historyService.getRecentHistory(50);
      
      if (userHistory.length === 0) {
        // Pas d'historique : recommandations basées sur le contenu populaire
        return this.getNewUserRecommendations(trendingData, popularData);
      }

      // Analyser les préférences utilisateur
      const userPreferences = this.analyzeUserPreferences(userHistory);
      
      // Générer des recommandations basées sur différents algorithmes
      const recommendations: RecommendationItem[] = [];

      // 1. Basé sur les animes similaires (même genre/style)
      const similarAnimes = await this.findSimilarAnimes(userHistory, trendingData, popularData);
      recommendations.push(...similarAnimes);

      // 2. Basé sur les tendances actuelles filtrées
      const filteredTrending = this.filterTrendingByPreferences(trendingData, userPreferences);
      recommendations.push(...filteredTrending);

      // 3. Basé sur les sorties de la semaine qui correspondent aux goûts
      const relevantPlanning = this.filterPlanningByPreferences(planningData, userPreferences);
      recommendations.push(...relevantPlanning);

      // 4. Découvertes : contenu populaire non encore vu
      const discoveries = await this.findNewDiscoveries(popularData, userHistory);
      recommendations.push(...discoveries);

      // Trier par score et retourner les 20 meilleures
      const sortedRecommendations = recommendations
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 20);

      // Mettre en cache
      await this.cacheRecommendations(sortedRecommendations);

      return sortedRecommendations;

    } catch (error) {
      return this.getNewUserRecommendations(trendingData, popularData);
    }
  }

  // Analyser les préférences de l'utilisateur basées sur son historique
  private analyzeUserPreferences(history: ViewingHistoryItem[]): UserPreferences {
    const preferences: UserPreferences = {
      favoriteContentTypes: {},
      watchingTimes: [],
      recentGenres: [],
      languagePreferences: {},
      activityLevel: 'normal'
    };

    // Analyser les types de contenu favoris
    history.forEach(item => {
      const type = item.contentType || 'ANIME';
      preferences.favoriteContentTypes[type] = (preferences.favoriteContentTypes[type] || 0) + 1;
    });

    // Analyser l'activité récente (7 derniers jours)
    const recentActivity = history.filter(item => {
      const itemDate = new Date(item.lastWatchedDate);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return itemDate > weekAgo;
    });

    if (recentActivity.length > 10) {
      preferences.activityLevel = 'high';
    } else if (recentActivity.length < 3) {
      preferences.activityLevel = 'low';
    }

    return preferences;
  }

  // Trouver des animes similaires basés sur l'historique
  private async findSimilarAnimes(
    history: ViewingHistoryItem[],
    trending: SearchResult[],
    popular: SearchResult[]
  ): Promise<RecommendationItem[]> {
    const recommendations: RecommendationItem[] = [];
    const watchedIds = new Set(history.map(h => h.animeId));

    // Récupérer les derniers animes regardés pour les utiliser comme base
    const recentWatched = history.slice(0, 10);

    [...trending, ...popular].forEach(anime => {
      if (watchedIds.has(anime.id)) return; // Déjà vu

      let score = 30; // Score de base
      let reason = "Similaire à vos goûts";
      let basedOn = "";

      // Analyser la similarité avec les animes récemment regardés
      recentWatched.forEach(watched => {
        // Similarité de titre (mots-clés communs)
        if (this.hasSimilarKeywords(anime.title, watched.animeTitle)) {
          score += 20;
          reason = "Similaire à " + watched.animeTitle;
          basedOn = watched.animeTitle;
        }

        // Bonus si même type de contenu
        if (anime.contentType === watched.contentType) {
          score += 10;
        }
      });

      if (score > 40) {
        recommendations.push({
          ...anime,
          recommendationReason: reason,
          recommendationScore: Math.min(score, 95),
          basedOn
        });
      }
    });

    return recommendations.slice(0, 8);
  }

  // Filtrer les tendances selon les préférences utilisateur
  private filterTrendingByPreferences(
    trending: SearchResult[],
    preferences: UserPreferences
  ): RecommendationItem[] {
    const recommendations: RecommendationItem[] = [];

    trending.forEach(anime => {
      let score = 40;
      const reason = "Tendance populaire en ce moment";

      // Bonus si c'est le type de contenu favori
      const favoriteType = Object.keys(preferences.favoriteContentTypes)[0];
      if (anime.contentType === favoriteType) {
        score += 25;
      }

      // Bonus pour le contenu récent/nouveau
      if (anime.episodeInfo && anime.episodeInfo.includes('Nouvel')) {
        score += 15;
      }

      recommendations.push({
        ...anime,
        recommendationReason: reason,
        recommendationScore: score,
        basedOn: "Tendances actuelles"
      });
    });

    return recommendations.slice(0, 6);
  }

  // Filtrer le planning selon les préférences
  private filterPlanningByPreferences(
    planning: SearchResult[],
    preferences: UserPreferences
  ): RecommendationItem[] {
    const recommendations: RecommendationItem[] = [];

    planning.forEach(anime => {
      let score = 35;
      const reason = "Nouvelle sortie cette semaine";

      // Bonus pour les sorties du jour
      const today = new Date().getDay();
      if (anime.releaseTime) {
        score += 20;
      }

      recommendations.push({
        ...anime,
        recommendationReason: reason,
        recommendationScore: score,
        basedOn: "Planning de la semaine"
      });
    });

    return recommendations.slice(0, 5);
  }

  // Trouver de nouvelles découvertes
  private findNewDiscoveries(
    popular: SearchResult[],
    history: ViewingHistoryItem[]
  ): Promise<RecommendationItem[]> {
    const watchedIds = new Set(history.map(h => h.animeId));
    const discoveries: RecommendationItem[] = [];

    popular.forEach(anime => {
      if (!watchedIds.has(anime.id)) {
        discoveries.push({
          ...anime,
          recommendationReason: "Découverte populaire",
          recommendationScore: 45,
          basedOn: "Contenu populaire non vu"
        });
      }
    });

    return Promise.resolve(discoveries.slice(0, 6));
  }

  // Recommandations pour nouveaux utilisateurs
  private getNewUserRecommendations(
    trending: SearchResult[],
    popular: SearchResult[]
  ): RecommendationItem[] {
    const recommendations: RecommendationItem[] = [];

    // Ajouter le top trending
    trending.slice(0, 8).forEach(anime => {
      recommendations.push({
        ...anime,
        recommendationReason: "Populaire en ce moment",
        recommendationScore: 60,
        basedOn: "Tendances générales"
      });
    });

    // Ajouter quelques classiques
    popular.slice(0, 6).forEach(anime => {
      recommendations.push({
        ...anime,
        recommendationReason: "Incontournable à découvrir",
        recommendationScore: 55,
        basedOn: "Sélection populaire"
      });
    });

    return recommendations.slice(0, 15);
  }

  // Utilitaires
  private hasSimilarKeywords(title1: string, title2: string): boolean {
    const words1 = title1.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const words2 = title2.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    return words1.some(word => words2.includes(word));
  }

  // Cache management
  private async getCachedRecommendations(): Promise<RecommendationItem[]> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return [];

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp < this.CACHE_DURATION) {
        return data;
      }
      return [];
    } catch {
      return [];
    }
  }

  private async cacheRecommendations(recommendations: RecommendationItem[]): Promise<void> {
    try {
      const cacheData = {
        data: recommendations,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
    }
  }

  // Vider le cache (par exemple après un nouveau visionnage)
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
    }
  }

  // Obtenir des statistiques de recommandations
  async getRecommendationStats(): Promise<{
    totalGenerated: number;
    cacheHitRate: number;
    userActivityLevel: string;
  }> {
    const historyService = ViewingHistoryService.getInstance();
    const history = await historyService.getRecentHistory(20);
    const preferences = this.analyzeUserPreferences(history);

    return {
      totalGenerated: history.length > 0 ? 20 : 15,
      cacheHitRate: 0.8, // Estimation
      userActivityLevel: preferences.activityLevel
    };
  }
}

interface UserPreferences {
  favoriteContentTypes: Record<string, number>;
  watchingTimes: string[];
  recentGenres: string[];
  languagePreferences: Record<string, number>;
  activityLevel: 'low' | 'normal' | 'high';
}

export default RecommendationService;