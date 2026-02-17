// FitKart Design System Theme Configuration
// Primary: Teal (#028090), Secondary: Light Teal (#00A896), Accent: Red (#f5576c), Gold (#fdcb6e)

export const theme = {
  colors: {
    primary: '#028090',
    secondary: '#00A896',
    accent: '#f5576c',
    gold: '#fdcb6e',
    white: '#FFFFFF',
    black: '#000000',
    lightGray: '#F5F5F5',
    gray: '#E0E0E0',
    darkGray: '#424242',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
  },
  
  typography: {
    fonts: {
      primary: 'Outfit',
      mono: 'Space Mono',
    },
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    full: 9999,
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  animations: {
    fadeIn: {
      duration: 300,
      easing: 'ease-out',
    },
    slideUp: {
      duration: 400,
      easing: 'ease-out',
    },
    scaleIn: {
      duration: 300,
      easing: 'ease-out',
    },
  },
};

export default theme;
