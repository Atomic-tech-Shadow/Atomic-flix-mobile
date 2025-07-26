#!/usr/bin/env node

/**
 * Test pour vérifier l'enregistrement des tokens dans le système
 */

const https = require('https');

async function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testTokenRegistration() {
  console.log('🔍 TEST D\'ENREGISTREMENT TOKEN ATOMIC FLIX');
  console.log('=' .repeat(50));

  try {
    // Test 1: Statistiques générales
    console.log('\n📊 STATISTIQUES SERVEUR');
    console.log('─'.repeat(30));
    
    const stats = await makeRequest(
      'https://atomic-flix-verifier-bot.vercel.app/api/register-push-token',
      'POST',
      { action: 'get_stats' }
    );
    
    console.log('Réponse serveur:', JSON.stringify(stats, null, 2));
    
    if (stats.success) {
      console.log(`✅ Serveur opérationnel`);
      console.log(`👥 Utilisateurs totaux: ${stats.stats.totalUsers}`);
      console.log(`🟢 Utilisateurs actifs: ${stats.stats.activeUsers}`);
      console.log(`📝 Inscriptions récentes: ${stats.stats.recentRegistrations.length}`);
      console.log(`💾 Type stockage: ${stats.stats.storage.type}`);
      console.log(`🔄 Persistant: ${stats.stats.storage.persistent ? 'Oui' : 'Non'}`);
      
      if (stats.stats.recentRegistrations.length > 0) {
        console.log('\n📋 DERNIÈRES INSCRIPTIONS:');
        stats.stats.recentRegistrations.forEach((reg, index) => {
          console.log(`   ${index + 1}. ID: ${reg.userId || 'N/A'}`);
          console.log(`      Token: ${reg.pushToken ? reg.pushToken.substring(0, 20) + '...' : 'N/A'}`);
          console.log(`      Date: ${reg.timestamp ? new Date(reg.timestamp).toLocaleString() : 'N/A'}`);
        });
      }
    } else {
      console.log('❌ Erreur serveur:', stats.error || 'Réponse invalide');
    }

    // Test 2: Endpoint simple GET
    console.log('\n🌐 TEST ENDPOINT GET');
    console.log('─'.repeat(25));
    
    const getResponse = await makeRequest(
      'https://atomic-flix-verifier-bot.vercel.app/api/register-push-token'
    );
    
    console.log('Réponse GET:', JSON.stringify(getResponse, null, 2));

    // Test 3: Simulation d'un token spécifique
    console.log('\n🧪 TEST TOKEN SPÉCIFIQUE');
    console.log('─'.repeat(30));
    
    const testToken = 'ExponentPushToken[test-android-token-123]';
    const testUserId = 'user_test_android_1753491500000';
    
    const tokenTest = await makeRequest(
      'https://atomic-flix-verifier-bot.vercel.app/api/register-push-token',
      'POST',
      {
        userId: testUserId,
        pushToken: testToken,
        telegramVerified: true
      }
    );
    
    console.log('Test enregistrement:', JSON.stringify(tokenTest, null, 2));
    
    if (tokenTest.success) {
      console.log('✅ Test d\'enregistrement réussi');
    } else {
      console.log('❌ Test d\'enregistrement échoué:', tokenTest.error);
    }

    // Test 4: Vérifier les stats après le test
    console.log('\n📊 STATS APRÈS TEST');
    console.log('─'.repeat(25));
    
    const finalStats = await makeRequest(
      'https://atomic-flix-verifier-bot.vercel.app/api/register-push-token',
      'POST',
      { action: 'get_stats' }
    );
    
    if (finalStats.success) {
      console.log(`👥 Utilisateurs totaux: ${finalStats.stats.totalUsers}`);
      console.log(`🟢 Utilisateurs actifs: ${finalStats.stats.activeUsers}`);
      
      if (finalStats.stats.totalUsers > stats.stats.totalUsers) {
        console.log('🆕 Nouveau token détecté après le test !');
      }
    }

  } catch (error) {
    console.error('❌ Erreur durant les tests:', error.message);
  }

  console.log('\n' + '═'.repeat(50));
  console.log('🎯 RÉSUMÉ POUR VOTRE TOKEN ANDROID');
  console.log('═'.repeat(50));
  console.log('');
  console.log('Pour que votre token soit enregistré:');
  console.log('1. 📱 Installez la version 2.7.3+ d\'ATOMIC FLIX');
  console.log('2. 🔔 Activez les notifications via la cloche');
  console.log('3. ✅ Terminez la vérification Telegram');
  console.log('4. 🚀 Votre token sera automatiquement enregistré');
  console.log('');
  console.log('💡 Note: Les versions précédentes ne peuvent pas enregistrer de tokens');
  console.log('   car elles n\'ont pas le système d\'intégration.');
}

testTokenRegistration();