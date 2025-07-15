const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Désactiver les exports de packages pour éviter les conflits
config.resolver.unstable_enablePackageExports = false;

// Configuration pour React Native 0.76.9
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimisations pour Expo SDK 53
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;