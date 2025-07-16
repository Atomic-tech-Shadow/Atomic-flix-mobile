/**
 * API client pour anime-sama-scraper - identique au code web
 * Reproduit exactement animeAPI.getDetails() du site web
 */

const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

// Interface pour les réponses API (identique au site web)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  meta?: any;
  error?: string;
  message?: string;
}

// Fonction pour les requêtes API avec timeout (identique au site web)
const apiRequest = async (endpoint: string, timeoutMs = 20000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    console.log('Requête API:', endpoint);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout: La requête a pris trop de temps');
    }
    throw error;
  }
};

// API client identique au site web
export const animeAPI = {
  // Fonction getDetails exactement comme dans le code web
  getDetails: async (id: string): Promise<ApiResponse<any>> => {
    try {
      // Utiliser l'endpoint exact du code web qui fonctionne
      const response = await apiRequest(`/api/anime/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur animeAPI.getDetails:', error);
      throw error; // Laisser l'erreur remonter comme dans le code web
    }
  },

  // Fonction pour obtenir les épisodes d'une saison
  getSeasonEpisodes: async (animeId: string, seasonValue: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiRequest(`/api/anime/${animeId}/season/${seasonValue}/episodes`);
      return response;
    } catch (error) {
      console.error('Erreur getSeasonEpisodes:', error);
      return {
        success: false,
        data: null,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erreur chargement épisodes'
      };
    }
  },

  // Fonction pour obtenir les sources d'un épisode
  getEpisodeSources: async (animeId: string, episodeId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiRequest(`/api/anime/${animeId}/episode/${episodeId}/sources`);
      return response;
    } catch (error) {
      console.error('Erreur getEpisodeSources:', error);
      return {
        success: false,
        data: null,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erreur chargement sources'
      };
    }
  }
};

export default animeAPI;