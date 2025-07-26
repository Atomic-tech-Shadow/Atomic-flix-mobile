#!/usr/bin/env node

/**
 * Test des statistiques et tokens enregistrés
 * Vérifie si votre token Android est dans le système
 */

console.log('📊 TEST STATISTIQUES & TOKENS ENREGISTRÉS');
console.log('=' .repeat(50));

// Test de récupération des statistiques
async function getStats() {
  console.log('\n📈 Récupération des statistiques...');
  
  try {
    const response = await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_stats'
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.stats) {
      console.log('✅ Statistiques récupérées avec succès:');
      console.log(`   📱 Utilisateurs totaux: ${data.stats.total_users || 0}`);
      console.log(`   🔑 Tokens actifs: ${data.stats.active_tokens || 0}`);
      console.log(`   📅 Dernière activité: ${data.stats.last_activity || 'Jamais'}`);
      console.log(`   📲 Dernière inscription: ${data.stats.last_registration || 'Jamais'}`);
      
      if (data.stats.recent_registrations) {
        console.log('\n📋 Dernières inscriptions:');
        data.stats.recent_registrations.forEach((reg, index) => {
          console.log(`   ${index + 1}. ID: ${reg.userId} | Device: ${reg.platform} | Date: ${reg.registeredAt}`);
        });
      }
      
      return data.stats;
    } else {
      console.log('⚠️  Pas de statistiques disponibles');
      console.log('   Erreur:', data.error || 'Inconnue');
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur lors de la récupération des stats:', error.message);
    return null;
  }
}

// Test d'enregistrement d'un token de test
async function testTokenRegistration() {
  console.log('\n🧪 Test d\'enregistrement token...');
  
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
        telegramId: '123456789',
        deviceInfo: {
          platform: 'android',
          device: 'Test Device',
          appVersion: '2.7.2',
          registeredAt: new Date().toISOString()
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Token de test enregistré avec succès');
      console.log(`   User ID: ${testUserId}`);
      console.log(`   Token: ${testToken.substr(0, 30)}...`);
      return testUserId;
    } else {
      console.log('❌ Échec enregistrement token de test:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur test enregistrement:', error.message);
    return null;
  }
}

// Test de vérification d'un utilisateur spécifique
async function checkSpecificUser(userId) {
  console.log(`\n🔍 Vérification utilisateur spécifique: ${userId}`);
  
  try {
    const response = await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'check_user',
        userId: userId
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.user) {
      console.log('✅ Utilisateur trouvé:');
      console.log(`   📱 Push Token: ${data.user.pushToken ? 'Enregistré' : 'Non enregistré'}`);
      console.log(`   📅 Inscrit le: ${data.user.registeredAt || 'Date inconnue'}`);
      console.log(`   📲 Plateforme: ${data.user.platform || 'Inconnue'}`);
      console.log(`   📱 Appareil: ${data.user.device || 'Inconnu'}`);
      return true;
    } else {
      console.log('❌ Utilisateur non trouvé ou erreur:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur vérification utilisateur:', error.message);
    return false;
  }
}

// Test de ping du serveur
async function pingServer() {
  console.log('\n🏥 Test de ping du serveur...');
  
  try {
    const response = await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ping'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Serveur opérationnel');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(data)}`);
      return true;
    } else {
      console.log('⚠️  Serveur accessible mais erreur HTTP:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Serveur inaccessible:', error.message);
    return false;
  }
}

// Afficher les instructions pour vérifier manuellement
function showManualVerification() {
  console.log('\n' + '═'.repeat(50));
  console.log('📋 VÉRIFICATION MANUELLE DE VOTRE TOKEN');
  console.log('═'.repeat(50));
  
  console.log('\n1. 📱 Sur votre téléphone Android avec ATOMIC FLIX:');
  console.log('   • Ouvrez l\'app');
  console.log('   • Regardez dans les logs (si vous avez accès)');
  console.log('   • Votre User ID commence par "user_" suivi d\'un timestamp');
  
  console.log('\n2. 🤖 Dans votre Bot Telegram:');
  console.log('   • Tapez /stats pour voir les statistiques');
  console.log('   • Vérifiez le nombre d\'utilisateurs enregistrés');
  console.log('   • Chaque installation génère un nouvel utilisateur');
  
  console.log('\n3. 🧪 Test d\'envoi de notification:');
  console.log('   • Tapez /update https://test.com dans votre bot');
  console.log('   • Si votre token est enregistré, vous recevrez la notification');
  console.log('   • Sinon, réinstallez l\'app avec la nouvelle version 2.7.2');
  
  console.log('\n💡 Note: Les tokens ne s\'enregistrent qu\'avec la nouvelle version');
  console.log('   de l\'app qui contient le système push notifications');
}

// Exécuter tous les tests
async function runAllTests() {
  const serverOk = await pingServer();
  
  if (serverOk) {
    const stats = await getStats();
    const testUserId = await testTokenRegistration();
    
    if (testUserId) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s
      await checkSpecificUser(testUserId);
    }
    
    // Récupérer les stats après le test
    console.log('\n🔄 Statistiques après test:');
    await getStats();
  }
  
  showManualVerification();
}

runAllTests().catch(console.error);