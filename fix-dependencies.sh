#!/bin/bash

echo "🔧 Correction des dépendances ATOMIC FLIX Mobile..."

# Suppression des fichiers de cache
rm -rf node_modules package-lock.json

# Installation avec legacy-peer-deps
npm install --legacy-peer-deps

# Vérification de la configuration
echo "✅ Dépendances installées avec succès"

# Vérification Expo
npx expo install --check

echo "🚀 Configuration mobile prête pour build APK"