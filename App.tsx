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

// Appeler preventAutoHideAsync() dans le scope global selon la documentation Expo 53
SplashScreen.preventAutoHideAsync();

// Configuration de l'animation selon la documentation officielle
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Préparation de l'app : chargement des ressources nécessaires
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn('Erreur lors de la préparation de l\'app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      // Cacher immédiatement le splash screen natif pour afficher notre composant personnalisé
      SplashScreen.hide();
    }
  }, [appIsReady]);

  const handleSplashFinish = () => {
    setShowSplash(false);
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
            ) : (
              <AppNavigator />
            )}
          </View>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
