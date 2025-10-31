// Nouvelle palette "I AM ATOMIC" - The Eminence in Shadow Theme
// Couleurs inspirées du pouvoir cosmique de Cid Kagenou

export const COLORS = {
  // Couleurs principales - Thème "I am Atomic" (Fond noir authentique)
  primary: '#0F0F0F', // Noir cosmique - Ombre de Cid Kagenou
  secondary: '#A855F7', // Violet néon lumineux - Énergie atomique
  accent: '#DB2777', // Magenta intense - Aura de pouvoir
  
  // Gradients cosmiques - Pouvoir "I am Atomic"
  primaryGradient: {
    start: '#1E1B4B', // Noir cosmique profond
    end: '#4C1D95'   // Violet d'ombre
  },
  secondaryGradient: {
    start: '#4C1D95', // Violet cosmique
    end: '#A855F7'   // Énergie néon
  },
  atomicGradient: {
    start: '#A855F7', // Violet lumineux  
    end: '#DB2777'   // Magenta atomique
  },
  
  // Couleurs de fond - Ombre cosmique "I am Atomic"
  background: {
    primary: '#0F0F0F', // Noir absolu - Ombre de Cid
    secondary: '#1A1A1A', // Noir légèrement plus clair
    card: 'rgba(255, 255, 255, 0.05)', // Cartes subtiles sur noir
    modal: 'rgba(15, 15, 15, 0.98)', // Modal noir profond
    atomic: 'linear-gradient(45deg, #0F0F0F 0%, #A855F7 50%, #DB2777 100%)', // Aura atomique sur noir
    glow: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(15, 15, 15, 0.9) 70%)', // Glow violet sur noir
    shadow: 'linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%)', // Gradient d'ombre
    // Nouveaux fonds cosmiques inspirés de "The Eminence in Shadow"
    cosmic: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.15) 0%, rgba(15, 15, 15, 0.95) 50%, #0F0F0F 100%)', // Aura cosmique
    starfield: 'linear-gradient(45deg, #0F0F0F 0%, rgba(168, 85, 247, 0.1) 30%, rgba(219, 39, 119, 0.1) 70%, #0F0F0F 100%)', // Champ d'étoiles
    nebula: 'radial-gradient(circle at 20% 80%, rgba(219, 39, 119, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), #0F0F0F', // Nébuleuse violette
    moon: 'radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.1) 0%, transparent 30%), linear-gradient(135deg, #0F0F0F 0%, rgba(168, 85, 247, 0.08) 100%)', // Lune dramatique
    lightning: 'linear-gradient(90deg, #0F0F0F 0%, rgba(168, 85, 247, 0.05) 30%, rgba(219, 39, 119, 0.05) 70%, #0F0F0F 100%)' // Éclairs subtils
  },
  
  // Couleurs de texte - Lueur cosmique de l'ombre
  text: {
    primary: '#F8FAFC',      // Blanc éclatant - Lumière pure dans l'ombre
    primaryBold: '#FFFFFF',  // Blanc pur - Pouvoir atomique
    secondary: '#C084FC',    // Violet lumineux - Énergie magique
    muted: '#A1A1AA',        // Gris cosmique - Informations secondaires
    accent: '#A855F7',       // Violet néon - Actions principales
    accentHover: '#DB2777',  // Magenta atomique - Survol intense
    success: '#C084FC',      // Violet cosmique - Succès harmonisé
    warning: '#F59E0B',      // Ambre - Avertissement
    error: '#DC2626',        // Rouge crimson Shadow - Erreur
    disabled: '#6B7280',     // Gris neutre - Désactivé
    atomic: '#F472B6',       // Rose magenta - Éléments spéciaux harmonisés
    shadow: '#1E1B4B'       // Ombre profonde - Contraste
  },
  
  // États et badges - Pouvoirs cosmiques
  success: '#C084FC', // Violet cosmique - Réussite harmonisée
  warning: '#F59E0B', // Ambre - Avertissement
  error: '#DC2626',   // Rouge crimson Shadow - Erreur
  danger: '#B91C1C',  // Rouge sang Shadow - Danger
  
  // Badges - Arsenal des pouvoirs de l'ombre (sur fond noir)
  badges: {
    anime: '#A855F7',    // Violet néon - Anime
    manga: '#DB2777',    // Magenta atomique - Manga  
    film: '#E879F9',     // Violet éclatant - Film
    nouveau: '#C084FC',  // Violet cosmique - Nouveau harmonisé
    vf: '#E879F9',       // Violet éclatant - Version française harmonisée
    vostfr: '#C084FC',   // Violet clair - Sous-titres
    legendary: '#F472B6', // Rose magenta doré - Légendaire harmonisé
    planning: '#DB2777',  // Magenta - Planification
    trending: '#A855F7',  // Violet néon - Tendances
    premium: '#F472B6',   // Rose magenta premium - Premium harmonisé
    hot: '#DC2626',       // Rouge crimson - Populaire Shadow style
    new: '#C084FC',       // Violet cosmique - Nouveautés harmonisées
    atomic: '#E879F9',    // Violet éclatant - Pouvoir atomique
    shadow: '#000000',    // Noir absolu - Ombre pure
    // Nouveaux badges inspirés des couleurs rouge de Shadow
    danger: '#B91C1C',    // Rouge sang - Danger Shadow
    blood: '#7F1D1D',     // Rouge sang foncé - Effets dramatiques
    crimson: '#DC2626',   // Rouge crimson - Pouvoirs Shadow
    shadowRed: '#991B1B', // Rouge ombre - Yeux de Shadow
  },
  
  // États cosmiques - Réactions du pouvoir
  states: {
    active: '#A855F7',        // Violet néon - Activé
    hover: '#DB2777',         // Magenta atomique - Survol
    focus: '#F472B6',         // Rose magenta - Focus harmonisé
    selected: '#E879F9',      // Violet éclatant - Sélectionné
    pressed: '#7C3AED',       // Violet profond - Pressé
    loading: '#A1A1AA',       // Gris cosmique - Chargement
    inactive: '#6B7280',      // Gris neutre - Inactif
    atomic: '#C084FC',        // Lueur violette - Pouvoir atomique
    shadow: '#374151'         // Gris d'ombre - Ombre
  },
  
  // Bordures et séparateurs - Contours néon sur ombre
  border: {
    primary: '#333333',              // Gris sombre pour contraste sur noir
    secondary: '#A855F7',            // Violet néon - Éclat atomique
    card: 'rgba(168, 85, 247, 0.3)', // Lueur violette subtile
    focus: '#DB2777',                // Magenta atomique - Focus
    glow: 'rgba(168, 85, 247, 0.8)', // Lueur néon intense
    atomic: '#E879F9',               // Violet éclatant - Pouvoir
    danger: 'rgba(220, 38, 38, 0.6)', // Lueur rouge Shadow - Danger
    blood: 'rgba(185, 28, 28, 0.8)'   // Lueur sang Shadow - Dramatique
  }
};

// Fonctions utilitaires pour les gradients et contrastes optimisés
export const createGradient = (colors: string[], opacity = 1) => {
  return colors.map(color => 
    opacity < 1 ? color.replace(')', `, ${opacity})`).replace('#', 'rgba(').replace(/(..)(..)(..)/, '$1, $2, $3') : color
  );
};

// Helper pour convertir une couleur hex en rgba
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Helper pour obtenir les couleurs d'un gradient thématique
export const getGradientColors = (isDark: boolean, gradientType: 'primary' | 'secondary' | 'atomic') => {
  const colors = getThemedColors(isDark);
  const gradient = gradientType === 'primary' ? colors.primaryGradient :
                   gradientType === 'secondary' ? colors.secondaryGradient :
                   colors.atomicGradient;
  return [gradient.start, gradient.end];
};

// Helper pour créer des gradients cosmiques avec opacité personnalisée
export const createCosmicGradient = (isDark: boolean, opacity: number = 1) => {
  const colors = getThemedColors(isDark);
  if (isDark) {
    return [
      hexToRgba('#0F0F0F', opacity),
      hexToRgba('#A855F7', opacity * 0.5),
      hexToRgba('#DB2777', opacity),
    ];
  } else {
    return [
      hexToRgba('#FFFFFF', opacity),
      hexToRgba('#6366F1', opacity * 0.5),
      hexToRgba('#EC4899', opacity),
    ];
  }
};

// Helper pour créer des overlays de gradient
export const createOverlayGradient = (isDark: boolean) => {
  if (isDark) {
    return [
      'rgba(0,0,0,0.6)',
      'rgba(168, 85, 247, 0.15)',
      'rgba(219, 39, 119, 0.1)',
      'rgba(168, 85, 247, 0.05)',
      'rgba(0,0,0,0.9)'
    ];
  } else {
    return [
      'rgba(255,255,255,0.6)',
      'rgba(99, 102, 241, 0.08)',
      'rgba(236, 72, 153, 0.05)',
      'rgba(99, 102, 241, 0.03)',
      'rgba(255,255,255,0.9)'
    ];
  }
};

// Styles de texte - Lueur cosmique de l'ombre (pour compatibilité, utilise le thème sombre par défaut)
export const textStyles = {
  heroTitle: {
    color: COLORS.text.primaryBold,
    textShadow: '0px 3px 6px rgba(30, 27, 75, 0.9), 0px 0px 20px rgba(168, 85, 247, 0.3)',
  },
  cardTitle: {
    color: COLORS.text.primary,
    textShadow: '0px 2px 4px rgba(30, 27, 75, 0.8), 0px 0px 10px rgba(168, 85, 247, 0.2)',
  },
  description: {
    color: COLORS.text.secondary,
    lineHeight: 22,
    textShadow: '0px 1px 2px rgba(30, 27, 75, 0.6)',
  },
  accent: {
    color: COLORS.text.accent,
    textShadow: '0px 1px 3px rgba(30, 27, 75, 0.7), 0px 0px 8px rgba(168, 85, 247, 0.4)',
  },
  atomic: {
    color: COLORS.text.atomic,
    textShadow: '0px 2px 4px rgba(30, 27, 75, 0.8), 0px 0px 15px rgba(244, 114, 182, 0.5)',
  },
  // Nouveaux styles inspirés de "I am Atomic"
  shadowTitle: {
    color: COLORS.text.primaryBold,
    textShadow: '0px 0px 20px rgba(168, 85, 247, 0.8), 0px 0px 40px rgba(219, 39, 119, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.9)',
    letterSpacing: 2,
    fontWeight: '700' as const,
  },
  cosmicSubtitle: {
    color: COLORS.text.secondary,
    textShadow: '0px 0px 15px rgba(168, 85, 247, 0.6), 0px 2px 4px rgba(0, 0, 0, 0.8)',
    letterSpacing: 1,
  }
};

// Fonction pour obtenir les styles de texte selon le thème
export const getThemedTextStyles = (isDark: boolean) => {
  const colors = getThemedColors(isDark);
  
  if (isDark) {
    return {
      heroTitle: {
        color: colors.text.primaryBold,
        textShadow: '0px 3px 6px rgba(30, 27, 75, 0.9), 0px 0px 20px rgba(168, 85, 247, 0.3)',
      },
      cardTitle: {
        color: colors.text.primary,
        textShadow: '0px 2px 4px rgba(30, 27, 75, 0.8), 0px 0px 10px rgba(168, 85, 247, 0.2)',
      },
      description: {
        color: colors.text.secondary,
        lineHeight: 22,
        textShadow: '0px 1px 2px rgba(30, 27, 75, 0.6)',
      },
      accent: {
        color: colors.text.accent,
        textShadow: '0px 1px 3px rgba(30, 27, 75, 0.7), 0px 0px 8px rgba(168, 85, 247, 0.4)',
      },
      atomic: {
        color: colors.text.atomic,
        textShadow: '0px 2px 4px rgba(30, 27, 75, 0.8), 0px 0px 15px rgba(244, 114, 182, 0.5)',
      },
      shadowTitle: {
        color: colors.text.primaryBold,
        textShadow: '0px 0px 20px rgba(168, 85, 247, 0.8), 0px 0px 40px rgba(219, 39, 119, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.9)',
        letterSpacing: 2,
        fontWeight: '700' as const,
      },
      cosmicSubtitle: {
        color: colors.text.secondary,
        textShadow: '0px 0px 15px rgba(168, 85, 247, 0.6), 0px 2px 4px rgba(0, 0, 0, 0.8)',
        letterSpacing: 1,
      }
    };
  } else {
    // Mode clair - ombres et couleurs adaptées
    return {
      heroTitle: {
        color: colors.text.primaryBold,
        textShadow: '0px 2px 4px rgba(0, 0, 0, 0.1), 0px 0px 10px rgba(99, 102, 241, 0.2)',
      },
      cardTitle: {
        color: colors.text.primary,
        textShadow: '0px 1px 2px rgba(0, 0, 0, 0.08), 0px 0px 6px rgba(99, 102, 241, 0.1)',
      },
      description: {
        color: colors.text.secondary,
        lineHeight: 22,
        textShadow: '0px 1px 1px rgba(0, 0, 0, 0.05)',
      },
      accent: {
        color: colors.text.accent,
        textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1), 0px 0px 6px rgba(99, 102, 241, 0.3)',
      },
      atomic: {
        color: colors.text.atomic,
        textShadow: '0px 2px 3px rgba(0, 0, 0, 0.1), 0px 0px 10px rgba(236, 72, 153, 0.3)',
      },
      shadowTitle: {
        color: colors.text.primaryBold,
        textShadow: '0px 0px 15px rgba(99, 102, 241, 0.5), 0px 0px 30px rgba(236, 72, 153, 0.3), 0px 3px 6px rgba(0, 0, 0, 0.15)',
        letterSpacing: 2,
        fontWeight: '700' as const,
      },
      cosmicSubtitle: {
        color: colors.text.secondary,
        textShadow: '0px 0px 10px rgba(99, 102, 241, 0.4), 0px 2px 3px rgba(0, 0, 0, 0.1)',
        letterSpacing: 1,
      }
    };
  }
};

// Styles interactifs - Pouvoirs cosmiques
export const interactiveStyles = {
  button: {
    primary: {
      backgroundColor: COLORS.badges.atomic, // Violet éclatant - CTA atomique
      borderColor: COLORS.border.glow,
      shadowColor: COLORS.states.atomic,
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: COLORS.states.active,
      borderWidth: 2,
    },
    accent: {
      backgroundColor: COLORS.badges.premium, // Rose magenta - Premium harmonisé
      borderColor: COLORS.states.focus,
      shadowColor: COLORS.text.atomic,
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    atomic: {
      backgroundColor: COLORS.background.atomic,
      borderColor: COLORS.border.atomic,
      shadowColor: COLORS.badges.atomic,
      shadowOpacity: 0.6,
      shadowRadius: 12,
    }
  },
  touchable: {
    activeOpacity: 0.7,
    underlayColor: COLORS.states.pressed,
  },
  glow: {
    shadowColor: COLORS.states.atomic,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  }
};

// Effets spéciaux - Pouvoir "I am Atomic"
export const atomicEffects = {
  glow: {
    shadowColor: COLORS.badges.atomic,
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  shadowAura: {
    shadowColor: COLORS.background.secondary,
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },
  cosmicBorder: {
    borderWidth: 2,
    borderColor: COLORS.border.glow,
    borderRadius: 12,
  },
  // Nouveaux effets rouges inspirés de Shadow
  shadowRedGlow: {
    shadowColor: COLORS.badges.crimson,
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 15,
  },
  bloodEffect: {
    shadowColor: COLORS.badges.blood,
    shadowOpacity: 1.0,
    shadowRadius: 25,
    elevation: 20,
  },
  dangerBorder: {
    borderWidth: 2,
    borderColor: COLORS.border.danger,
    borderRadius: 12,
  },
  crimsonAura: {
    shadowColor: COLORS.badges.shadowRed,
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 12,
  }
};

// Couleurs pour le mode clair
export const LIGHT_COLORS = {
  // Couleurs principales - Thème clair
  primary: '#FFFFFF',
  secondary: '#6366F1',
  accent: '#EC4899',
  
  // Gradients - Mode clair
  primaryGradient: {
    start: '#F3F4F6',
    end: '#E5E7EB'
  },
  secondaryGradient: {
    start: '#818CF8',
    end: '#6366F1'
  },
  atomicGradient: {
    start: '#6366F1',
    end: '#EC4899'
  },
  
  // Couleurs de fond - Mode clair
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    card: 'rgba(0, 0, 0, 0.03)',
    modal: 'rgba(255, 255, 255, 0.98)',
    atomic: 'linear-gradient(45deg, #FFFFFF 0%, #6366F1 50%, #EC4899 100%)',
    glow: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(255, 255, 255, 0.9) 70%)',
    shadow: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
    cosmic: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0.95) 50%, #FFFFFF 100%)',
    starfield: 'linear-gradient(45deg, #FFFFFF 0%, rgba(99, 102, 241, 0.05) 30%, rgba(236, 72, 153, 0.05) 70%, #FFFFFF 100%)',
    nebula: 'radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), #FFFFFF',
    moon: 'radial-gradient(circle at 70% 30%, rgba(244, 114, 182, 0.05) 0%, transparent 30%), linear-gradient(135deg, #FFFFFF 0%, rgba(99, 102, 241, 0.04) 100%)',
    lightning: 'linear-gradient(90deg, #FFFFFF 0%, rgba(99, 102, 241, 0.03) 30%, rgba(236, 72, 153, 0.03) 70%, #FFFFFF 100%)'
  },
  
  // Couleurs de texte - Mode clair
  text: {
    primary: '#111827',
    primaryBold: '#000000',
    secondary: '#6366F1',
    muted: '#6B7280',
    accent: '#6366F1',
    accentHover: '#EC4899',
    success: '#8B5CF6',
    warning: '#F59E0B',
    error: '#DC2626',
    disabled: '#9CA3AF',
    atomic: '#EC4899',
    shadow: '#F3F4F6'
  },
  
  // États et badges - Mode clair
  success: '#8B5CF6',
  warning: '#F59E0B',
  error: '#DC2626',
  danger: '#B91C1C',
  
  // Badges - Mode clair
  badges: {
    anime: '#6366F1',
    manga: '#EC4899',
    film: '#A78BFA',
    nouveau: '#8B5CF6',
    vf: '#A78BFA',
    vostfr: '#8B5CF6',
    legendary: '#F472B6',
    planning: '#EC4899',
    trending: '#6366F1',
    premium: '#F472B6',
    hot: '#DC2626',
    new: '#8B5CF6',
    atomic: '#A78BFA',
    shadow: '#F3F4F6',
    danger: '#B91C1C',
    blood: '#991B1B',
    crimson: '#DC2626',
    shadowRed: '#B91C1C',
  },
  
  // États - Mode clair
  states: {
    active: '#6366F1',
    hover: '#EC4899',
    focus: '#F472B6',
    selected: '#A78BFA',
    pressed: '#4F46E5',
    loading: '#9CA3AF',
    inactive: '#D1D5DB',
    atomic: '#8B5CF6',
    shadow: '#E5E7EB'
  },
  
  // Bordures et séparateurs - Mode clair
  border: {
    primary: '#E5E7EB',
    secondary: '#6366F1',
    card: 'rgba(99, 102, 241, 0.3)',
    focus: '#EC4899',
    glow: 'rgba(99, 102, 241, 0.8)',
    atomic: '#A78BFA',
    danger: 'rgba(220, 38, 38, 0.6)',
    blood: 'rgba(185, 28, 28, 0.8)'
  }
};

// Fonction pour obtenir les couleurs selon le thème
export const getThemedColors = (isDark: boolean) => {
  return isDark ? COLORS : LIGHT_COLORS;
};