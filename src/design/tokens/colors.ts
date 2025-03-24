export const colors = {
  // Couleurs de base
  primary: {
    50: '#E6F3FF',
    100: '#CCE7FF',
    200: '#99CFFF',
    300: '#66B7FF',
    400: '#339FFF',
    500: '#0087FF', // Couleur d'accentuation principale
    600: '#0066CC',
    700: '#004C99',
    800: '#003366',
    900: '#001933'
  },
  
  // Tons de gris
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#868E96',
    700: '#495057',
    800: '#343A40',
    900: '#212529'
  },

  // Couleurs sémantiques
  semantic: {
    success: '#2E7D32',
    warning: '#ED6C02',
    error: '#D32F2F',
    info: '#0288D1'
  }
}

export const lightTheme = {
  // Arrière-plans
  background: {
    primary: colors.gray[50],
    secondary: colors.gray[100],
    tertiary: colors.gray[200]
  },
  
  // Texte
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[700],
    tertiary: colors.gray[600],
    disabled: colors.gray[400]
  },
  
  // Bordures
  border: {
    light: colors.gray[200],
    default: colors.gray[300],
    strong: colors.gray[400]
  },
  
  // Accentuation
  accent: {
    primary: colors.primary[500],
    hover: colors.primary[600],
    active: colors.primary[700],
    disabled: colors.gray[300]
  }
}

export const darkTheme = {
  // Arrière-plans
  background: {
    primary: colors.gray[900],
    secondary: colors.gray[800],
    tertiary: colors.gray[700]
  },
  
  // Texte
  text: {
    primary: colors.gray[50],
    secondary: colors.gray[200],
    tertiary: colors.gray[300],
    disabled: colors.gray[500]
  },
  
  // Bordures
  border: {
    light: colors.gray[700],
    default: colors.gray[600],
    strong: colors.gray[500]
  },
  
  // Accentuation
  accent: {
    primary: colors.primary[500],
    hover: colors.primary[400],
    active: colors.primary[300],
    disabled: colors.gray[600]
  }
} 