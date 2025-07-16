import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MangaChapter, MangaSeason, MangaData } from '../types';
import { StatusBar } from 'expo-status-bar';
import SharedHeader from '../components/SharedHeader';

type MangaReaderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MangaReader'>;
type MangaReaderScreenRouteProp = RouteProp<RootStackParamList, 'MangaReader'>;

interface Props {
  navigation: MangaReaderScreenNavigationProp;
  route: MangaReaderScreenRouteProp;
}

const { width, height } = Dimensions.get('window');

export default function MangaReaderScreen({ navigation, route }: Props) {
  const { mangaUrl, mangaTitle } = route.params;
  
  // États pour les données
  const [mangaData, setMangaData] = useState<MangaData | null>(null);
  const [mangaSeasons, setMangaSeasons] = useState<MangaSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<MangaSeason | null>(null);
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<MangaChapter | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingPages, setLoadingPages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChapterList, setShowChapterList] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Fonction pour les requêtes API
  const apiRequest = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Service externe indisponible: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  };

  // Charger les saisons et chapitres d'une saison
  const loadSeasonChapters = async (season: MangaSeason, language: string = 'VF') => {
    try {
      setLoadingChapters(true);
      console.log('Chargement des chapitres pour la saison:', season);
      
      const chaptersResponse = await apiRequest(`https://anime-sama-scraper.vercel.app/api/episodes?url=${encodeURIComponent(season.fullUrl)}&language=${language}`);
      
      if (chaptersResponse && chaptersResponse.success && chaptersResponse.episodes) {
        const formattedChapters: MangaChapter[] = chaptersResponse.episodes.map((ep: any) => ({
          id: ep.id || `chapter-${ep.episodeNumber}`,
          title: ep.title || `Chapitre ${ep.episodeNumber}`,
          number: ep.episodeNumber,
          url: ep.url,
          pages: [],
          available: ep.available !== false,
          language: ep.language || language
        }));
        
        setChapters(formattedChapters);
        
        if (formattedChapters.length > 0) {
          setSelectedChapter(formattedChapters[0]);
          await loadChapterPages(formattedChapters[0]);
        }
      } else {
        setError(`Aucun chapitre trouvé pour cette saison`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des chapitres:', error);
      setError(`Erreur de chargement des chapitres: ${error}`);
    } finally {
      setLoadingChapters(false);
    }
  };

  // Charger les pages d'un chapitre
  const loadChapterPages = async (chapter: MangaChapter) => {
    try {
      setLoadingPages(true);
      setCurrentPageIndex(0);
      console.log('Chargement des pages pour le chapitre:', chapter);
      
      const pagesResponse = await apiRequest(`https://anime-sama-scraper.vercel.app/api/manga-pages?url=${encodeURIComponent(chapter.url)}`);
      
      if (pagesResponse && pagesResponse.success && pagesResponse.pages) {
        const updatedChapter = {
          ...chapter,
          pages: pagesResponse.pages
        };
        setSelectedChapter(updatedChapter);
        
        // Mettre à jour le chapitre dans la liste
        setChapters(prevChapters => 
          prevChapters.map(ch => 
            ch.id === chapter.id ? updatedChapter : ch
          )
        );
      } else {
        setError(`Aucune page trouvée pour ce chapitre`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des pages:', error);
      setError(`Erreur de chargement des pages: ${error}`);
    } finally {
      setLoadingPages(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    const loadMangaData = async () => {
      try {
        setLoading(true);
        console.log('Chargement des données manga:', mangaUrl);
        
        // Extraire l'ID depuis l'URL
        const idMatch = mangaUrl.match(/\/anime\/([^\/]+)/);
        if (!idMatch) {
          throw new Error('ID manga introuvable dans l\'URL');
        }
        
        const id = idMatch[1];
        
        // Charger les informations générales
        const animeResponse = await apiRequest(`https://anime-sama-scraper.vercel.app/api/anime/${id}`);
        
        if (animeResponse && animeResponse.success && animeResponse.data) {
          setMangaData(animeResponse.data);
          
          // Charger les saisons pour trouver les scans
          const seasonsResponse = await apiRequest(`https://anime-sama-scraper.vercel.app/api/seasons/${id}`);
          
          if (seasonsResponse && seasonsResponse.success && seasonsResponse.seasons) {
            // Filtrer uniquement les scans (manga)
            const scans = seasonsResponse.seasons.filter((season: any) => season.contentType === 'manga');
            console.log('Scans trouvés:', scans);
            
            setMangaSeasons(scans);
            
            if (scans.length > 0) {
              const firstSeason = scans[0];
              setSelectedSeason(firstSeason);
              await loadSeasonChapters(firstSeason, 'VF');
            } else {
              setError('Aucun scan disponible pour cet anime');
            }
          } else {
            setError('Erreur lors du chargement des saisons');
          }
        } else {
          setError('Erreur lors du chargement des données du manga');
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setError(`Erreur: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    loadMangaData();
  }, [mangaUrl]);

  // Navigation entre les pages
  const goToNextPage = () => {
    if (selectedChapter && currentPageIndex < selectedChapter.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // Navigation entre les chapitres
  const goToChapter = async (chapter: MangaChapter) => {
    setSelectedChapter(chapter);
    setShowChapterList(false);
    await loadChapterPages(chapter);
  };

  // Zoom
  const zoomIn = () => setZoom(Math.min(zoom + 0.5, 3));
  const zoomOut = () => setZoom(Math.max(zoom - 0.5, 0.5));

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" backgroundColor="#0a0a1a" />
        <SharedHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00bcd4" />
          <Text style={styles.loadingText}>Chargement du manga...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" backgroundColor="#0a0a1a" />
        <SharedHeader />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentPage = selectedChapter?.pages[currentPageIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      <SharedHeader />
      <View style={styles.container}>

      {/* Lecteur principal */}
      {selectedChapter && currentPage ? (
        <ScrollView 
          style={styles.readerContainer}
          contentContainerStyle={styles.readerContent}
          maximumZoomScale={3}
          minimumZoomScale={0.5}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: currentPage }}
            style={[styles.mangaPage, { transform: [{ scale: zoom }] }]}
            resizeMode="contain"
            onError={() => {
              Alert.alert('Erreur', 'Impossible de charger cette page');
            }}
          />
        </ScrollView>
      ) : (
        <View style={styles.noPageContainer}>
          <Text style={styles.noPageText}>Aucune page disponible</Text>
        </View>
      )}

      {/* Contrôles de navigation */}
      <View style={styles.controls}>
        <View style={styles.pageNavigation}>
          <TouchableOpacity 
            style={[styles.navButton, currentPageIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPreviousPage}
            disabled={currentPageIndex === 0}
          >
            <Text style={styles.navButtonText}>← Prec.</Text>
          </TouchableOpacity>

          <Text style={styles.pageIndicator}>
            {currentPageIndex + 1} / {selectedChapter?.pages.length || 0}
          </Text>

          <TouchableOpacity 
            style={[
              styles.navButton, 
              selectedChapter && currentPageIndex >= selectedChapter.pages.length - 1 && styles.navButtonDisabled
            ]}
            onPress={goToNextPage}
            disabled={selectedChapter ? currentPageIndex >= selectedChapter.pages.length - 1 : true}
          >
            <Text style={styles.navButtonText}>Suiv. →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
          
          <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal liste des chapitres */}
      <Modal
        visible={showChapterList}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChapterList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chapitres</Text>
              <TouchableOpacity onPress={() => setShowChapterList(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={chapters}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.chapterItem,
                    selectedChapter?.id === item.id && styles.chapterItemSelected
                  ]}
                  onPress={() => goToChapter(item)}
                >
                  <Text style={styles.chapterTitle}>{item.title}</Text>
                  <Text style={styles.chapterNumber}>Ch. {item.number}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Indicateur de chargement */}
      {(loadingChapters || loadingPages) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00bcd4" />
          <Text style={styles.loadingText}>
            {loadingChapters ? 'Chargement des chapitres...' : 'Chargement des pages...'}
          </Text>
        </View>
      )}
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
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
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00bcd4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#00bcd4',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  chaptersButton: {
    padding: 8,
  },
  chaptersButtonText: {
    fontSize: 20,
  },
  readerContainer: {
    flex: 1,
  },
  readerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height - 200,
  },
  mangaPage: {
    width: width - 40,
    height: height - 200,
    marginVertical: 10,
  },
  noPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPageText: {
    color: '#ffffff',
    fontSize: 16,
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  pageNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    backgroundColor: '#00bcd4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navButtonDisabled: {
    backgroundColor: '#333333',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pageIndicator: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButton: {
    backgroundColor: '#333333',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  zoomButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  zoomText: {
    color: '#ffffff',
    fontSize: 14,
    marginHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    color: '#00bcd4',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  chapterItemSelected: {
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
  },
  chapterTitle: {
    color: '#ffffff',
    fontSize: 16,
    flex: 1,
  },
  chapterNumber: {
    color: '#00bcd4',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});