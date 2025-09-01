import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ViewingHistoryItem {
  animeId: string;
  animeTitle: string;
  animeImage: string;
  lastWatchedDate: string;
  season?: string;
  episode?: string;
  episodeTitle?: string;
  progress?: number; // Pourcentage de visionnage
  contentType?: 'ANIME' | 'MANGA' | 'FILM';
}

class ViewingHistoryService {
  private static instance: ViewingHistoryService;
  private readonly HISTORY_KEY = '@atomic_flix_viewing_history';
  private readonly MAX_HISTORY_ITEMS = 100; // Limite pour éviter surcharge

  static getInstance(): ViewingHistoryService {
    if (!ViewingHistoryService.instance) {
      ViewingHistoryService.instance = new ViewingHistoryService();
    }
    return ViewingHistoryService.instance;
  }

  // Ajouter un anime à l'historique
  async addToHistory(item: Omit<ViewingHistoryItem, 'lastWatchedDate'>): Promise<void> {
    try {
      const history = await this.getHistory();
      
      // Créer l'entrée avec la date actuelle
      const historyItem: ViewingHistoryItem = {
        ...item,
        lastWatchedDate: new Date().toISOString()
      };

      // Supprimer l'entrée existante si elle existe (pour la remettre en haut)
      const filteredHistory = history.filter(h => h.animeId !== item.animeId);
      
      // Ajouter en début de liste
      const updatedHistory = [historyItem, ...filteredHistory];
      
      // Limiter le nombre d'éléments
      const trimmedHistory = updatedHistory.slice(0, this.MAX_HISTORY_ITEMS);
      
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmedHistory));
      
      // Vider le cache des recommandations pour forcer une mise à jour
      try {
        const RecommendationService = await import('./RecommendationService');
        const recommendationService = RecommendationService.default.getInstance();
        await recommendationService.clearCache();
      } catch (error) {
      }
      
    } catch (error) {
    }
  }

  // Récupérer l'historique complet
  async getHistory(): Promise<ViewingHistoryItem[]> {
    try {
      const historyJson = await AsyncStorage.getItem(this.HISTORY_KEY);
      if (!historyJson) return [];
      
      const history: ViewingHistoryItem[] = JSON.parse(historyJson);
      
      // Trier par date (plus récent en premier)
      return history.sort((a, b) => 
        new Date(b.lastWatchedDate).getTime() - new Date(a.lastWatchedDate).getTime()
      );
    } catch (error) {
      return [];
    }
  }

  // Récupérer les derniers animes regardés (pour la section Historique du HomeScreen)
  async getRecentHistory(limit: number = 20): Promise<ViewingHistoryItem[]> {
    const history = await this.getHistory();
    return history.slice(0, limit);
  }

  // Supprimer un anime de l'historique
  async removeFromHistory(animeId: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filteredHistory = history.filter(item => item.animeId !== animeId);
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
    }
  }

  // Vider tout l'historique
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.HISTORY_KEY);
    } catch (error) {
    }
  }

  // Mettre à jour le progrès de visionnage
  async updateProgress(animeId: string, progress: number, episode?: string, episodeTitle?: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const itemIndex = history.findIndex(item => item.animeId === animeId);
      
      if (itemIndex !== -1) {
        history[itemIndex] = {
          ...history[itemIndex],
          progress,
          episode,
          episodeTitle,
          lastWatchedDate: new Date().toISOString()
        };
        
        // Remettre l'item en première position
        const updatedItem = history.splice(itemIndex, 1)[0];
        history.unshift(updatedItem);
        
        await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
    }
  }

  // Vérifier si un anime est dans l'historique
  async isInHistory(animeId: string): Promise<boolean> {
    const history = await this.getHistory();
    return history.some(item => item.animeId === animeId);
  }

  // Obtenir les statistiques d'historique
  async getHistoryStats(): Promise<{
    totalAnimes: number;
    totalEpisodes: number;
    favoriteContentType: string;
    firstWatchDate?: string;
  }> {
    try {
      const history = await this.getHistory();
      
      const stats = {
        totalAnimes: history.length,
        totalEpisodes: history.filter(item => item.episode).length,
        favoriteContentType: this.getMostWatchedContentType(history),
        firstWatchDate: history.length > 0 ? history[history.length - 1].lastWatchedDate : undefined
      };
      
      return stats;
    } catch (error) {
      return {
        totalAnimes: 0,
        totalEpisodes: 0,
        favoriteContentType: 'ANIME'
      };
    }
  }

  private getMostWatchedContentType(history: ViewingHistoryItem[]): string {
    const contentTypeCounts = history.reduce((counts, item) => {
      const type = item.contentType || 'ANIME';
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    return Object.entries(contentTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'ANIME';
  }
}

export default ViewingHistoryService;