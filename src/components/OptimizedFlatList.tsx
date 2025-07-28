import React from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { getOptimizedListProps } from '../utils/performanceUtils';

interface OptimizedFlatListProps<T> extends FlatListProps<T> {
  data: T[];
  itemHeight?: number;
  enableVirtualization?: boolean;
}

/**
 * 🔥 FlatList optimisé pour des performances ultra-fluides
 * Utilise la virtualisation et des optimisations avancées pour grandes listes
 */
function OptimizedFlatList<T>({
  data,
  itemHeight,
  enableVirtualization = true,
  horizontal = false,
  ...props
}: OptimizedFlatListProps<T>) {
  const optimizedProps = {
    // 🔥 Propriétés de base pour performances optimales
    showsVerticalScrollIndicator: false,
    showsHorizontalScrollIndicator: false,
    keyboardShouldPersistTaps: 'handled' as const,
    
    // 🔥 Optimisations de virtualisation
    ...(enableVirtualization ? getOptimizedListProps(itemHeight) : {}),
    
    // 🔥 Optimisations de scroll fluide
    scrollEventThrottle: 16,
    decelerationRate: 'fast' as const,
    bounces: true,
    bouncesZoom: false,
    
    // 🔥 Configuration conditionnelle selon l'orientation
    ...(horizontal ? {
      alwaysBounceHorizontal: false,
      snapToAlignment: 'start' as const,
    } : {
      alwaysBounceVertical: false,
      scrollsToTop: true,
    }),
    
    // Optimisations pour la mémoire et performance
    removeClippedSubviews: true,
    automaticallyAdjustContentInsets: false,
    contentInsetAdjustmentBehavior: 'never' as const,
    overScrollMode: 'auto' as const,
    fadingEdgeLength: 0,
    directionalLockEnabled: true,
    disableIntervalMomentum: false,
    
    // Surcharger avec les props passées
    ...props,
  };

  return (
    <FlatList
      data={data}
      horizontal={horizontal}
      {...optimizedProps}
    />
  );
}

export default OptimizedFlatList;