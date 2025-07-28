import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

interface OptimizedScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  enableSnapping?: boolean;
  snapInterval?: number;
}

/**
 * 🔥 ScrollView optimisé pour des performances ultra-fluides
 * Configuration optimale pour tous les types de scroll (vertical et horizontal)
 */
const OptimizedScrollView: React.FC<OptimizedScrollViewProps> = ({
  children,
  enableSnapping = false,
  snapInterval = 140,
  horizontal = false,
  ...props
}) => {
  const optimizedProps = {
    // 🔥 Propriétés de base pour performances optimales
    removeClippedSubviews: true,
    scrollEventThrottle: 16,
    keyboardShouldPersistTaps: 'handled' as const,
    decelerationRate: 'fast' as const,
    bounces: true,
    bouncesZoom: false,
    showsVerticalScrollIndicator: false,
    showsHorizontalScrollIndicator: false,
    
    // 🔥 Optimisations avancées pour smooth scrolling
    maximumZoomScale: 1,
    minimumZoomScale: 1,
    scrollsToTop: !horizontal,
    automaticallyAdjustContentInsets: false,
    contentInsetAdjustmentBehavior: 'never' as const,
    overScrollMode: 'auto' as const,
    fadingEdgeLength: 0,
    directionalLockEnabled: true,
    disableIntervalMomentum: false,
    
    // 🔥 Configuration conditionnelle pour scroll horizontal
    ...(horizontal && {
      alwaysBounceHorizontal: false,
      snapToInterval: enableSnapping ? snapInterval : 0,
      snapToAlignment: 'start' as const,
    }),
    
    // 🔥 Configuration conditionnelle pour scroll vertical  
    ...(!horizontal && {
      alwaysBounceVertical: false,
      maintainVisibleContentPosition: {
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100
      },
    }),
    
    // Surcharger avec les props passées
    ...props,
  };

  return (
    <ScrollView horizontal={horizontal} {...optimizedProps}>
      {children}
    </ScrollView>
  );
};

export default OptimizedScrollView;