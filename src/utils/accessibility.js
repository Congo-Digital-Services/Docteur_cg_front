// Utilitaires pour améliorer l'accessibilité de l'application

export const accessibilityProps = {
  // Boutons
  button: {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityHint: 'Appuyez pour activer cette fonction',
  },
  
  // Champs de saisie
  input: {
    accessible: true,
    accessibilityRole: 'text',
    accessibilityHint: 'Champ de saisie',
  },
  
  // Cartes cliquables
  card: {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityHint: 'Appuyez pour voir les détails',
  },
  
  // Images
  image: {
    accessible: true,
    accessibilityRole: 'image',
  },
  
  // Titres
  heading: {
    accessible: true,
    accessibilityRole: 'header',
  },
  
  // Texte informatif
  text: {
    accessible: true,
    accessibilityRole: 'text',
  },
};

// Fonctions utilitaires pour l'accessibilité
export const getAccessibilityLabel = (text, context = '') => {
  return context ? `${text}, ${context}` : text;
};

export const getAccessibilityHint = (action, context = '') => {
  const hints = {
    navigate: 'Appuyez pour naviguer',
    submit: 'Appuyez pour soumettre',
    toggle: 'Appuyez pour basculer',
    select: 'Appuyez pour sélectionner',
    close: 'Appuyez pour fermer',
    open: 'Appuyez pour ouvrir',
    delete: 'Appuyez pour supprimer',
    edit: 'Appuyez pour modifier',
    save: 'Appuyez pour sauvegarder',
    cancel: 'Appuyez pour annuler',
  };
  
  const baseHint = hints[action] || 'Appuyez pour activer';
  return context ? `${baseHint}, ${context}` : baseHint;
};

// Tailles minimales recommandées pour les éléments tactiles
export const touchTargetSize = {
  minimum: 44, // 44pt minimum recommandé par Apple et Google
  comfortable: 48,
  large: 56,
};

// Contraste de couleurs recommandé
export const contrastRatios = {
  normal: 4.5, // Ratio minimum pour le texte normal
  large: 3.0, // Ratio minimum pour le texte large (18pt+)
  enhanced: 7.0, // Ratio recommandé pour une meilleure accessibilité
};
