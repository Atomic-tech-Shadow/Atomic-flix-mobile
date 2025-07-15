#!/usr/bin/env node

/**
 * Script de validation pour la configuration Android
 * Vérifie que les fichiers XML sont valides et conformes aux règles Android
 */

const fs = require('fs');
const path = require('path');

function validateXML(filePath, fileName) {
  console.log(`\n🔍 Validation de ${fileName}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier manquant: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifications de base XML
    if (!content.includes('<?xml version="1.0"')) {
      console.log(`❌ ${fileName}: Déclaration XML manquante`);
      return false;
    }
    
    if (fileName === 'data_extraction_rules.xml') {
      // Vérifications spécifiques pour data_extraction_rules.xml
      if (!content.includes('<data-extraction-rules>')) {
        console.log(`❌ ${fileName}: Balise racine manquante`);
        return false;
      }
      
      if (!content.includes('<cloud-backup>')) {
        console.log(`❌ ${fileName}: Section cloud-backup manquante`);
        return false;
      }
      
      if (!content.includes('<device-transfer>')) {
        console.log(`❌ ${fileName}: Section device-transfer manquante`);
        return false;
      }
      
      // Vérifier que les domaines exclus sont dans les domaines inclus
      const hasDatabase = content.includes('<include domain="database"');
      const hasSharedPref = content.includes('<include domain="sharedpref"');
      const excludeDatabase = content.includes('<exclude domain="database"');
      const excludeSharedPref = content.includes('<exclude domain="sharedpref"');
      
      if (excludeDatabase && !hasDatabase) {
        console.log(`❌ ${fileName}: exclude domain="database" sans include correspondant`);
        return false;
      }
      
      if (excludeSharedPref && !hasSharedPref) {
        console.log(`❌ ${fileName}: exclude domain="sharedpref" sans include correspondant`);
        return false;
      }
      
      console.log(`✅ ${fileName}: Configuration valide`);
      console.log(`   - Domaines inclus: database=${hasDatabase}, sharedpref=${hasSharedPref}`);
      console.log(`   - Exclusions: database=${excludeDatabase}, sharedpref=${excludeSharedPref}`);
      
    } else if (fileName === 'backup_rules.xml') {
      // Vérifications spécifiques pour backup_rules.xml
      if (!content.includes('<full-backup-content>')) {
        console.log(`❌ ${fileName}: Balise racine manquante`);
        return false;
      }
      
      console.log(`✅ ${fileName}: Configuration valide`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ ${fileName}: Erreur de lecture - ${error.message}`);
    return false;
  }
}

function main() {
  console.log('📋 VALIDATION DE LA CONFIGURATION ANDROID');
  console.log('=========================================');
  
  const xmlDir = 'android/app/src/main/res/xml';
  const files = [
    { path: path.join(xmlDir, 'data_extraction_rules.xml'), name: 'data_extraction_rules.xml' },
    { path: path.join(xmlDir, 'backup_rules.xml'), name: 'backup_rules.xml' }
  ];
  
  let allValid = true;
  
  for (const file of files) {
    const isValid = validateXML(file.path, file.name);
    allValid = allValid && isValid;
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allValid) {
    console.log('✅ TOUTES LES VALIDATIONS PASSÉES');
    console.log('🚀 Configuration Android prête pour le build');
    process.exit(0);
  } else {
    console.log('❌ ERREURS DE VALIDATION DÉTECTÉES');
    console.log('🔧 Corrigez les erreurs avant de continuer');
    process.exit(1);
  }
}

main();