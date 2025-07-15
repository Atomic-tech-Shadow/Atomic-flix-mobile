#!/bin/bash

echo "🔧 Correction des problèmes Android 35..."

# Nettoyer les builds précédents
echo "🧹 Nettoyage des builds précédents..."
rm -rf android/build
rm -rf android/app/build
rm -rf node_modules/.cache
rm -rf .expo

# Nettoyer les dépendances
echo "📦 Nettoyage des dépendances..."
npx expo install --fix

# Vérifier les dépendances Expo
echo "🔍 Vérification des dépendances Expo..."
npx expo doctor

# Prebuild pour Android 35
echo "⚙️ Prebuild pour Android 35..."
npx expo prebuild --platform android --clean

# Vérifier la configuration
echo "✅ Vérification de la configuration..."
node test-eas-config.js

echo "🎉 Correction terminée ! Vous pouvez maintenant tenter un build avec:"
echo "   npx eas build --platform android --profile preview"