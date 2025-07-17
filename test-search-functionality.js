#!/usr/bin/env node

/**
 * Test de la fonctionnalité de recherche - ATOMIC FLIX
 * Vérifie que l'API de recherche fonctionne correctement
 */

async function testSearchAPI() {
  console.log('🔍 Test de l\'API de recherche anime-sama-scraper');
  console.log('='.repeat(50));
  
  const testQueries = ['naruto', 'one piece', 'attack', 'demon slayer'];
  
  for (const query of testQueries) {
    try {
      console.log(`\n📡 Test recherche: "${query}"`);
      
      const response = await fetch(`https://anime-sama-scraper.vercel.app/api/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ Réponse reçue: ${data.success ? 'SUCCESS' : 'FAILED'}`);
      
      if (data.success && data.results) {
        console.log(`📊 Résultats: ${data.results.length} animes trouvés`);
        if (data.results.length > 0) {
          console.log(`📝 Premier résultat: ${data.results[0].title}`);
        }
      } else {
        console.log('❌ Pas de résultats dans la réponse');
      }
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
  }
}

async function testTrendingAPI() {
  console.log('\n\n🔥 Test de l\'API trending');
  console.log('='.repeat(50));
  
  try {
    const response = await fetch('https://anime-sama-scraper.vercel.app/api/trending');
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ Réponse reçue: ${data.success ? 'SUCCESS' : 'FAILED'}`);
    
    if (data.success && data.results) {
      console.log(`📊 Contenu trending: ${data.results.length} éléments`);
      if (data.results.length > 0) {
        console.log(`📝 Premier élément: ${data.results[0].title}`);
      }
    } else {
      console.log('❌ Pas de contenu trending dans la réponse');
    }
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
  }
}

async function main() {
  await testSearchAPI();
  await testTrendingAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Tests terminés');
}

main().catch(console.error);