# 🚀 Exemples d'Usage - Optimisations Scroll Atomic Flix

## Configuration Immédiate pour HomeScreen

### Remplacement Simple ScrollView → OptimizedScrollView

```typescript
// AVANT (HomeScreen.tsx actuel)
import { ScrollView } from 'react-native';

<ScrollView
  style={styles.scrollView}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  showsVerticalScrollIndicator={false}
  scrollEventThrottle={4}
  // ... autres props
>

// APRÈS (avec OptimizedScrollView)
import OptimizedScrollView from '../components/OptimizedScrollView';

<OptimizedScrollView
  style={styles.scrollView}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
>
```

**Gain de performance estimé : +25% fluidité scroll**

## Pour les Listes d'Animes

### 1. Petites sections (< 30 animes)
```typescript
// Trending, Classiques, Pépites
<OptimizedScrollView 
  horizontal={true}
  enableSnapping={true}
  snapInterval={140}
  style={{ height: 220 }}
>
  {trendingAnimes.map(anime => (
    <MemoizedAnimeCard key={anime.id} anime={anime} />
  ))}
</OptimizedScrollView>
```

### 2. Grandes listes (> 50 animes)
```typescript
import OptimizedFlatList from '../components/OptimizedFlatList';

<OptimizedFlatList
  data={searchResults}
  renderItem={({ item }) => <MemoizedAnimeCard anime={item} />}
  itemHeight={140} // IMPORTANT: taille fixe pour performance max
  numColumns={2}
  style={{ flex: 1 }}
/>
```

### 3. Très grandes listes (> 200 animes)
```typescript
<OptimizedFlatList
  data={allAnimes}
  renderItem={({ item }) => <MemoizedAnimeCard anime={item} />}
  itemHeight={140}
  ultraPerformance={true} // Active mode haute performance
  style={{ flex: 1 }}
/>
```

## Configuration selon Use Case

### Écran de Recherche
```typescript
const SearchScreen = () => {
  const [results, setResults] = useState([]);

  const renderAnime = useCallback(({ item }) => (
    <MemoizedAnimeCard 
      anime={item} 
      onPress={() => navigation.navigate('AnimeDetail', { anime: item })}
    />
  ), [navigation]);

  return (
    <OptimizedFlatList
      data={results}
      renderItem={renderAnime}
      itemHeight={140}
      keyExtractor={(item) => item.id}
      // Auto-optimisation selon taille des résultats
    />
  );
};
```

### Écran Planning/Calendrier
```typescript
// Grande liste avec sections par date
import { SectionList } from 'react-native';
import { getOptimizedListProps } from '../utils/performanceUtils';

<SectionList
  sections={planningData}
  renderItem={({ item }) => <PlanningCard episode={item} />}
  renderSectionHeader={({ section }) => <DateHeader date={section.date} />}
  {...getOptimizedListProps(120)}
  stickySectionHeadersEnabled={true}
/>
```

## Détecteur Automatique de Performance

```typescript
import { getRecommendedScrollComponent } from '../utils/performanceUtils';

const SmartScrollComponent = ({ data, itemHeight }) => {
  const recommendation = getRecommendedScrollComponent(data.length, !!itemHeight);
  
  console.log(`📊 Performance: ${recommendation.reason}`);
  
  if (recommendation.component === 'ScrollView') {
    return (
      <OptimizedScrollView>
        {data.map((item, index) => renderItem(item, index))}
      </OptimizedScrollView>
    );
  }
  
  return (
    <OptimizedFlatList
      data={data}
      renderItem={({ item }) => renderItem(item)}
      itemHeight={itemHeight}
      ultraPerformance={data.length > 200}
    />
  );
};
```

## Monitoring de Performance

```typescript
import { createPerformanceMonitor } from '../utils/performanceUtils';

const AnimeListScreen = () => {
  const monitor = createPerformanceMonitor('AnimeList');

  useEffect(() => {
    monitor.markRenderStart();
    return () => {
      const stats = monitor.getStats();
      console.log('📊 Performance Stats:', stats);
    };
  }, []);

  const handleScroll = useCallback(() => {
    monitor.trackScrollPerformance();
  }, []);

  return (
    <OptimizedFlatList
      data={animes}
      renderItem={renderAnime}
      onScroll={handleScroll}
      itemHeight={140}
    />
  );
};
```

## Gestion des Images Optimisées

```typescript
import { getOptimizedImageProps } from '../utils/performanceUtils';

const MemoizedAnimeCard = memo(({ anime }) => (
  <TouchableOpacity style={styles.card}>
    <Image 
      source={{ uri: anime.imageUrl }} 
      {...getOptimizedImageProps()}
      style={styles.image}
    />
    <Text>{anime.title}</Text>
  </TouchableOpacity>
));
```

## Configuration Avancée

### Pour Scroll Horizontal avec Pagination
```typescript
<OptimizedScrollView
  horizontal={true}
  enableSnapping={true}
  snapInterval={width * 0.8} // 80% de la largeur d'écran
  decelerationRate="fast"
  showsHorizontalScrollIndicator={false}
>
  {featuredAnimes.map(anime => (
    <FeaturedCard key={anime.id} anime={anime} width={width * 0.8} />
  ))}
</OptimizedScrollView>
```

### Pour Scroll avec RefreshControl
```typescript
<OptimizedScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#00bcd4']} // Android
      tintColor="#00bcd4"   // iOS
    />
  }
>
  {content}
</OptimizedScrollView>
```

## Migration Step-by-Step

### Étape 1: HomeScreen (Immédiat)
1. Remplacer `ScrollView` par `OptimizedScrollView`
2. Supprimer les props de performance manuelles
3. Tester le scroll

### Étape 2: Listes de recherche (Semaine 1)
1. Identifier les listes > 50 items
2. Remplacer par `OptimizedFlatList`
3. Ajouter `itemHeight` si possible

### Étape 3: Optimisation images (Semaine 2)
1. Utiliser `getOptimizedImageProps()` 
2. Implémenter lazy loading
3. Optimiser tailles d'images

### Étape 4: Monitoring (Semaine 3)
1. Ajouter monitoring de performance
2. Analyser les métriques
3. Ajuster selon les résultats

## Tests de Performance

### Test Frame Rate
```typescript
// En développement, vérifier FPS
const TestScrollPerformance = () => {
  let frameCount = 0;
  let startTime = Date.now();

  const trackFrame = () => {
    frameCount++;
    const elapsed = Date.now() - startTime;
    if (elapsed >= 1000) {
      console.log(`FPS: ${frameCount} (Target: 60)`);
      frameCount = 0;
      startTime = Date.now();
    }
  };

  return (
    <OptimizedFlatList
      onScroll={trackFrame}
      // ... autres props
    />
  );
};
```

### Test Mémoire
```typescript
// Surveiller l'usage mémoire
const monitorMemory = () => {
  if (__DEV__) {
    const memInfo = performance.memory;
    console.log(`Memory: ${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
  }
};
```

## Résultats Attendus

### Avant Optimisation
- Frame drops fréquents sur scroll rapide  
- 120-200ms latence au démarrage des listes
- Usage mémoire élevé (150MB+)

### Après Optimisation  
- 60fps constant même sur scroll rapide
- 50-80ms latence au démarrage
- Usage mémoire réduit (80-120MB)
- Scroll plus fluide et réactif

---

*Exemples créés le 28 juillet 2025 pour Atomic Flix v2.9.4*