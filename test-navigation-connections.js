/**
 * Test des connexions de navigation - ATOMIC FLIX
 * Vérifie que tous les écrans sont correctement connectés
 */

const fs = require('fs');
const path = require('path');

function testResult(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  const result = passed ? 'RÉUSSI' : 'ÉCHOUÉ';
  
  console.log(`${status} ${name} : ${result}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

function testAppNavigatorConfig() {
  console.log('🔍 Test de la configuration AppNavigator...');
  
  const navigatorPath = path.join(__dirname, 'src/navigation/AppNavigator.tsx');
  
  if (!fs.existsSync(navigatorPath)) {
    testResult('AppNavigator existe', false, 'Fichier manquant');
    return false;
  }
  
  const content = fs.readFileSync(navigatorPath, 'utf8');
  
  // Vérifier que AnimePlayerScreen est importé
  const hasImport = content.includes('import AnimePlayerScreen from');
  testResult('AnimePlayerScreen importé', hasImport, 'Import dans AppNavigator');
  
  // Vérifier que la route AnimePlayer existe
  const hasRoute = content.includes('name="AnimePlayer"');
  testResult('Route AnimePlayer configurée', hasRoute, 'Stack.Screen déclaré');
  
  // Vérifier les types de navigation
  const hasNavTypes = content.includes('AnimePlayer: { animeUrl: string; seasonData: Season; animeTitle: string }');
  testResult('Types de navigation AnimePlayer', hasNavTypes, 'RootStackParamList correct');
  
  // Vérifier que le composant est assigné
  const hasComponent = content.includes('component={AnimePlayerScreen}');
  testResult('Composant AnimePlayerScreen assigné', hasComponent, 'Component lié à la route');
  
  return hasImport && hasRoute && hasNavTypes && hasComponent;
}

function testHomeScreenConnections() {
  console.log('🔍 Test des connexions HomeScreen...');
  
  const homeScreenPath = path.join(__dirname, 'src/screens/HomeScreen.tsx');
  
  if (!fs.existsSync(homeScreenPath)) {
    testResult('HomeScreen existe', false, 'Fichier manquant');
    return false;
  }
  
  const content = fs.readFileSync(homeScreenPath, 'utf8');
  
  // Vérifier la navigation vers AnimeDetail
  const hasAnimeDetailNav = content.includes('navigation.navigate(\'AnimeDetail\'');
  testResult('Navigation Home → AnimeDetail', hasAnimeDetailNav, 'loadAnimeDetails fonction');
  
  // Vérifier les types de navigation
  const hasNavTypes = content.includes('StackNavigationProp<RootStackParamList');
  testResult('Types de navigation HomeScreen', hasNavTypes, 'Types corrects');
  
  // Vérifier que le onPress est connecté
  const hasOnPress = content.includes('onPress={() => loadAnimeDetails(anime.id');
  testResult('OnPress connecté', hasOnPress, 'Cartes anime cliquables');
  
  return hasAnimeDetailNav && hasNavTypes && hasOnPress;
}

function testAnimeDetailScreenConnections() {
  console.log('🔍 Test des connexions AnimeDetailScreen...');
  
  const animeDetailPath = path.join(__dirname, 'src/screens/AnimeDetailScreen.tsx');
  
  if (!fs.existsSync(animeDetailPath)) {
    testResult('AnimeDetailScreen existe', false, 'Fichier manquant');
    return false;
  }
  
  const content = fs.readFileSync(animeDetailPath, 'utf8');
  
  // Vérifier la navigation vers AnimePlayer
  const hasAnimePlayerNav = content.includes('navigation.navigate(\'AnimePlayer\'');
  testResult('Navigation AnimeDetail → AnimePlayer', hasAnimePlayerNav, 'goToPlayer fonction');
  
  // Vérifier les paramètres passés
  const hasCorrectParams = content.includes('animeUrl: animeUrl,') && 
                           content.includes('seasonData: season,') && 
                           content.includes('animeTitle: animeTitle');
  testResult('Paramètres corrects passés', hasCorrectParams, 'animeUrl, seasonData, animeTitle');
  
  // Vérifier que goToPlayer est appelé
  const hasGoToPlayerCall = content.includes('onPress={() => goToPlayer(season)}');
  testResult('goToPlayer appelé', hasGoToPlayerCall, 'OnPress des saisons');
  
  // Vérifier les types Season
  const hasSeasonTypes = content.includes('interface Season');
  testResult('Interface Season définie', hasSeasonTypes, 'Types corrects');
  
  return hasAnimePlayerNav && hasCorrectParams && hasGoToPlayerCall && hasSeasonTypes;
}

function testAnimePlayerScreenConnections() {
  console.log('🔍 Test des connexions AnimePlayerScreen...');
  
  const animePlayerPath = path.join(__dirname, 'src/screens/AnimePlayerScreen.tsx');
  
  if (!fs.existsSync(animePlayerPath)) {
    testResult('AnimePlayerScreen existe', false, 'Fichier manquant');
    return false;
  }
  
  const content = fs.readFileSync(animePlayerPath, 'utf8');
  
  // Vérifier que les paramètres sont récupérés
  const hasRouteParams = content.includes('route.params');
  testResult('Paramètres route récupérés', hasRouteParams, 'route.params utilisé');
  
  // Vérifier les types corrects
  const hasCorrectTypes = content.includes('AnimePlayerScreenRouteProp') && 
                         content.includes('AnimePlayerScreenNavigationProp');
  testResult('Types navigation corrects', hasCorrectTypes, 'Types AnimePlayer définis');
  
  // Vérifier SharedHeader
  const hasSharedHeader = content.includes('SharedHeader');
  testResult('SharedHeader intégré', hasSharedHeader, 'Header unifié');
  
  // Vérifier que animeUrl, seasonData et animeTitle sont utilisés
  const hasAnimeUrl = content.includes('animeUrl') && content.includes('seasonData') && content.includes('animeTitle');
  testResult('Paramètres utilisés', hasAnimeUrl, 'animeUrl, seasonData, animeTitle');
  
  return hasRouteParams && hasCorrectTypes && hasSharedHeader && hasAnimeUrl;
}

function testSharedHeaderConnections() {
  console.log('🔍 Test des connexions SharedHeader...');
  
  const sharedHeaderPath = path.join(__dirname, 'src/components/SharedHeader.tsx');
  
  if (!fs.existsSync(sharedHeaderPath)) {
    testResult('SharedHeader existe', false, 'Fichier manquant');
    return false;
  }
  
  const content = fs.readFileSync(sharedHeaderPath, 'utf8');
  
  // Vérifier la navigation dans SharedHeader
  const hasNavigation = content.includes('useNavigation');
  testResult('Navigation dans SharedHeader', hasNavigation, 'useNavigation hook');
  
  // Vérifier les types
  const hasNavTypes = content.includes('StackNavigationProp<RootStackParamList>');
  testResult('Types navigation SharedHeader', hasNavTypes, 'Types corrects');
  
  return hasNavigation && hasNavTypes;
}

async function runAllTests() {
  console.log('🔗 TEST DES CONNEXIONS DE NAVIGATION - ATOMIC FLIX');
  console.log('====================================================\n');
  
  const results = [
    testAppNavigatorConfig(),
    testHomeScreenConnections(),
    testAnimeDetailScreenConnections(),
    testAnimePlayerScreenConnections(),
    testSharedHeaderConnections()
  ];
  
  const passedTests = results.filter(r => r).length;
  const totalTests = results.length;
  
  console.log('\n============================================================');
  console.log(`📊 RÉSULTATS: ${passedTests}/${totalTests} tests réussis`);
  
  if (passedTests === totalTests) {
    console.log('✅ TOUTES LES CONNEXIONS SONT CORRECTES');
    console.log('🎉 La navigation entre les écrans fonctionne parfaitement !');
  } else {
    console.log('⚠️  CERTAINES CONNEXIONS ONT ÉCHOUÉ');
    console.log('🔧 Vérifiez les erreurs ci-dessus et corrigez-les');
  }
}

// Exécuter tous les tests
runAllTests();