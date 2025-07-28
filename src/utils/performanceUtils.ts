import { InteractionManager, LayoutAnimation, Platform } from 'react-native';

/**
 * 🔥 Utilitaires pour optimiser les performances de l'application
 * Utilisés pour garantir des animations et interactions fluides
 */

/**
 * Execute une fonction après que toutes les interactions soient terminées
 * Évite les janks pendant les animations de navigation
 */
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(callback);
};

/**
 * Debounce une fonction pour éviter les appels trop fréquents
 * Idéal pour les recherches en temps réel
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Configuration d'animation optimisée pour les transitions fluides
 */
export const configureLayoutAnimation = (): void => {
  LayoutAnimation.configureNext({
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
};

/**
 * Configuration d'animation rapide pour les micro-interactions
 */
export const configureQuickAnimation = (): void => {
  LayoutAnimation.configureNext({
    duration: 150,
    create: {
      type: LayoutAnimation.Types.easeOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeOut,
    },
  });
};

/**
 * Optimisation des images pour le chargement rapide
 */
export const getOptimizedImageProps = () => ({
  resizeMode: 'cover' as const,
  loadingIndicatorSource: { uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFhMWEyZTsgc3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzBhMGExYTsgc3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgLz4KPC9zdmc+' },
  onLoadStart: () => {
    // Placeholder pour tracking des métriques de performance
  },
  onLoad: () => {
    // Image chargée avec succès
  },
  onError: () => {
    // Gestion d'erreur silencieuse pour éviter les logs de spam
  },
});

/**
 * Optimisation du rendu des listes pour de meilleures performances
 */
export const getOptimizedListProps = (itemHeight?: number) => ({
  removeClippedSubviews: true,
  maxToRenderPerBatch: 10,
  initialNumToRender: 8,
  windowSize: 10,
  updateCellsBatchingPeriod: 50,
  getItemLayout: itemHeight ? (data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }) : undefined,
});

/**
 * Throttle une fonction pour éviter les appels trop fréquents
 * Différent du debounce : exécute immédiatement puis ignore les appels suivants
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Utilitaire pour les animations de scale avec le native driver
 */
export const createScaleAnimation = (scale: any, toValue: number, duration: number = 150) => {
  return {
    toValue,
    duration,
    useNativeDriver: true,
  };
};

/**
 * Configuration optimale pour les ScrollView selon le type
 */
export const getScrollViewConfig = (type: 'vertical' | 'horizontal' = 'vertical') => {
  const baseConfig = {
    removeClippedSubviews: true,
    scrollEventThrottle: 16,
    keyboardShouldPersistTaps: 'handled' as const,
    decelerationRate: 'fast' as const,
    bounces: true,
    bouncesZoom: false,
    showsVerticalScrollIndicator: false,
    showsHorizontalScrollIndicator: false,
    maximumZoomScale: 1,
    minimumZoomScale: 1,
    automaticallyAdjustContentInsets: false,
    contentInsetAdjustmentBehavior: 'never' as const,
    overScrollMode: 'auto' as const,
    fadingEdgeLength: 0,
    directionalLockEnabled: true,
    disableIntervalMomentum: false,
  };

  if (type === 'horizontal') {
    return {
      ...baseConfig,
      horizontal: true,
      alwaysBounceHorizontal: false,
      snapToAlignment: 'start' as const,
    };
  }

  return {
    ...baseConfig,
    alwaysBounceVertical: false,
    scrollsToTop: true,
    maintainVisibleContentPosition: {
      minIndexForVisible: 0,
      autoscrollToTopThreshold: 100
    },
  };
};