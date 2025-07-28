import React, { memo, useCallback } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { getOptimizedListProps, getUltraPerformanceListProps } from '../utils/performanceUtils';

interface OptimizedFlatListProps<T> extends FlatListProps<T> {
  data: T[];
  renderItem: FlatListProps<T>['renderItem'];
  itemHeight?: number;
  ultraPerformance?: boolean;
}

/**
 * 🚀 FlatList optimisé pour des performances ultra-fluides
 */
function OptimizedFlatList<T>({
  data,
  renderItem,
  itemHeight,
  ultraPerformance = false,
  keyExtractor,
  ...props
}: OptimizedFlatListProps<T>) {
  
  const shouldUseUltraPerformance = ultraPerformance || (data && data.length > 200);
  const optimizedProps = shouldUseUltraPerformance && itemHeight
    ? getUltraPerformanceListProps(itemHeight)
    : getOptimizedListProps(itemHeight);

  const defaultKeyExtractor = useCallback((item: T, index: number): string => {
    const candidate = item as any;
    if (candidate?.id) return String(candidate.id);
    if (candidate?.key) return String(candidate.key);
    return `item-${index}`;
  }, []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor || defaultKeyExtractor}
      {...optimizedProps}
      {...props}
    />
  );
}

export default memo(OptimizedFlatList) as <T>(props: OptimizedFlatListProps<T>) => React.ReactElement;