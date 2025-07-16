/**
 * Test de l'API AnimeDetailScreen - ATOMIC FLIX
 * Vérifie que l'API fonctionne identiquement au code web
 */

const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

// Test direct de l'API comme dans le code web
async function testAnimeDetailAPI() {
  console.log('🔍 TEST API ANIME DETAIL SCREEN');
  console.log('===============================');
  console.log('Base URL:', API_BASE_URL);
  
  // Test avec plusieurs IDs d'anime populaires
  const testAnimes = [
    'attack-on-titan',
    'demon-slayer',
    'one-piece',
    'naruto',
    'dragon-ball-z'
  ];
  
  for (const animeId of testAnimes) {
    console.log(`\n📺 Test pour: ${animeId}`);
    console.log('--------------------------------');
    
    // Tester les différents endpoints possibles
    const endpoints = [
      `/api/details/${animeId}`,
      `/api/anime/${animeId}`,
      `/api/anime/details/${animeId}`
    ];
    
    let success = false;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`   Tentative: ${endpoint}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.success && data.data) {
            console.log(`   ✅ SUCCÈS: ${endpoint}`);
            console.log(`   📊 Titre: ${data.data.title || 'N/A'}`);
            console.log(`   📅 Année: ${data.data.year || 'N/A'}`);
            console.log(`   🎬 Saisons: ${data.data.seasons?.length || 0}`);
            console.log(`   📝 Synopsis: ${data.data.synopsis ? 'Présent' : 'Absent'}`);
            console.log(`   🖼️ Image: ${data.data.image ? 'Présente' : 'Absente'}`);
            success = true;
            break;
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }
    
    if (!success) {
      console.log(`   🔴 ÉCHEC: Aucun endpoint ne fonctionne pour ${animeId}`);
    }
  }
  
  console.log('\n📋 RÉSUMÉ DES TESTS');
  console.log('==================');
  console.log('✅ Test terminé - Vérifiez les résultats ci-dessus');
  console.log('🔧 Si tous échouent, l\'API pourrait être temporairement indisponible');
  console.log('🌐 Testez manuellement: ' + API_BASE_URL + '/api/details/attack-on-titan');
}

// Test de comparaison avec le code web
async function compareWithWebCode() {
  console.log('\n🔄 COMPARAISON AVEC LE CODE WEB');
  console.log('===============================');
  
  // Simuler le comportement exact du code web
  const id = 'attack-on-titan';
  
  try {
    // Exactement comme animeAPI.getDetails(id) dans le code web
    console.log('Simulation animeAPI.getDetails() du code web...');
    
    const response = await fetch(`${API_BASE_URL}/api/details/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    
    if (!apiResponse || !apiResponse.success) {
      const errorMsg = apiResponse?.error || apiResponse?.message || 'Anime non trouvé dans la base de données';
      throw new Error(errorMsg);
    }
    
    console.log('✅ Code web simulé avec succès !');
    console.log('📊 Données reçues:', {
      title: apiResponse.data.title,
      seasons: apiResponse.data.seasons?.length,
      hasImage: !!apiResponse.data.image,
      hasSynopsis: !!apiResponse.data.synopsis
    });
    
  } catch (error) {
    console.log('❌ Erreur simulation code web:', error.message);
  }
}

// Exécuter les tests
if (require.main === module) {
  testAnimeDetailAPI()
    .then(() => compareWithWebCode())
    .catch(console.error);
}

module.exports = { testAnimeDetailAPI, compareWithWebCode };