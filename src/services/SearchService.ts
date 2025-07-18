import { apiRequest } from '../utils/api';

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: 'anime' | 'manga' | 'film';
  image?: string;
  description?: string;
  year?: string;
  status?: string;
}

class SearchService {
  private static instance: SearchService;
  private searchCache: Map<string, SearchResult[]> = new Map();
  private lastSearchTime: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    
    // Vérifier le cache
    const cachedResult = this.getCachedResult(normalizedQuery);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const response = await apiRequest(`/api/search?query=${encodeURIComponent(query)}`);
      
      if (response && response.success) {
        const results = response.results || [];
        if (Array.isArray(results)) {
          // Mettre en cache les résultats
          this.setCachedResult(normalizedQuery, results);
          return results;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Erreur de recherche:', error);
      return [];
    }
  }

  private getCachedResult(query: string): SearchResult[] | null {
    const cached = this.searchCache.get(query);
    const cacheTime = this.lastSearchTime.get(query);
    
    if (cached && cacheTime && (Date.now() - cacheTime) < this.CACHE_DURATION) {
      return cached;
    }
    
    return null;
  }

  private setCachedResult(query: string, results: SearchResult[]): void {
    this.searchCache.set(query, results);
    this.lastSearchTime.set(query, Date.now());
    
    // Nettoyer le cache si trop de résultats
    if (this.searchCache.size > 100) {
      const oldestKey = Array.from(this.lastSearchTime.entries())
        .sort(([,a], [,b]) => a - b)[0][0];
      this.searchCache.delete(oldestKey);
      this.lastSearchTime.delete(oldestKey);
    }
  }

  clearCache(): void {
    this.searchCache.clear();
    this.lastSearchTime.clear();
  }
}

export default SearchService;