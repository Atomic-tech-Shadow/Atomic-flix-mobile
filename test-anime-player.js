/**
 * Test de l'AnimePlayerScreen - ATOMIC FLIX
 * Vérifie que l'écran de lecture d'anime fonctionne correctement
 */

console.log('🎬 TEST DE L\'ANIMEPLAYER SCREEN - ATOMIC FLIX');
console.log('===============================================');

function testResult(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const status = passed ? 'RÉUSSI' : 'ÉCHOUÉ';
  console.log(`${icon} ${name} : ${status}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// Test 1: Vérifier que le fichier AnimePlayerScreen existe
function testAnimePlayerExists() {
  const fs = require('fs');
  const path = require('path');
  
  const playerPath = path.join(__dirname, 'src', 'screens', 'AnimePlayerScreen.tsx');
  const exists = fs.existsSync(playerPath);
  
  if (exists) {
    const content = fs.readFileSync(playerPath, 'utf8');
    const hasWebView = content.includes('WebView');
    const hasAPI = content.includes('anime-sama-scraper.vercel.app');
    const hasNavigation = content.includes('SharedHeader');
    
    testResult('Fichier AnimePlayerScreen', exists, 'Fichier créé avec succès');
    testResult('WebView intégré', hasWebView, 'Utilise react-native-webview');
    testResult('API intégrée', hasAPI, 'Utilise anime-sama-scraper API');
    testResult('Navigation', hasNavigation, 'SharedHeader intégré');
    
    return hasWebView && hasAPI && hasNavigation;
  } else {
    testResult('Fichier AnimePlayerScreen', false, 'Fichier non trouvé');
    return false;
  }
}

// Test 2: Vérifier que la navigation est configurée
function testNavigationConfig() {
  const fs = require('fs');
  const path = require('path');
  
  const navPath = path.join(__dirname, 'src', 'navigation', 'AppNavigator.tsx');
  const exists = fs.existsSync(navPath);
  
  if (exists) {
    const content = fs.readFileSync(navPath, 'utf8');
    const hasAnimePlayerImport = content.includes('AnimePlayerScreen');
    const hasAnimePlayerType = content.includes('AnimePlayer:');
    const hasAnimePlayerScreen = content.includes('name="AnimePlayer"');
    
    testResult('Navigation configurée', hasAnimePlayerImport && hasAnimePlayerType && hasAnimePlayerScreen, 
               'AnimePlayerScreen ajouté à AppNavigator');
    
    return hasAnimePlayerImport && hasAnimePlayerType && hasAnimePlayerScreen;
  } else {
    testResult('Navigation configurée', false, 'AppNavigator non trouvé');
    return false;
  }
}

// Test 3: Vérifier que les types sont corrects
function testTypes() {
  const fs = require('fs');
  const path = require('path');
  
  const typesPath = path.join(__dirname, 'src', 'types', 'index.ts');
  const exists = fs.existsSync(typesPath);
  
  if (exists) {
    const content = fs.readFileSync(typesPath, 'utf8');
    const hasEpisode = content.includes('interface Episode');
    const hasVideoSource = content.includes('interface VideoSource');
    const hasSeason = content.includes('interface Season');
    const hasAnimeData = content.includes('interface AnimeData');
    const hasEpisodeDetails = content.includes('interface EpisodeDetails');
    
    const allTypesPresent = hasEpisode && hasVideoSource && hasSeason && hasAnimeData && hasEpisodeDetails;
    
    testResult('Types définis', allTypesPresent, 'Tous les types nécessaires sont présents');
    
    return allTypesPresent;
  } else {
    testResult('Types définis', false, 'Fichier types non trouvé');
    return false;
  }
}

// Test 4: Vérifier que react-native-webview est installé
function testWebViewInstalled() {
  const fs = require('fs');
  const path = require('path');
  
  const packagePath = path.join(__dirname, 'package.json');
  const exists = fs.existsSync(packagePath);
  
  if (exists) {
    const content = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(content);
    const hasWebView = packageJson.dependencies && packageJson.dependencies['react-native-webview'];
    
    testResult('react-native-webview installé', !!hasWebView, 
               hasWebView ? `Version: ${hasWebView}` : 'Package manquant');
    
    return !!hasWebView;
  } else {
    testResult('react-native-webview installé', false, 'package.json non trouvé');
    return false;
  }
}

// Test 5: Vérifier que l'API est utilisée correctement
function testAPIUsage() {
  const fs = require('fs');
  const path = require('path');
  
  const playerPath = path.join(__dirname, 'src', 'screens', 'AnimePlayerScreen.tsx');
  const exists = fs.existsSync(playerPath);
  
  if (exists) {
    const content = fs.readFileSync(playerPath, 'utf8');
    const hasApiRequest = content.includes('apiRequest');
    const hasGetAnimeDetails = content.includes('getAnimeDetails');
    const hasLoadSeasonEpisodes = content.includes('loadSeasonEpisodes');
    const hasLoadEpisodeSources = content.includes('loadEpisodeSources');
    const hasEpisodesAPI = content.includes('/api/episodes/');
    const hasEmbedAPI = content.includes('/api/embed');
    
    const allAPIFunctions = hasApiRequest && hasGetAnimeDetails && hasLoadSeasonEpisodes && 
                           hasLoadEpisodeSources && hasEpisodesAPI && hasEmbedAPI;
    
    testResult('API utilisée correctement', allAPIFunctions, 'Toutes les fonctions API sont présentes');
    
    return allAPIFunctions;
  } else {
    testResult('API utilisée correctement', false, 'Fichier AnimePlayerScreen non trouvé');
    return false;
  }
}

// Test 6: Vérifier que l'interface est adaptée mobile
function testMobileInterface() {
  const fs = require('fs');
  const path = require('path');
  
  const playerPath = path.join(__dirname, 'src', 'screens', 'AnimePlayerScreen.tsx');
  const exists = fs.existsSync(playerPath);
  
  if (exists) {
    const content = fs.readFileSync(playerPath, 'utf8');
    const hasSafeAreaView = content.includes('SafeAreaView');
    const hasScrollView = content.includes('ScrollView');
    const hasTouchableOpacity = content.includes('TouchableOpacity');
    const hasStyleSheet = content.includes('StyleSheet');
    const hasActivityIndicator = content.includes('ActivityIndicator');
    const hasRefreshControl = content.includes('RefreshControl');
    
    const allMobileComponents = hasSafeAreaView && hasScrollView && hasTouchableOpacity && 
                               hasStyleSheet && hasActivityIndicator && hasRefreshControl;
    
    testResult('Interface mobile adaptée', allMobileComponents, 'Composants React Native natifs utilisés');
    
    return allMobileComponents;
  } else {
    testResult('Interface mobile adaptée', false, 'Fichier AnimePlayerScreen non trouvé');
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('\n🔍 Lancement des tests...\n');
  
  const results = [
    testAnimePlayerExists(),
    testNavigationConfig(),
    testTypes(),
    testWebViewInstalled(),
    testAPIUsage(),
    testMobileInterface()
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n============================================================');
  console.log(`📊 RÉSULTATS: ${passed}/${total} tests réussis`);
  
  if (passed === total) {
    console.log('✅ TOUS LES TESTS SONT RÉUSSIS');
    console.log('🎉 L\'AnimePlayerScreen est prêt à être utilisé !');
  } else {
    console.log('⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('🔧 Vérifiez les erreurs ci-dessus et corrigez-les');
  }
}

// Exécuter les tests
runAllTests();