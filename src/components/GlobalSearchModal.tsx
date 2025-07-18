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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import SearchService, { SearchResult } from '../services/SearchService';
import { BlurView } from 'expo-blur';

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
  
  const searchService = SearchService.getInstance();

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
        <View style={styles.modalContainer}>
          {/* Header avec barre de recherche */}
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

          {/* Contenu des résultats */}
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
                <Ionicons name="search" size={64} color="#64748b" />
                <Text style={styles.placeholderText}>
                  Recherchez vos animes et mangas préférés
                </Text>
              </View>
            )}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.3)',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
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
    color: '#ffffff',
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
    color: '#ef4444',
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
    color: '#64748b',
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
  placeholderText: {
    color: '#64748b',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
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
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
  },
  mangaBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
  },
  filmBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
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