import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { MangaData, MangaSeason, MangaChapter } from '../types/index';
import type { RootStackParamList } from '../navigation/AppNavigator';

type MangaReaderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MangaReader'>;
type MangaReaderScreenRouteProp = RouteProp<RootStackParamList, 'MangaReader'>;

const { width, height } = Dimensions.get('window');

// Reproduction exacte de manga-reader.tsx
const MangaReaderScreen: React.FC = () => {
  const navigation = useNavigation<MangaReaderScreenNavigationProp>();
  const route = useRoute<MangaReaderScreenRouteProp>();
  const { mangaUrl, mangaTitle } = route.params;

  const [mangaData, setMangaData] = useState<MangaData | null>(null);
  const [seasons, setSeasons] = useState<MangaSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<MangaSeason | null>(null);
  const [chapters, setChapters] = useState<MangaChapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<MangaChapter | null>(null);
  const [currentPages, setCurrentPages] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration API identique au site web
  const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

  // Fonction API identique au site web
  const apiRequest = async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  };

  // Charger les données du manga (identique au site web)
  const loadMangaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const extractedId = mangaUrl.split('/').pop() || mangaUrl;
      console.log('Chargement manga ID:', extractedId);
      
      const animeResponse = await apiRequest(`/api/anime/${extractedId}`);
      console.log('Réponse anime:', animeResponse);
      
      if (animeResponse && animeResponse.success && animeResponse.data) {
        setMangaData(animeResponse.data);
        
        const seasonsResponse = await apiRequest(`/api/seasons/${extractedId}`);
        
        if (seasonsResponse && seasonsResponse.success && seasonsResponse.seasons) {
          const scans = seasonsResponse.seasons.filter((season: any) => season.contentType === 'manga');
          console.log('Scans trouvés:', scans);
          
          setSeasons(scans);
          
          if (scans.length > 0) {
            let seasonToSelect = scans[0];
            setSelectedSeason(seasonToSelect);
            
            await loadSeasonChapters(seasonToSelect, 'VF');
          } else {
            setError('Aucun scan disponible pour cet anime');
          }
        }
      } else {
        setError('Impossible de charger les données du manga');
      }
    } catch (error) {
      console.error('Erreur chargement manga:', error);
      setError('Erreur lors du chargement du manga');
    } finally {
      setLoading(false);
    }
  };

  // Charger les chapitres d'une saison (identique au site web)
  const loadSeasonChapters = async (season: MangaSeason, language: string = 'VF') => {
    try {
      setChaptersLoading(true);
      setSelectedSeason(season);
      setChapters([]);
      setCurrentChapter(null);
      
      const extractedId = mangaUrl.split('/').pop() || mangaUrl;
      console.log('Chargement chapitres pour:', extractedId, 'saison:', season.value);
      
      const response = await apiRequest(`/api/chapters/${extractedId}/${season.value}?language=${language}`);
      console.log('Chapitres reçus:', response);
      
      if (response && response.success && response.chapters) {
        const formattedChapters = response.chapters.map((chapter: any, index: number) => ({
          id: `${extractedId}-${season.value}-ch${chapter.number || index + 1}`,
          title: chapter.title || `Chapitre ${chapter.number || index + 1}`,
          number: chapter.number || index + 1,
          url: chapter.url || `https://anime-sama.fr/catalogue/${extractedId}/${season.value}/scan/${chapter.number || index + 1}`,
          pages: chapter.pages || [],
          available: chapter.available !== false,
          language: language
        }));
        
        setChapters(formattedChapters);
        console.log('Chapitres formatés:', formattedChapters.length);
      } else {
        console.warn('Aucun chapitre trouvé dans la réponse API');
        setError('Aucun chapitre disponible pour cette saison');
      }
    } catch (error) {
      console.error('Erreur chargement chapitres:', error);
      setError('Erreur lors du chargement des chapitres');
    } finally {
      setChaptersLoading(false);
    }
  };

  // Charger les pages d'un chapitre (identique au site web)
  const loadChapterPages = async (chapter: MangaChapter) => {
    try {
      setPagesLoading(true);
      setCurrentChapter(chapter);
      setCurrentPages([]);
      setCurrentPageIndex(0);
      
      console.log('Chargement pages du chapitre:', chapter.number);
      
      const response = await apiRequest(`/api/pages?url=${encodeURIComponent(chapter.url)}`);
      console.log('Pages reçues:', response);
      
      if (response && response.success && response.pages && response.pages.length > 0) {
        setCurrentPages(response.pages);
        console.log('Pages chargées:', response.pages.length, 'pages disponibles');
      } else {
        console.warn('Aucune page trouvée dans la réponse API');
        // Fallback avec pages de démonstration
        const demoPages = [
          'https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=Page+1+-+API+en+developpement',
          'https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=Page+2+-+API+en+developpement',
          'https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=Page+3+-+API+en+developpement'
        ];
        setCurrentPages(demoPages);
        setError('API pages manga en développement - pages de démonstration affichées');
      }
    } catch (error) {
      console.error('Erreur chargement pages:', error);
      setError('Erreur lors du chargement des pages');
    } finally {
      setPagesLoading(false);
    }
  };

  // Navigation entre les pages
  const goToNextPage = () => {
    if (currentPageIndex < currentPages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // Effet initial
  useEffect(() => {
    loadMangaData();
  }, [mangaUrl]);

  // Composant Header avec navigation
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {mangaTitle}
        </Text>
        {currentChapter && (
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Chapitre {currentChapter.number} • Page {currentPageIndex + 1}/{currentPages.length}
          </Text>
        )}
      </View>
    </View>
  );

  // Composant Lecteur de Pages
  const renderPageReader = () => {
    if (pagesLoading) {
      return (
        <View style={styles.readerContainer}>
          <ActivityIndicator size="large" color="#00ffff" />
          <Text style={styles.loadingText}>Chargement des pages...</Text>
        </View>
      );
    }

    if (currentPages.length === 0) {
      return (
        <View style={styles.readerContainer}>
          <Ionicons name="book" size={64} color="#6b7280" />
          <Text style={styles.placeholderText}>
            Sélectionnez un chapitre pour commencer la lecture
          </Text>
          <Text style={styles.apiNoticeText}>
            📖 L'API pour les pages de manga sera bientôt disponible
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.readerContainer}>
        <TouchableOpacity
          style={styles.pageContainer}
          onPress={goToNextPage}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: currentPages[currentPageIndex] }}
            style={styles.mangaPage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        {/* Contrôles de navigation */}
        <View style={styles.pageControls}>
          <TouchableOpacity
            style={[styles.navButton, currentPageIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPrevPage}
            disabled={currentPageIndex === 0}
          >
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.pageIndicator}>
            {currentPageIndex + 1} / {currentPages.length}
          </Text>
          
          <TouchableOpacity
            style={[styles.navButton, currentPageIndex === currentPages.length - 1 && styles.navButtonDisabled]}
            onPress={goToNextPage}
            disabled={currentPageIndex === currentPages.length - 1}
          >
            <Ionicons name="chevron-forward" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Composant Sélecteur de Saisons
  const renderSeasonSelector = () => {
    if (seasons.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="library" size={20} color="#00ffff" />
          <Text style={styles.sectionTitle}>
            Saisons disponibles ({seasons.length})
          </Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.seasonsContainer}>
            {seasons.map((season, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.seasonButton,
                  selectedSeason?.value === season.value && styles.seasonButtonActive
                ]}
                onPress={() => loadSeasonChapters(season)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.seasonButtonText,
                  selectedSeason?.value === season.value && styles.seasonButtonTextActive
                ]}>
                  {season.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Composant Liste des Chapitres
  const renderChaptersList = () => {
    if (chapters.length === 0 && !chaptersLoading) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="#00ffff" />
            <Text style={styles.sectionTitle}>Chapitres</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={48} color="#374151" />
            <Text style={styles.emptyText}>Aucun chapitre disponible</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text" size={20} color="#00ffff" />
          <Text style={styles.sectionTitle}>
            Chapitres ({chapters.length})
          </Text>
        </View>
        
        {chaptersLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ffff" />
            <Text style={styles.loadingText}>Chargement des chapitres...</Text>
          </View>
        ) : (
          <View style={styles.chaptersGrid}>
            {chapters.map((chapter, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.chapterButton,
                  currentChapter?.number === chapter.number && styles.chapterButtonActive,
                  !chapter.available && styles.chapterButtonDisabled
                ]}
                onPress={() => chapter.available ? loadChapterPages(chapter) : null}
                disabled={!chapter.available}
                activeOpacity={0.8}
              >
                <View style={styles.chapterButtonContent}>
                  <View style={styles.chapterIcon}>
                    <Ionicons 
                      name={chapter.available ? "document-text" : "lock-closed"} 
                      size={16} 
                      color={
                        currentChapter?.number === chapter.number 
                          ? "#ffffff" 
                          : chapter.available 
                            ? "#00ffff" 
                            : "#6b7280"
                      } 
                    />
                  </View>
                  
                  <View style={styles.chapterInfo}>
                    <Text style={[
                      styles.chapterNumber,
                      currentChapter?.number === chapter.number && styles.chapterNumberActive,
                      !chapter.available && styles.chapterNumberDisabled
                    ]}>
                      Chapitre {chapter.number}
                    </Text>
                    
                    {chapter.title && (
                      <Text style={[
                        styles.chapterTitle,
                        currentChapter?.number === chapter.number && styles.chapterTitleActive,
                        !chapter.available && styles.chapterTitleDisabled
                      ]} numberOfLines={1}>
                        {chapter.title}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // État de chargement
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ffff" />
          <Text style={styles.loadingText}>Chargement du manga...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" backgroundColor="#0a0a0a" />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMangaData}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
      
      <View style={styles.content}>
        {renderHeader()}
        
        {currentPages.length > 0 ? (
          renderPageReader()
        ) : (
          <ScrollView 
            style={styles.controlsScrollView}
            showsVerticalScrollIndicator={false}
          >
            {renderSeasonSelector()}
            {renderChaptersList()}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(10,10,10,0.95)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  readerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  pageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mangaPage: {
    width: width,
    height: height * 0.8,
  },
  pageControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
  },
  navButton: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  pageIndicator: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  apiNoticeText: {
    color: '#9ca3af',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  controlsScrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  seasonsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  seasonButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  seasonButtonActive: {
    backgroundColor: '#00ffff',
    borderColor: '#00ffff',
  },
  seasonButtonText: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: '600',
  },
  seasonButtonTextActive: {
    color: '#ffffff',
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chapterButton: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
  },
  chapterButtonActive: {
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderColor: '#00ffff',
  },
  chapterButtonDisabled: {
    opacity: 0.5,
    borderColor: 'rgba(107,114,128,0.2)',
  },
  chapterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  chapterIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chapterNumberActive: {
    color: '#00ffff',
  },
  chapterNumberDisabled: {
    color: '#6b7280',
  },
  chapterTitle: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  chapterTitleActive: {
    color: '#d1d5db',
  },
  chapterTitleDisabled: {
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default MangaReaderScreen;