#!/bin/bash

# Script pour corriger les erreurs de build Android
# Résout les problèmes de ressources manquantes et nettoie le projet

echo "🔧 ATOMIC FLIX - Correction Build Android"
echo "========================================"

# Nettoyer le cache Expo
echo "🧹 Nettoyage cache Expo..."
npx expo r -c

# Nettoyer les builds précédents
echo "🧹 Nettoyage builds précédents..."
rm -rf .expo/
rm -rf android/
rm -rf ios/

# Prebuild avec les nouveaux plugins
echo "🔨 Prebuild avec plugins Android..."
npx expo prebuild --platform android --clean

# Vérifier que les fichiers de ressources sont créés
echo "🔍 Vérification ressources Android..."
if [ -f "android/app/src/main/res/xml/data_extraction_rules.xml" ]; then
    echo "✅ data_extraction_rules.xml créé avec succès"
else
    echo "❌ Problème création data_extraction_rules.xml"
fi

echo ""
echo "🎯 Build Android corrigé !"
echo "🚀 Vous pouvez maintenant lancer :"
echo "   • npx eas build --platform android --profile preview"
echo "   • ./build-with-keystore.sh"
echo ""