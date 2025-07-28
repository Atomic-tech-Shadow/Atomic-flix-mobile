import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { runAfterInteractions } from '../utils/performanceUtils';

interface PerformanceMonitorProps {
  showMonitor?: boolean;
  componentName?: string;
}

/**
 * 🔥 Moniteur de performances pour debug des optimisations
 * Affiche les métriques de rendu en mode développement
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showMonitor = __DEV__, // Seulement en développement par défaut
  componentName = 'Component'
}) => {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState<number>(0);
  const [renderDuration, setRenderDuration] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    runAfterInteractions(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setRenderCount(count => count + 1);
      setLastRenderTime(endTime);
      setRenderDuration(duration);
    });
  });

  if (!showMonitor) {
    return null;
  }

  return (
    <View style={styles.monitor}>
      <Text style={styles.monitorText}>
        {componentName}: {renderCount} renders
      </Text>
      <Text style={styles.monitorText}>
        Last: {renderDuration.toFixed(1)}ms
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  monitor: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 4,
    zIndex: 9999,
  },
  monitorText: {
    color: '#00bcd4',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

export default PerformanceMonitor;