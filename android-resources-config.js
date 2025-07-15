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
      
      console.log("✅ Fichiers data_extraction_rules.xml et backup_rules.xml créés avec succès");
      
      return config;
    },
  ]);
}

module.exports = createDataExtractionRules;