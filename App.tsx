import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreenNative from 'expo-splash-screen';
import 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';
import { queryClient } from './src/utils/queryClient';

// Empêche le splash screen natif de se cacher automatiquement
SplashScreenNative.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          {showSplash ? (
            <SplashScreen onFinish={handleSplashFinish} />
          ) : (
            <AppNavigator />
          )}
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
