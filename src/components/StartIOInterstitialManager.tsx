import React, { useEffect, useCallback } from 'react';
import { startIOAdService, useStartIOAds, AdEvent } from '../services/StartIOAdService';

interface StartIOInterstitialManagerProps {
  children: React.ReactNode;
  showOnEpisodeChange?: boolean;
  showOnScreenChange?: boolean;
  episodeChangeCounter?: number;
  screenChangeCounter?: number;
}

export const StartIOInterstitialManager: React.FC<StartIOInterstitialManagerProps> = ({
  children,
  showOnEpisodeChange = true,
  showOnScreenChange = false,
  episodeChangeCounter = 0,
  screenChangeCounter = 0,
}) => {
  const { initialized, adEvents } = useStartIOAds();

  // Gestion des publicités interstitielles lors du changement d'épisode
  useEffect(() => {
    if (!initialized || !showOnEpisodeChange || episodeChangeCounter === 0) return;

    // Afficher une publicité tous les 3 changements d'épisode
    if (episodeChangeCounter % 3 === 0) {
      showInterstitialWithDelay();
    }
  }, [episodeChangeCounter, initialized, showOnEpisodeChange]);

  // Gestion des publicités interstitielles lors du changement d'écran
  useEffect(() => {
    if (!initialized || !showOnScreenChange || screenChangeCounter === 0) return;

    // Afficher une publicité tous les 5 changements d'écran
    if (screenChangeCounter % 5 === 0) {
      showInterstitialWithDelay();
    }
  }, [screenChangeCounter, initialized, showOnScreenChange]);

  const showInterstitialWithDelay = useCallback(async () => {
    try {
      // Attendre un petit délai pour une meilleure expérience utilisateur
      setTimeout(async () => {
        const success = await startIOAdService.showInterstitialAdWithLoading();
        if (success) {
          console.log('[StartIOInterstitialManager] Interstitial ad shown successfully');
        } else {
          console.log('[StartIOInterstitialManager] Failed to show interstitial ad');
        }
      }, 1500);
    } catch (error) {
      console.error('[StartIOInterstitialManager] Error showing interstitial:', error);
    }
  }, []);

  // Gérer les événements de publicités
  useEffect(() => {
    const latestEvent = adEvents[adEvents.length - 1];
    if (!latestEvent || latestEvent.adType !== 'interstitial') return;

    switch (latestEvent.type) {
      case 'adShown':
        console.log('[StartIOInterstitialManager] Interstitial ad displayed');
        break;
      case 'adClosed':
        console.log('[StartIOInterstitialManager] Interstitial ad closed, resuming app');
        break;
      case 'adFailed':
        console.log('[StartIOInterstitialManager] Interstitial ad failed to load');
        break;
      case 'adClicked':
        console.log('[StartIOInterstitialManager] Interstitial ad clicked');
        break;
    }
  }, [adEvents]);

  return <>{children}</>;
};

export default StartIOInterstitialManager;