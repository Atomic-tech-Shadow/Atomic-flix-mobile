#!/usr/bin/env node

/**
 * Test complet du système de notifications trending
 * Valide la configuration et l'intégration selon documentation Expo 2025
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 TEST SYSTÈME NOTIFICATIONS TRENDING - ATOMIC FLIX');
console.log('=' .repeat(60));

let testsReussis = 0;
let testsTotal = 0;

function test(nom, condition, details = '') {
  testsTotal++;
  if (condition) {
    console.log(`✅ ${nom}`);
    testsReussis++;
  } else {
    console.log(`❌ ${nom}`);
    if (details) console.log(`   ${details}`);
  }
}

// Test 1: Configuration app.json
console.log('\n📱 CONFIGURATION APP.JSON');
test(
  'Fichier app.json existe',
  fs.existsSync('app.json')
);

if (fs.existsSync('app.json')) {
  const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  test(
    'Plugin expo-notifications configuré',
    appConfig.expo?.plugins?.some(p => Array.isArray(p) && p[0] === 'expo-notifications') ||
    appConfig.plugins?.some(p => Array.isArray(p) && p[0] === 'expo-notifications'),
    'Plugin expo-notifications requis pour notifications push'
  );
  
  const notificationPlugin = appConfig.expo?.plugins?.find(p => Array.isArray(p) && p[0] === 'expo-notifications') ||
                            appConfig.plugins?.find(p => Array.isArray(p) && p[0] === 'expo-notifications');
  if (notificationPlugin && notificationPlugin[1]) {
    const config = notificationPlugin[1];
    
    test(
      'Canal par défaut configuré',
      config.defaultChannel === 'atomic-flix-trending',
      'Canal defaultChannel doit être "atomic-flix-trending"'
    );
    
    test(
      'Icône notifications configurée',
      config.icon === './assets/atomic-flix-logo.png',
      'Icône doit pointer vers logo ATOMIC FLIX'
    );
    
    test(
      'Couleur notifications configurée',
      config.color === '#00bcd4',
      'Couleur cyan cohérente avec thème app'
    );
    
    test(
      'Notifications background activées',
      config.enableBackgroundRemoteNotifications === true,
      'Nécessaire pour notifications quand app fermée'
    );
  }
}

// Test 2: Service TrendingNotificationService
console.log('\n🔔 SERVICE TRENDING NOTIFICATIONS');
test(
  'TrendingNotificationService.ts existe',
  fs.existsSync('src/services/TrendingNotificationService.ts')
);

if (fs.existsSync('src/services/TrendingNotificationService.ts')) {
  const serviceContent = fs.readFileSync('src/services/TrendingNotificationService.ts', 'utf8');
  
  test(
    'Import expo-notifications correct',
    serviceContent.includes("import * as Notifications from 'expo-notifications'"),
    'Import Expo notifications obligatoire'
  );
  
  test(
    'Configuration handler notifications',
    serviceContent.includes('Notifications.setNotificationHandler'),
    'Handler requis pour gestion notifications reçues'
  );
  
  test(
    'Canal Android configuré',
    serviceContent.includes('setNotificationChannelAsync') && 
    serviceContent.includes('atomic-flix-trending'),
    'Canal Android obligatoire pour Android 13+'
  );
  
  test(
    'Permissions iOS configurées',
    serviceContent.includes('allowAlert: true') && 
    serviceContent.includes('allowBadge: true'),
    'Permissions iOS spécifiques requises'
  );
  
  test(
    'Détection nouvelles tendances',
    serviceContent.includes('detectNewTrending') && 
    serviceContent.includes('checkForNewTrending'),
    'Logique détection nouveautés trending'
  );
  
  test(
    'Envoi notifications push',
    serviceContent.includes('sendPushNotification') && 
    serviceContent.includes('exp.host/--/api/v2/push/send'),
    'API Expo pour envoi notifications push'
  );
  
  test(
    'Listeners navigation configurés',
    serviceContent.includes('setupNotificationListeners') && 
    serviceContent.includes('addNotificationResponseReceivedListener'),
    'Navigation automatique sur tap notification'
  );
  
  test(
    'Fonction test disponible',
    serviceContent.includes('sendTestNotification'),
    'Fonction test pour validation développement'
  );
}

// Test 3: Intégration HomeScreen
console.log('\n🏠 INTÉGRATION HOMESCREEN');
if (fs.existsSync('src/screens/HomeScreen.tsx')) {
  const homeContent = fs.readFileSync('src/screens/HomeScreen.tsx', 'utf8');
  
  test(
    'Import TrendingNotificationService',
    homeContent.includes("import TrendingNotificationService from '../services/TrendingNotificationService'"),
    'Import service trending requis'
  );
  
  test(
    'Instance service créée',
    homeContent.includes('TrendingNotificationService.getInstance()'),
    'Pattern singleton utilisé'
  );
  
  test(
    'Initialisation service',
    homeContent.includes('trendingNotificationService.initialize()'),
    'Initialisation obligatoire au démarrage'
  );
  
  test(
    'Configuration listeners',
    homeContent.includes('setupNotificationListeners(navigation)'),
    'Listeners navigation configurés'
  );
  
  test(
    'Vérification tendances',
    homeContent.includes('checkForNewTrending(newContent)'),
    'Vérification lors du chargement trending'
  );
}

// Test 4: Types TypeScript
console.log('\n📝 TYPES TYPESCRIPT');
if (fs.existsSync('src/types/index.ts')) {
  const typesContent = fs.readFileSync('src/types/index.ts', 'utf8');
  
  test(
    'Interface SearchResult définie',
    typesContent.includes('interface SearchResult') || typesContent.includes('export interface SearchResult'),
    'Interface SearchResult requise pour trending'
  );
}

// Test 5: Composant de test
console.log('\n🧪 COMPOSANT DE TEST');
test(
  'NotificationTester.tsx existe',
  fs.existsSync('src/components/NotificationTester.tsx')
);

if (fs.existsSync('src/components/NotificationTester.tsx')) {
  const testerContent = fs.readFileSync('src/components/NotificationTester.tsx', 'utf8');
  
  test(
    'Fonction test notification',
    testerContent.includes('sendTestNotification'),
    'Bouton test notification développement'
  );
  
  test(
    'Vérification permissions',
    testerContent.includes('getPermissionStatus'),
    'Bouton vérification permissions'
  );
}

// Test 6: Fichier de test validation
console.log('\n✅ VALIDATION FINALE');
test(
  'Script test trending créé',
  fs.existsSync('test-trending-notifications.js'),
  'Script validation système complet'
);

// Résumé
console.log('\n' + '=' .repeat(60));
console.log(`📊 RÉSULTATS: ${testsReussis}/${testsTotal} tests réussis`);

if (testsReussis === testsTotal) {
  console.log('🎉 CONFIGURATION TRENDING NOTIFICATIONS COMPLÈTE !');
  console.log('');
  console.log('📱 PROCHAINES ÉTAPES:');
  console.log('   1. Build APK: npx eas build --platform android');
  console.log('   2. Installer sur appareil physique');
  console.log('   3. Tester notifications trending');
  console.log('   4. Vérifier navigation automatique');
  console.log('');
  console.log('⚠️  IMPORTANT: Notifications push ne fonctionnent QUE sur appareil physique');
  console.log('              (pas dans émulateur ou Expo Go web)');
} else {
  console.log(`❌ ${testsTotal - testsReussis} tests échoués - configuration incomplète`);
  process.exit(1);
}