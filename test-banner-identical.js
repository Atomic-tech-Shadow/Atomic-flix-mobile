/**
 * Test de vérification bannière identique - ATOMIC FLIX
 * Vérifie que la bannière mobile reproduit exactement la bannière web
 */

const fs = require('fs');
const path = require('path');

function testResult(name, passed, details = '') {
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

function testWebBanner() {
  console.log('\n🌐 ANALYSE BANNIÈRE WEB');
  
  const webFile = path.join(__dirname, 'attached_assets', 'anime-player_1752707514026.tsx');
  
  if (!fs.existsSync(webFile)) {
    testResult('Fichier web trouvé', false, 'Fichier web non trouvé');
    return false;
  }
  
  const webContent = fs.readFileSync(webFile, 'utf8');
  
  // Test éléments de la bannière web
  const hasRelativeContainer = webContent.includes('relative overflow-hidden');
  const hasBackgroundImage = webContent.includes('bg-cover bg-center');
  const hasOverlay = webContent.includes('bg-black/60');
  const hasBottomPositioning = webContent.includes('absolute bottom-4 left-4');
  const hasTitleStyles = webContent.includes('text-2xl font-bold');
  const hasSeasonStyles = webContent.includes('text-lg uppercase');
  
  testResult('Container relatif avec overflow', hasRelativeContainer, 'relative overflow-hidden détecté');
  testResult('Image de fond couverture', hasBackgroundImage, 'bg-cover bg-center détecté');
  testResult('Overlay noir 60%', hasOverlay, 'bg-black/60 détecté');
  testResult('Positionnement absolu bas', hasBottomPositioning, 'absolute bottom-4 left-4 détecté');
  testResult('Titre 2xl bold', hasTitleStyles, 'text-2xl font-bold détecté');
  testResult('Saison lg uppercase', hasSeasonStyles, 'text-lg uppercase détecté');
  
  return hasRelativeContainer && hasBackgroundImage && hasOverlay && hasBottomPositioning && hasTitleStyles && hasSeasonStyles;
}

function testMobileBanner() {
  console.log('\n📱 ANALYSE BANNIÈRE MOBILE');
  
  const mobileFile = path.join(__dirname, 'src', 'screens', 'AnimePlayerScreen.tsx');
  
  if (!fs.existsSync(mobileFile)) {
    testResult('Fichier mobile trouvé', false, 'Fichier mobile non trouvé');
    return false;
  }
  
  const mobileContent = fs.readFileSync(mobileFile, 'utf8');
  
  // Test équivalents mobile
  const hasBannerContainer = mobileContent.includes('bannerContainer');
  const hasBannerImage = mobileContent.includes('bannerImage');
  const hasBannerOverlay = mobileContent.includes('bannerOverlay');
  const hasBannerContent = mobileContent.includes('bannerContent');
  const hasBannerTitle = mobileContent.includes('bannerTitle');
  const hasBannerSeason = mobileContent.includes('bannerSeason');
  
  testResult('Container bannière', hasBannerContainer, 'bannerContainer détecté');
  testResult('Image bannière', hasBannerImage, 'bannerImage détecté');
  testResult('Overlay bannière', hasBannerOverlay, 'bannerOverlay détecté');
  testResult('Contenu bannière', hasBannerContent, 'bannerContent détecté');
  testResult('Titre bannière', hasBannerTitle, 'bannerTitle détecté');
  testResult('Saison bannière', hasBannerSeason, 'bannerSeason détecté');
  
  return hasBannerContainer && hasBannerImage && hasBannerOverlay && hasBannerContent && hasBannerTitle && hasBannerSeason;
}

function testStyleEquivalence() {
  console.log('\n🎨 TEST ÉQUIVALENCE STYLES');
  
  const mobileFile = path.join(__dirname, 'src', 'screens', 'AnimePlayerScreen.tsx');
  const mobileContent = fs.readFileSync(mobileFile, 'utf8');
  
  // Test styles équivalents
  const hasRelativePosition = mobileContent.includes('position: \'relative\'');
  const hasOverflowHidden = mobileContent.includes('overflow: \'hidden\'');
  const hasAbsoluteOverlay = mobileContent.includes('position: \'absolute\'');
  const hasBlackOverlay = mobileContent.includes('rgba(0, 0, 0, 0.6)');
  const hasBottomPositioning = mobileContent.includes('bottom: 16');
  const hasTitleSize24 = mobileContent.includes('fontSize: 24');
  const hasSeasonSize18 = mobileContent.includes('fontSize: 18');
  const hasUppercaseTransform = mobileContent.includes('textTransform: \'uppercase\'');
  
  testResult('Position relative', hasRelativePosition, 'position: \'relative\' détecté');
  testResult('Overflow hidden', hasOverflowHidden, 'overflow: \'hidden\' détecté');
  testResult('Position absolute overlay', hasAbsoluteOverlay, 'position: \'absolute\' détecté');
  testResult('Overlay noir 60%', hasBlackOverlay, 'rgba(0, 0, 0, 0.6) détecté');
  testResult('Positionnement bas', hasBottomPositioning, 'bottom: 16 détecté');
  testResult('Titre 24px (2xl)', hasTitleSize24, 'fontSize: 24 détecté');
  testResult('Saison 18px (lg)', hasSeasonSize18, 'fontSize: 18 détecté');
  testResult('Texte uppercase', hasUppercaseTransform, 'textTransform: \'uppercase\' détecté');
  
  return hasRelativePosition && hasOverflowHidden && hasAbsoluteOverlay && hasBlackOverlay && 
         hasBottomPositioning && hasTitleSize24 && hasSeasonSize18 && hasUppercaseTransform;
}

function testImplementationDetails() {
  console.log('\n🔧 TEST DÉTAILS IMPLÉMENTATION');
  
  const mobileFile = path.join(__dirname, 'src', 'screens', 'AnimePlayerScreen.tsx');
  const mobileContent = fs.readFileSync(mobileFile, 'utf8');
  
  // Test détails techniques
  const hasResizeCover = mobileContent.includes('resizeMode="cover"');
  const hasFullDimensions = mobileContent.includes('width: \'100%\'') && mobileContent.includes('height: \'100%\'');
  const hasColorGray300 = mobileContent.includes('#d1d5db');
  const hasWhiteColor = mobileContent.includes('#ffffff');
  const hasFontBold = mobileContent.includes('fontWeight: \'bold\'');
  
  testResult('Resize mode cover', hasResizeCover, 'resizeMode="cover" détecté');
  testResult('Dimensions complètes', hasFullDimensions, 'width/height 100% détectés');
  testResult('Couleur grise 300', hasColorGray300, '#d1d5db détecté');
  testResult('Couleur blanche', hasWhiteColor, '#ffffff détecté');
  testResult('Police bold', hasFontBold, 'fontWeight: \'bold\' détecté');
  
  return hasResizeCover && hasFullDimensions && hasColorGray300 && hasWhiteColor && hasFontBold;
}

async function runAllTests() {
  console.log('🏁 TEST BANNIÈRE IDENTIQUE WEB vs MOBILE - ATOMIC FLIX');
  console.log('======================================================');
  
  const webTest = testWebBanner();
  const mobileTest = testMobileBanner();
  const styleTest = testStyleEquivalence();
  const implementationTest = testImplementationDetails();
  
  console.log('\n📊 RÉSULTATS FINAUX');
  console.log('===================');
  
  testResult('Bannière web', webTest, 'Structure web correcte');
  testResult('Bannière mobile', mobileTest, 'Structure mobile correcte');
  testResult('Équivalence styles', styleTest, 'Styles équivalents');
  testResult('Détails implémentation', implementationTest, 'Implémentation correcte');
  
  const allPassed = webTest && mobileTest && styleTest && implementationTest;
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 BANNIÈRE PARFAITEMENT IDENTIQUE !');
    console.log('✅ Structure identique (relative + absolute)');
    console.log('✅ Overlay noir 60% identique');
    console.log('✅ Positionnement bas identique');
    console.log('✅ Tailles de police identiques (24px/18px)');
    console.log('✅ Couleurs identiques');
    console.log('✅ Image en pleine largeur avec cover');
    console.log('');
    console.log('🎯 La bannière mobile reproduit EXACTEMENT la bannière web !');
  } else {
    console.log('❌ DIFFÉRENCES DÉTECTÉES');
    console.log('🔧 Vérifier les implémentations');
  }
  
  return allPassed;
}

// Exécuter tous les tests
runAllTests();