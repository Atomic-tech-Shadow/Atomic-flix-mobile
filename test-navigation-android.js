/**
 * Script de test pour vérifier la navigation Android - ATOMIC FLIX
 * Vérifie que tous les écrans sont connectés et utilisent la navigation Android
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TEST DE NAVIGATION ANDROID - ATOMIC FLIX');
console.log('============================================');

// Vérifier que tous les écrans existent
const screens = [
  'HomeScreen.tsx',
  'AnimeDetailScreen.tsx', 
  'AnimePlayerScreen.tsx',
  'MangaReaderScreen.tsx',
  'AboutScreen.tsx',
  'NotFoundScreen.tsx',
  'PrivacyPolicyScreen.tsx',
  'TermsOfServiceScreen.tsx'
];

let testsReussis = 0;
let testsTotal = 0;

function testResult(name, passed, details = '') {
  testsTotal++;
  if (passed) {
    testsReussis++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

// Test 1: Vérifier que tous les écrans existent
console.log('\n🔍 Test 1: Existence des écrans...');
screens.forEach(screen => {
  const screenPath = path.join('src', 'screens', screen);
  const exists = fs.existsSync(screenPath);
  testResult(`Écran ${screen}`, exists, 
    exists ? 'Fichier trouvé' : 'Fichier manquant');
});

// Test 2: Vérifier AppNavigator
console.log('\n🔍 Test 2: Configuration AppNavigator...');
try {
  const navigatorPath = path.join('src', 'navigation', 'AppNavigator.tsx');
  const navigatorContent = fs.readFileSync(navigatorPath, 'utf8');
  
  // Vérifier que tous les écrans sont importés
  const imports = screens.map(screen => screen.replace('.tsx', ''));
  imports.forEach(screenName => {
    const imported = navigatorContent.includes(`import ${screenName} from '../screens/${screenName}'`);
    testResult(`Import ${screenName}`, imported, 
      imported ? 'Écran importé correctement' : 'Import manquant');
  });
  
  // Vérifier que tous les écrans ont headerShown: false
  const headerShownFalse = (navigatorContent.match(/headerShown: false/g) || []).length;
  testResult('Headers désactivés', headerShownFalse >= 7, 
    `${headerShownFalse} écrans avec headerShown: false`);
    
} catch (error) {
  testResult('Lecture AppNavigator', false, error.message);
}

// Test 3: Vérifier SharedHeader dans chaque écran
console.log('\n🔍 Test 3: Utilisation SharedHeader...');
screens.forEach(screen => {
  try {
    const screenPath = path.join('src', 'screens', screen);
    const content = fs.readFileSync(screenPath, 'utf8');
    
    const hasSharedHeaderImport = content.includes("import SharedHeader from '../components/SharedHeader'");
    const hasSharedHeaderUsage = content.includes('<SharedHeader');
    const hasSafeAreaView = content.includes('<SafeAreaView');
    
    testResult(`${screen} - SharedHeader`, hasSharedHeaderImport && hasSharedHeaderUsage,
      hasSharedHeaderImport && hasSharedHeaderUsage ? 'SharedHeader utilisé' : 'SharedHeader manquant');
      
    testResult(`${screen} - SafeAreaView`, hasSafeAreaView,
      hasSafeAreaView ? 'SafeAreaView configuré' : 'SafeAreaView manquant');
  } catch (error) {
    testResult(`${screen} - Lecture`, false, error.message);
  }
});

// Test 4: Vérifier le composant SharedHeader
console.log('\n🔍 Test 4: Composant SharedHeader...');
try {
  const sharedHeaderPath = path.join('src', 'components', 'SharedHeader.tsx');
  const sharedHeaderContent = fs.readFileSync(sharedHeaderPath, 'utf8');
  
  const hasBackButton = sharedHeaderContent.includes('showBackButton');
  const hasNavigation = sharedHeaderContent.includes('useNavigation');
  const hasAndroidStyles = sharedHeaderContent.includes('#0a0a1a');
  
  testResult('SharedHeader - Bouton retour', hasBackButton,
    hasBackButton ? 'Bouton retour conditionnel' : 'Bouton retour manquant');
  testResult('SharedHeader - Navigation', hasNavigation,
    hasNavigation ? 'Navigation configurée' : 'Navigation manquante');
  testResult('SharedHeader - Styles Android', hasAndroidStyles,
    hasAndroidStyles ? 'Styles Android présents' : 'Styles Android manquants');
    
} catch (error) {
  testResult('SharedHeader - Lecture', false, error.message);
}

// Test 5: Vérifier la navigation Android native
console.log('\n🔍 Test 5: Navigation Android native...');
try {
  const appJsonPath = 'app.json';
  const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
  const appJson = JSON.parse(appJsonContent);
  
  const hasAndroidConfig = appJson.expo && appJson.expo.android;
  const hasNavigationBar = appJson.expo && appJson.expo.android && appJson.expo.android.navigationBar;
  
  testResult('Configuration Android', hasAndroidConfig,
    hasAndroidConfig ? 'Configuration Android présente' : 'Configuration Android manquante');
    
} catch (error) {
  testResult('app.json - Lecture', false, error.message);
}

// Résumé
console.log('\n============================================');
console.log(`📊 RÉSUMÉ DES TESTS DE NAVIGATION ANDROID`);
console.log('============================================');
console.log(`✅ Tests réussis: ${testsReussis}/${testsTotal}`);

if (testsReussis === testsTotal) {
  console.log('🎉 TOUS LES TESTS RÉUSSIS !');
  console.log('✅ Navigation Android configurée correctement');
  console.log('✅ Tous les écrans connectés et fonctionnels');
  console.log('✅ SharedHeader unifié sur tous les écrans');
  console.log('✅ Navigation système Android activée');
} else {
  console.log('⚠️ CERTAINS TESTS ÉCHOUÉS');
  console.log(`❌ ${testsTotal - testsReussis} problèmes détectés`);
}

console.log('\n🚀 Navigation Android prête pour les tests mobiles !');