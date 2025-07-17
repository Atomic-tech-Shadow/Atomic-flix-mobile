#!/usr/bin/env node

/**
 * Débogage du problème de recherche - ATOMIC FLIX
 * Analyse des conditions d'affichage des résultats de recherche
 */

const fs = require('fs');

console.log('🔍 Analyse du problème de recherche');
console.log('='.repeat(50));

// Lire le fichier HomeScreen.tsx
const homeScreenContent = fs.readFileSync('src/screens/HomeScreen.tsx', 'utf8');

// Vérifier les conditions d'affichage
console.log('\n📋 Vérification des conditions d\'affichage:');

// Condition 1: Barre de recherche
const showSearchBarCondition = homeScreenContent.match(/{showSearchBar &&[^}]*}/);
if (showSearchBarCondition) {
  console.log('✅ Condition barre de recherche trouvée');
} else {
  console.log('❌ Condition barre de recherche manquante');
}

// Condition 2: Affichage des résultats
const searchResultsCondition = homeScreenContent.match(/{searchResults\.length > 0[^}]*}/);
if (searchResultsCondition) {
  console.log('✅ Condition affichage résultats trouvée');
} else {
  console.log('❌ Condition affichage résultats manquante');
}

// Condition 3: Message de chargement
const loadingCondition = homeScreenContent.match(/{loading && searchQuery[^}]*}/);
if (loadingCondition) {
  console.log('✅ Condition chargement trouvée');
} else {
  console.log('❌ Condition chargement manquante');
}

// Vérifier les logs de débogage
const debugLogsFound = homeScreenContent.includes('console.log(\'🔍 Recherche démarrée');
console.log(debugLogsFound ? '✅ Logs de débogage présents' : '❌ Logs de débogage manquants');

// Vérifier l'API request
const apiRequestFound = homeScreenContent.includes('apiRequest(`/api/search?query=');
console.log(apiRequestFound ? '✅ Appel API présent' : '❌ Appel API manquant');

// Vérifier useState pour searchResults
const searchResultsState = homeScreenContent.includes('setSearchResults(results)');
console.log(searchResultsState ? '✅ setState searchResults présent' : '❌ setState searchResults manquant');

console.log('\n🔧 Problèmes potentiels identifiés:');

// Problème 1: Condition d'affichage
if (!homeScreenContent.includes('searchResults.length > 0 && !loading')) {
  console.log('⚠️  Condition d\'affichage des résultats pourrait être incorrecte');
}

// Problème 2: Gestion de l'état
if (!homeScreenContent.includes('setShowSearchBar(true)')) {
  console.log('⚠️  L\'état showSearchBar pourrait ne pas être activé');
}

// Problème 3: Navigation après recherche
if (!homeScreenContent.includes('loadAnimeDetails')) {
  console.log('⚠️  Navigation vers les détails pourrait être manquante');
}

console.log('\n💡 Recommandations:');
console.log('1. Vérifier que handleSearchPress active bien showSearchBar');
console.log('2. Vérifier que les résultats API sont correctement stockés dans l\'état');
console.log('3. Vérifier les conditions d\'affichage des résultats');
console.log('4. Tester avec des logs de débogage console.log()');

console.log('\n🏁 Analyse terminée');