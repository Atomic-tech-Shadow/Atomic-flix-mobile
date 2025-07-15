#!/bin/bash

# Script de build Android avec correction JAVA_HOME
# ATOMIC FLIX Mobile Build Fix

echo "🔧 Configuration de l'environnement Java..."

# Export JAVA_HOME explicitement
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH

echo "JAVA_HOME défini sur: $JAVA_HOME"
echo "Version Java:"
java -version

echo "📱 Lancement du build Android..."

# Nettoyage préalable
echo "🧹 Nettoyage des caches..."
npx expo r -c
rm -rf .expo android/build android/app/build

# Build avec variables d'environnement explicites
echo "🚀 Build EAS avec configuration Java..."
JAVA_HOME=/usr/lib/jvm/java-17-openjdk \
ANDROID_COMPILE_SDK=33 \
ANDROID_BUILD_TOOLS=33.0.0 \
ANDROID_MIN_SDK=24 \
ANDROID_TARGET_SDK=33 \
npx eas build --platform android --profile preview --clear-cache

echo "✅ Build terminé !"