#!/bin/bash

echo "🔧 Correction package-lock.json pour Metro..."

# Supprimer les verrous problématiques
rm -rf node_modules package-lock.json

# Installer avec versions exactes Metro
npm install metro@0.82.0 metro-config@0.82.0 metro-resolver@0.82.0 --save-dev --legacy-peer-deps

# Réinstaller toutes les dépendances
npm install --legacy-peer-deps

# Vérifier les versions finales
echo "📦 Versions Metro installées:"
npm list metro metro-config metro-resolver | grep -E "(metro|metro-config|metro-resolver)"

echo "✅ Package-lock.json corrigé"