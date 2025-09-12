export const theme = {
  colors: {
    // Main brand colors from parking app design
    primary: '#1F2937', // Dark gray/black for buttons and headers
    primaryLight: '#374151',
    accent: '#CDD663', // Yellow accent color for cars and highlights
    accentLight: '#FEF3C7',
    accentDark: '#D6E173',
    
    // Background colors
    background: '#F9FAFB', // Light gray background
    backgroundCard: '#FFFFFF', // Clean white cards
    backgroundSecondary: '#F3F4F6',
    
    // Surface colors
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    // Text colors
    text: {
      primary: '#111827', // Almost black for main text
      secondary: '#6B7280', // Gray for secondary text
      tertiary: '#9CA3AF', // Light gray for hints
      inverse: '#FFFFFF', // White text for dark backgrounds
    },
    
    // UI element colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    divider: '#E5E7EB',
    
    // Status colors
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Shadow and overlay
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowStrong: 'rgba(0, 0, 0, 0.2)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Zone colors (for parking zones)
    zone: {
      a: '#FCD34D', // Yellow
      b: '#60A5FA', // Blue
      c: '#F87171', // Red
    },
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    base: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  borderRadius: {
    sm: 4,
    base: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};

export type Theme = typeof theme;
