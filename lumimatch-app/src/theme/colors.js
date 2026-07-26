// Modern Color System - Material Design 3 inspired
export const Colors = {
  // Background
  background: {
    primary: '#101114',      // Ana arka plan
    secondary: '#1a1d23',    // Kart arka planı
    tertiary: '#252932',     // Elevated surfaces
    elevated: '#2d3139',     // Modal, drawer
  },

  // Accent Colors
  accent: {
    blue: '#18B5FF',
    purple: '#7B61FF',
    pink: '#FF2F92',
    gradient: {
      blue: ['#18B5FF', '#1E88E5'],
      purple: ['#7B61FF', '#6A4FFF'],
      pink: ['#FF2F92', '#FF006E'],
      sunset: ['#FF2F92', '#7B61FF'],
      ocean: ['#18B5FF', '#7B61FF'],
    }
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B8C5',
    tertiary: '#6B7280',
    disabled: '#4B5563',
    accent: '#18B5FF',
  },

  // Status Colors
  status: {
    online: '#10B981',
    offline: '#6B7280',
    away: '#F59E0B',
    busy: '#EF4444',
    live: '#FF0000',
  },

  // Semantic Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#18B5FF',

  // Interactive
  interactive: {
    hover: 'rgba(255, 255, 255, 0.05)',
    pressed: 'rgba(255, 255, 255, 0.1)',
    focus: 'rgba(24, 181, 255, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.02)',
  },

  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.15)',
  },

  // Shadows & Overlays
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    medium: 'rgba(0, 0, 0, 0.7)',
    heavy: 'rgba(0, 0, 0, 0.9)',
  },

  // Special
  blur: 'rgba(26, 29, 35, 0.8)',      // Glassmorphism
  shimmer: 'rgba(255, 255, 255, 0.1)', // Loading shimmer
};

export default Colors;
