import React, { useState, useEffect, useCallback } from 'react';
import { View, AppState, AppStateStatus } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import TelegramVerification from './src/components/TelegramVerification';
import { queryClient } from './src/utils/queryClient';
import PushNotificationService from './src/services/pushNotifications';
import UserService from './src/services/userService';

// Appeler preventAutoHideAsync() dans le scope global selon la documentation Expo 53
SplashScreen.preventAutoHideAsync();

// Configuration de l'animation selon la documentation officielle
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// Configuration complète des notifications push
async function initPushNotifications() {
  try {
    // Obtenir l'ID utilisateur persistant
    const userId = await UserService.getUserId();
    console.log('✅ User ID obtained:', userId);
    
    // Configurer les listeners de notifications
    PushNotificationService.setupNotificationListeners();
    console.log('✅ Notification listeners configured');
    
    // Enregistrer le token push en arrière-plan (non bloquant)
    PushNotificationService.registerPushToken(userId)
      .then(success => {
        if (success) {
          console.log('✅ Push notifications registered');
          // Mettre à jour l'activité utilisateur en arrière-plan
          return PushNotificationService.updateActivity(userId);
        }
        return Promise.resolve();
      })
      .catch(error => {
        console.log('⚠️ Push setup error (non-blocking):', error);
      });
    
  } catch (error) {
    console.log('❌ Push setup failed (non-blocking):', error);
  }
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Préparation de l'app : chargement des ressources nécessaires
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Initialiser les notifications push
        await initPushNotifications();
      } catch (e) {
        console.warn('Erreur lors de la préparation de l\'app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  // Gérer les changements d'état de l'app (foreground/background)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App redevient active - mettre à jour l'activité utilisateur en arrière-plan
        try {
          const userId = await UserService.getUserId();
          PushNotificationService.updateActivity(userId).catch(error => {
            console.log('Activity update error (non-blocking):', error);
          });
        } catch (error) {
          console.log('Activity update setup error (non-blocking):', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
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
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <AppNavigator />
          </View>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
