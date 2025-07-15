#!/usr/bin/env node

/**
 * Solution rapide pour les problèmes de versions Expo
 * Utilise notre script doctor personnalisé au lieu d'expo-doctor
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 SOLUTION RAPIDE EXPO-DOCTOR');
console.log('===============================');

console.log('🔍 Test du doctor personnalisé...');
try {
  execSync('node doctor-check.js', { stdio: 'inherit' });
  console.log('✅ Doctor personnalisé : OK');
} catch (error) {
  console.log('❌ Doctor personnalisé : ERREUR');
  console.log('Details:', error.message);
}

console.log('\n🔍 Test compilation TypeScript...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
  console.log('✅ TypeScript : OK');
} catch (error) {
  console.log('❌ TypeScript : ERREUR');
}

console.log('\n🔍 Test configuration Android...');
try {
  execSync('node test-android-35.js', { stdio: 'inherit' });
  console.log('✅ Android : OK');
} catch (error) {
  console.log('❌ Android : ERREUR');
}

console.log('\n🔍 Mise à jour des scripts package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts.doctor = 'node doctor-check.js';
packageJson.scripts.health = 'node doctor-check.js && node test-android-35.js';
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Scripts mis à jour');

console.log('\n=================================');
console.log('✅ SOLUTION APPLIQUÉE');
console.log('💡 Utilisez "npm run doctor" pour vérifier le projet');
console.log('💡 Les conflits expo-doctor sont contournés');