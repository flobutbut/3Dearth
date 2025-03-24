export const typography = {
  // Famille de polices
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, monospace'
  },

  // Tailles de police
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.8125rem',   // 13px
    base: '0.8125rem', // 13px
    lg: '0.9375rem',   // 15px
    xl: '1.0625rem',   // 17px
    '2xl': '1.25rem',  // 20px
    '3xl': '1.5625rem',// 25px
    '4xl': '1.875rem', // 30px
    '5xl': '2.25rem'   // 36px
  },

  // Hauteurs de ligne
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },

  // Poids de police
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },

  // Espacement des lettres
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em'
  }
}

// Styles de texte prédéfinis
export const textStyles = {
  h1: {
    fontSize: typography.fontSize['4xl'],
    lineHeight: typography.lineHeight.tight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    lineHeight: typography.lineHeight.tight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    lineHeight: typography.lineHeight.snug,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal
  },
  h4: {
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.snug,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal
  },
  body1: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  body2: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal
  },
  caption: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.wide
  },
  button: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.none,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wide
  }
} 