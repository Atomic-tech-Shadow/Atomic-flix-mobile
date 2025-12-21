import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

export const useUpdateCheck = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    checkForUpdates();
    // Vérifier les mises à jour toutes les 60 secondes
    const interval = setInterval(checkForUpdates, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      if (!__DEV__) {
        const update = await Updates.checkAsync();
        
        if (update.isAvailable) {
          setIsUpdateAvailable(true);
          showUpdateAlert();
        }
      }
    } catch (error) {
      console.log('Erreur lors de la vérification des mises à jour:', error);
    }
  };

  const showUpdateAlert = () => {
    Alert.alert(
      '🚀 Mise à jour disponible',
      'Une nouvelle version de l\'application est disponible. Voulez-vous redémarrer pour installer la mise à jour ?',
      [
        {
          text: 'Plus tard',
          onPress: () => setIsUpdateAvailable(false),
          style: 'cancel',
        },
        {
          text: 'Redémarrer maintenant',
          onPress: () => reloadApp(),
          style: 'default',
        },
      ]
    );
  };

  const reloadApp = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Erreur lors du rechargement de l\'app:', error);
      Alert.alert('Erreur', 'Impossible de redémarrer l\'application. Veuillez redémarrer manuellement.');
    }
  };

  return { isUpdateAvailable, checkForUpdates };
};
