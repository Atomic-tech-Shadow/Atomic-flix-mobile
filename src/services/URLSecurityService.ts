import { Linking, Alert } from 'react-native';

/**
 * 🔒 Service de sécurité pour valider et bloquer les URLs
 * Empêche l'app d'ouvrir un navigateur externe non autorisé
 */

const ALLOWED_DOMAINS = [
  // Lecteurs vidéo
  'sibnet.ru',
  'video.sibnet.ru',
  'smoothpre.com',
  'vidmoly.to',
  'sendvid.com',
  'vudeo.co',
  'vudeo.net',
  'vudeo.io',
  'mycloud.click',
  'mycloud.to',
  'doodstream.com',
  'dood.re',
  'dood.wf',
  'dood.pm',
  'dailymotion.com',
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'mp4upload.com',
  'streamtape.com',
  'kwik.cx',
  'okru',
  'netu.tv',
  'dropload.io',
  // Domaines de confiance
  'anime-sama.si',
  's1.anime-sama.si',
  's2.anime-sama.si',
  's3.anime-sama.si',
  's4.anime-sama.si',
  'cdn.anime-sama.si',
  'anime-sama.eu',
  'cloudflare.com',
  'hcaptcha.com',
  'recaptcha.net',
  'google.com',
  'cdn.statically.io',
  'statically.io',
  'discordapp.com',
  'discord.com',
  'discord.gg',
  'images.search.yahoo.com',
  'bing.com',
  'wp.com',
  'i0.wp.com',
  'i1.wp.com',
  'i2.wp.com',
  'image.tmdb.org',
  'm.media-amazon.com',
  'anime-sama.fr',
  's1.anime-sama.fr',
  's2.anime-sama.fr',
  's3.anime-sama.fr',
  's4.anime-sama.fr',
  'cdn.anime-sama.fr',
];

const BLOCKED_SCHEMES = [
  'tel:',       // Appels téléphoniques
  'mailto:',    // Emails
  'sms:',       // Messages
  'market://',  // Play Store
  'intent://',  // Intents Android
  'android-app://', // Deeplinks Android
  'itms://',    // App Store iOS
  'itms-apps://', // App Store iOS
  'javascript:',    // Code JavaScript
  'data:',      // Data URLs (XSS)
  'vbscript:',  // VBScript
  'file://',    // Accès fichiers locaux
];

interface URLValidationResult {
  isValid: boolean;
  isDangerous: boolean;
  reason?: string;
  shouldOpen: boolean;
}

/**
 * Valider une URL avant de l'ouvrir
 */
export const validateURL = (url: string): URLValidationResult => {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      isDangerous: true,
      reason: 'URL invalide ou vide',
      shouldOpen: false,
    };
  }

  const lowerUrl = url.toLowerCase().trim();

  // ❌ Vérifier les schémas bloqués
  const blockedScheme = BLOCKED_SCHEMES.find(scheme => lowerUrl.startsWith(scheme));
  if (blockedScheme) {
    return {
      isValid: false,
      isDangerous: true,
      reason: `Schéma interdit détecté: ${blockedScheme}`,
      shouldOpen: false,
    };
  }

  // ✅ Vérifier si c'est HTTP/HTTPS
  if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
    return {
      isValid: false,
      isDangerous: true,
      reason: 'Seulement HTTP/HTTPS sont autorisés',
      shouldOpen: false,
    };
  }

  try {
    const urlObj = new URL(url);

    // ❌ Vérifier si HTTPS (préférence sécurité)
    if (urlObj.protocol !== 'https:') {
      console.warn('⚠️ Avertissement: URL non-HTTPS détectée:', url);
    }

    // ✅ Vérifier si domaine autorisé
    const hostname = urlObj.hostname.toLowerCase();
    const isAllowed = ALLOWED_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );

    if (isAllowed) {
      return {
        isValid: true,
        isDangerous: false,
        reason: 'Domaine autorisé',
        shouldOpen: true,
      };
    }

    // ❌ Domaine non autorisé
    return {
      isValid: true,
      isDangerous: true,
      reason: `Domaine non autorisé: ${hostname}`,
      shouldOpen: false,
    };

  } catch (error) {
    return {
      isValid: false,
      isDangerous: true,
      reason: 'Erreur parsing URL',
      shouldOpen: false,
    };
  }
};

/**
 * Ouvrir une URL en toute sécurité
 * Bloque les ouvertures dangereuses
 */
export const openURLSecurely = async (
  url: string,
  onSecurityError?: (reason: string) => void
): Promise<boolean> => {
  const validation = validateURL(url);

  // ✅ URL valide et sûre
  if (validation.shouldOpen && validation.isValid) {
    try {
      // Vérifier si l'URL peut être ouverte avant d'essayer
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        console.log('✅ URL ouverte avec succès:', url);
        return true;
      } else {
        console.warn('⚠️ URL ne peut pas être ouverte:', url);
        Alert.alert('Erreur', 'Impossible d\'ouvrir cette URL');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'ouverture de l\'URL:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite');
      return false;
    }
  }

  // ❌ URL dangereuse ou invalide - BLOQUER
  console.error('🚫 URL BLOQUÉE:', {
    url,
    reason: validation.reason,
    isDangerous: validation.isDangerous,
  });

  const errorMessage = validation.reason || 'Cette URL n\'est pas autorisée';
  
  if (onSecurityError) {
    onSecurityError(errorMessage);
  }

  Alert.alert(
    'Sécurité',
    errorMessage,
    [{ text: 'OK', onPress: () => {} }],
    { cancelable: true }
  );

  return false;
};

/**
 * Obtenir la liste des domaines autorisés
 */
export const getAllowedDomains = (): string[] => {
  return [...ALLOWED_DOMAINS];
};

/**
 * Ajouter un domaine à la whitelist
 */
export const addAllowedDomain = (domain: string): void => {
  const cleanDomain = domain.toLowerCase().replace('https://', '').replace('http://', '').split('/')[0];
  if (!ALLOWED_DOMAINS.includes(cleanDomain)) {
    ALLOWED_DOMAINS.push(cleanDomain);
    console.log('✅ Domaine ajouté à la whitelist:', cleanDomain);
  }
};

/**
 * Bloquer complètement Linking.openURL() - Option extrême
 * À utiliser si vous voulez empêcher TOUS les navigateurs externes
 */
export const blockAllExternalBrowsers = (): void => {
  const originalOpenURL = Linking.openURL;
  
  Linking.openURL = async (url: string) => {
    console.warn('🚫 ACCÈS NAVIGATEUR EXTERNE BLOQUÉ:', url);
    const validation = validateURL(url);
    
    if (!validation.shouldOpen) {
      Alert.alert('Sécurité', 'Les navigateurs externes sont bloqués pour cette app', [
        { text: 'OK', onPress: () => {} },
      ]);
      return;
    }
    
    // Permettre seulement les URLs sûres
    return originalOpenURL(url);
  };
};

/**
 * Récupérer les logs de validation
 */
export const testURLValidation = (testURLs: string[]): void => {
  console.log('🧪 Test de validation d\'URLs:');
  testURLs.forEach(url => {
    const result = validateURL(url);
    console.log(`\n📍 ${url}`);
    console.log(`   Valide: ${result.isValid}`);
    console.log(`   Dangereux: ${result.isDangerous}`);
    console.log(`   Raison: ${result.reason}`);
    console.log(`   Ouvrir: ${result.shouldOpen}`);
  });
};

export default {
  validateURL,
  openURLSecurely,
  getAllowedDomains,
  addAllowedDomain,
  blockAllExternalBrowsers,
  testURLValidation,
};
