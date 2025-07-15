#!/bin/bash

# ATOMIC FLIX - Mobile APK Build Script with Local Keystore
# This script builds the APK using the provided signing keystore

echo "🚀 Building ATOMIC FLIX APK with local keystore..."

# Check if keystore exists
if [ ! -f "signing.keystore" ]; then
    echo "❌ Error: signing.keystore not found!"
    echo "Please ensure signing.keystore is in the mobile directory"
    exit 1
fi

# Check if credentials.json exists
if [ ! -f "credentials.json" ]; then
    echo "❌ Error: credentials.json not found!"
    echo "Please ensure credentials.json is configured"
    exit 1
fi

# Export keystore information as environment variables
export ANDROID_KEYSTORE_PATH="./signing.keystore"
export ANDROID_KEYSTORE_PASSWORD="Q9TSIc286YHu"
export ANDROID_KEY_ALIAS="atomic-flix-key"
export ANDROID_KEY_PASSWORD="Q9TSIc286YHu"

echo "✅ Keystore configuration loaded"
echo "📦 Keystore file: signing.keystore"
echo "🔑 Key alias: atomic-flix-key"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .expo
rm -rf android
rm -rf ios

# Build with EAS using local credentials
echo "🔨 Building APK with EAS..."
npx eas build --platform android --profile preview --local --clear-cache

echo "✅ Build completed!"
echo "📱 APK should be available in the build output directory"