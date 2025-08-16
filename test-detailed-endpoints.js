#!/usr/bin/env node

/**
 * Tests détaillés des endpoints fonctionnels avec paramètres corrects
 */

const ANIME_API_BASE = 'https://anime-sama-scraper.vercel.app';
const TELEGRAM_BOT_API_BASE = 'https://atomic-flix-verifier-bot.vercel.app';

async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ATOMIC FLIX API Test',
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
    
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function testDetailedEndpoints() {
  console.log('🔍 TESTS DÉTAILLÉS DES ENDPOINTS FONCTIONNELS');
  console.log('==============================================\n');

  // Test avec l'ID anime "one-piece" trouvé dans les résultats de recherche
  const animeId = 'one-piece';
  
  console.log('📺 Test détails anime avec ID valide:');
  try {
    const result = await makeRequest(`${ANIME_API_BASE}/api/anime/${animeId}`);
    console.log(`Status: ${result.status}`);
    if (result.ok) {
      console.log('✅ Structure des données:');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ Erreur:', result.data);
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  console.log('\n📺 Test épisodes saison 1:');
  try {
    const result = await makeRequest(`${ANIME_API_BASE}/api/anime/${animeId}/season/1/episodes`);
    console.log(`Status: ${result.status}`);
    if (result.ok) {
      console.log('✅ Structure des données:');
      if (Array.isArray(result.data)) {
        console.log(`Nombre d'épisodes: ${result.data.length}`);
        if (result.data.length > 0) {
          console.log('Premier épisode:', JSON.stringify(result.data[0], null, 2));
        }
      } else {
        console.log(JSON.stringify(result.data, null, 2));
      }
    } else {
      console.log('❌ Erreur:', result.data);
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  console.log('\n📺 Test sources épisode 1:');
  try {
    const result = await makeRequest(`${ANIME_API_BASE}/api/anime/${animeId}/episode/1/sources`);
    console.log(`Status: ${result.status}`);
    if (result.ok) {
      console.log('✅ Structure des données:');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ Erreur:', result.data);
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  // Test avec un userId numérique pour l'API Telegram
  console.log('\n🤖 Test vérification subscription avec userId numérique:');
  try {
    const result = await makeRequest(`${TELEGRAM_BOT_API_BASE}/api/verify-subscription`, {
      method: 'POST',
      body: JSON.stringify({ userId: 123456789 })
    });
    console.log(`Status: ${result.status}`);
    console.log('Réponse:', JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  // Test de recherche avec différents termes
  console.log('\n🔍 Test recherche avec terme "naruto":');
  try {
    const result = await makeRequest(`${ANIME_API_BASE}/api/search?query=naruto`);
    console.log(`Status: ${result.status}`);
    if (result.ok && result.data.animes) {
      console.log(`✅ Trouvé ${result.data.count} résultat(s)`);
      result.data.animes.forEach((anime, index) => {
        console.log(`${index + 1}. ${anime.title} (ID: ${anime.id})`);
      });
    } else {
      console.log('Réponse:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  // Test planning avec plus de détails
  console.log('\n📅 Analyse du planning en détail:');
  try {
    const result = await makeRequest(`${ANIME_API_BASE}/api/planning`);
    if (result.ok) {
      console.log(`✅ Planning pour ${result.data.day} (${result.data.currentDay})`);
      console.log(`📊 Total: ${result.data.count} éléments`);
      console.log(`🕐 Extrait le: ${result.data.extractedAt}`);
      
      // Grouper par type
      const byType = result.data.items.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📋 Répartition par type:', byType);
      
      // Grouper par statut
      const byStatus = result.data.items.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Répartition par statut:', byStatus);
      
      // Afficher quelques exemples
      console.log('\n📺 Premiers éléments du planning:');
      result.data.items.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} (${item.language}) - ${item.releaseTime} - ${item.status}`);
      });
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

testDetailedEndpoints();