import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import CustomSplashScreen from './src/components/SplashScreen';
import TelegramVerification from './src/components/TelegramVerification';
import { queryClient } from './src/utils/queryClient';

// CRITIQUE : Appeler preventAutoHideAsync() dans le scope global
// avant tout rendu React pour éviter le flash du splash screen par défaut
SplashScreen.preventAutoHideAsync()
  .then(() => console.log('✅ Splash screen auto-hide prevented'))
  .catch(console.warn);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTelegramVerification, setShowTelegramVerification] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Ici on peut ajouter des chargements async (fonts, données, etc.)
        // Pour l'instant, on simule juste un délai minimal
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('Erreur lors de la préparation de l\'app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && !showSplash && !showTelegramVerification) {
      // Ne cacher le splash screen d'Expo que quand tout est prêt :
      // - App prête
      // - Splash screen custom terminé
      // - Vérification Telegram terminée
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, showSplash, showTelegramVerification]);

  const handleSplashFinish = () => {
    setShowSplash(false);
    setShowTelegramVerification(true);
  };

  const handleTelegramVerified = () => {
    setShowTelegramVerification(false);
  };

  // Ne rien rendre jusqu'à ce que l'app soit prête
  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            {showSplash ? (
              <CustomSplashScreen onFinish={handleSplashFinish} />
            ) : showTelegramVerification ? (
              <TelegramVerification
                onVerified={handleTelegramVerified}
                telegramChannelUrl="https://t.me/votre_canal" // Remplacez par votre URL
                channelName="ATOMIC FLIX Official"
              />
            ) : (
              <AppNavigator />
            )}
          </View>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
