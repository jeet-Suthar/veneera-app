export const Colors = {
  light: {
    primary: 'rgba(45, 135, 255, 1)',
    secondary: 'rgba(232, 243, 255, 1)',
    background: 'rgba(255, 255, 255, 1)',
    surface: 'rgba(247, 249, 252, 1)',
    text: 'rgba(26, 31, 54, 1)',
    textSecondary: 'rgba(98, 107, 125, 1)',
    border: 'rgba(225, 232, 240, 1)',
    success: 'rgba(52, 199, 89, 1)',
    error: 'rgba(255, 59, 48, 1)',
    cardBackground: 'rgba(255, 255, 255, 1)'
  },
  dark: {
    primary: 'rgba(59, 130, 246, 1)',
    secondary: 'rgba(30, 30, 30, 1)',
    background: 'rgb(19, 18, 18)',
    surface: 'rgb(29, 29, 29)',
    text: 'rgba(255, 255, 255, 1)',
    textSecondary: 'rgba(163, 163, 163, 1)',
    border: 'rgba(42, 42, 42, 1)',
    success: 'rgba(5, 150, 105, 1)',
    error: 'rgba(220, 38, 38, 1)',
    cardBackground: 'rgba(26, 26, 26, 1)'
  }
};

export type ThemeColors = typeof Colors.light;