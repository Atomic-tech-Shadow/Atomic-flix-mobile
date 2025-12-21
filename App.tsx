import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { queryClient } from './src/utils/queryClient';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen';
import UpdateAlert from './src/components/UpdateAlert';

// Empêcher le splash screen natif de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    async function prepareApp() {
      try {
        console.log('🚀 Préparation de l\'app...');
        
        // Charger les fonts Ionicons uniquement sur les plateformes natives
        console.log('📝 Chargement des fonts...');
        const { Platform } = require('react-native');
        
        if (Platform.OS !== 'web') {
          await Font.loadAsync({
            ...Ionicons.font,
          });
        }
        console.log('✅ Fonts chargés !');
        
        // Simuler le chargement des ressources
        await new Promise(resolve => setTimeout(resolve, 300));
        
        console.log('📱 Cachage du splash screen natif...');
        // Cacher le splash screen natif et montrer notre splash personnalisé
        await SplashScreen.hideAsync();
        
        console.log('✅ App prête !');
        // Préparation terminée
        setAppIsReady(true);
      } catch (e) {
        console.warn('❌ Erreur lors de la préparation de l\'app:', e);
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  const handleSplashFinish = () => {
    console.log('🎬 Splash screen terminé');
    setShowAnimatedSplash(false);
  };

  if (!appIsReady) {
    console.log('⏳ En attente de préparation de l\'app...');
    return null;
  }

  console.log('🎨 Rendu de l\'app principale, showAnimatedSplash:', showAnimatedSplash);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary
              onError={(error, errorInfo) => {
                if (__DEV__) {
                  console.error('🚨 Global Error:', error);
                  console.error('📍 Error Info:', errorInfo);
                }
              }}
            >
              <UpdateAlert />
              <View style={{ flex: 1 }}>
                <AppNavigator />
                {showAnimatedSplash && (
                  <AnimatedSplashScreen 
                    onFinish={handleSplashFinish}
                    duration={2500}
                  />
                )}
              </View>
            </ErrorBoundary>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}