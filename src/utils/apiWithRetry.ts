/**
 * Utilitaire pour les appels API avec retry automatique et gestion hors ligne
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  timeout?: number;
}

export type ErrorType = 'network' | 'server' | 'unknown';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
  errorType?: ErrorType;
  cached?: boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  timeout: 15000, // Augmenté de 10s à 15s pour les réseaux instables
};

/**
 * Fonction utilitaire pour attendre un délai
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calcule le délai d'attente avec backoff exponentiel
 */
const calculateDelay = (attempt: number, options: Required<RetryOptions>): number => {
  const exponentialDelay = options.baseDelay * Math.pow(options.backoffFactor, attempt);
  const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // Ajout de jitter
  return Math.min(jitteredDelay, options.maxDelay);
};

/**
 * Détermine le type d'erreur (réseau, serveur, ou inconnu)
 */
const getErrorType = (error: any): ErrorType => {
  // Extraire le code HTTP de l'erreur si présent
  const httpStatusMatch = error.message?.match(/HTTP (\d{3})/);
  const statusCode = httpStatusMatch ? parseInt(httpStatusMatch[1]) : error.status;
  
  // Erreurs serveur (5xx)
  if (statusCode) {
    if (statusCode >= 500 && statusCode < 600) {
      return 'server';
    }
    if (statusCode === 408 || statusCode === 429) {
      return 'server';
    }
  }
  
  // AbortError causé par notre timeout = serveur lent/indisponible
  // (Le fetch a été aborted car le serveur met trop de temps à répondre)
  if (error.name === 'AbortError') {
    return 'server';
  }
  
  // TimeoutError ou message contenant timeout = problème serveur
  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    return 'server';
  }
  
  // Erreurs de connexion réseau (pas d'internet)
  if (error.name === 'NetworkError' || 
      error.message?.includes('Network request failed') ||
      error.message?.includes('Failed to fetch')) {
    return 'network';
  }
  
  return 'unknown';
};

/**
 * Vérifie si une erreur est récupérable (temporaire)
 */
const isRetryableError = (error: any): boolean => {
  // Erreurs réseau temporaires
  if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
    return true;
  }
  
  // AbortError (timeout) = serveur lent, on peut réessayer
  if (error.name === 'AbortError') {
    return true;
  }
  
  // Extraire le code HTTP de l'erreur si présent (même logique que getErrorType)
  const httpStatusMatch = error.message?.match(/HTTP (\d{3})/);
  const statusCode = httpStatusMatch ? parseInt(httpStatusMatch[1]) : error.status;
  
  // Status codes HTTP récupérables
  if (statusCode) {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(statusCode);
  }
  
  // Erreurs de connexion
  if (error.message?.includes('Network request failed') || 
      error.message?.includes('fetch')) {
    return true;
  }
  
  return false;
};

/**
 * Appel API avec retry automatique et gestion d'erreurs avancée
 */
export async function apiRequestWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<ApiResponse<T>> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError: any;

  for (let attempt = 0; attempt <= finalOptions.maxRetries; attempt++) {
    try {
      if (__DEV__) {
        console.log(`🌐 Tentative API ${attempt + 1}/${finalOptions.maxRetries + 1}: ${url}`);
      }

      // Timeout pour la requête
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (__DEV__) {
        console.log(`✅ API Success: ${url}`);
      }

      return {
        success: true,
        data,
        cached: false,
      };

    } catch (error: any) {
      lastError = error;

      if (__DEV__) {
        console.warn(`❌ API Erreur tentative ${attempt + 1}: ${error.message}`);
      }

      // Si c'est la dernière tentative ou une erreur non récupérable
      if (attempt === finalOptions.maxRetries || !isRetryableError(error)) {
        break;
      }

      // Attendre avant la prochaine tentative avec backoff exponentiel
      const delayTime = calculateDelay(attempt, finalOptions);
      
      if (__DEV__) {
        console.log(`⏳ Retry dans ${delayTime}ms...`);
      }
      
      await delay(delayTime);
    }
  }

  // Toutes les tentatives ont échoué
  const errorType = getErrorType(lastError);
  return {
    success: false,
    data: null as T,
    error: lastError?.message || 'Erreur API inconnue',
    errorType,
  };
}

/**
 * Wrapper pour les requêtes GET avec cache simple
 */
const simpleCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function apiGetWithCache<T = any>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {},
  useCache: boolean = true
): Promise<ApiResponse<T>> {
  // Vérifier le cache d'abord
  if (useCache) {
    const cacheKey = `${url}${JSON.stringify(options)}`;
    const cached = simpleCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      if (__DEV__) {
        console.log(`💾 Cache hit: ${url}`);
      }
      
      return {
        success: true,
        data: cached.data,
        cached: true,
      };
    }
  }

  // Appel API normal
  const result = await apiRequestWithRetry<T>(url, options, retryOptions);

  // Sauvegarder en cache si succès
  if (result.success && useCache) {
    const cacheKey = `${url}${JSON.stringify(options)}`;
    simpleCache.set(cacheKey, {
      data: result.data,
      timestamp: Date.now(),
    });
  }

  return result;
}

/**
 * Nettoie le cache expiré
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of simpleCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      simpleCache.delete(key);
    }
  }
}

// Nettoyer le cache périodiquement
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredCache, CACHE_DURATION);
}