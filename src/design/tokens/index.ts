import { colors, lightTheme, darkTheme } from './colors'
import { typography, textStyles } from './typography'
import { spacing, layout } from './spacing'

export {
  colors,
  lightTheme,
  darkTheme,
  typography,
  textStyles,
  spacing,
  layout
}

// Thème par défaut qui combine tous les tokens
export const defaultTheme = {
  light: {
    colors: lightTheme,
    typography,
    spacing,
    layout
  },
  dark: {
    colors: darkTheme,
    typography,
    spacing,
    layout
  }
}

// Type pour le thème
export type Theme = typeof defaultTheme.light | typeof defaultTheme.dark 