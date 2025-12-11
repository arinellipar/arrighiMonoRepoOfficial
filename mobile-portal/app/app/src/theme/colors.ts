// Tema Dark Premium ArrighiCRM - Preto, Cinza Escuro e Dourado
// Paleta Futurista CRM Judiciário

export const colors = {
  // Dourado Premium (Primary)
  primary: {
    50: '#fffbf0',
    100: '#fff5d6',
    200: '#ffebad',
    300: '#ffe184',
    400: '#ffd75b',
    500: '#d4af37', // Dourado rico - cor principal
    600: '#b8941f',
    700: '#9c7a15',
    800: '#80600d',
    900: '#644607',
    950: '#483003',
  },

  // Amber (alias do dourado)
  amber: {
    50: '#fffbf0',
    100: '#fff5d6',
    200: '#ffebad',
    300: '#ffe184',
    400: '#ffd75b',
    500: '#d4af37',
    600: '#b8941f',
    700: '#9c7a15',
    800: '#80600d',
    900: '#644607',
  },

  // Accent - mantém o dourado como accent
  accent: {
    50: '#fffbf0',
    100: '#fff5d6',
    200: '#ffebad',
    300: '#ffe184',
    400: '#ffd75b',
    500: '#d4af37',
    600: '#b8941f',
    700: '#9c7a15',
    800: '#80600d',
    900: '#644607',
    950: '#483003',
  },

  // Escala de Cinzas (Preto → Cinza Escuro)
  neutral: {
    50: '#f5f5f5',
    100: '#e8e8e8',
    200: '#d1d1d1',
    300: '#b0b0b0',
    400: '#888888',
    500: '#6b6b6b',
    600: '#505050',
    700: '#3a3a3a', // Cinza escuro
    800: '#262626', // Cinza muito escuro
    900: '#1a1a1a', // Quase preto
    950: '#0a0a0a', // Preto profundo
  },

  // Background - Dark theme premium
  background: {
    primary: '#0a0a0a',    // Preto profundo
    secondary: '#1a1a1a',  // Quase preto
    tertiary: '#262626',   // Cinza muito escuro
    card: '#1a1a1a',       // Cards em cinza muito escuro
    cardHover: '#262626',
    input: '#262626',      // Inputs
    glass: 'rgba(26, 26, 26, 0.95)',
    glassBorder: 'rgba(58, 58, 58, 1)',
  },

  // Texto
  text: {
    primary: '#f5f5f5',    // Texto claro
    secondary: '#b0b0b0',  // Cinza médio
    muted: '#6b6b6b',      // Cinza mais escuro
    accent: '#d4af37',     // Dourado
  },

  // Border
  border: {
    default: 'rgba(58, 58, 58, 0.8)',  // Bordas em cinza escuro
    light: '#505050',
    accent: 'rgba(212, 175, 55, 0.3)',
    neon: 'rgba(212, 175, 55, 0.4)',   // Para efeito neon dourado
    focus: '#d4af37',                   // Focus ring dourado
  },

  // Status colors
  success: {
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
    glow: 'rgba(34, 197, 94, 0.2)',
  },

  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    glow: 'rgba(239, 68, 68, 0.2)',
  },

  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    glow: 'rgba(245, 158, 11, 0.2)',
  },

  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    glow: 'rgba(59, 130, 246, 0.2)',
  },

  // Overlay
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },

  // Gradientes
  gradients: {
    primary: ['#d4af37', '#b8941f'],
    amber: ['#ffd75b', '#d4af37'],
    dark: ['#0a0a0a', '#1a1a1a'],
    card: ['#1a1a1a', '#262626'],
  },
};

// Sombras
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 8,
  },
  amber: {
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  // Sombras douradas para efeitos premium
  neonPurple: {
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  neonCyan: {
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  gold: {
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
};

// Border radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Espaçamentos
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};
