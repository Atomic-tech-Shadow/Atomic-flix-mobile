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
  
  // Couleurs de fond (conservées sombres pour garder l'aspect anime)
  background: {
    primary: '#0a0a1a', // Noir principal
    secondary: '#1a0a2e', // Violet très sombre
    card: '#2a1a3e', // Violet sombre pour cartes
    modal: 'rgba(20, 10, 30, 0.95)'
  },
  
  // Couleurs de texte
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    accent: '#00D4FF',
    muted: '#7A7A7A'
  },
  
  // États et badges
  success: '#00FF94', // Vert néon
  warning: '#FFB84D', // Orange pour planning
  error: '#FF5757',
  
  // Badges spécialisés (harmonisés avec le logo)
  badges: {
    anime: '#8B5DFF', // Violet du logo
    manga: '#FF6B9D', // Rose du logo  
    film: '#00D4FF', // Cyan du logo
    nouveau: '#00FF94', // Vert néon
    vf: '#FFB84D', // Orange
    vostfr: '#00D4FF', // Cyan
    legendary: '#FFD700', // Or (conservé)
    planning: '#FFB84D' // Orange harmonisé
  },
  
  // Bordures et séparateurs
  border: {
    primary: '#8B5DFF',
    secondary: '#00D4FF',
    card: 'rgba(139, 93, 255, 0.3)',
    focus: '#FF6B9D'
  }
};

// Fonctions utilitaires pour les gradients
export const createGradient = (colors: string[], opacity = 1) => {
  return colors.map(color => 
    opacity < 1 ? color.replace(')', `, ${opacity})`).replace('#', 'rgba(').replace(/(..)(..)(..)/, '$1, $2, $3') : color
  );
};