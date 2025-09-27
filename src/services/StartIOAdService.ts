import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

// Interface pour le module natif Start.io
interface StartIOAdModule {
  initialize: (appId: string) => Promise<boolean>;
  showInterstitialAd: () => Promise<boolean>;
  loadInterstitialAd: () => Promise<boolean>;
  isInterstitialAdReady: () => Promise<boolean>;
  showBannerAd: (position: string) => Promise<boolean>;
  hideBannerAd: () => Promise<boolean>;
  showRewardedVideoAd: () => Promise<boolean>;
  loadRewardedVideoAd: () => Promise<boolean>;
  isRewardedVideoAdReady: () => Promise<boolean>;
  setTestAdsEnabled: (enabled: boolean) => Promise<void>;
}

// Types pour les événements de publicités
export type AdEventType = 'adLoaded' | 'adFailed' | 'adShown' | 'adClosed' | 'adClicked' | 'rewardEarned';

export interface AdEvent {
  type: AdEventType;
  adType: 'interstitial' | 'banner' | 'rewarded';
  data?: any;
}

// Configuration pour Start.io
const STARTIO_APP_ID = '208920272';

class StartIOAdService {
  private initialized = false;
  private eventEmitter: NativeEventEmitter | null = null;
  private listeners: ((event: AdEvent) => void)[] = [];

  constructor() {
    // N'initialise rien automatiquement - l'initialisation se fait via initialize()
  }

  // Initialisation fallback pour le développement uniquement
  private initializeFallback() {
    console.log('[StartIO] Initializing with fallback mode for development');
    this.initialized = true;
  }

  // Initialiser le SDK Start.io
  async initialize(): Promise<boolean> {
    try {
      if (this.initialized) {
        return true;
      }

      console.log('[StartIO] Initializing SDK with App ID:', STARTIO_APP_ID);
      
      // Essayer d'abord le module natif en production
      const { StartIOAds } = NativeModules as { StartIOAds: StartIOAdModule };
      if (StartIOAds && !__DEV__) {
        try {
          this.eventEmitter = new NativeEventEmitter(StartIOAds as any);
          this.setupEventListeners();
          
          const result = await StartIOAds.initialize(STARTIO_APP_ID);
          this.initialized = result;
          
          if (result) {
            console.log('[StartIO] Native SDK initialized successfully');
            return result;
          }
        } catch (nativeError) {
          console.warn('[StartIO] Native SDK failed, falling back to development mode:', nativeError);
        }
      }

      // Fallback pour le développement ou si le module natif n'est pas disponible
      if (__DEV__ || !StartIOAds) {
        this.initializeFallback();
        await this.setTestAdsEnabled(true);
        console.log('[StartIO] SDK initialized successfully (development mode)');
        return true;
      }

      throw new Error('Start.io native module not found and not in development mode');
    } catch (error) {
      console.error('[StartIO] Failed to initialize:', error);
      // En derniers recours, utiliser le mode fallback
      this.initializeFallback();
      return true;
    }
  }

  // Configuration du mode test
  async setTestAdsEnabled(enabled: boolean): Promise<void> {
    try {
      console.log('[StartIO] Setting test ads enabled:', enabled);
      
      if (__DEV__) {
        // En mode développement, on log simplement
        console.log('[StartIO] Test ads', enabled ? 'enabled' : 'disabled', '(development mode)');
        return;
      }

      const { StartIOAds } = NativeModules as { StartIOAds: StartIOAdModule };
      if (StartIOAds) {
        await StartIOAds.setTestAdsEnabled(enabled);
      }
    } catch (error) {
      console.error('[StartIO] Failed to set test ads enabled:', error);
    }
  }

  // Configurer les listeners d'événements
  private setupEventListeners() {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener('StartIOAdEvent', (event: AdEvent) => {
      console.log('[StartIO] Ad event received:', event);
      this.notifyListeners(event);
    });
  }

  // Ajouter un listener pour les événements de publicités
  addAdEventListener(listener: (event: AdEvent) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notifier tous les listeners
  private notifyListeners(event: AdEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[StartIO] Error in ad event listener:', error);
      }
    });
  }

  // Publicités interstitielles
  async loadInterstitialAd(): Promise<boolean> {
    try {
      if (!this.initialized) {
        console.warn('[StartIO] SDK not initialized, initializing now...');
        await this.initialize();
      }

      console.log('[StartIO] Loading interstitial ad...');
      
      if (__DEV__) {
        // Simuler le chargement en mode développement
        setTimeout(() => {
          this.notifyListeners({
            type: 'adLoaded',
            adType: 'interstitial'
          });
        }, 1000);
        return true;
      }

      const { StartIOAds } = NativeModules as { StartIOAds: StartIOAdModule };
      if (StartIOAds) {
        return await StartIOAds.loadInterstitialAd();
      }

      return false;
    } catch (error) {
      console.error('[StartIO] Failed to load interstitial ad:', error);
      this.notifyListeners({
        type: 'adFailed',
        adType: 'interstitial',
        data: { error: (error as Error).message }
      });
      return false;
    }
  }

  async showInterstitialAd(): Promise<boolean> {
    try {
      if (!this.initialized) {
        console.warn('[StartIO] SDK not initialized');
        return false;
      }

      console.log('[StartIO] Showing interstitial ad...');
      
      if (__DEV__) {
        // Simuler l'affichage en mode développement
        console.log('[StartIO] Interstitial ad shown (development mode)');
        this.notifyListeners({
          type: 'adShown',
          adType: 'interstitial'
        });
        
        // Simuler la fermeture après 3 secondes
        setTimeout(() => {
          this.notifyListeners({
            type: 'adClosed',
            adType: 'interstitial'
          });
        }, 3000);
        
        return true;
      }

      const { StartIOAds } = NativeModules as { StartIOAds: StartIOAdModule };
      if (StartIOAds) {
        return await StartIOAds.showInterstitialAd();
      }

      return false;
    } catch (error) {
      console.error('[StartIO] Failed to show interstitial ad:', error);
      return false;
    }
  }

  async isInterstitialAdReady(): Promise<boolean> {
    try {
      if (!this.initialized) return false;

      if (__DEV__) {
        // En mode développement, toujours prêt
        return true;
      }

      const { StartIOAds } = NativeModules as { StartIOAds: StartIOAdModule };
      if (StartIOAds) {
        return await StartIOAds.isInterstitialAdReady();
      }

      return false;
    } catch (error) {
      console.error('[StartIO] Failed to check interstitial ad ready:', error);
      return false;
    }
  }

  // Publicités banner
  async showBannerAd(position: 'top' | 'bottom' = 'bottom'): Promise<boolean> {
    try {
      if (!this.initialized) {
        console.warn('[StartIO] SDK not initialized');
        return false;
      }

      console.log('[StartIO] Showing banner ad at position:', position);
      
      if (__DEV__) {
        console.log('[StartIO] Banner ad shown (development mode)');
        this.notifyListeners({
          type: 'adShown',
          adType: 'banner',
          data: { position }
        });
        return true;
      }

      const { StartIOAds } = NativeModules as { StartIOAds: StartIOAdModule };
      if (StartIOAds) {
        return await StartIOAds.showBannerAd(position.toUpperCase());
      }

      return false;
    } catch (error) {
      console.error('[StartIO] Failed to show banner ad:', error);
      return false;
    }
  }

  async hideBannerAd(): Promise<boolean> {
    try {
      if (!this.initialized) return false;

      console.log('[StartIO] Hiding banner ad...');
      
      if (__DEV__) {
        console.log('[StartIO] Banner ad hidden (development mode)');
        return true;
      }

      const { StartIOAds } = NativeModules as { StartIOAds: StartIOAdModule };
      if (StartIOAds) {
        return await StartIOAds.hideBannerAd();
      }

      return false;
    } catch (error) {
      console.error('[StartIO] Failed to hide banner ad:', error);
      return false;
    }
  }

  // Publicités vidéo rewarded
  async loadRewardedVideoAd(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log('[StartIO] Loading rewarded video ad...');
      
      if (__DEV__) {
        setTimeout(() => {
          this.notifyListeners({
            type: 'adLoaded',
            adType: 'rewarded'
          });
        }, 1500);
        return true;
      }

      const { StartIOAds } = NativeModules as { StartIOAds: StartIOAdModule };
      if (StartIOAds) {
        return await StartIOAds.loadRewardedVideoAd();
      }

      return false;
    } catch (error) {
      console.error('[StartIO] Failed to load rewarded video ad:', error);
      return false;
    }
  }

  async showRewardedVideoAd(): Promise<boolean> {
    try {
      if (!this.initialized) return false;

      console.log('[StartIO] Showing rewarded video ad...');
      
      if (__DEV__) {
        console.log('[StartIO] Rewarded video ad shown (development mode)');
        this.notifyListeners({
          type: 'adShown',
          adType: 'rewarded'
        });
        
        // Simuler la récompense après 5 secondes
        setTimeout(() => {
          this.notifyListeners({
            type: 'rewardEarned',
            adType: 'rewarded',
            data: { reward: 'premium_content' }
          });
          
          setTimeout(() => {
            this.notifyListeners({
              type: 'adClosed',
              adType: 'rewarded'
            });
          }, 1000);
        }, 5000);
        
        return true;
      }

      const { StartIOAds } = NativeModules as { StartIOAds: StartIOAdModule };
      if (StartIOAds) {
        return await StartIOAds.showRewardedVideoAd();
      }

      return false;
    } catch (error) {
      console.error('[StartIO] Failed to show rewarded video ad:', error);
      return false;
    }
  }

  async isRewardedVideoAdReady(): Promise<boolean> {
    try {
      if (!this.initialized) return false;

      if (__DEV__) {
        return true;
      }

      const { StartIOAds } = NativeModules as { StartIOAds: StartIOAdModule };
      if (StartIOAds) {
        return await StartIOAds.isRewardedVideoAdReady();
      }

      return false;
    } catch (error) {
      console.error('[StartIO] Failed to check rewarded video ad ready:', error);
      return false;
    }
  }

  // Utilitaire pour charger et afficher une publicité interstitielle
  async showInterstitialAdWithLoading(): Promise<boolean> {
    try {
      const isReady = await this.isInterstitialAdReady();
      
      if (isReady) {
        return await this.showInterstitialAd();
      } else {
        console.log('[StartIO] Interstitial ad not ready, loading...');
        const loaded = await this.loadInterstitialAd();
        
        if (loaded) {
          // Attendre un peu que la publicité soit prête
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await this.showInterstitialAd();
        }
        
        return false;
      }
    } catch (error) {
      console.error('[StartIO] Failed to show interstitial ad with loading:', error);
      return false;
    }
  }

  // Utilitaire pour charger et afficher une publicité vidéo rewarded
  async showRewardedVideoAdWithLoading(): Promise<boolean> {
    try {
      const isReady = await this.isRewardedVideoAdReady();
      
      if (isReady) {
        return await this.showRewardedVideoAd();
      } else {
        console.log('[StartIO] Rewarded video ad not ready, loading...');
        const loaded = await this.loadRewardedVideoAd();
        
        if (loaded) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          return await this.showRewardedVideoAd();
        }
        
        return false;
      }
    } catch (error) {
      console.error('[StartIO] Failed to show rewarded video ad with loading:', error);
      return false;
    }
  }
}

// Instance singleton du service
export const startIOAdService = new StartIOAdService();

// Hook React pour utiliser le service Start.io
import { useEffect, useState } from 'react';

export const useStartIOAds = () => {
  const [initialized, setInitialized] = useState(false);
  const [adEvents, setAdEvents] = useState<AdEvent[]>([]);

  useEffect(() => {
    // Initialiser le service au premier montage
    startIOAdService.initialize().then(setInitialized);

    // Écouter les événements de publicités
    const removeListener = startIOAdService.addAdEventListener((event) => {
      setAdEvents(prev => [...prev.slice(-9), event]); // Garder les 10 derniers événements
    });

    return removeListener;
  }, []);

  return {
    initialized,
    adEvents,
    service: startIOAdService
  };
};

export default startIOAdService;