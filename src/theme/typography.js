// Système de typographie moderne et lisible
export const fontSizes = {
  xs: 12,      // Petits textes, labels
  sm: 14,      // Texte de corps
  md: 16,      // Texte principal
  lg: 18,      // Sous-titres
  xl: 22,      // Titres de section
  xxl: 28,     // Titres principaux
  xxxl: 32     // Titres hero
};

export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800'
};

// Styles de texte prédéfinis pour la cohérence
export const textStyles = {
  hero: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    lineHeight: 40,
  },
  h1: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    lineHeight: 36,
  },
  h2: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
  },
  h3: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: 24,
  },
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: 16,
  },
  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: 20,
  },
};
