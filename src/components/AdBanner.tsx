import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { adMobService } from '../services/AdMobService';
import { COLORS } from '../constants/newColors';

interface AdBannerProps {
  size?: any;
  style?: any;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
}

/**
 * Composant bannière publicitaire pour Atomic Flix
 * Affiche des publicités AdMob avec style cohérent
 */
const AdBanner: React.FC<AdBannerProps> = ({ 
  size = BannerAdSize.ADAPTIVE_BANNER,
  style,
  onAdLoaded,
  onAdFailedToLoad 
}) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Ne pas afficher si AdMob n'est pas prêt
  if (!adMobService.isAdMobReady()) {
    return null;
  }

  const handleAdLoaded = () => {
    console.log('💰 Bannière publicitaire chargée');
    setIsAdLoaded(true);
    setHasError(false);
    onAdLoaded?.();
  };

  const handleAdFailedToLoad = (error: any) => {
    console.warn('⚠️ Erreur chargement bannière publicitaire:', error);
    setHasError(true);
    setIsAdLoaded(false);
    onAdFailedToLoad?.(error);
  };

  // Ne pas afficher le conteneur si erreur
  if (hasError) {
    return null;
  }

  return (
    <View style={[styles.adContainer, style]}>
      <BannerAd
        unitId={adMobService.getBannerAdUnitId()}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
      {/* Indicateur de chargement invisible - l'OS gère l'affichage */}
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginVertical: 8,
    paddingVertical: 4,
    // Bordure subtile pour intégration visuelle
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Ombre pour profondeur
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AdBanner;