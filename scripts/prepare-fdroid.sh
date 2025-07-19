#!/bin/bash

# Script pour préparer la soumission F-Droid
echo "🚀 Préparation pour soumission F-Droid..."

# Vérifier si git est initialisé
if [ ! -d ".git" ]; then
    echo "📦 Initialisation du dépôt Git..."
    git init
    git add .
    git commit -m "Initial commit: Atomic Flix v1.0.0"
fi

# Créer le tag de version
echo "🏷️  Création du tag v1.0.0..."
git tag v1.0.0 2>/dev/null || echo "Tag v1.0.0 existe déjà"

# Vérifier les fichiers F-Droid
echo "✅ Vérification des fichiers F-Droid..."

if [ -f "fastlane/metadata/android/en-US/short_description.txt" ]; then
    echo "  ✓ short_description.txt"
else
    echo "  ❌ short_description.txt manquant"
fi

if [ -f "fastlane/metadata/android/en-US/full_description.txt" ]; then
    echo "  ✓ full_description.txt"
else
    echo "  ❌ full_description.txt manquant"
fi

if [ -f "fastlane/metadata/android/en-US/images/icon.png" ]; then
    echo "  ✓ icon.png"
else
    echo "  ❌ icon.png manquant"
fi

if [ -f "LICENSE" ]; then
    echo "  ✓ LICENSE"
else
    echo "  ❌ LICENSE manquant"
fi

echo ""
echo "📋 Prochaines étapes manuelles :"
echo "1. Uploader le code sur GitHub/GitLab"
echo "2. Mettre à jour l'URL dans metadata-fdroid/com.atomicflix.mobile.yml"
echo "3. Suivre les instructions dans F-DROID-SUBMISSION.md"
echo ""
echo "🎉 Préparation terminée !"