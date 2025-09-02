/**
 * Utilitaires pour la gestion des langues et drapeaux
 * Supports all language variants found in anime-sama API
 */

export interface LanguageInfo {
  code: string;
  displayName: string;
  flag: string;
  group: 'french' | 'japanese' | 'american' | 'other';
}

/**
 * Configuration complète des langues supportées par l'API
 */
export const LANGUAGE_CONFIG: Record<string, LanguageInfo> = {
  // Versions françaises
  'VF': { code: 'VF', displayName: 'VF', flag: '🇫🇷', group: 'french' },
  'VF1': { code: 'VF1', displayName: 'VF1', flag: '🇫🇷', group: 'french' },
  'VF2': { code: 'VF2', displayName: 'VF2', flag: '🇫🇷', group: 'french' },
  
  // Versions japonaises
  'VOSTFR': { code: 'VOSTFR', displayName: 'VOSTFR', flag: '🇯🇵', group: 'japanese' },
  'VJSTFR': { code: 'VJSTFR', displayName: 'VJSTFR', flag: '🇯🇵', group: 'japanese' },
  'VO': { code: 'VO', displayName: 'VO', flag: '🇯🇵', group: 'japanese' },
  
  // Versions américaines
  'VA': { code: 'VA', displayName: 'VA', flag: '🇺🇸', group: 'american' },
  'EN': { code: 'EN', displayName: 'EN', flag: '🇺🇸', group: 'american' },
};

/**
 * Extrait et normalise l'information de langue depuis différents formats d'API
 */
export const extractLanguageInfo = (language: any): LanguageInfo | null => {
  if (!language) return null;
  
  // Si c'est une chaîne directe (VOSTFR, VF1, VF2, VA)
  if (typeof language === 'string') {
    return LANGUAGE_CONFIG[language.toUpperCase()] || {
      code: language.toUpperCase(),
      displayName: language.toUpperCase(),
      flag: '🌐',
      group: 'other'
    };
  }
  
  // Si c'est un objet avec un champ name
  if (language.name) {
    return LANGUAGE_CONFIG[language.name.toUpperCase()] || {
      code: language.name.toUpperCase(),
      displayName: language.name.toUpperCase(),
      flag: language.flag || '🌐',
      group: 'other'
    };
  }
  
  // Si c'est un objet avec des booléens (ancien système)
  if (language.vf) return LANGUAGE_CONFIG.VF;
  if (language.vostfr) return LANGUAGE_CONFIG.VOSTFR;
  if (language.vjstfr) return LANGUAGE_CONFIG.VJSTFR;
  
  return null;
};

/**
 * Obtient le badge de langue simplifié pour l'affichage
 */
export const getLanguageBadgeText = (language: any): string => {
  const langInfo = extractLanguageInfo(language);
  if (!langInfo) return 'VO';
  
  // Grouper les versions françaises sous "VF"
  if (langInfo.group === 'french') return 'VF';
  
  // Garder les autres langues telles quelles
  return langInfo.displayName;
};

/**
 * Obtient l'emoji du drapeau pour une langue
 */
export const getLanguageFlag = (language: any): string => {
  const langInfo = extractLanguageInfo(language);
  return langInfo?.flag || '🌐';
};

/**
 * Vérifie si deux langues appartiennent au même groupe
 */
export const isSameLanguageGroup = (lang1: any, lang2: any): boolean => {
  const info1 = extractLanguageInfo(lang1);
  const info2 = extractLanguageInfo(lang2);
  
  if (!info1 || !info2) return false;
  return info1.group === info2.group;
};

/**
 * Normalise le code de langue pour les requêtes API
 */
export const normalizeLanguageForAPI = (language: string): string => {
  const langInfo = LANGUAGE_CONFIG[language.toUpperCase()];
  if (!langInfo) return language.toLowerCase();
  
  // Normaliser les versions françaises pour l'API
  if (langInfo.group === 'french') return 'vf';
  if (langInfo.code === 'VOSTFR') return 'vostfr';
  if (langInfo.code === 'VA') return 'va';
  
  return language.toLowerCase();
};