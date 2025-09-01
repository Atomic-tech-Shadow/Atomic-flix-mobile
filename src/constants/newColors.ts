// Nouvelle palette de couleurs basée sur le logo 3D moderne
// Couleurs extraites du nouveau logo F avec gradients cyan/violet/rose

export const COLORS = {
  // Couleurs principales du logo
  primary: '#8B5DFF', // Violet principal du F
  secondary: '#00D4FF', // Cyan éclatant 
  accent: '#FF6B9D', // Rose/magenta
  
  // Gradients basés sur le logo
  primaryGradient: {
    start: '#8B5DFF',
    end: '#FF6B9D'
  },
  secondaryGradient: {
    start: '#00D4FF', 
    end: '#8B5DFF'
  },
  
  // Couleurs de fond directement inspirées du logo
  background: {
    primary: 'linear-gradient(135deg, #8B5DFF 0%, #00D4FF 50%, #FF6B9D 100%)', // Gradient du logo
    secondary: '#8B5DFF', // Violet principal du logo
    card: '#00D4FF', // Cyan du logo
    modal: 'rgba(139, 93, 255, 0.95)' // Violet transparent
  },
  
  // Couleurs de texte - Système optimisé pour contraste maximal
  text: {
    primary: '#FFFFFF',      // Titres principaux - contraste parfait sur violet
    primaryBold: '#F5F5F5',  // Titres très importants avec ombre
    secondary: '#E0E0E0',    // Descriptions importantes - contraste amélioré
    muted: '#B0B0B0',        // Informations secondaires - plus lisible
    accent: '#00FFFF',       // Liens, actions - cyan plus éclatant
    accentHover: '#FF6B9D',  // Accent au survol - rose stratégique
    success: '#00FF94',      // Messages de succès
    warning: '#FFD700',      // Avertissements - or plus visible
    error: '#FF4757',        // Messages d'erreur
    disabled: '#707070'      // Éléments désactivés - plus visible
  },
  
  // États et badges
  success: '#00FF94', // Vert néon
  warning: '#FFB84D', // Orange pour planning
  error: '#FF5757',
  
  // Badges spécialisés avec utilisation stratégique des accents
  badges: {
    anime: '#8B5DFF', // Violet du logo
    manga: '#FF6B9D', // Rose du logo - accent stratégique  
    film: '#00FFFF', // Cyan plus éclatant - accent stratégique
    nouveau: '#00FF94', // Vert néon
    vf: '#FFD700', // Or plus visible
    vostfr: '#00FFFF', // Cyan éclatant - accent stratégique
    legendary: '#FFD700', // Or premium
    planning: '#FF6B9D', // Rose - accent stratégique pour planification
    trending: '#00FFFF', // Cyan éclatant pour contenu tendance
    premium: '#FFD700', // Or pour contenu premium
    hot: '#FF6B9D', // Rose pour contenu populaire
    new: '#00FF94' // Vert néon pour nouveautés
  },
  
  // Couleurs d'état avec accents stratégiques
  states: {
    active: '#00FFFF',        // Cyan éclatant - état actif
    hover: '#FF6B9D',         // Rose - survol interactif
    focus: '#FFD700',         // Or - focus important
    selected: '#FF6B9D',      // Rose - sélection
    pressed: '#00D4FF',       // Cyan original - pression
    loading: '#B0B0B0',       // Gris - chargement
    inactive: '#707070'       // Gris foncé - inactif
  },
  
  // Bordures et séparateurs
  border: {
    primary: '#8B5DFF',
    secondary: '#00D4FF',
    card: 'rgba(139, 93, 255, 0.3)',
    focus: '#FF6B9D'
  }
};

// Fonctions utilitaires pour les gradients et contrastes optimisés
export const createGradient = (colors: string[], opacity = 1) => {
  return colors.map(color => 
    opacity < 1 ? color.replace(')', `, ${opacity})`).replace('#', 'rgba(').replace(/(..)(..)(..)/, '$1, $2, $3') : color
  );
};

// Styles de texte optimisés pour contraste sur fond violet
export const textStyles = {
  heroTitle: {
    color: COLORS.text.primaryBold,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.9)',
  },
  cardTitle: {
    color: COLORS.text.primary,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.7)',
  },
  description: {
    color: COLORS.text.secondary,
    lineHeight: 22, // Amélioré pour la lisibilité
  },
  accent: {
    color: COLORS.text.accent,
    textShadow: '0px 1px 1px rgba(0, 0, 0, 0.5)',
  }
};

// Styles interactifs avec accents stratégiques
export const interactiveStyles = {
  button: {
    primary: {
      backgroundColor: COLORS.badges.hot, // Rose pour CTA principaux
      borderColor: COLORS.states.hover,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: COLORS.states.active, // Cyan pour secondaires
    },
    accent: {
      backgroundColor: COLORS.badges.premium, // Or pour premium
      borderColor: COLORS.states.focus,
    }
  },
  touchable: {
    activeOpacity: 0.8,
    underlayColor: COLORS.states.pressed,
  }
};