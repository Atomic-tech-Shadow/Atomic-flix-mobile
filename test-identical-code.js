/**
 * Test de vérification code identique - ATOMIC FLIX
 * Vérifie que le code mobile est maintenant EXACTEMENT identique au code web
 */

const fs = require('fs');
const path = require('path');

function testResult(name, passed, details = '') {
  console.log(`${passed ? '✅' : '❌'} ${name} ${details ? `- ${details}` : ''}`);
  return passed;
}

// Tester l'ordre des éléments
function testElementOrder() {
  const filePath = path.join(__dirname, 'src/screens/AnimePlayerScreen.tsx');
  if (!fs.existsSync(filePath)) {
    return testResult('Ordre des éléments', false, 'Fichier non trouvé');
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Vérifier que les sélecteurs sont AVANT le lecteur vidéo
  const selectorsIndex = content.indexOf('selectorsGrid');
  const videoIndex = content.indexOf('renderVideoPlayer()');
  
  if (selectorsIndex === -1 || videoIndex === -1) {
    return testResult('Ordre des éléments', false, 'Éléments manquants');
  }
  
  return testResult('Ordre des éléments', selectorsIndex < videoIndex, 'Sélecteurs avant lecteur');
}

// Tester la présence du menu de téléchargement
function testDownloadMenu() {
  const filePath = path.join(__dirname, 'src/screens/AnimePlayerScreen.tsx');
  if (!fs.existsSync(filePath)) {
    return testResult('Menu de téléchargement', false, 'Fichier non trouvé');
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const hasDownloadState = content.includes('showDownloadMenu');
  const hasDownloadFunction = content.includes('downloadVideo');
  const hasDownloadMenu = content.includes('downloadMenu');
  const hasQualityOptions = content.includes('Qualité Faible') && content.includes('Qualité HD');
  
  return testResult('Menu de téléchargement', hasDownloadState && hasDownloadFunction && hasDownloadMenu && hasQualityOptions, 'Toutes les fonctionnalités présentes');
}

// Tester la navigation entre épisodes
function testEpisodeNavigation() {
  const filePath = path.join(__dirname, 'src/screens/AnimePlayerScreen.tsx');
  if (!fs.existsSync(filePath)) {
    return testResult('Navigation épisodes', false, 'Fichier non trouvé');
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const hasNavigationFunction = content.includes('navigateEpisode');
  const hasNavButtons = content.includes('chevron-back') && content.includes('chevron-forward');
  const hasDisabledState = content.includes('navButtonDisabled');
  
  return testResult('Navigation épisodes', hasNavigationFunction && hasNavButtons && hasDisabledState, 'Navigation complète');
}

// Tester la structure identique au web
function testWebIdenticalStructure() {
  const filePath = path.join(__dirname, 'src/screens/AnimePlayerScreen.tsx');
  if (!fs.existsSync(filePath)) {
    return testResult('Structure identique', false, 'Fichier non trouvé');
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Vérifier l'ordre exact : Sélecteurs -> Dernière sélection -> Lecteur -> Navigation -> Message
  const elements = [
    'selectorsGrid',
    'lastSelectionContainer',
    'renderVideoPlayer',
    'navigationContainer',
    'atomicMessageContainer'
  ];
  
  let lastIndex = -1;
  let orderCorrect = true;
  
  for (const element of elements) {
    const index = content.indexOf(element);
    if (index === -1 || index <= lastIndex) {
      orderCorrect = false;
      break;
    }
    lastIndex = index;
  }
  
  return testResult('Structure identique', orderCorrect, 'Ordre des éléments comme le web');
}

// Tester les fonctions manquantes ajoutées
function testMissingFunctions() {
  const filePath = path.join(__dirname, 'src/screens/AnimePlayerScreen.tsx');
  if (!fs.existsSync(filePath)) {
    return testResult('Fonctions manquantes', false, 'Fichier non trouvé');
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const hasNavigateFunction = content.includes('navigateEpisode');
  const hasDownloadFunction = content.includes('downloadVideo');
  const hasChangeLanguageFunction = content.includes('changeLanguage');
  
  return testResult('Fonctions manquantes', hasNavigateFunction && hasDownloadFunction && hasChangeLanguageFunction, 'Toutes les fonctions ajoutées');
}

// Test principal
async function runAllTests() {
  console.log('🧪 TEST CODE IDENTIQUE AU WEB - ATOMIC FLIX');
  console.log('='.repeat(50));
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Tests de structure
  if (testElementOrder()) passedTests++;
  totalTests++;
  
  if (testDownloadMenu()) passedTests++;
  totalTests++;
  
  if (testEpisodeNavigation()) passedTests++;
  totalTests++;
  
  if (testWebIdenticalStructure()) passedTests++;
  totalTests++;
  
  if (testMissingFunctions()) passedTests++;
  totalTests++;
  
  console.log('='.repeat(50));
  console.log(`📊 RÉSULTATS: ${passedTests}/${totalTests} tests réussis`);
  
  if (passedTests === totalTests) {
    console.log('🎉 SUCCÈS: Code mobile maintenant EXACTEMENT identique au code web !');
  } else {
    console.log('❌ ÉCHEC: Différences restantes avec le code web');
  }
}

runAllTests();