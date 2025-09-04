import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifiEnabled: boolean;
}

export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isWifiEnabled: false
  });
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // S'abonner aux changements de statut réseau
    const unsubscribe = NetInfo.addEventListener(state => {
      const newNetworkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type || 'unknown',
        isWifiEnabled: state.isWifiEnabled ?? false
      };
      
      setNetworkState(newNetworkState);
      
      // Afficher/masquer la bannière selon la connexion
      if (!newNetworkState.isConnected || !newNetworkState.isInternetReachable) {
        setShowOfflineBanner(true);
      } else {
        // Délai avant de masquer la bannière pour éviter le clignotement
        setTimeout(() => setShowOfflineBanner(false), 1000);
      }

      if (__DEV__) {
        console.log('📡 Statut réseau:', {
          connected: newNetworkState.isConnected,
          internet: newNetworkState.isInternetReachable,
          type: newNetworkState.type
        });
      }
    });

    // Vérification initiale du statut réseau
    NetInfo.fetch().then(state => {
      const initialState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type || 'unknown',
        isWifiEnabled: state.isWifiEnabled ?? false
      };
      setNetworkState(initialState);
      
      if (!initialState.isConnected || !initialState.isInternetReachable) {
        setShowOfflineBanner(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fonction pour vérifier manuellement la connexion
  const checkConnection = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return (state.isConnected ?? false) && (state.isInternetReachable ?? false);
  };

  // Fonction pour masquer manuellement la bannière
  const hideBanner = () => {
    setShowOfflineBanner(false);
  };

  return {
    networkState,
    showOfflineBanner,
    checkConnection,
    hideBanner,
    isOnline: networkState.isConnected && networkState.isInternetReachable,
    isOffline: !networkState.isConnected || !networkState.isInternetReachable
  };
}