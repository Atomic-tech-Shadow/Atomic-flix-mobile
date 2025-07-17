/**
 * Test de comparaison des dropdowns - ATOMIC FLIX
 * Vérifie que les dropdowns React Native correspondent exactement au code web
 */

const fs = require('fs');
const path = require('path');

function testResult(name, passed, details = '') {
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

function testWebDropdowns() {
  console.log('\n🌐 ANALYSE DES DROPDOWNS WEB');
  
  // Lire le fichier web
  const webFile = path.join(__dirname, 'attached_assets', 'anime-player_1752707514026.tsx');
  
  if (!fs.existsSync(webFile)) {
    testResult('Fichier web trouvé', false, 'Fichier web non trouvé');
    return false;
  }
  
  const webContent = fs.readFileSync(webFile, 'utf8');
  
  // Test 1: Grille 2 colonnes
  const hasGrid2Cols = webContent.includes('grid-cols-2');
  testResult('Grille 2 colonnes', hasGrid2Cols, 'grid-cols-2 détecté');
  
  // Test 2: Labels des épisodes
  const hasEpisodeLabel = webContent.includes('ÉPISODE {episode.episodeNumber}');
  testResult('Label épisode', hasEpisodeLabel, 'ÉPISODE {episode.episodeNumber} détecté');
  
  // Test 3: Labels des serveurs
  const hasServerLabel = webContent.includes('{source.server} ({source.quality})');
  testResult('Label serveur', hasServerLabel, '{source.server} ({source.quality}) détecté');
  
  // Test 4: Styles des dropdowns
  const hasDropdownStyles = webContent.includes('bg-gray-800 text-white px-4 py-3 rounded-lg');
  testResult('Styles dropdown', hasDropdownStyles, 'Styles CSS détectés');
  
  return hasGrid2Cols && hasEpisodeLabel && hasServerLabel && hasDropdownStyles;
}

function testReactNativeDropdowns() {
  console.log('\n📱 ANALYSE DES DROPDOWNS REACT NATIVE');
  
  // Lire le fichier React Native
  const mobileFile = path.join(__dirname, 'src', 'screens', 'AnimePlayerScreen.tsx');
  
  if (!fs.existsSync(mobileFile)) {
    testResult('Fichier mobile trouvé', false, 'Fichier mobile non trouvé');
    return false;
  }
  
  const mobileContent = fs.readFileSync(mobileFile, 'utf8');
  
  // Test 1: Grille 2 colonnes (React Native)
  const hasSelectorsGrid = mobileContent.includes('selectorsGrid');
  testResult('Grille sélecteurs', hasSelectorsGrid, 'selectorsGrid détecté');
  
  // Test 2: Labels des épisodes identiques
  const hasEpisodeLabel = mobileContent.includes('ÉPISODE ${episode.episodeNumber}');
  testResult('Label épisode identique', hasEpisodeLabel, 'ÉPISODE ${episode.episodeNumber} détecté');
  
  // Test 3: Labels des serveurs identiques
  const hasServerLabel = mobileContent.includes('${source.server} (${source.quality})');
  testResult('Label serveur identique', hasServerLabel, '${source.server} (${source.quality}) détecté');
  
  // Test 4: Picker React Native
  const hasPicker = mobileContent.includes('<Picker');
  testResult('Picker React Native', hasPicker, '<Picker détecté');
  
  // Test 5: Deux sélecteurs
  const selectorHalfCount = (mobileContent.match(/selectorHalf/g) || []).length;
  testResult('Deux sélecteurs', selectorHalfCount >= 2, `${selectorHalfCount} sélecteurs détectés`);
  
  return hasSelectorsGrid && hasEpisodeLabel && hasServerLabel && hasPicker && selectorHalfCount >= 2;
}

function testFunctionalEquivalence() {
  console.log('\n🔄 TEST D\'ÉQUIVALENCE FONCTIONNELLE');
  
  // Test 1: Même logique de sélection
  const webFile = path.join(__dirname, 'attached_assets', 'anime-player_1752707514026.tsx');
  const mobileFile = path.join(__dirname, 'src', 'screens', 'AnimePlayerScreen.tsx');
  
  if (!fs.existsSync(webFile) || !fs.existsSync(mobileFile)) {
    testResult('Fichiers disponibles', false, 'Un ou plusieurs fichiers manquants');
    return false;
  }
  
  const webContent = fs.readFileSync(webFile, 'utf8');
  const mobileContent = fs.readFileSync(mobileFile, 'utf8');
  
  // Test onChange episode
  const webOnChange = webContent.includes('setSelectedEpisode(episode)');
  const mobileOnChange = mobileContent.includes('setSelectedEpisode(episode)');
  testResult('Logique onChange épisode', webOnChange && mobileOnChange, 'setSelectedEpisode() identique');
  
  // Test onChange serveur
  const webServerChange = webContent.includes('setSelectedPlayer(parseInt(e.target.value))');
  const mobileServerChange = mobileContent.includes('setSelectedPlayer(parseInt(itemValue))');
  testResult('Logique onChange serveur', webServerChange && mobileServerChange, 'setSelectedPlayer() équivalent');
  
  // Test loadEpisodeSources
  const webLoadSources = webContent.includes('loadEpisodeSources(episode)');
  const mobileLoadSources = mobileContent.includes('loadEpisodeSources(episode)');
  testResult('Chargement sources', webLoadSources && mobileLoadSources, 'loadEpisodeSources() identique');
  
  return webOnChange && mobileOnChange && webServerChange && mobileServerChange && webLoadSources && mobileLoadSources;
}

function testUILabels() {
  console.log('\n🏷️ TEST DES LABELS UI');
  
  const mobileFile = path.join(__dirname, 'src', 'screens', 'AnimePlayerScreen.tsx');
  
  if (!fs.existsSync(mobileFile)) {
    testResult('Fichier mobile disponible', false, 'Fichier mobile non trouvé');
    return false;
  }
  
  const mobileContent = fs.readFileSync(mobileFile, 'utf8');
  
  // Test des labels exacts
  const labels = [
    'ÉPISODE ${episode.episodeNumber}',
    '${source.server} (${source.quality})',
    'DERNIÈRE SÉLECTION',
    'I AM ATOMIC'
  ];
  
  let allLabelsFound = true;
  labels.forEach(label => {
    const found = mobileContent.includes(label);
    testResult(`Label "${label}"`, found, found ? 'Trouvé' : 'Manquant');
    if (!found) allLabelsFound = false;
  });
  
  return allLabelsFound;
}

async function runAllTests() {
  console.log('🧪 TEST DE COMPARAISON DES DROPDOWNS - ATOMIC FLIX');
  console.log('=====================================================');
  
  const webTest = testWebDropdowns();
  const mobileTest = testReactNativeDropdowns();
  const functionalTest = testFunctionalEquivalence();
  const labelsTest = testUILabels();
  
  console.log('\n📊 RÉSULTATS FINAUX');
  console.log('===================');
  
  testResult('Dropdowns web', webTest, 'Structure et styles corrects');
  testResult('Dropdowns mobile', mobileTest, 'Picker React Native configuré');
  testResult('Équivalence fonctionnelle', functionalTest, 'Logique identique');
  testResult('Labels UI', labelsTest, 'Tous les labels présents');
  
  const allPassed = webTest && mobileTest && functionalTest && labelsTest;
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 TOUS LES TESTS PASSÉS !');
    console.log('✅ Les dropdowns mobile sont identiques au web');
    console.log('✅ Grille 2 colonnes implémentée');
    console.log('✅ Labels et fonctionnalités identiques');
  } else {
    console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('🔧 Vérifier les implémentations');
  }
  
  return allPassed;
}

// Exécuter tous les tests
runAllTests();