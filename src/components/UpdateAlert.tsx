import React from 'react';
import { useUpdateCheck } from '../hooks/useUpdateCheck';

/**
 * Composant qui gère automatiquement les mises à jour Expo
 * S'affiche quand une mise à jour est disponible
 */
export const UpdateAlert: React.FC = () => {
  // Le hook gère tout : vérification, alerte, et rechargement
  useUpdateCheck();
  
  // Ce composant ne render rien visuellement, il gère juste la logique
  return null;
};

export default UpdateAlert;
