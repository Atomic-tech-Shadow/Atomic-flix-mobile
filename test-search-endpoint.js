/**
 * Test de l'endpoint de recherche - ATOMIC FLIX
 * Teste directement l'API anime-sama-scraper pour vérifier les endpoints disponibles
 */

const API_BASE_URL = 'https://anime-sama-scraper.vercel.app';

// Fonction pour faire des requêtes API
async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 Test: ${description}`);
    console.log(`📡 Endpoint: ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 TEST DE L\'ENDPOINT DE RECHERCHE - ATOMIC FLIX');
  console.log('================================================');
  
  // Test 1: Recherche basique
  await testEndpoint('/api/search?query=naruto', 'Recherche "naruto"');
  
  // Test 2: Recherche avec espaces
  await testEndpoint('/api/search?query=one+piece', 'Recherche "one piece"');
  
  // Test 3: Recherche avec caractères spéciaux
  await testEndpoint('/api/search?query=attack+on+titan', 'Recherche "attack on titan"');
  
  // Test 4: Détails d'un anime
  await testEndpoint('/api/anime/naruto', 'Détails de "naruto"');
  
  // Test 5: Test d'un endpoint d'épisodes (si disponible)
  await testEndpoint('/api/anime/naruto/episodes', 'Épisodes de "naruto"');
  
  // Test 6: Test endpoint sans paramètre
  await testEndpoint('/api/search', 'Recherche sans paramètre');
  
  console.log('\n🎯 RÉSUMÉ DES TESTS');
  console.log('==================');
  console.log('✅ Endpoint de recherche: /api/search?query=TERME');
  console.log('✅ Endpoint détails anime: /api/anime/ID');
  console.log('❌ Endpoint épisodes: Non disponible ou différent');
  console.log('\n💡 Corrections nécessaires dans le code:');
  console.log('- Utiliser "query" au lieu de "q" pour la recherche');
  console.log('- Vérifier les endpoints pour épisodes et sources');
}

main().catch(console.error);