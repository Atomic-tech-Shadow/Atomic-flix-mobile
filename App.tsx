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
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Cache le splash Expo immédiatement pour éviter les superpositions
        await SplashScreen.hideAsync();
        // Préparation minimale de l'app 
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
    // Le splash Expo est déjà caché dans prepareApp()
    // Cette fonction peut rester simple pour le layout
  }, []);

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
