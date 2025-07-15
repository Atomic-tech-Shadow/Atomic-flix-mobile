/**
 * Script de test pour vérifier la configuration EAS
 * Sans nécessiter d'authentification
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration EAS...\n');

// 1. Vérifier eas.json
const easJsonPath = path.join(__dirname, 'eas.json');
if (fs.existsSync(easJsonPath)) {
    const easConfig = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));
    console.log('✅ eas.json trouvé');
    console.log('   Version CLI:', easConfig.cli?.version || 'Non spécifiée');
    console.log('   Profils build:', Object.keys(easConfig.build || {}));
} else {
    console.log('❌ eas.json manquant');
}

// 2. Vérifier app.json
const appJsonPath = path.join(__dirname, 'app.json');
if (fs.existsSync(appJsonPath)) {
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    console.log('\n✅ app.json trouvé');
    console.log('   Nom:', appConfig.expo?.name || 'Non spécifié');
    console.log('   Slug:', appConfig.expo?.slug || 'Non spécifié');
    console.log('   Version:', appConfig.expo?.version || 'Non spécifiée');
    console.log('   Project ID:', appConfig.expo?.extra?.eas?.projectId || 'Non spécifié');
} else {
    console.log('\n❌ app.json manquant');
}

// 3. Vérifier credentials.json
const credentialsPath = path.join(__dirname, 'credentials.json');
if (fs.existsSync(credentialsPath)) {
    console.log('\n✅ credentials.json trouvé');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log('   Configuration keystore:', credentials.android?.keystore ? 'Configuré' : 'Non configuré');
} else {
    console.log('\n❌ credentials.json manquant');
}

// 4. Vérifier le keystore
const keystorePath = path.join(__dirname, 'signing.keystore');
if (fs.existsSync(keystorePath)) {
    console.log('\n✅ signing.keystore trouvé');
    const stats = fs.statSync(keystorePath);
    console.log('   Taille:', Math.round(stats.size / 1024), 'KB');
} else {
    console.log('\n❌ signing.keystore manquant');
}

// 5. Vérifier package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageConfig = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('\n✅ package.json trouvé');
    console.log('   EAS CLI:', packageConfig.dependencies?.['eas-cli'] || 
                               packageConfig.devDependencies?.['eas-cli'] || 'Non installé');
    console.log('   Expo:', packageConfig.dependencies?.expo || 'Non installé');
} else {
    console.log('\n❌ package.json manquant');
}

console.log('\n🎯 Résumé de la configuration EAS :');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Vérifications finales
let configOk = true;

if (!fs.existsSync(easJsonPath)) {
    console.log('❌ eas.json manquant');
    configOk = false;
}

if (!fs.existsSync(appJsonPath)) {
    console.log('❌ app.json manquant');
    configOk = false;
}

if (fs.existsSync(easJsonPath) && fs.existsSync(appJsonPath)) {
    const easConfig = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    if (!easConfig.cli?.version) {
        console.log('⚠️  Version CLI EAS non spécifiée');
    }
    
    if (!appConfig.expo?.extra?.eas?.projectId) {
        console.log('❌ Project ID EAS manquant');
        configOk = false;
    }
}

if (configOk) {
    console.log('✅ Configuration EAS complète et valide !');
    console.log('🚀 Prêt pour: npx eas build --platform android --profile preview');
} else {
    console.log('❌ Configuration EAS incomplète');
}

console.log('\n💡 Pour utiliser EAS CLI, authentifiez-vous avec: npx eas login');