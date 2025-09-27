import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { startIOAdService, useStartIOAds } from '../services/StartIOAdService';
import { COLORS } from '../constants/newColors';

interface StartIORewardedButtonProps {
  onRewardEarned?: (reward: any) => void;
  rewardText?: string;
  buttonText?: string;
  disabled?: boolean;
  style?: any;
}

export const StartIORewardedButton: React.FC<StartIORewardedButtonProps> = ({
  onRewardEarned,
  rewardText = "Contenu premium débloqué !",
  buttonText = "🎁 Regarder pour débloquer",
  disabled = false,
  style
}) => {
  const { initialized, adEvents } = useStartIOAds();
  const [loading, setLoading] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Écouter les événements de récompense
  React.useEffect(() => {
    const latestEvent = adEvents[adEvents.length - 1];
    if (!latestEvent || latestEvent.adType !== 'rewarded') return;

    if (latestEvent.type === 'rewardEarned') {
      setRewardClaimed(true);
      setLoading(false);
      
      if (onRewardEarned) {
        onRewardEarned(latestEvent.data?.reward);
      }
      
      // Reset après 5 secondes
      setTimeout(() => {
        setRewardClaimed(false);
      }, 5000);
    } else if (latestEvent.type === 'adClosed' || latestEvent.type === 'adFailed') {
      setLoading(false);
    }
  }, [adEvents, onRewardEarned]);

  const handlePress = useCallback(async () => {
    if (!initialized || loading || disabled || rewardClaimed) return;

    try {
      setLoading(true);
      const success = await startIOAdService.showRewardedVideoAdWithLoading();
      
      if (!success) {
        setLoading(false);
        console.log('[StartIORewardedButton] Failed to show rewarded video');
      }
    } catch (error) {
      console.error('[StartIORewardedButton] Error showing rewarded video:', error);
      setLoading(false);
    }
  }, [initialized, loading, disabled, rewardClaimed]);

  if (!initialized) {
    return null;
  }

  const isDisabled = disabled || loading || rewardClaimed;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        rewardClaimed && styles.buttonSuccess,
        style
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.text.primary} />
        ) : (
          <Text style={[
            styles.buttonText,
            isDisabled && styles.buttonTextDisabled,
            rewardClaimed && styles.buttonTextSuccess
          ]}>
            {rewardClaimed ? `✅ ${rewardText}` : buttonText}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.text.muted,
    opacity: 0.6,
  },
  buttonSuccess: {
    backgroundColor: COLORS.success,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: COLORS.text.disabled,
  },
  buttonTextSuccess: {
    color: COLORS.text.primary,
  },
});

export default StartIORewardedButton;