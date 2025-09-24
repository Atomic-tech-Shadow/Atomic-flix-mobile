import mobileAds, { 
  InterstitialAd, 
  RewardedAd, 
  TestIds, 
  AdEventType,
  RewardedAdEventType,
  BannerAdSize
} from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

/**
 * Service pour gérer les publicités AdMob dans Atomic Flix
 * Fournit des bannières, interstitiels et publicités récompensées
 */
class AdMobService {
  private isInitialized = false;
  private interstitialAd: InterstitialAd | null = null;
  private rewardedAd: RewardedAd | null = null;

  // IDs des unités publicitaires - TEST IDs pour développement
  private readonly AD_UNITS = {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxx/yyyyyyyyyy',
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxx/yyyyyyyyyy',
    rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxx/yyyyyyyyyy',
  };

  /**
   * Initialise le service AdMob
   * Doit être appelé au démarrage de l'app
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        console.log('💰 AdMob déjà initialisé');
        return true;
      }

      // Demander permission de tracking sur iOS
      const { status } = await requestTrackingPermissionsAsync();
      console.log('📱 Permission de tracking:', status);

      // Initialiser AdMob
      await mobileAds().initialize();
      this.isInitialized = true;

      console.log('💰 AdMob initialisé avec succès !');
      
      // Pré-charger les publicités
      await this.preloadAds();
      
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation AdMob:', error);
      return false;
    }
  }

  /**
   * Pré-charge les publicités interstitielles et récompensées
   */
  private async preloadAds(): Promise<void> {
    try {
      // Charger publicité interstitielle
      this.interstitialAd = InterstitialAd.createForAdRequest(
        this.AD_UNITS.interstitial,
        {
          requestNonPersonalizedAdsOnly: true,
        }
      );
      this.interstitialAd.load();

      // Charger publicité récompensée
      this.rewardedAd = RewardedAd.createForAdRequest(
        this.AD_UNITS.rewarded,
        {
          requestNonPersonalizedAdsOnly: true,
        }
      );
      this.rewardedAd.load();

      console.log('📺 Publicités pré-chargées');
    } catch (error) {
      console.error('❌ Erreur pré-chargement publicités:', error);
    }
  }

  /**
   * Affiche une publicité interstitielle
   * Idéal pour les transitions entre écrans ou épisodes
   */
  async showInterstitialAd(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.interstitialAd) {
        console.warn('⚠️ AdMob non initialisé ou publicité non chargée');
        return false;
      }

      const isLoaded = this.interstitialAd.loaded;
      
      if (isLoaded) {
        await this.interstitialAd.show();
        console.log('📺 Publicité interstitielle affichée');
        
        // Pré-charger la prochaine publicité
        this.interstitialAd.load();
        
        return true;
      } else {
        console.warn('⚠️ Publicité interstitielle non chargée');
        // Essayer de recharger
        this.interstitialAd.load();
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur affichage publicité interstitielle:', error);
      return false;
    }
  }

  /**
   * Affiche une publicité récompensée
   * Parfait pour débloquer du contenu premium ou des épisodes
   */
  async showRewardedAd(): Promise<{ shown: boolean; rewarded: boolean }> {
    return new Promise((resolve) => {
      try {
        if (!this.isInitialized || !this.rewardedAd) {
          console.warn('⚠️ AdMob non initialisé ou publicité récompensée non chargée');
          resolve({ shown: false, rewarded: false });
          return;
        }

        const isLoaded = this.rewardedAd.loaded;
        
        if (isLoaded) {
          let wasRewarded = false;

          // Écouter l'événement de récompense
          const rewardListener = this.rewardedAd.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD, 
            (reward) => {
              console.log('🎁 Récompense obtenue:', reward);
              wasRewarded = true;
            }
          );

          // Écouter la fermeture de la publicité
          const closeListener = this.rewardedAd.addAdEventListener(
            AdEventType.CLOSED,
            () => {
              console.log('📺 Publicité récompensée fermée');
              // Nettoyer les listeners
              rewardListener();
              closeListener();
              
              // Pré-charger la prochaine publicité
              this.rewardedAd!.load();
              
              resolve({ shown: true, rewarded: wasRewarded });
            }
          );

          this.rewardedAd.show();
          console.log('📺 Publicité récompensée affichée');
        } else {
          console.warn('⚠️ Publicité récompensée non chargée');
          // Essayer de recharger
          this.rewardedAd.load();
          resolve({ shown: false, rewarded: false });
        }
      } catch (error) {
        console.error('❌ Erreur affichage publicité récompensée:', error);
        resolve({ shown: false, rewarded: false });
      }
    });
  }

  /**
   * Obtient l'ID de l'unité publicitaire pour les bannières
   */
  getBannerAdUnitId(): string {
    return this.AD_UNITS.banner;
  }

  /**
   * Obtient la taille de bannière recommandée
   */
  getBannerSize(): any {
    return BannerAdSize.ADAPTIVE_BANNER;
  }

  /**
   * Vérifie si AdMob est initialisé
   */
  isAdMobReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Affiche une publicité aléatoire (interstitielle ou rien)
   * Utile pour une monétisation passive
   */
  async showRandomAd(): Promise<boolean> {
    // 30% de chance d'afficher une publicité
    const shouldShow = Math.random() < 0.3;
    
    if (shouldShow) {
      return await this.showInterstitialAd();
    }
    
    return false;
  }

  /**
   * Log des statistiques publicitaires
   */
  logAdStats(): void {
    console.log('📊 Stats AdMob:', {
      initialized: this.isInitialized,
      interstitialLoaded: this.interstitialAd?.loaded || false,
      rewardedLoaded: this.rewardedAd?.loaded || false,
    });
  }
}

export const adMobService = new AdMobService();