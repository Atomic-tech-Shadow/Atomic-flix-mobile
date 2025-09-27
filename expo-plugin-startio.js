const { withAndroidManifest, withAppBuildGradle, withMainApplication, withInfoPlist } = require('@expo/config-plugins');

const STARTIO_APP_ID = '208920272';

// Configuration des permissions Android nécessaires pour Start.io
const withStartIOAndroidPermissions = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    // Ajouter les permissions nécessaires pour Start.io
    const permissions = [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_WIFI_STATE',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION'
    ];
    
    permissions.forEach(permission => {
      if (!androidManifest.manifest['uses-permission']?.some(p => p.$['android:name'] === permission)) {
        if (!androidManifest.manifest['uses-permission']) {
          androidManifest.manifest['uses-permission'] = [];
        }
        androidManifest.manifest['uses-permission'].push({
          $: { 'android:name': permission }
        });
      }
    });
    
    return config;
  });
};

// Ajout du SDK Start.io aux dépendances Android
const withStartIOGradle = (config) => {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    // Ajouter le repository et la dépendance Start.io si pas déjà présent
    if (!buildGradle.includes('com.startapp:inapp-sdk')) {
      const dependencyLine = `    implementation 'com.startapp:inapp-sdk:5.1.0'`;
      
      // Ajouter la dépendance dans la section dependencies
      if (buildGradle.includes('dependencies {')) {
        config.modResults.contents = buildGradle.replace(
          'dependencies {',
          `dependencies {\n${dependencyLine}`
        );
      }
    }
    
    return config;
  });
};

// Configuration de l'initialisation Start.io dans MainApplication
const withStartIOMainApplication = (config) => {
  return withMainApplication(config, (config) => {
    const mainApplication = config.modResults.contents;
    
    // Ajouter l'import Start.io
    if (!mainApplication.includes('com.startapp.sdk.adsbase.StartAppSDK')) {
      config.modResults.contents = mainApplication.replace(
        'import com.facebook.react.ReactApplication;',
        'import com.facebook.react.ReactApplication;\nimport com.startapp.sdk.adsbase.StartAppSDK;'
      );
    }
    
    // Ajouter l'initialisation dans onCreate
    if (!mainApplication.includes('StartAppSDK.init')) {
      const initCode = `\n    // Initialize Start.io SDK\n    StartAppSDK.init(this, "${STARTIO_APP_ID}", true);`;
      
      config.modResults.contents = config.modResults.contents.replace(
        'super.onCreate();',
        `super.onCreate();${initCode}`
      );
    }
    
    return config;
  });
};

// Configuration iOS (Info.plist)
const withStartIOiOS = (config) => {
  return withInfoPlist(config, (config) => {
    // Ajouter les configurations nécessaires pour iOS
    config.modResults.NSAppTransportSecurity = {
      NSAllowsArbitraryLoads: true
    };
    
    // Ajouter la configuration Start.io dans Info.plist
    config.modResults.StartIOAppId = STARTIO_APP_ID;
    
    return config;
  });
};

// Plugin principal qui combine toutes les configurations
const withStartIO = (config, options = {}) => {
  // Appliquer toutes les configurations
  config = withStartIOAndroidPermissions(config);
  config = withStartIOGradle(config);
  config = withStartIOMainApplication(config);
  config = withStartIOiOS(config);
  
  return config;
};

module.exports = withStartIO;