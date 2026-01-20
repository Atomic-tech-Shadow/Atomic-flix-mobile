import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WatchHistoryItem {
  id: string;
  userId?: string;
  animeId: string;
  animeTitle: string;
  animeImage?: string;
  episodeNumber: number;
  episodeTitle?: string;
  language: string;
  watchedAt: Date;
  watchDuration: number; // secondes regardées
  totalDuration: number; // durée totale de l'épisode
  isCompleted: boolean;
  lastPosition: number; // position de lecture en secondes
  seasonName?: string; // "Saga 11" ou "Saison 1"
  seasonNumber?: number; // 11 pour Saga 11
}

class HistoryService {
  private readonly STORAGE_KEY = '@atomic_flix_watch_history';

  // Génère un ID unique pour l'historique
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Extrait l'information de saison/saga depuis l'animeId
  extractSeasonInfo(animeId: string): { seasonName: string; seasonNumber: number } {
    // Essayer d'extraire depuis l'ID : "one-piece-saga11-vostfr" -> 11
    const sagaMatch = animeId.match(/saga[-_ ]?(\d+)/i);
    if (sagaMatch) {
      const number = parseInt(sagaMatch[1], 10);
      return {
        seasonName: `Saga ${number}`,
        seasonNumber: number
      };
    }

    // Essayer d'extraire depuis l'ID : "anime-saison3-vf" -> 3
    const saisonMatch = animeId.match(/saison[-_ ]?(\d+)/i);
    if (saisonMatch) {
      const number = parseInt(saisonMatch[1], 10);
      return {
        seasonName: `Saison ${number}`,
        seasonNumber: number
      };
    }

    // Gestion des OAV
    if (animeId.toLowerCase().includes('oav')) {
      return {
        seasonName: 'OAV',
        seasonNumber: 0
      };
    }

    // Gestion des Films
    if (animeId.toLowerCase().includes('film')) {
      return {
        seasonName: 'Film',
        seasonNumber: -1
      };
    }

    // Fallback par défaut
    return {
      seasonName: 'Saison 1',
      seasonNumber: 1
    };
  }

  // Sauvegarder un épisode regardé dans l'historique
  async saveWatchHistory(item: Omit<WatchHistoryItem, 'id' | 'watchedAt'>): Promise<void> {
    try {
      const existingHistory = await this.getWatchHistory();
      
    // Vérifie si cet épisode existe déjà dans l'historique
    const existingIndex = existingHistory.findIndex(
      h => h.animeId === item.animeId && 
           h.episodeNumber === item.episodeNumber && 
           h.language === item.language &&
           (h.seasonNumber === item.seasonNumber || (!h.seasonNumber && !item.seasonNumber))
    );

      const historyItem: WatchHistoryItem = {
        ...item,
        id: this.generateId(),
        watchedAt: new Date(),
      };

      if (existingIndex >= 0) {
        // Mettre à jour l'épisode existant
        existingHistory[existingIndex] = {
          ...existingHistory[existingIndex],
          ...historyItem,
          id: existingHistory[existingIndex].id, // Garder l'ID original
        };
      } else {
        // Ajouter au début de la liste (plus récent en premier)
        existingHistory.unshift(historyItem);
      }

      // Limiter à 50 épisodes max pour éviter de surcharger le stockage
      const limitedHistory = existingHistory.slice(0, 50);

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedHistory));
      console.log('📺 Historique sauvegardé:', item.animeTitle, item.seasonName || 'Saison ?', 'Ep.', item.episodeNumber, item.language);
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error);
    }
  }

  // Récupérer tout l'historique de visionnage
  async getWatchHistory(): Promise<WatchHistoryItem[]> {
    try {
      const historyData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!historyData) return [];

      const history: WatchHistoryItem[] = JSON.parse(historyData);
      let needsUpdate = false;
      
      // Convertir les dates string en objets Date et backfill des informations de saison manquantes
      const enrichedHistory = history.map(item => {
        const enrichedItem = {
          ...item,
          watchedAt: new Date(item.watchedAt),
        };

        // Si les informations de saison manquent, les extraire de l'animeId
        if (!enrichedItem.seasonName || !enrichedItem.seasonNumber) {
          const seasonInfo = this.extractSeasonInfo(enrichedItem.animeId);
          enrichedItem.seasonName = seasonInfo.seasonName;
          enrichedItem.seasonNumber = seasonInfo.seasonNumber;
          needsUpdate = true;
        }

        return enrichedItem;
      });

      // Sauvegarder les changements si on a enrichi des éléments
      if (needsUpdate) {
        try {
          await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(enrichedHistory));
          console.log('📺 Historique enrichi avec informations de saison/saga');
        } catch (error) {
          console.warn('Erreur sauvegarde historique enrichi:', error);
        }
      }
      
      return enrichedHistory;
    } catch (error) {
      console.error('Erreur lecture historique:', error);
      return [];
    }
  }

  // Récupérer les épisodes en cours (non terminés, regardés récemment)
  async getCurrentlyWatching(): Promise<WatchHistoryItem[]> {
    try {
      const allHistory = await this.getWatchHistory();
      
      // Filtrer les épisodes non terminés et les grouper par anime
      const currentlyWatching = new Map<string, WatchHistoryItem>();
      
      allHistory.forEach(item => {
        if (!item.isCompleted) {
          const key = `${item.animeId}_${item.language}`;
          const existing = currentlyWatching.get(key);
          
          // Garder l'épisode le plus récemment regardé pour chaque anime/langue
          if (!existing || new Date(item.watchedAt) > new Date(existing.watchedAt)) {
            currentlyWatching.set(key, item);
          }
        }
      });
      
      // Retourner triés par date de visionnage (plus récent en premier)
      return Array.from(currentlyWatching.values())
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
        .slice(0, 10); // Max 10 animes en cours
    } catch (error) {
      console.error('Erreur récupération en cours:', error);
      return [];
    }
  }

  // Marquer un épisode comme terminé
  async markEpisodeCompleted(animeId: string, episodeNumber: number, language: 'VF' | 'VOSTFR'): Promise<void> {
    try {
      const history = await this.getWatchHistory();
      const index = history.findIndex(
        h => h.animeId === animeId && h.episodeNumber === episodeNumber && h.language === language
      );

      if (index >= 0) {
        history[index].isCompleted = true;
        history[index].lastPosition = history[index].totalDuration;
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
        console.log('✅ Épisode marqué terminé:', animeId, 'Ep.', episodeNumber);
      }
    } catch (error) {
      console.error('Erreur marquage terminé:', error);
    }
  }

  // Supprimer un élément de l'historique
  async removeFromHistory(id: string): Promise<void> {
    try {
      const history = await this.getWatchHistory();
      const filteredHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
      console.log('🗑️ Élément supprimé de l\'historique:', id);
    } catch (error) {
      console.error('Erreur suppression historique:', error);
    }
  }

  // Effacer tout l'historique
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('🧹 Historique effacé');
    } catch (error) {
      console.error('Erreur effacement historique:', error);
    }
  }

  // Calculer le pourcentage de progression
  calculateProgress(watchDuration: number, totalDuration: number): number {
    if (totalDuration <= 0) return 0;
    return Math.min(Math.round((watchDuration / totalDuration) * 100), 100);
  }

  // Formater le temps de visionnage
  formatWatchTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }
}

export const historyService = new HistoryService();