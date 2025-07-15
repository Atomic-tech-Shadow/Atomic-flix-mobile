#!/bin/bash

# Script pour corriger les erreurs de lint Android
# Résout les problèmes FullBackupContent dans data_extraction_rules.xml

echo "🔧 Correction des erreurs de lint Android..."
echo "============================================"

# Vérifier si le dossier Android existe
if [ ! -d "android/app/src/main/res/xml" ]; then
    echo "❌ Structure Android manquante. Exécutez 'npx expo prebuild' d'abord."
    exit 1
fi

# Sauvegarder les fichiers existants
backup_dir="android-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"

if [ -f "android/app/src/main/res/xml/data_extraction_rules.xml" ]; then
    cp "android/app/src/main/res/xml/data_extraction_rules.xml" "$backup_dir/"
    echo "📁 Sauvegarde: $backup_dir/data_extraction_rules.xml"
fi

if [ -f "android/app/src/main/res/xml/backup_rules.xml" ]; then
    cp "android/app/src/main/res/xml/backup_rules.xml" "$backup_dir/"
    echo "📁 Sauvegarde: $backup_dir/backup_rules.xml"
fi

# Appliquer les corrections depuis le plugin
echo "🔄 Application des corrections..."
node -e "
const plugin = require('./android-resources-config.js');
const config = {
  modRequest: {
    projectRoot: '.',
    platformProjectRoot: './android'
  }
};
plugin({ ...config });
"

# Valider la configuration
echo "🔍 Validation de la configuration..."
node validate-android-config.js

if [ $? -eq 0 ]; then
    echo "✅ Corrections appliquées avec succès"
    echo "🚀 Lint Android devrait maintenant passer"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Testez avec: npx eas build --platform android --profile preview"
    echo "   2. Ou: ./gradlew app:lintDebug (dans le dossier android)"
else
    echo "❌ Erreurs détectées lors de la validation"
    echo "🔧 Vérifiez les fichiers XML manuellement"
fi