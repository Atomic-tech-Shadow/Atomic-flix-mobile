# 🚀 Guide de Performance Scroll - Atomic Flix

## Vue d'ensemble
Ce guide compile les meilleures pratiques 2025 pour obtenir un scroll ultra-fluide dans votre application React Native Expo.

## 🔥 Composants de Performance Disponibles

### 1. OptimizedScrollView
- **Localisation**: `src/components/OptimizedScrollView.tsx`
- **Usage**: ScrollView avec optimisations automatiques
- **Performances**: Configuration ultra-optimisée

### 2. Utilitaires de Performance
- **Localisation**: `src/utils/performanceUtils.ts`
- **Fonctions**: Configuration FlatList, animations, optimisations images

## 📊 Benchmark des Composants

### ScrollView vs FlatList
| Critère | ScrollView | FlatList | Recommandation |
|---------|------------|----------|----------------|
| **< 50 items** | ✅ Rapide | ⚠️ Overkill | ScrollView |
| **50-200 items** | ⚠️ Lent | ✅ Optimal | FlatList |
| **> 200 items** | ❌ Très lent | ✅ Excellent | FlatList obligatoire |
| **Mémoire** | ❌ Élevée | ✅ Optimisée | FlatList |
| **Scroll initial** | ✅ Instantané | ⚠️ Peut avoir du lag | ScrollView |

## ⚡ Configurations Optimales

### Pour ScrollView (< 50 items)
```javascript
// Configuration automatique avec OptimizedScrollView
import OptimizedScrollView from '../components/OptimizedScrollView';

<OptimizedScrollView
  // Pour scroll vertical (défaut)
  removeClippedSubviews={true}
  scrollEventThrottle={4}
  decelerationRate={0.985}
  bounces={true}
  showsVerticalScrollIndicator={false}
>
  {content}
</OptimizedScrollView>

// Pour scroll horizontal
<OptimizedScrollView
  horizontal={true}
  enableSnapping={true}
  snapInterval={140}
>
  {horizontalContent}
</OptimizedScrollView>
```

### Pour FlatList (> 50 items)
```javascript
import { getOptimizedListProps } from '../utils/performanceUtils';

<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  
  // Props optimisées automatiques
  {...getOptimizedListProps(120)} // 120 = hauteur item fixe
  
  // Props additionnelles pour performance maximale
  initialNumToRender={8}
  maxToRenderPerBatch={5}
  windowSize={10}
  removeClippedSubviews={true}
  
  // Pour items de taille fixe (BOOST ÉNORME)
  getItemLayout={(data, index) => ({
    length: 120,
    offset: 120 * index,
    index
  })}
/>
```

## 🎯 Optimisations par Use Case

### 1. Écran d'Accueil (HomeScreen)
**Situation actuelle**: ScrollView avec beaucoup de sections

**Recommandation**: 
- ✅ Garder ScrollView (< 50 items total)
- ✅ Utiliser OptimizedScrollView
- ✅ Lazy loading des sections

```javascript
// Dans HomeScreen.tsx
import OptimizedScrollView from '../components/OptimizedScrollView';

<OptimizedScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  {/* Vos sections existantes */}
</OptimizedScrollView>
```

### 2. Listes d'Animes (> 50 items)
**Recommandation**: FlatList obligatoire

```javascript
import { FlatList } from 'react-native';
import { getOptimizedListProps } from '../utils/performanceUtils';
import MemoizedAnimeCard from '../components/MemoizedAnimeCard';

const AnimeList = ({ animes }) => {
  const renderAnime = useCallback(({ item }) => (
    <MemoizedAnimeCard anime={item} onPress={handleAnimePress} />
  ), [handleAnimePress]);

  return (
    <FlatList
      data={animes}
      renderItem={renderAnime}
      keyExtractor={(item) => item.id}
      {...getOptimizedListProps(140)} // Hauteur carte = 140px
      
      // Performance boost énorme si taille fixe
      getItemLayout={(data, index) => ({
        length: 140,
        offset: 140 * index,
        index
      })}
    />
  );
};
```

### 3. Scroll Horizontal (Trending, etc.)
**Recommandation**: OptimizedScrollView avec snapping

```javascript
<OptimizedScrollView
  horizontal={true}
  enableSnapping={true}
  snapInterval={140}
  style={{ height: 200 }}
>
  {trendingAnimes.map(anime => (
    <MemoizedAnimeCard key={anime.id} anime={anime} />
  ))}
</OptimizedScrollView>
```

## 🔧 Paramètres Critiques Expliqués

### scrollEventThrottle
- **4-8**: Ultra fluide (CPU intensif)
- **16**: Équilibre parfait (60fps)
- **32+**: Économe mais moins fluide

### removeClippedSubviews
- **true**: Supprime les vues hors écran (Android par défaut)
- **Gain**: 30-50% mémoire sur grandes listes
- **Attention**: Peut causer des bugs visuels rares

### decelerationRate
- **0.985**: Décélération naturelle (recommandé)
- **0.99**: Plus rapide
- **'fast'**: iOS rapide, Android très rapide
- **'normal'**: Comportement standard

### getItemLayout (FlatList)
```javascript
// BOOST PERFORMANCE ÉNORME pour items taille fixe
getItemLayout={(data, index) => ({
  length: ITEM_HEIGHT,      // Hauteur exacte
  offset: ITEM_HEIGHT * index,  // Position calculée
  index
})}
```

## 🚀 Nouvelles Optimisations React Native 2025

### 1. FlashList (Alternative FlatList)
```bash
npx expo install @shopify/flash-list
```

```javascript
import { FlashList } from '@shopify/flash-list';

// 2x plus rapide que FlatList sur grandes listes
<FlashList
  data={data}
  renderItem={renderItem}
  estimatedItemSize={140}  // Plus simple que getItemLayout
/>
```

### 2. react-native-reanimated 3.x
```javascript
import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

const scrollY = useSharedValue(0);
const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollY.value = event.contentOffset.y;
  },
});

<Animated.ScrollView onScroll={scrollHandler}>
  {content}
</Animated.ScrollView>
```

## 📱 Tests de Performance

### Outils de Mesure
1. **Expo Performance Monitor**
```javascript
// En développement
console.log('JS Heap:', performance.now());
```

2. **React DevTools Profiler**
```javascript
import { Profiler } from 'react';

<Profiler id="ScrollView" onRender={onRenderCallback}>
  <OptimizedScrollView>{content}</OptimizedScrollView>
</Profiler>
```

### Métriques Cibles 2025
- **Frame Rate**: 60fps constant
- **JS Heap**: < 100MB par écran
- **Time to Interactive**: < 300ms
- **Scroll Jank**: 0 frames droppées

## ⚠️ Pièges à Éviter

### 1. Inline Functions dans renderItem
```javascript
// ❌ MAUVAIS - Re-render à chaque scroll
<FlatList
  renderItem={({ item }) => <Component onPress={() => doSomething(item)} />}
/>

// ✅ BON - Fonction stable
const renderItem = useCallback(({ item }) => 
  <Component onPress={handlePress} item={item} />
, [handlePress]);
```

### 2. Images non optimisées
```javascript
// ❌ MAUVAIS - Images lourdes
<Image source={{ uri: 'https://big-image.jpg' }} />

// ✅ BON - Images optimisées
import { getOptimizedImageProps } from '../utils/performanceUtils';

<Image 
  source={{ uri: optimizedImageUrl }} 
  {...getOptimizedImageProps()}
/>
```

### 3. État dans renderItem
```javascript
// ❌ MAUVAIS - État local dans item
const renderItem = ({ item }) => {
  const [isPressed, setIsPressed] = useState(false); // Re-créé à chaque render
  return <TouchableOpacity onPress={() => setIsPressed(!isPressed)} />;
};

// ✅ BON - État global ou mémorisé
const MemoizedItem = memo(({ item, isPressed, onPress }) => (
  <TouchableOpacity onPress={onPress} />
));
```

## 🎯 Plan d'Action Atomic Flix

### Phase 1: Optimisations Immédiates ✅
- [x] OptimizedScrollView créé
- [x] Utils de performance disponibles
- [x] MemoizedAnimeCard implémenté

### Phase 2: Améliorations Recommandées
- [ ] Remplacer grandes listes par FlatList
- [ ] Ajouter FlashList pour listes > 200 items
- [ ] Optimiser les images (WebP, tailles)
- [ ] Implémenter lazy loading

### Phase 3: Optimisations Avancées
- [ ] react-native-reanimated 3.x
- [ ] Virtualisation personnalisée
- [ ] Préchargement intelligent
- [ ] Métriques de performance

## 📚 Ressources Supplémentaires

### Documentation Officielle
- [React Native Performance](https://reactnative.dev/docs/performance)
- [FlatList Optimization](https://reactnative.dev/docs/flatlist)
- [ScrollView Props](https://reactnative.dev/docs/scrollview)

### Bibliothèques Recommandées
- [@shopify/flash-list](https://github.com/Shopify/flash-list)
- [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [react-native-fast-image](https://github.com/DylanVann/react-native-fast-image)

### Outils de Debug
- [Expo Performance Monitor](https://docs.expo.dev/debugging/tools/#performance-monitor)
- [React DevTools](https://reactnative.dev/docs/react-devtools)
- [Flipper](https://fbflipper.com/)

---

*Guide créé le 28 juillet 2025 pour Atomic Flix v2.9.4*