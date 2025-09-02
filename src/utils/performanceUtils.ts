import React from 'react';

/**
 * 🚀 Utilitaires d'optimisation de performance pour les listes
 */

export const getOptimizedListProps = (itemHeight?: number) => ({
  removeClippedSubviews: true,
  maxToRenderPerBatch: 5,
  updateCellsBatchingPeriod: 30,
  initialNumToRender: 10,
  windowSize: 10,
  getItemLayout: itemHeight ? (data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index
  }) : undefined,
});

export const getUltraPerformanceListProps = (itemHeight: number) => ({
  removeClippedSubviews: true,
  maxToRenderPerBatch: 3,
  updateCellsBatchingPeriod: 50,
  initialNumToRender: 8,
  windowSize: 5,
  getItemLayout: (data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index
  }),
});

export const optimizedMemo = <T extends Record<string, any>>(
  Component: React.ComponentType<T>
): React.ComponentType<T> => {
  return React.memo(Component, (prevProps, nextProps) => {
    // Comparaison optimisée pour les props communes
    const keys = Object.keys(nextProps) as Array<keyof T>;
    return keys.every(key => prevProps[key] === nextProps[key]);
  });
};