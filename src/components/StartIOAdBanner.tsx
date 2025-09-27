import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { startIOAdService, useStartIOAds } from '../services/StartIOAdService';
import { COLORS } from '../constants/newColors';

interface StartIOAdBannerProps {
  position?: 'top' | 'bottom';
  visible?: boolean;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const StartIOAdBanner: React.FC<StartIOAdBannerProps> = ({
  position = 'bottom',
  visible = true,
  style
}) => {
  const { initialized } = useStartIOAds();
  const [adVisible, setAdVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialized && visible) {
      showBannerAd();
    } else if (!visible) {
      hideBannerAd();
    }

    return () => {
      if (adVisible) {
        hideBannerAd();
      }
    };
  }, [initialized, visible]);

  const showBannerAd = async () => {
    if (loading || adVisible) return;
    
    try {
      setLoading(true);
      const success = await startIOAdService.showBannerAd(position);
      if (success) {
        setAdVisible(true);
      }
    } catch (error) {
      console.error('[StartIOAdBanner] Error showing banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const hideBannerAd = async () => {
    if (!adVisible) return;
    
    try {
      await startIOAdService.hideBannerAd();
      setAdVisible(false);
    } catch (error) {
      console.error('[StartIOAdBanner] Error hiding banner:', error);
    }
  };

  if (!initialized || !visible) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      position === 'top' ? styles.topPosition : styles.bottomPosition,
      style
    ]}>
      {__DEV__ && (
        <View style={styles.devBanner}>
          <Text style={styles.devText}>
            {loading ? '🔄 Chargement publicité...' : 
             adVisible ? '📺 Publicité Start.io' : '❌ Publicité non disponible'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.text.muted,
    borderWidth: 1,
  },
  topPosition: {
    position: 'absolute',
    top: 0,
    zIndex: 1000,
  },
  bottomPosition: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1000,
  },
  devBanner: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  devText: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StartIOAdBanner;