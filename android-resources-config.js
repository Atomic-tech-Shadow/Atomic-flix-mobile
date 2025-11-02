const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Plugin pour créer les ressources Android manquantes
 * Résout les erreurs de build liées aux fichiers de ressources
 */
function createDataExtractionRules(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      
      // Créer le dossier res/xml s'il n'existe pas
      const xmlDir = path.join(platformProjectRoot, "app", "src", "main", "res", "xml");
      
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }
      
      // Créer le fichier data_extraction_rules.xml
      const dataExtractionRules = `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <!-- Inclure les domaines principaux -->
        <include domain="root" />
        <include domain="file" />
        <include domain="database" />
        <include domain="sharedpref" />
        
        <!-- Exclure les fichiers sensibles -->
        <exclude domain="file" path="keystore/" />
        <exclude domain="file" path="credentials/" />
        <exclude domain="database" path="secure.db" />
        <exclude domain="sharedpref" path="sensitive_prefs.xml" />
    </cloud-backup>
    
    <device-transfer>
        <!-- Inclure les domaines principaux -->
        <include domain="root" />
        <include domain="file" />
        <include domain="database" />
        <include domain="sharedpref" />
        
        <!-- Exclure les données sensibles du transfert -->
        <exclude domain="file" path="keystore/" />
        <exclude domain="file" path="credentials/" />
        <exclude domain="database" path="secure.db" />
        <exclude domain="sharedpref" path="sensitive_prefs.xml" />
    </device-transfer>
</data-extraction-rules>`;
      
      const filePath = path.join(xmlDir, "data_extraction_rules.xml");
      fs.writeFileSync(filePath, dataExtractionRules);
      
      // Créer aussi le fichier backup_rules.xml pour compatibilité
      const backupRules = `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <include domain="file" />
    <include domain="database" />
    <include domain="sharedpref" />
    <exclude domain="file" path="keystore/" />
    <exclude domain="file" path="credentials/" />
</full-backup-content>`;
      
      const backupFilePath = path.join(xmlDir, "backup_rules.xml");
      fs.writeFileSync(backupFilePath, backupRules);
      
      // Créer les fichiers styles.xml pour splash screen plein écran
      const valuesDir = path.join(platformProjectRoot, "app", "src", "main", "res", "values");
      const values35Dir = path.join(platformProjectRoot, "app", "src", "main", "res", "values-v35");
      
      if (!fs.existsSync(valuesDir)) {
        fs.mkdirSync(valuesDir, { recursive: true });
      }
      
      if (!fs.existsSync(values35Dir)) {
        fs.mkdirSync(values35Dir, { recursive: true });
      }
      
      // Styles généraux pour application mobile
      const stylesContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Thème principal de l'application -->
    <style name="Theme.App" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="android:windowBackground">@color/app_background</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
        <item name="android:screenOrientation">portrait</item>
    </style>
    
    <!-- Couleur de fond de l'application -->
    <color name="app_background">#0F0F0F</color>
</resources>`;
      
      // Styles spécifiques Android 35+ pour edge-to-edge
      const styles35Content = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Thème pour Android 35+ avec support edge-to-edge -->
    <style name="Theme.App" parent="Theme.Material3.DayNight.NoActionBar">
        <item name="android:windowBackground">@color/app_background</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
        <item name="android:screenOrientation">portrait</item>
        <item name="android:enforceStatusBarContrast">false</item>
        <item name="android:enforceNavigationBarContrast">false</item>
    </style>
    
    <!-- Couleur de fond de l'application -->
    <color name="app_background">#0F0F0F</color>
</resources>`;
      
      fs.writeFileSync(path.join(valuesDir, "styles.xml"), stylesContent);
      fs.writeFileSync(path.join(values35Dir, "styles.xml"), styles35Content);
      
      console.log("✅ Fichiers data_extraction_rules.xml, backup_rules.xml et styles.xml créés avec succès");
      console.log("✅ Configuration splash screen plein écran portrait appliquée");
      
      return config;
    },
  ]);
}

module.exports = createDataExtractionRules;