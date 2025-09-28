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
    error: '#EF4444',        // Rouge ardent - Erreur
    disabled: '#6B7280',     // Gris neutre - Désactivé
    atomic: '#F472B6',       // Rose magenta - Éléments spéciaux harmonisés
    shadow: '#1E1B4B'       // Ombre profonde - Contraste
  },
  
  // États et badges - Pouvoirs cosmiques
  success: '#C084FC', // Violet cosmique - Réussite harmonisée
  warning: '#F59E0B', // Ambre - Avertissement
  error: '#EF4444',   // Rouge ardent - Erreur
  
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
    hot: '#DB2777',       // Magenta - Populaire
    new: '#C084FC',       // Violet cosmique - Nouveautés harmonisées
    atomic: '#E879F9',    // Violet éclatant - Pouvoir atomique
    shadow: '#000000'     // Noir absolu - Ombre pure
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
    atomic: '#E879F9'                // Violet éclatant - Pouvoir
  }
};

// Fonctions utilitaires pour les gradients et contrastes optimisés
export const createGradient = (colors: string[], opacity = 1) => {
  return colors.map(color => 
    opacity < 1 ? color.replace(')', `, ${opacity})`).replace('#', 'rgba(').replace(/(..)(..)(..)/, '$1, $2, $3') : color
  );
};

// Styles de texte - Lueur cosmique de l'ombre
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
  }
};