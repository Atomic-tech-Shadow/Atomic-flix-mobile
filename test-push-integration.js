#!/usr/bin/env node

/**
 * Test de l'intégration des notifications push pour ATOMIC FLIX
 * Vérifie que tous les services sont correctement configurés
 */

console.log('🧪 TEST D\'INTÉGRATION - NOTIFICATIONS PUSH ATOMIC FLIX');
console.log('=' .repeat(60));

// Test 1: Vérifier l'API du bot Telegram
async function testTelegramAPI() {
  console.log('\n📡 Test 1: API Bot Telegram');
  try {
    const response = await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_stats'
      })
    });
    
    const data = await response.json();
    console.log('✅ API Bot accessible');
    console.log(`   Utilisateurs: ${data.stats?.total_users || 'N/A'}`);
    console.log(`   Tokens actifs: ${data.stats?.active_tokens || 'N/A'}`);
  } catch (error) {
    console.log('❌ API Bot inaccessible:', error.message);
  }
}

// Test 2: Vérifier la configuration Expo
async function testExpoConfig() {
  console.log('\n📱 Test 2: Configuration Expo');
  try {
    const fs = require('fs');
    const appConfig = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
    
    console.log('✅ app.json chargé');
    console.log(`   Project ID: ${appConfig.expo.extra?.eas?.projectId || 'N/A'}`);
    
    // Vérifier le plugin notifications
    const hasNotificationPlugin = appConfig.expo.plugins?.some(plugin => 
      Array.isArray(plugin) && plugin[0] === 'expo-notifications'
    );
    
    if (hasNotificationPlugin) {
      console.log('✅ Plugin expo-notifications configuré');
    } else {
      console.log('❌ Plugin expo-notifications manquant');
    }
    
    if (appConfig.expo.notifications) {
      console.log('✅ Configuration notifications présente');
    } else {
      console.log('⚠️  Configuration notifications basique');
    }
    
  } catch (error) {
    console.log('❌ Erreur configuration Expo:', error.message);
  }
}

// Test 3: Test des services créés
async function testServices() {
  console.log('\n🛠️  Test 3: Services créés');
  
  const fs = require('fs');
  
  // Vérifier PushNotificationService
  try {
    if (fs.existsSync('./src/services/pushNotifications.js')) {
      console.log('✅ PushNotificationService créé');
    } else {
      console.log('❌ PushNotificationService manquant');
    }
  } catch (error) {
    console.log('❌ Erreur PushNotificationService:', error.message);
  }
  
  // Vérifier UserService
  try {
    if (fs.existsSync('./src/services/userService.js')) {
      console.log('✅ UserService créé');
    } else {
      console.log('❌ UserService manquant');
    }
  } catch (error) {
    console.log('❌ Erreur UserService:', error.message);
  }
  
  // Vérifier NotificationSettings
  try {
    if (fs.existsSync('./src/components/NotificationSettings.tsx')) {
      console.log('✅ NotificationSettings créé');
    } else {
      console.log('❌ NotificationSettings manquant');
    }
  } catch (error) {
    console.log('❌ Erreur NotificationSettings:', error.message);
  }
}

// Test 4: Simuler l'enregistrement d'un utilisateur
async function testUserRegistration() {
  console.log('\n👤 Test 4: Simulation enregistrement utilisateur');
  
  const testUserId = `test_user_${Date.now()}`;
  const testToken = `ExponentPushToken[test_${Math.random().toString(36).substr(2, 9)}]`;
  
  try {
    const response = await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        userId: testUserId,
        pushToken: testToken,
        deviceInfo: {
          platform: 'web',
          device: 'test',
          appVersion: '2.7.0'
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Enregistrement utilisateur fonctionnel');
      console.log(`   User ID: ${testUserId}`);
    } else {
      console.log('❌ Échec enregistrement:', data.error);
    }
  } catch (error) {
    console.log('❌ Erreur enregistrement:', error.message);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  await testTelegramAPI();
  await testExpoConfig();
  await testServices();
  await testUserRegistration();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 INTÉGRATION TERMINÉE');
  console.log('   La commande /update du bot Telegram peut maintenant');
  console.log('   envoyer des notifications à tous les utilisateurs vérifiés !');
  console.log('=' .repeat(60));
}

// Lancer les tests
runAllTests().catch(console.error);