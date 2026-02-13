import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import OptimizedScrollView from '../components/OptimizedScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { SearchResult } from '../types/index';
import type { RootStackParamList, DrawerParamList } from '../navigation/AppNavigator';
import { getThemedTextStyles } from '../constants/newColors';
import { useTheme } from '../contexts/ThemeContext';
import SharedHeader from '../components/SharedHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { animeAPI } from '../utils/animeAPI';
import { apiRequest } from '../utils/api';
import { useNotifications } from '../hooks/useNotifications';

type AnimeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimeDetail'> & DrawerNavigationProp<DrawerParamList>;
type AnimeDetailScreenRouteProp = RouteProp<RootStackParamList, 'AnimeDetail'>;

const { width, height } = Dimensions.get('window');

interface Season {
  number: number;
  name: string;
  value: string;
  languages: string[];
  episodeCount: number;
  url: string;
  available: boolean;
}

interface AnimeData {
  id: string;
  title: string;
  synopsis: string;
  image: string;
  genres: string[];
  status: string;
  progressInfo: string;
  correspondence: string;
  year: string;
  seasons: Season[];
  url: string;
}

const AnimeDetailScreen: React.FC = () => {
  const navigation = useNavigation<AnimeDetailScreenNavigationProp>();
  const route = useRoute<AnimeDetailScreenRouteProp>();
  const { animeUrl, animeTitle } = route.params;

  const [animeData, setAnimeData] = useState<AnimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  const { unreadCount } = useNotifications();
  const { isDark, colors } = useTheme();
  const COLORS = colors;
  const textStyles = getThemedTextStyles(isDark);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.primary,
    },
    scrollView: {
      flex: 1,
    },
    heroContainer: {
      position: 'relative',
      height: height * 0.45,
      backgroundColor: COLORS.primary,
    },
    heroImageContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroImage: {
      width: '100%',
      height: '100%',
    },
    heroGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100%',
    },
    heroContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.text.primaryBold,
      marginBottom: 12,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10,
    },
    heroBadgesCompact: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    heroBadgeSmall: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    },
    badgeDotSmall: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.accent,
      marginRight: 6,
    },
    badgeTextSmall: {
      color: COLORS.text.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    mobileSection: {
      padding: 20,
    },
    mobileSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    mobileSectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.text.primary,
      marginLeft: 10,
    },
    synopsisContainer: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      borderRadius: 20,
      padding: 20,
      borderWidth: 1.5,
      borderColor: COLORS.border.card,
    },
    synopsisText: {
      color: COLORS.text.primary,
      fontSize: 15,
      lineHeight: 24,
    },
    seasonsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginTop: 8,
      paddingBottom: 20,
    },
    seasonCard: {
      width: (width - 56) / 2,
      height: 160,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: COLORS.background.card,
      borderWidth: 1,
      borderColor: COLORS.border.card,
      marginBottom: 4,
    },
    seasonCardContent: {
      flex: 1,
      padding: 16,
      justifyContent: 'flex-end',
    },
    seasonCardGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '100%',
    },
    seasonCardTitle: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 6,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    seasonCardEpisode: {
      color: COLORS.secondary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    seasonCardBadgeManga: {
      color: COLORS.badges.manga,
      fontSize: 10,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
      paddingHorizontal: 32,
    },
    errorText: {
      color: COLORS.error,
      marginTop: 16,
      marginBottom: 24,
      textAlign: 'center',
      fontSize: 16,
    },
    retryButton: {
      backgroundColor: COLORS.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryText: {
      color: COLORS.text.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    searchBarContainer: {
      padding: 16,
      backgroundColor: COLORS.primary,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    searchInput: {
      flex: 1,
      color: COLORS.text.primary,
      fontSize: 16,
      marginLeft: 12,
    },
    clearSearchButton: {
      padding: 4,
    },
    clearSearchText: {
      color: COLORS.text.muted,
      fontSize: 18,
    },
    loadingSearchContainer: {
      padding: 20,
      alignItems: 'center',
    },
    searchResultsGrid: {
      padding: 16,
    },
    emptySearchContainer: {
      padding: 20,
      alignItems: 'center',
    },
    emptySearchText: {
      color: COLORS.text.muted,
      fontSize: 14,
    }
  });

  const loadAnimeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const animeId = animeUrl.split('/').pop() || animeUrl;
      const apiResponse = await animeAPI.getDetails(animeId);
      if (!apiResponse || !apiResponse.success) {
        throw new Error(apiResponse?.error || 'Anime non trouvé');
      }
      setAnimeData(apiResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const goToPlayer = async (season: Season) => {
    if (!animeUrl || !animeData) return;
    navigation.navigate('AnimePlayer', {
      animeUrl: animeUrl,
      seasonData: season,
      animeTitle: animeTitle
    });
  };

  useEffect(() => {
    if (animeUrl) loadAnimeData();
  }, [animeUrl]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimeData();
    setRefreshing(false);
  };

  const handleSearchPress = () => {
    setShowSearchBar(!showSearchBar);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (loading && !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Chargement..." size="large" color={COLORS.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !animeData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAnimeData}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!animeData) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {showSearchBar && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.secondary} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher..."
              placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"}
              autoFocus
            />
            <TouchableOpacity onPress={() => setShowSearchBar(false)} style={styles.clearSearchButton}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <SharedHeader 
        onSearchPress={handleSearchPress}
        onMenuPress={() => navigation.openDrawer()}
      />

      <OptimizedScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
      >

        <View style={styles.heroContainer}>
          <View style={styles.heroImageContainer}>
            <Image source={{ uri: animeData.image }} style={styles.heroImage} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(15, 15, 15, 0.5)', COLORS.primary]} style={styles.heroGradient} />
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle} numberOfLines={2}>{animeData.title}</Text>
            <View style={styles.heroBadgesCompact}>
              {animeData.year && (
                <View style={styles.heroBadgeSmall}>
                  <View style={styles.badgeDotSmall} />
                  <Text style={styles.badgeTextSmall}>{animeData.year}</Text>
                </View>
              )}
              {animeData.status && (
                <View style={styles.heroBadgeSmall}>
                  <View style={[styles.badgeDotSmall, { backgroundColor: COLORS.secondary }]} />
                  <Text style={styles.badgeTextSmall}>{animeData.status}</Text>
                </View>
              )}
              {animeData.genres?.slice(0, 2).map((genre, idx) => (
                <View key={idx} style={styles.heroBadgeSmall}>
                  <View style={[styles.badgeDotSmall, { backgroundColor: '#A855F7' }]} />
                  <Text style={styles.badgeTextSmall}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.mobileSection}>
          <View style={styles.mobileSectionHeader}>
            <Ionicons name="information-circle" size={24} color={COLORS.accent} />
            <Text style={styles.mobileSectionTitle}>Synopsis</Text>
          </View>
          <View style={styles.synopsisContainer}>
            <Text style={styles.synopsisText}>{animeData.synopsis || "Aucun synopsis disponible."}</Text>
          </View>
        </View>

        <View style={[styles.mobileSection, { paddingTop: 0 }]}>
          <View style={styles.mobileSectionHeader}>
            <Ionicons name="list" size={24} color={COLORS.secondary} />
            <Text style={styles.mobileSectionTitle}>Saisons & Films</Text>
          </View>
          <View style={styles.seasonsGrid}>
            {animeData.seasons?.map((season, index) => (
              <TouchableOpacity key={index} style={styles.seasonCard} onPress={() => goToPlayer(season)}>
                <Image source={{ uri: animeData.image }} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']} style={styles.seasonCardGradient} />
                <View style={styles.seasonCardContent}>
                  <Text style={styles.seasonCardTitle} numberOfLines={2}>{season.name}</Text>
                  <Text style={styles.seasonCardEpisode}>
                    {season.episodeCount > 0 ? `${season.episodeCount} ÉPISODES` : 'DÉTAILS'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </OptimizedScrollView>
    </SafeAreaView>
  );
};

export default AnimeDetailScreen;
