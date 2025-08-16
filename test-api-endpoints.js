#!/usr/bin/env node

/**
 * Script de test complet pour tous les endpoints de l'API ATOMIC FLIX
 * Pour comprendre les nouvelles mises à jour de l'API
 */

const fs = require('fs');

// Configuration des APIs
const ANIME_API_BASE = 'https://anime-sama-scraper.vercel.app';
const TELEGRAM_BOT_API_BASE = 'https://atomic-flix-verifier-bot.vercel.app';

console.log('🔍 TESTS DES ENDPOINTS API - ATOMIC FLIX');
console.log('=========================================');
console.log(`📡 API Anime: ${ANIME_API_BASE}`);
console.log(`🤖 API Bot Telegram: ${TELEGRAM_BOT_API_BASE}`);
console.log('');

/**
 * Fonction utilitaire pour faire des requêtes API avec timeout
 */
async function makeRequest(url, options = {}, timeout = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ATOMIC FLIX API Test Script',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout: ${timeout}ms dépassé`);
    }
    throw error;
  }
}

/**
 * Test d'un endpoint avec affichage des résultats
 */
async function testEndpoint(name, url, method = 'GET', body = null) {
  console.log(`\n🔍 Test: ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Méthode: ${method}`);
  
  try {
    const options = {
      method,
      ...(body && { body: JSON.stringify(body) })
    };
    
    const startTime = Date.now();
    const result = await makeRequest(url, options);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Statut: ${result.status} ${result.statusText}`);
    console.log(`⏱️  Durée: ${duration}ms`);
    
    // Afficher des infos sur la réponse
    if (result.ok) {
      if (typeof result.data === 'object') {
        console.log(`📊 Type de données: ${Array.isArray(result.data) ? 'Array' : 'Object'}`);
        if (Array.isArray(result.data)) {
          console.log(`📦 Nombre d'éléments: ${result.data.length}`);
          if (result.data.length > 0) {
            console.log(`🔑 Clés du premier élément:`, Object.keys(result.data[0]));
          }
        } else {
          console.log(`🔑 Clés principales:`, Object.keys(result.data));
        }
      } else {
        console.log(`📝 Type de données: ${typeof result.data}`);
        console.log(`📏 Taille: ${String(result.data).length} caractères`);
      }
    }
    
    return {
      success: true,
      status: result.status,
      data: result.data,
      duration,
      headers: result.headers
    };
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Tests de l'API Anime
 */
async function testAnimeAPI() {
  console.log('\n🎌 === TESTS API ANIME ===');
  
  const results = {};
  
  // Test du search endpoint
  results.search = await testEndpoint(
    'Recherche d\'anime', 
    `${ANIME_API_BASE}/api/search?query=one piece`
  );
  
  // Test du planning endpoint
  results.planning = await testEndpoint(
    'Planning des animes', 
    `${ANIME_API_BASE}/api/planning`
  );
  
  // Si la recherche a réussi, utiliser un ID pour tester les autres endpoints
  if (results.search.success && results.search.data) {
    let animeId = null;
    
    // Chercher un ID d'anime valide dans les résultats
    if (Array.isArray(results.search.data.results)) {
      const firstAnime = results.search.data.results[0];
      if (firstAnime && firstAnime.id) {
        animeId = firstAnime.id;
      }
    } else if (results.search.data.results && results.search.data.results[0]) {
      animeId = results.search.data.results[0].id;
    }
    
    if (animeId) {
      console.log(`\n📺 Utilisation de l'anime ID: ${animeId}`);
      
      // Test détails anime
      results.animeDetails = await testEndpoint(
        'Détails d\'un anime', 
        `${ANIME_API_BASE}/api/anime/${animeId}`
      );
      
      // Test épisodes d'une saison
      results.seasonEpisodes = await testEndpoint(
        'Épisodes d\'une saison', 
        `${ANIME_API_BASE}/api/anime/${animeId}/season/1/episodes`
      );
      
      // Test sources d'un épisode
      results.episodeSources = await testEndpoint(
        'Sources d\'un épisode', 
        `${ANIME_API_BASE}/api/anime/${animeId}/episode/1/sources`
      );
    }
  }
  
  // Tests d'autres endpoints
  results.episodes = await testEndpoint(
    'Épisodes par URL', 
    `${ANIME_API_BASE}/api/episodes?url=https://anime-sama.fr/catalogue/one-piece/&language=vostfr`
  );
  
  results.embed = await testEndpoint(
    'Sources embed', 
    `${ANIME_API_BASE}/api/embed?url=https://example.com/embed`
  );
  
  return results;
}

/**
 * Tests de l'API Bot Telegram
 */
async function testTelegramBotAPI() {
  console.log('\n🤖 === TESTS API BOT TELEGRAM ===');
  
  const results = {};
  
  // Test vérification subscription
  results.verifySubscription = await testEndpoint(
    'Vérification subscription', 
    `${TELEGRAM_BOT_API_BASE}/api/verify-subscription`,
    'POST',
    { userId: 'test_user_123' }
  );
  
  // Test notification update
  results.notifyUpdate = await testEndpoint(
    'Notification de mise à jour', 
    `${TELEGRAM_BOT_API_BASE}/api/notify-update`,
    'POST',
    { 
      userId: 'test_user_123',
      version: '2.6.3',
      changelog: 'Test des nouvelles fonctionnalités',
      downloadUrl: 'https://example.com/app.apk',
      isRequired: false
    }
  );
  
  // Test check update
  results.checkUpdate = await testEndpoint(
    'Vérification mise à jour', 
    `${TELEGRAM_BOT_API_BASE}/api/check-update`,
    'POST',
    { 
      currentVersion: '2.6.2',
      platform: 'android'
    }
  );
  
  // Test register push token
  results.registerPushToken = await testEndpoint(
    'Enregistrement push token', 
    `${TELEGRAM_BOT_API_BASE}/api/register-push-token`,
    'POST',
    {
      action: 'register',
      userId: 'test_user_123',
      pushToken: 'ExponentPushToken[test]',
      deviceInfo: {
        platform: 'android',
        version: '2.6.2'
      }
    }
  );
  
  // Test webhook telegram (probablement protégé)
  results.telegramWebhook = await testEndpoint(
    'Webhook Telegram', 
    `${TELEGRAM_BOT_API_BASE}/api/telegram-webhook`,
    'POST',
    {
      update_id: 12345,
      message: {
        message_id: 1,
        date: Date.now(),
        text: '/verify',
        chat: { id: 12345 },
        from: { id: 12345, username: 'test_user' }
      }
    }
  );
  
  return results;
}

/**
 * Génération du rapport de test
 */
function generateReport(animeResults, telegramResults) {
  console.log('\n📋 === RAPPORT DE TEST ===');
  
  const report = {
    timestamp: new Date().toISOString(),
    animeAPI: animeResults,
    telegramBotAPI: telegramResults,
    summary: {
      animeEndpoints: {
        total: Object.keys(animeResults).length,
        successful: Object.values(animeResults).filter(r => r.success).length,
        failed: Object.values(animeResults).filter(r => !r.success).length
      },
      telegramEndpoints: {
        total: Object.keys(telegramResults).length,
        successful: Object.values(telegramResults).filter(r => r.success).length,
        failed: Object.values(telegramResults).filter(r => !r.success).length
      }
    }
  };
  
  console.log(`\n🎌 API Anime:`);
  console.log(`   ✅ Succès: ${report.summary.animeEndpoints.successful}/${report.summary.animeEndpoints.total}`);
  console.log(`   ❌ Échecs: ${report.summary.animeEndpoints.failed}/${report.summary.animeEndpoints.total}`);
  
  console.log(`\n🤖 API Bot Telegram:`);
  console.log(`   ✅ Succès: ${report.summary.telegramEndpoints.successful}/${report.summary.telegramEndpoints.total}`);
  console.log(`   ❌ Échecs: ${report.summary.telegramEndpoints.failed}/${report.summary.telegramEndpoints.total}`);
  
  // Sauvegarder le rapport détaillé
  const reportFile = `api-test-report-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📁 Rapport détaillé sauvegardé: ${reportFile}`);
  
  return report;
}

/**
 * Fonction principale
 */
async function main() {
  try {
    // Tester l'API Anime
    const animeResults = await testAnimeAPI();
    
    // Tester l'API Bot Telegram
    const telegramResults = await testTelegramBotAPI();
    
    // Générer le rapport
    const report = generateReport(animeResults, telegramResults);
    
    console.log('\n🎉 Tests terminés !');
    console.log('Vérifiez les résultats ci-dessus pour comprendre les mises à jour de l\'API.');
    
  } catch (error) {
    console.error('\n💥 Erreur durant les tests:', error);
    process.exit(1);
  }
}

// Lancer les tests
main();