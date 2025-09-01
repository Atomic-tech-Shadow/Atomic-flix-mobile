import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface pour un élément d'historique intelligent
export interface SmartHistoryItem {
  id: string;
  animeId: string;
  animeTitle: string;
  animeImage: string;
  animeUrl: string;
  
  // Métadonnées de visionnage
  firstWatchDate: string;
  lastWatchDate: string;
  totalWatchTime: number; // en minutes
  watchCount: number;
  
  // Informations sur le contenu
  seasons: WatchedSeason[];
  contentType: 'ANIME' | 'MANGA' | 'FILM';
  genres: string[];
  year?: number;
  rating?: number;
  
  // Engagement utilisateur
  isFavorite: boolean;
  userRating?: number; // 1-5 étoiles
  watchStatus: 'WATCHING' | 'COMPLETED' | 'DROPPED' | 'PLAN_TO_WATCH';
  
  // Données comportementales
  averageSessionTime: number; // temps moyen par session
  preferredLanguage: 'VF' | 'VOSTFR';
  skipIntroCount: number;
  rewatchCount: number;
  
  // Métadonnées techniques
  deviceType: 'mobile' | 'tablet' | 'web';
  lastPlayerPosition?: number; // position où l'utilisateur s'est arrêté
}

export interface WatchedSeason {
  seasonName: string;
  episodesWatched: WatchedEpisode[];
  completionRate: number; // pourcentage de la saison regardée
  lastEpisodeWatched?: string;
}

export interface WatchedEpisode {
  episodeNumber: number;
  episodeTitle: string;
  watchDate: string;
  watchDuration: number; // durée regardée en minutes
  completed: boolean;
  playerPosition: number; // position d'arrêt dans l'épisode
}

// Interface pour les statistiques d'historique
export interface HistoryStats {
  totalAnimes: number;
  totalEpisodes: number;
  totalWatchTime: number; // en heures
  averageRating: number;
  favoriteGenres: string[];
  watchingStreak: number; // jours consécutifs de visionnage
  mostWatchedAnime: SmartHistoryItem | null;
  recentActivity: ActivitySummary[];
}

export interface ActivitySummary {
  date: string;
  episodesWatched: number;
  timeSpent: number; // en minutes
  animesDiscovered: number;
}

// Interface pour les recommandations intelligentes
export interface SmartRecommendation {
  animeId: string;
  animeTitle: string;
  animeImage: string;
  animeUrl: string;
  recommendationScore: number; // 0-100
  reasonType: 'SIMILAR_GENRE' | 'SAME_STUDIO' | 'TRENDING' | 'COLLABORATIVE' | 'SEQUEL';
  reason: string;
  confidence: number; // 0-100
}

class SmartHistoryService {
  private static instance: SmartHistoryService;
  private readonly HISTORY_KEY = '@atomic_flix_smart_history';
  private readonly STATS_KEY = '@atomic_flix_history_stats';
  private readonly PREFERENCES_KEY = '@atomic_flix_user_preferences';
  private readonly MAX_HISTORY_ITEMS = 500;

  static getInstance(): SmartHistoryService {
    if (!SmartHistoryService.instance) {
      SmartHistoryService.instance = new SmartHistoryService();
    }
    return SmartHistoryService.instance;
  }

  // Ajouter ou mettre à jour un anime dans l'historique intelligent
  async addToHistory(data: {
    animeId: string;
    animeTitle: string;
    animeImage: string;
    animeUrl: string;
    season?: string;
    episode?: string;
    episodeTitle?: string;
    contentType?: 'ANIME' | 'MANGA' | 'FILM';
    genres?: string[];
    watchDuration?: number;
    playerPosition?: number;
    language?: 'VF' | 'VOSTFR';
  }): Promise<void> {
    try {
      const history = await this.getHistory();
      const existingIndex = history.findIndex(item => item.animeId === data.animeId);
      const now = new Date().toISOString();

      if (existingIndex !== -1) {
        // Mettre à jour l'anime existant
        const existing = history[existingIndex];
        existing.lastWatchDate = now;
        existing.watchCount += 1;
        existing.totalWatchTime += data.watchDuration || 0;
        
        if (data.language) {
          existing.preferredLanguage = data.language;
        }

        // Ajouter l'épisode s'il est spécifié
        if (data.season && data.episode) {
          this.updateSeasonEpisode(existing, data.season, data.episode, data.episodeTitle || '', data.watchDuration || 0, data.playerPosition || 0);
        }

        // Recalculer la session moyenne
        existing.averageSessionTime = existing.totalWatchTime / existing.watchCount;
        
        // Remettre en première position
        history.splice(existingIndex, 1);
        history.unshift(existing);
      } else {
        // Créer un nouvel élément d'historique
        const newItem: SmartHistoryItem = {
          id: `${data.animeId}_${Date.now()}`,
          animeId: data.animeId,
          animeTitle: data.animeTitle,
          animeImage: data.animeImage,
          animeUrl: data.animeUrl,
          firstWatchDate: now,
          lastWatchDate: now,
          totalWatchTime: data.watchDuration || 0,
          watchCount: 1,
          seasons: data.season ? [{
            seasonName: data.season,
            episodesWatched: data.episode ? [{
              episodeNumber: parseInt(data.episode.replace(/\D/g, '')) || 1,
              episodeTitle: data.episodeTitle || '',
              watchDate: now,
              watchDuration: data.watchDuration || 0,
              completed: (data.watchDuration || 0) > 20, // Considéré comme regardé si >20min
              playerPosition: data.playerPosition || 0
            }] : [],
            completionRate: 0,
            lastEpisodeWatched: data.episode
          }] : [],
          contentType: data.contentType || 'ANIME',
          genres: data.genres || [],
          isFavorite: false,
          watchStatus: 'WATCHING',
          averageSessionTime: data.watchDuration || 0,
          preferredLanguage: data.language || 'VOSTFR',
          skipIntroCount: 0,
          rewatchCount: 0,
          deviceType: 'mobile' // Détection automatique possible
        };

        history.unshift(newItem);
      }

      // Limiter la taille de l'historique
      const trimmedHistory = history.slice(0, this.MAX_HISTORY_ITEMS);
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmedHistory));
      
      // Mettre à jour les statistiques
      await this.updateStats();
      
    } catch (error) {
      console.error('Erreur ajout historique intelligent:', error);
    }
  }

  // Mettre à jour les informations d'épisode pour une saison
  private updateSeasonEpisode(
    item: SmartHistoryItem,
    seasonName: string,
    episode: string,
    episodeTitle: string,
    watchDuration: number,
    playerPosition: number
  ): void {
    const episodeNumber = parseInt(episode.replace(/\D/g, '')) || 1;
    let season = item.seasons.find(s => s.seasonName === seasonName);
    
    if (!season) {
      season = {
        seasonName,
        episodesWatched: [],
        completionRate: 0,
        lastEpisodeWatched: episode
      };
      item.seasons.push(season);
    }

    const existingEpisode = season.episodesWatched.find(e => e.episodeNumber === episodeNumber);
    
    if (existingEpisode) {
      existingEpisode.watchDate = new Date().toISOString();
      existingEpisode.watchDuration += watchDuration;
      existingEpisode.playerPosition = playerPosition;
      existingEpisode.completed = existingEpisode.watchDuration > 20;
    } else {
      season.episodesWatched.push({
        episodeNumber,
        episodeTitle,
        watchDate: new Date().toISOString(),
        watchDuration,
        completed: watchDuration > 20,
        playerPosition
      });
    }

    season.lastEpisodeWatched = episode;
    // Estimer le taux de complétion (approximatif)
    season.completionRate = Math.min(100, (season.episodesWatched.length / 12) * 100); // Estimation basée sur 12 épisodes par saison
  }

  // Récupérer l'historique complet
  async getHistory(): Promise<SmartHistoryItem[]> {
    try {
      const historyJson = await AsyncStorage.getItem(this.HISTORY_KEY);
      if (!historyJson) return [];
      
      const history: SmartHistoryItem[] = JSON.parse(historyJson);
      return history.sort((a, b) => 
        new Date(b.lastWatchDate).getTime() - new Date(a.lastWatchDate).getTime()
      );
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  }

  // Récupérer l'historique récent pour la section historique
  async getRecentHistory(limit: number = 10): Promise<SmartHistoryItem[]> {
    const history = await this.getHistory();
    return history.slice(0, limit);
  }

  // Récupérer les animes en cours de visionnage
  async getCurrentlyWatching(): Promise<SmartHistoryItem[]> {
    const history = await this.getHistory();
    return history.filter(item => item.watchStatus === 'WATCHING').slice(0, 8);
  }

  // Récupérer les favoris
  async getFavorites(): Promise<SmartHistoryItem[]> {
    const history = await this.getHistory();
    return history.filter(item => item.isFavorite);
  }

  // Marquer/démarquer comme favori
  async toggleFavorite(animeId: string): Promise<boolean> {
    try {
      const history = await this.getHistory();
      const item = history.find(h => h.animeId === animeId);
      
      if (item) {
        item.isFavorite = !item.isFavorite;
        await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
        return item.isFavorite;
      }
      return false;
    } catch (error) {
      console.error('Erreur toggle favori:', error);
      return false;
    }
  }

  // Mettre à jour le statut de visionnage
  async updateWatchStatus(animeId: string, status: SmartHistoryItem['watchStatus']): Promise<void> {
    try {
      const history = await this.getHistory();
      const item = history.find(h => h.animeId === animeId);
      
      if (item) {
        item.watchStatus = status;
        await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  }

  // Noter un anime
  async rateAnime(animeId: string, rating: number): Promise<void> {
    try {
      const history = await this.getHistory();
      const item = history.find(h => h.animeId === animeId);
      
      if (item) {
        item.userRating = Math.max(1, Math.min(5, rating));
        await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
        await this.updateStats();
      }
    } catch (error) {
      console.error('Erreur notation anime:', error);
    }
  }

  // Obtenir les statistiques détaillées
  async getDetailedStats(): Promise<HistoryStats> {
    try {
      const history = await this.getHistory();
      const totalEpisodes = history.reduce((sum, item) => 
        sum + item.seasons.reduce((seasonSum, season) => seasonSum + season.episodesWatched.length, 0), 0
      );
      
      const totalWatchTime = history.reduce((sum, item) => sum + item.totalWatchTime, 0);
      const ratingsSum = history.filter(item => item.userRating).reduce((sum, item) => sum + (item.userRating || 0), 0);
      const ratingsCount = history.filter(item => item.userRating).length;
      
      // Analyser les genres favoris
      const genreCount: Record<string, number> = {};
      history.forEach(item => {
        item.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      });
      
      const favoriteGenres = Object.entries(genreCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genre]) => genre);

      return {
        totalAnimes: history.length,
        totalEpisodes,
        totalWatchTime: totalWatchTime / 60, // Convertir en heures
        averageRating: ratingsCount > 0 ? ratingsSum / ratingsCount : 0,
        favoriteGenres,
        watchingStreak: await this.calculateWatchingStreak(),
        mostWatchedAnime: history.reduce((max, item) => 
          item.totalWatchTime > (max?.totalWatchTime || 0) ? item : max, null as SmartHistoryItem | null
        ),
        recentActivity: await this.getRecentActivity()
      };
    } catch (error) {
      console.error('Erreur stats détaillées:', error);
      return {
        totalAnimes: 0,
        totalEpisodes: 0,
        totalWatchTime: 0,
        averageRating: 0,
        favoriteGenres: [],
        watchingStreak: 0,
        mostWatchedAnime: null,
        recentActivity: []
      };
    }
  }

  // Calculer la série de visionnage (jours consécutifs)
  private async calculateWatchingStreak(): Promise<number> {
    try {
      const history = await this.getHistory();
      const watchDates = [...new Set(history.map(item => 
        new Date(item.lastWatchDate).toDateString()
      ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      // Commencer le calcul depuis aujourd'hui ou hier
      const startDate = watchDates[0] === today ? today : (watchDates[0] === yesterday ? yesterday : null);
      
      if (!startDate) return 0;

      let currentDate = new Date(startDate);
      for (const watchDate of watchDates) {
        if (watchDate === currentDate.toDateString()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      return 0;
    }
  }

  // Obtenir l'activité récente
  private async getRecentActivity(): Promise<ActivitySummary[]> {
    try {
      const history = await this.getHistory();
      const activityMap: Record<string, ActivitySummary> = {};

      history.forEach(item => {
        item.seasons.forEach(season => {
          season.episodesWatched.forEach(episode => {
            const date = new Date(episode.watchDate).toDateString();
            if (!activityMap[date]) {
              activityMap[date] = {
                date,
                episodesWatched: 0,
                timeSpent: 0,
                animesDiscovered: 0
              };
            }
            activityMap[date].episodesWatched++;
            activityMap[date].timeSpent += episode.watchDuration;
          });
        });

        // Compter les nouvelles découvertes
        const firstWatchDate = new Date(item.firstWatchDate).toDateString();
        if (activityMap[firstWatchDate]) {
          activityMap[firstWatchDate].animesDiscovered++;
        }
      });

      return Object.values(activityMap)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30); // 30 derniers jours
    } catch (error) {
      return [];
    }
  }

  // Mettre à jour les statistiques (cache)
  private async updateStats(): Promise<void> {
    try {
      const stats = await this.getDetailedStats();
      await AsyncStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Erreur mise à jour stats:', error);
    }
  }

  // Générer des recommandations intelligentes
  async getSmartRecommendations(limit: number = 10): Promise<SmartRecommendation[]> {
    try {
      const history = await this.getHistory();
      const favoriteGenres = await this.getFavoriteGenres();
      
      // Pour cette implémentation simplifiée, on retourne des recommandations basiques
      // Dans une vraie implémentation, on ferait appel à une API de recommandations
      return [];
    } catch (error) {
      console.error('Erreur recommandations:', error);
      return [];
    }
  }

  // Obtenir les genres préférés
  private async getFavoriteGenres(): Promise<string[]> {
    const stats = await this.getDetailedStats();
    return stats.favoriteGenres;
  }

  // Nettoyer l'historique ancien
  async cleanOldHistory(daysToKeep: number = 365): Promise<void> {
    try {
      const history = await this.getHistory();
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const filteredHistory = history.filter(item => 
        new Date(item.lastWatchDate) > cutoffDate || item.isFavorite
      );
      
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Erreur nettoyage historique:', error);
    }
  }

  // Exporter l'historique
  async exportHistory(): Promise<string> {
    try {
      const history = await this.getHistory();
      const stats = await this.getDetailedStats();
      
      return JSON.stringify({
        exportDate: new Date().toISOString(),
        version: '2.0',
        history,
        stats
      }, null, 2);
    } catch (error) {
      console.error('Erreur export historique:', error);
      return '';
    }
  }

  // Supprimer complètement l'historique
  async clearAllHistory(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.HISTORY_KEY, this.STATS_KEY]);
    } catch (error) {
      console.error('Erreur suppression historique:', error);
    }
  }
}

export default SmartHistoryService;