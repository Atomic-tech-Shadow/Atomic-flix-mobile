#!/bin/bash

# Script pour tester la configuration Android corrigée
echo "🔍 Test configuration Android ATOMIC FLIX"
echo "========================================"

# Vérifier les fichiers de ressources créés
echo "🔍 Vérification fichiers de ressources..."
if [ -f "android/app/src/main/res/xml/data_extraction_rules.xml" ]; then
    echo "✅ data_extraction_rules.xml présent"
else
    echo "❌ data_extraction_rules.xml manquant"
fi

if [ -f "android/app/src/main/res/xml/backup_rules.xml" ]; then
    echo "✅ backup_rules.xml présent"
else
    echo "❌ backup_rules.xml manquant"
fi

# Vérifier la structure Android
if [ -d "android/app/src/main" ]; then
    echo "✅ Structure Android présente"
    echo "📁 Contenu res/xml:"
    ls -la android/app/src/main/res/xml/ 2>/dev/null || echo "❌ Dossier xml manquant"
else
    echo "❌ Structure Android manquante - prebuild nécessaire"
fi

# Test de compilation TypeScript
echo "🔍 Test compilation TypeScript..."
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    echo "✅ TypeScript compilation OK"
else
    echo "❌ Erreurs TypeScript détectées"
fi

# Vérifier configuration app.json
echo "🔍 Vérification plugins app.json..."
if grep -q "android-resources-config.js" app.json; then
    echo "✅ Plugin android-resources-config ajouté"
else
    echo "❌ Plugin android-resources-config manquant"
fi

echo ""
echo "🎯 Configuration Android testée !"
echo "💡 Pour build APK : npx expo export --platform android"
echo "💡 Pour prebuild complet : npx expo prebuild --platform android --clean"