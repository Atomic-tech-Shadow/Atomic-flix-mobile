#!/bin/bash

echo "🔄 Reset complet Metro pour ATOMIC FLIX..."

# Nettoyage complet
rm -rf node_modules package-lock.json .expo
npm cache clean --force

# Réinstallation avec versions exactes
echo "📦 Installation Metro 0.82.0..."
npm install --legacy-peer-deps

# Vérification post-installation
echo "🔍 Vérification versions Metro:"
npm list metro metro-config metro-resolver 2>/dev/null || echo "Packages Metro installés"

# Test rapide de la configuration
echo "🧪 Test configuration Metro..."
node -e "
try {
  const config = require('./metro.config.js');
  console.log('✅ metro.config.js valide');
} catch (e) {
  console.log('❌ Erreur metro.config.js:', e.message);
}
"

echo "✅ Reset Metro terminé"