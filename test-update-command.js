#!/usr/bin/env node

/**
 * Test de la commande /update du bot Telegram
 * Simule l'envoi d'une notification de mise à jour
 */

console.log('🤖 TEST COMMANDE /UPDATE - BOT TELEGRAM');
console.log('=' .repeat(50));

// Simuler l'enregistrement d'un utilisateur test
async function registerTestUser() {
  console.log('\n👤 Enregistrement utilisateur test...');
  
  const testUserId = `atomic_flix_user_${Date.now()}`;
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
          platform: 'android',
          device: 'Samsung Galaxy',
          appVersion: '2.7.0',
          registeredAt: new Date().toISOString()
        }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Utilisateur enregistré avec succès');
      console.log(`   ID: ${testUserId}`);
      console.log(`   Token: ${testToken.substr(0, 30)}...`);
      return { userId: testUserId, token: testToken };
    } else {
      console.log('❌ Échec enregistrement:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return null;
  }
}

// Simuler la commande /update
async function simulateUpdateCommand() {
  console.log('\n🚀 Simulation commande /update...');
  
  const updateUrl = 'https://apkpure.com/fr/atomic-flix/com.atomicflix.mobile/download';
  
  try {
    // En réalité, cette commande est envoyée via Telegram
    // Ici on simule juste pour tester l'API
    console.log(`📱 URL mise à jour: ${updateUrl}`);
    console.log('💬 Message qui sera envoyé :');
    console.log('   🎉 NOUVELLE MISE À JOUR ATOMIC FLIX !');
    console.log('   ✨ Une nouvelle version est disponible sur APKPure');
    console.log('   📱 Fonctionnalités améliorées:');
    console.log('   • Performance optimisée');
    console.log('   • Corrections de bugs');
    console.log('   • Nouvelles fonctionnalités');
    console.log('   ⬇️ Téléchargez maintenant !');
    
    return true;
  } catch (error) {
    console.log('❌ Erreur simulation:', error.message);
    return false;
  }
}

// Vérifier les statistiques
async function checkStats() {
  console.log('\n📊 Statistiques du système...');
  
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
      console.log('✅ Statistiques récupérées');
      console.log(`   Utilisateurs totaux: ${data.stats.total_users || 'N/A'}`);
      console.log(`   Tokens actifs: ${data.stats.active_tokens || 'N/A'}`);
      console.log(`   Dernière activité: ${data.stats.last_activity || 'N/A'}`);
    } else {
      console.log('⚠️  Statistiques non disponibles');
    }
  } catch (error) {
    console.log('❌ Erreur statistiques:', error.message);
  }
}

// Instructions pour l'utilisateur
function showInstructions() {
  console.log('\n' + '=' .repeat(50));
  console.log('📋 INSTRUCTIONS POUR UTILISER /UPDATE');
  console.log('=' .repeat(50));
  console.log('1. Ouvrez Telegram et allez sur votre bot');
  console.log('2. Tapez : /update https://apkpure.com/fr/atomic-flix/com.atomicflix.mobile/download');
  console.log('3. Confirmez la diffusion');
  console.log('4. TOUS les utilisateurs vérifiés reçoivent la notification !');
  console.log('');
  console.log('💡 La notification apparaît instantanément sur leurs téléphones');
  console.log('💡 Ils cliquent et téléchargent directement depuis APKPure');
  console.log('💡 Taux de mise à jour maximisé !');
  console.log('=' .repeat(50));
}

// Exécuter tous les tests
async function runAllTests() {
  const user = await registerTestUser();
  await simulateUpdateCommand();
  await checkStats();
  showInstructions();
}

runAllTests().catch(console.error);