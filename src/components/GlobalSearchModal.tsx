import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import SearchService, { SearchResult } from '../services/SearchService';
import { BlurView } from 'expo-blur';
import { COLORS } from '../constants/newColors';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface GlobalSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideAnim] = useState(new Animated.Value(0));
  
  const searchService = SearchService.getInstance();

  // Animation d'ouverture/fermeture
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const results = await searchService.search(query);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('Aucun résultat trouvé pour cette recherche');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de recherche';
      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchService]);

  // Recherche en temps réel avec debounce
  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setError(null);
      return undefined;
    }
  }, [searchQuery, performSearch]);

  const handleResultPress = (result: SearchResult) => {
    onClose();
    setSearchQuery('');
    setSearchResults([]);
    
    // Navigation selon le type de contenu
    if (result.type === 'manga') {
      navigation.navigate('MangaReader', { 
        mangaUrl: result.url, 
        mangaTitle: result.title 
      });
    } else {
      navigation.navigate('AnimeDetail', { 
        animeUrl: result.url, 
        animeTitle: result.title 
      });
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    onClose();
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultContent}>
        {item.image && (
          <Image 
            source={{ uri: item.image }} 
            style={styles.resultImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.year && (
            <Text style={styles.resultYear}>{item.year}</Text>
          )}
          <View style={styles.resultMeta}>
            <View style={[styles.typeBadge, styles[`${item.type}Badge`]]}>
              <Text style={styles.typeText}>
                {item.type === 'anime' ? 'ANIME' : 
                 item.type === 'manga' ? 'MANGA' : 'FILM'}
              </Text>
            </View>
            {item.status && (
              <Text style={styles.resultStatus}>{item.status}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <BlurView intensity={20} style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#00bcd4" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher animes, mangas, films..."
                placeholderTextColor="#64748b"
                autoFocus
              />
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.content}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00bcd4" />
                <Text style={styles.loadingText}>Recherche en cours...</Text>
              </View>
            )}

            {error && !loading && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!loading && !error && searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsList}
              />
            )}

            {!loading && !error && searchQuery && searchResults.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color="#64748b" />
                <Text style={styles.emptyText}>
                  Aucun résultat pour "{searchQuery}"
                </Text>
              </View>
            )}

            {!searchQuery && (
              <View style={styles.placeholderContainer}>
                <View style={styles.placeholderIcon}>
                  <Ionicons name="search" size={64} color="#00bcd4" />
                </View>
                <Text style={styles.placeholderTitle}>
                  Recherche Globale
                </Text>
                <Text style={styles.placeholderText}>
                  Découvrez vos animes et mangas préférés
                </Text>
                <View style={styles.placeholderHints}>
                  <View style={styles.hintItem}>
                    <Ionicons name="tv" size={16} color="#00bcd4" />
                    <Text style={styles.hintText}>Animes</Text>
                  </View>
                  <View style={styles.hintItem}>
                    <Ionicons name="book" size={16} color="#f43f5e" />
                    <Text style={styles.hintText}>Mangas</Text>
                  </View>
                  <View style={styles.hintItem}>
                    <Ionicons name="film" size={16} color="#a855f7" />
                    <Text style={styles.hintText}>Films</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 26, 0.95)', // Cohérent avec le thème principal
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.primary, // Couleur cohérente avec le thème
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 188, 212, 0.2)', // Bordure cyan subtile
    backgroundColor: 'rgba(0, 188, 212, 0.05)', // Fond avec teinte cyan très légère
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#00bcd4', // Bordure cyan plus marquée
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 16,
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text.primary,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.text.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.text.muted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  placeholderTitle: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  placeholderHints: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hintText: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  resultItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.2)',
    shadowColor: '#00bcd4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resultContent: {
    flexDirection: 'row',
    padding: 12,
  },
  resultImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  resultTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultYear: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  animeBadge: {
    backgroundColor: 'rgba(0, 188, 212, 0.3)',
    borderWidth: 1,
    borderColor: '#00bcd4',
  },
  mangaBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.3)',
    borderWidth: 1,
    borderColor: '#f43f5e',
  },
  filmBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  typeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultStatus: {
    color: '#64748b',
    fontSize: 12,
  },
});

export default GlobalSearchModal;