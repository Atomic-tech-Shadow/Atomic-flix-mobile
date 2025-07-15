#!/bin/bash

# Script de build Android simplifié pour ATOMIC FLIX
# Contourne les problèmes EAS CLI et utilise expo directement

echo "🚀 ATOMIC FLIX - Build Android Simplifié"
echo "======================================="

# Vérifier la configuration
echo "🔍 Vérification configuration..."
if [ ! -f "android/app/src/main/res/xml/data_extraction_rules.xml" ]; then
    echo "❌ Fichiers de ressources manquants - création..."
    mkdir -p android/app/src/main/res/xml
    
    cat > android/app/src/main/res/xml/data_extraction_rules.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="root" />
        <include domain="file" />
        <exclude domain="file" path="keystore/" />
    </cloud-backup>
    <device-transfer>
        <include domain="root" />
        <include domain="file" />
        <exclude domain="file" path="keystore/" />
    </device-transfer>
</data-extraction-rules>
EOF
    echo "✅ data_extraction_rules.xml créé"
fi

# Nettoyer le cache
echo "🧹 Nettoyage cache..."
npx expo r -c > /dev/null 2>&1

# Export Android
echo "📦 Export Android bundle..."
npx expo export --platform android --output-dir ./build-output --clear

if [ $? -eq 0 ]; then
    echo "✅ Export Android réussi!"
    echo "📁 Fichiers disponibles dans ./build-output"
    ls -la ./build-output/ 2>/dev/null
else
    echo "❌ Erreur lors de l'export Android"
fi

echo ""
echo "🎯 Build Android simplifié terminé!"
echo "💡 Pour un build APK complet avec keystore :"
echo "   1. Installer EAS CLI : npm install -g @expo/cli"
echo "   2. npx eas build --platform android --profile preview --local"
echo "   3. Ou utiliser le service cloud EAS"