import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';

type AnimePlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnimePlayer'>;
type AnimePlayerScreenRouteProp = RouteProp<RootStackParamList, 'AnimePlayer'>;

const { width, height } = Dimensions.get('window');

// Interfaces pour les épisodes et sources vidéo (identiques au site web)
interface Episode {
  id: string;
  title: string;
  episodeNumber: number;
  url: string;
  language: string;
  available: boolean;
  streamingSources?: VideoSource[];
}

interface VideoSource {
  url: string;
  server: string;
  quality: string;
  language: string;
  type: string;
  serverIndex: number;
}

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
  year: string;
  seasons: Season[];
  url: string;
}

interface EpisodeDetails {
  id: string;
  title: string;
  animeTitle: string;
  episodeNumber: number;
  sources: VideoSource[];
  availableServers: string[];
  url: string;
}

const AnimePlayerScreen: React.FC = () => {
  const navigation = useNavigation<AnimePlayerScreenNavigationProp>();
  const route = useRoute<AnimePlayerScreenRouteProp>();
  const { animeUrl, seasonData, animeTitle } = route.params;

  // États pour les données (simplifiées pour le design exact)
  const [selectedLanguage, setSelectedLanguage] = useState<'VO' | 'VF'>('VO');
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [selectedServer, setSelectedServer] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Header mobile exact comme le site ATOMIC FLIX
  const renderMobileHeader = () => (
    <View style={styles.mobileHeader}>
      <View style={styles.headerRow}>
        {/* Logo ATOMIC FLIX avec symbole atomique */}
        <View style={styles.logoSection}>
          <View style={styles.atomicIcon}>
            <View style={styles.atomicSymbolSmall}>
              <View style={styles.atomicCoreSmall} />
              <View style={[styles.atomicRingSmall, styles.ringSmall1]} />
            </View>
          </View>
          <Text style={styles.logoTextMobile}>
            <Text style={styles.atomicTextMobile}>ATOMIC</Text>
            <Text style={styles.flixTextMobile}>FLIX</Text>
          </Text>
        </View>

        {/* Icônes navigation droite */}
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="search" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="notifications" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="menu" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Hero Section avec image de fond et titre (exactement comme dans l'image)
  const renderHeroSection = () => (
    <View style={styles.heroContainer}>
      <Image
        source={{ uri: 'https://img.anime-sama.fr/catalogue/clevatess/cover.jpg' }}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(10,10,26,0.9)']}
        style={styles.heroGradient}
      />
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>Clevatess</Text>
        <Text style={styles.heroSubtitle}>SAISON 1</Text>
      </View>
    </View>
  );

  // Section sélecteurs de langue (comme dans l'image VO/VF)
  const renderLanguageSelectors = () => (
    <View style={styles.languageContainer}>
      <TouchableOpacity
        style={[styles.languageButton, selectedLanguage === 'VO' && styles.languageButtonActive]}
        onPress={() => setSelectedLanguage('VO')}
      >
        <Text style={[styles.languageText, selectedLanguage === 'VO' && styles.languageTextActive]}>VO</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.languageButton, selectedLanguage === 'VF' && styles.languageButtonActive]}
        onPress={() => setSelectedLanguage('VF')}
      >
        <Text style={[styles.languageText, selectedLanguage === 'VF' && styles.languageTextActive]}>VF</Text>
      </TouchableOpacity>
    </View>
  );

  // Dropdowns pour épisode et serveur (exactement comme dans l'image)
  const renderDropdowns = () => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.dropdownText}>ÉPISODE {selectedEpisode}</Text>
        <Ionicons name="chevron-down" size={20} color="#ffffff" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.dropdownText}>SERVER {selectedServer} (HD)</Text>
        <Ionicons name="chevron-down" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  // Section "Dernière sélection" 
  const renderLastSelection = () => (
    <View style={styles.lastSelectionContainer}>
      <Text style={styles.lastSelectionLabel}>DERNIÈRE SÉLECTION : ÉPISODE {selectedEpisode}</Text>
    </View>
  );

  // Lecteur vidéo avec message sandbox (exactement comme dans l'image)
  const renderVideoPlayer = () => (
    <View style={styles.videoPlayerContainer}>
      <View style={styles.videoPlayerHeader}>
        <Text style={styles.videoPlayerTitle}>Clevatess</Text>
        <Text style={styles.videoPlayerSubtitle}>Episode {selectedEpisode} • Server {selectedServer} • HD</Text>
      </View>
      
      <View style={styles.videoPlayerContent}>
        <Text style={styles.sandboxMessage}>
          This video is not{'\n'}
          available due to{'\n'}
          sandboxed iframe!
        </Text>
      </View>
      
      <View style={styles.videoControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.downloadButton}>
          <Ionicons name="download" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="chevron-forward" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a1a" />
      
      {/* Header mobile ATOMIC FLIX */}
      {renderMobileHeader()}
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(false)}
            colors={['#00bcd4']}
            tintColor="#00bcd4"
          />
        }
      >
        {/* Hero Section avec image de fond */}
        {renderHeroSection()}
        
        {/* Sélecteurs de langue VO/VF */}
        {renderLanguageSelectors()}
        
        {/* Dropdowns épisode et serveur */}
        {renderDropdowns()}
        
        {/* Section dernière sélection */}
        {renderLastSelection()}
        
        {/* Lecteur vidéo */}
        {renderVideoPlayer()}
        
        {/* Footer avec texte ATOMIC */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🔮I AM ATOMIC🔮</Text>
          <Text style={styles.footerSubtext}>Trop de pub? 3 Changez de lecteur.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header mobile ATOMIC FLIX (identique aux autres écrans)
  mobileHeader: {
    backgroundColor: '#0a0a1a',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 188, 212, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atomicIcon: {
    marginRight: 8,
  },
  atomicSymbolSmall: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  atomicCoreSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00bcd4',
  },
  atomicRingSmall: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#00bcd4',
  },
  ringSmall1: {
    transform: [{ rotate: '45deg' }],
  },
  logoTextMobile: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  atomicTextMobile: {
    color: '#ffffff',
  },
  flixTextMobile: {
    color: '#00bcd4',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  
  // Hero section avec image de fond
  heroContainer: {
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // Sélecteurs de langue VO/VF
  languageContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333366',
  },
  languageButtonActive: {
    backgroundColor: '#003d82',
    borderColor: '#00bcd4',
  },
  languageText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  languageTextActive: {
    color: '#ffffff',
  },
  
  // Dropdowns pour épisode et serveur
  dropdownContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00bcd4',
  },
  dropdownText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Section dernière sélection
  lastSelectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  lastSelectionLabel: {
    fontSize: 12,
    color: '#cccccc',
    fontWeight: '600',
  },
  
  // Lecteur vidéo
  videoPlayerContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333366',
    overflow: 'hidden',
  },
  videoPlayerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333366',
  },
  videoPlayerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  videoPlayerSubtitle: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4,
  },
  videoPlayerContent: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a1a',
  },
  sandboxMessage: {
    fontSize: 18,
    color: '#00bcd4',
    textAlign: 'center',
    fontWeight: '600',
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#1a1a2e',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#003d82',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Footer
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#cccccc',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AnimePlayerScreen;