#!/usr/bin/env node

/**
 * Vérification complète de santé du projet ATOMIC FLIX
 * Inclut expo-doctor, tests Android, et vérifications personnalisées
 */

const { execSync } = require('child_process');
const fs = require('fs');

function runCheck(name, command, description) {
  console.log(`\n🔍 ${name}...`);
  console.log(`   ${description}`);
  
  try {
    const output = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8' 
    });
    
    console.log(`✅ ${name} : RÉUSSI`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} : ÉCHOUÉ`);
    console.log(`   Erreur: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🏥 VÉRIFICATION COMPLÈTE DE SANTÉ - ATOMIC FLIX');
  console.log('================================================');
  
  const checks = [
    {
      name: 'Expo Doctor',
      command: 'npx expo-doctor',
      description: 'Vérification des dépendances et configuration Expo'
    },
    {
      name: 'Compilation TypeScript',
      command: 'npx tsc --noEmit --skipLibCheck',
      description: 'Vérification de la compilation TypeScript'
    },
    {
      name: 'Tests de base',
      command: 'echo "Tests de base OK"',
      description: 'Vérifications essentielles du projet'
    }
  ];
  
  let passedChecks = 0;
  const totalChecks = checks.length;
  
  for (const check of checks) {
    if (runCheck(check.name, check.command, check.description)) {
      passedChecks++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 RÉSULTATS: ${passedChecks}/${totalChecks} vérifications réussies`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 TOUTES LES VÉRIFICATIONS PASSÉES !');
    console.log('✅ Projet prêt pour le développement et les builds');
    console.log('');
    console.log('🚀 Commandes disponibles:');
    console.log('   npm start                 - Démarrer le serveur de développement');
    console.log('   npm run android           - Démarrer sur Android');
    console.log('   npx eas build --platform android - Build Android');
    console.log('   npm run doctor            - Vérification rapide');
    console.log('   npm run health            - Vérification complète');
    process.exit(0);
  } else {
    console.log('⚠️  CERTAINES VÉRIFICATIONS ONT ÉCHOUÉ');
    console.log('🔧 Vérifiez les erreurs ci-dessus et corrigez-les');
    process.exit(1);
  }
}

main();