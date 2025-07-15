/**
 * Test de configuration Android 35 - ATOMIC FLIX
 * Vérifie que toutes les configurations sont compatibles avec Android 35
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Test de configuration Android 35 pour ATOMIC FLIX...\n');

let allTestsPassed = true;
let testResults = [];

function testResult(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  const message = `${status} ${name}${details ? ': ' + details : ''}`;
  console.log(message);
  testResults.push({ name, passed, details });
  if (!passed) allTestsPassed = false;
}

// Test 1: Vérifier app.json pour Android 35
try {
  const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const androidConfig = appConfig.expo.plugins.find(p => 
    Array.isArray(p) && p[0] === 'expo-build-properties'
  );
  
  if (androidConfig && androidConfig[1].android) {
    const android = androidConfig[1].android;
    testResult('Configuration Android 35 dans app.json', 
      android.compileSdkVersion === 35 && android.targetSdkVersion === 35,
      `compile:${android.compileSdkVersion}, target:${android.targetSdkVersion}`
    );
  } else {
    testResult('Configuration Android dans app.json', false, 'Non trouvée');
  }
} catch (e) {
  testResult('Lecture app.json', false, e.message);
}

// Test 2: Vérifier eas.json pour Android 35
try {
  const easConfig = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
  const productionEnv = easConfig.build.production.env;
  
  testResult('Configuration EAS pour Android 35',
    productionEnv.ANDROID_COMPILE_SDK === '35' && productionEnv.ANDROID_TARGET_SDK === '35',
    `compile:${productionEnv.ANDROID_COMPILE_SDK}, target:${productionEnv.ANDROID_TARGET_SDK}`
  );
} catch (e) {
  testResult('Lecture eas.json', false, e.message);
}

// Test 3: Vérifier les fichiers de styles Android
const stylesPath = 'android/app/src/main/res/values/styles.xml';
const styles35Path = 'android/app/src/main/res/values-v35/styles.xml';

testResult('Fichier styles.xml général', fs.existsSync(stylesPath));
testResult('Fichier styles.xml Android 35', fs.existsSync(styles35Path));

// Test 4: Vérifier les fichiers de ressources Android
const backupRulesPath = 'android/app/src/main/res/xml/backup_rules.xml';
const dataExtractionPath = 'android/app/src/main/res/xml/data_extraction_rules.xml';

testResult('Fichier backup_rules.xml', fs.existsSync(backupRulesPath));
testResult('Fichier data_extraction_rules.xml', fs.existsSync(dataExtractionPath));

// Test 5: Vérifier le plugin de configuration manifeste
try {
  const manifestPlugin = fs.readFileSync('android-manifest-config.js', 'utf8');
  const hasAndroid35Config = manifestPlugin.includes('android:enableOnBackInvokedCallback') &&
                            manifestPlugin.includes('android:supportsRtl');
  
  testResult('Plugin manifeste Android 35', hasAndroid35Config,
    hasAndroid35Config ? 'Configurations Android 35 présentes' : 'Configurations manquantes'
  );
} catch (e) {
  testResult('Plugin manifeste Android', false, e.message);
}

// Test 6: Vérifier les dépendances principales
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  testResult('Expo SDK 53', deps.expo?.startsWith('~53.'), deps.expo || 'Non trouvé');
  testResult('EAS CLI 16.15+', deps['eas-cli']?.includes('16.15'), deps['eas-cli'] || 'Non trouvé');
} catch (e) {
  testResult('Vérification dépendances', false, e.message);
}

// Test 7: Vérifier les paramètres de build
try {
  const easConfig = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
  const previewProfile = easConfig.build.preview;
  
  testResult('Profil preview configuré', !!previewProfile);
  testResult('Credentials local configurés', 
    previewProfile.android?.credentialsSource === 'local'
  );
} catch (e) {
  testResult('Configuration build', false, e.message);
}

// Résumé final
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ DES TESTS ANDROID 35');
console.log('='.repeat(60));

const passedTests = testResults.filter(t => t.passed).length;
const totalTests = testResults.length;

console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
console.log(`${allTestsPassed ? '🎉' : '⚠️'} Status: ${allTestsPassed ? 'TOUS LES TESTS PASSÉS' : 'CERTAINS TESTS ÉCHOUÉS'}`);

if (allTestsPassed) {
  console.log('\n🚀 Configuration Android 35 VALIDE !');
  console.log('💡 Prêt pour le build avec:');
  console.log('   npx eas build --platform android --profile preview');
} else {
  console.log('\n❌ Certains problèmes détectés:');
  testResults.filter(t => !t.passed).forEach(t => {
    console.log(`   • ${t.name}: ${t.details || 'Échec'}`);
  });
}

console.log('\n🛠️ Pour corriger les problèmes, lancez:');
console.log('   ./fix-android-35.sh');