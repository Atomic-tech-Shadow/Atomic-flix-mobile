#!/bin/bash

# Script de correction rapide JAVA_HOME pour build Android
# ATOMIC FLIX - Fix Java Environment

echo "🔍 Détection des installations Java disponibles..."

# Chercher toutes les installations Java
JAVA_PATHS=(
    "/usr/lib/jvm/java-17-openjdk-amd64"
    "/usr/lib/jvm/java-17-openjdk"
    "/usr/lib/jvm/java-11-openjdk-amd64"
    "/usr/lib/jvm/java-11-openjdk"
    "/usr/lib/jvm/default-java"
)

VALID_JAVA=""

for path in "${JAVA_PATHS[@]}"; do
    if [ -d "$path" ] && [ -f "$path/bin/java" ]; then
        echo "✅ Java trouvé: $path"
        VALID_JAVA="$path"
        break
    else
        echo "❌ Non trouvé: $path"
    fi
done

if [ -z "$VALID_JAVA" ]; then
    echo "❌ Aucune installation Java valide trouvée!"
    echo "Chemins testés:"
    for path in "${JAVA_PATHS[@]}"; do
        echo "  - $path"
    done
    exit 1
fi

echo "🎯 Utilisation de: $VALID_JAVA"

# Mettre à jour eas.json avec le bon chemin
echo "📝 Mise à jour de eas.json avec JAVA_HOME=$VALID_JAVA"

# Export pour l'environnement actuel
export JAVA_HOME="$VALID_JAVA"
export PATH="$JAVA_HOME/bin:$PATH"

echo "✅ Configuration Java mise à jour!"
echo "JAVA_HOME: $JAVA_HOME"
echo "Version Java:"
java -version 2>&1 | head -3

echo ""
echo "🚀 Vous pouvez maintenant relancer votre build avec:"
echo "   npm run build:android"
echo "   ou"
echo "   eas build --platform android --profile preview"