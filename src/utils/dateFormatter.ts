/**
 * Utilitaire pour formater les dates et heures selon les besoins de l'API
 */

export const formatAddedDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Si moins de 1 minute
    if (diffMins < 1) {
      return 'À l\'instant';
    }
    // Si moins de 1 heure
    if (diffMins < 60) {
      return `Il y a ${diffMins}min`;
    }
    // Si moins de 24 heures
    if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    }
    // Si moins de 7 jours
    if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    }

    // Format normal : "21 déc. 19:39"
    const frenchFormatter = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return frenchFormatter.format(date);
  } catch (error) {
    return 'Date inconnue';
  }
};

/**
 * Formater l'heure du planning avec éventuellement le jour
 */
export const formatPlanningTime = (releaseTime: string): string => {
  // Si l'heure est au format "11h00"
  if (releaseTime && releaseTime.includes('h')) {
    return releaseTime; // "11h00"
  }
  return releaseTime || '⏰';
};

/**
 * Convertir ISO date to French format (ex: "21 décembre 2025")
 */
export const formatDateFrench = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const frenchFormatter = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return frenchFormatter.format(date);
  } catch (error) {
    return 'Date inconnue';
  }
};

/**
 * Obtenir le jour en français d'une date ISO
 */
export const getDayNameFrench = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const frenchFormatter = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long'
    });
    return frenchFormatter.format(date);
  } catch (error) {
    return 'Jour inconnu';
  }
};
