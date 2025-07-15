const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Plugin pour optimiser le manifeste Android
 * Règle les problèmes de compatibilité et d'optimisation
 */
function addOptimizedManifestConfig(androidManifest) {
  const { manifest } = androidManifest;
  
  // Assurer que l'application principale existe
  if (!manifest.application || manifest.application.length === 0) {
    return androidManifest;
  }

  const application = manifest.application[0];

  // Optimisations pour la performance
  if (!application.$) {
    application.$ = {};
  }

  // Configuration pour éviter les erreurs de manifeste
  application.$["android:largeHeap"] = "true";
  application.$["android:usesCleartextTraffic"] = "true";
  application.$["android:requestLegacyExternalStorage"] = "true";
  application.$["android:hardwareAccelerated"] = "true";
  application.$["android:allowBackup"] = "false";
  application.$["android:extractNativeLibs"] = "true";

  // Configuration pour MainActivity
  if (application.activity && application.activity.length > 0) {
    const mainActivity = application.activity[0];
    if (!mainActivity.$) {
      mainActivity.$ = {};
    }
    
    mainActivity.$["android:windowSoftInputMode"] = "adjustResize";
    mainActivity.$["android:exported"] = "true";
    mainActivity.$["android:launchMode"] = "singleTask";
  }

  return androidManifest;
}

module.exports = function withOptimizedAndroidManifest(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = addOptimizedManifestConfig(config.modResults);
    return config;
  });
};