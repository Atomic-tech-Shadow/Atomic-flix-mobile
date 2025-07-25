import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import TelegramVerification from './src/components/TelegramVerification';
import { queryClient } from './src/utils/queryClient';
import * as Notifications from 'expo-notifications';

// Appeler preventAutoHideAsync() dans le scope global selon la documentation Expo 53
SplashScreen.preventAutoHideAsync();

// Configuration de l'animation selon la documentation officielle
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// Configuration minimale push notifications selon CONFIG-APP-MINIMALE
async function initPushNotifications() {
  try {
    // Demander permission (obligatoire)
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    
    // Obtenir le token push
    const token = await Notifications.getExpoPushTokenAsync();
    
    // Enregistrer sur votre serveur
    await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        userId: 'user_' + Math.random().toString(36).substr(2, 9),
        pushToken: token.data
      })
    });
    
    console.log('✅ Push notifications configured');
  } catch (error) {
    console.log('❌ Push setup failed:', error);
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
