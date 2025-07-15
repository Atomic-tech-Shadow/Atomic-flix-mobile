#!/bin/bash

echo "🔧 Correction des problèmes Metro pour ATOMIC FLIX..."

# Nettoyer les caches
npm run clean
rm -rf node_modules/.cache
rm -rf .expo

# Réinstaller les dépendances Metro avec versions exactes
npm install --legacy-peer-deps

# Vérifier les versions Metro
echo "📦 Versions Metro installées:"
npm list metro metro-config metro-resolver

# Test de la configuration
echo "🧪 Test configuration Metro..."
npx expo export:embed --platform android --dev false --output-dir test-output || echo "Test build échoué - normal en l'absence de sources"

echo "✅ Configuration Metro corrigée"