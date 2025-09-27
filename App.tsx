import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { queryClient } from './src/utils/queryClient';
import ErrorBoundary from './src/components/ErrorBoundary';

// Appeler preventAutoHideAsync() dans le scope global selon la documentation Expo 53
SplashScreen.preventAutoHideAsync();

// Configuration de l'animation selon la documentation officielle
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Préparation de l'app : chargement des ressources nécessaires
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Préparation de l'app terminée
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
      // Cacher le splash screen natif d'Expo quand l'app est prête
      SplashScreen.hide();
    }
  }, [appIsReady]);

  // Ne rien rendre jusqu'à ce que l'app soit prête
  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary
            onError={(error, errorInfo) => {
              // En production, on pourrait envoyer l'erreur à un service de monitoring
              if (__DEV__) {
                console.error('🚨 Global Error:', error);
                console.error('📍 Error Info:', errorInfo);
              }
            }}
          >
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <AppNavigator />
            </View>
          </ErrorBoundary>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}