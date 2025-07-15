#!/usr/bin/env node

/**
 * Script de correction des versions Expo
 * Résout les conflits entre @expo/config-plugins et @expo/prebuild-config
 */

const fs = require('fs');
const { execSync } = require('child_process');

function logStep(message) {
  console.log(`🔧 ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message) {
  console.log(`❌ ${message}`);
}

function updatePackageJson() {
  logStep('Correction du package.json...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Versions compatibles avec Expo SDK 53
  const compatibleVersions = {
    '@expo/config-plugins': '~10.1.1',
    '@expo/prebuild-config': '~9.0.0',
    'expo': '~53.0.19',
    'expo-doctor': '~1.13.5',
    '@expo/cli': '~0.24.0'
  };
  
  // Mise à jour des versions
  let updated = false;
  for (const [pkg, version] of Object.entries(compatibleVersions)) {
    if (packageJson.dependencies[pkg] && packageJson.dependencies[pkg] !== version) {
      packageJson.dependencies[pkg] = version;
      updated = true;
      logStep(`  ${pkg}: ${version}`);
    }
    if (packageJson.devDependencies[pkg] && packageJson.devDependencies[pkg] !== version) {
      packageJson.devDependencies[pkg] = version;
      updated = true;
      logStep(`  ${pkg}: ${version}`);
    }
  }
  
  if (updated) {
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    logSuccess('package.json mis à jour avec les versions compatibles');
  } else {
    logSuccess('package.json déjà à jour');
  }
  
  return updated;
}

function clearNodeModules() {
  logStep('Nettoyage des modules...');
  
  try {
    if (fs.existsSync('node_modules')) {
      execSync('rm -rf node_modules', { stdio: 'inherit' });
    }
    if (fs.existsSync('package-lock.json')) {
      execSync('rm -f package-lock.json', { stdio: 'inherit' });
    }
    logSuccess('Modules nettoyés');
  } catch (error) {
    logError(`Erreur lors du nettoyage: ${error.message}`);
  }
}

function installDependencies() {
  logStep('Installation des dépendances...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    logSuccess('Dépendances installées');
  } catch (error) {
    logError(`Erreur lors de l'installation: ${error.message}`);
    return false;
  }
  
  return true;
}

function testConfiguration() {
  logStep('Test de la configuration...');
  
  try {
    // Test des imports principaux
    const { ConfigPlugin } = require('@expo/config-plugins');
    const { createLegacyPlugin } = require('@expo/prebuild-config');
    
    logSuccess('Configuration Expo valide');
    return true;
  } catch (error) {
    logError(`Test échoué: ${error.message}`);
    return false;
  }
}

function runCustomDoctor() {
  logStep('Exécution du doctor personnalisé...');
  
  try {
    execSync('node doctor-check.js', { stdio: 'inherit' });
    logSuccess('Doctor personnalisé passé');
    return true;
  } catch (error) {
    logError(`Doctor personnalisé échoué: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔧 CORRECTION DES VERSIONS EXPO - ATOMIC FLIX');
  console.log('==============================================');
  
  try {
    // Étape 1: Mettre à jour package.json
    const needsUpdate = updatePackageJson();
    
    if (needsUpdate) {
      // Étape 2: Nettoyer les modules
      clearNodeModules();
      
      // Étape 3: Réinstaller
      if (!installDependencies()) {
        process.exit(1);
      }
    }
    
    // Étape 4: Tester la configuration
    if (!testConfiguration()) {
      process.exit(1);
    }
    
    // Étape 5: Exécuter le doctor personnalisé
    if (!runCustomDoctor()) {
      process.exit(1);
    }
    
    console.log('\n' + '='.repeat(50));
    logSuccess('CORRECTION TERMINÉE AVEC SUCCÈS');
    console.log('🚀 Projet prêt pour le développement');
    
  } catch (error) {
    logError(`Erreur inattendue: ${error.message}`);
    process.exit(1);
  }
}

main();