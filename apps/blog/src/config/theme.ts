// Fuwari theme configuration
export const themeConfig = {
  // Color theme settings
  themeColor: {
    hue: 240, // Main theme hue value (0-360)
    saturation: 80, // Saturation percentage
    lightness: 50, // Lightness percentage
  },
  
  // Banner settings
  banner: {
    default: '/images/banner.jpg', // Default banner image
    home: '/images/home-banner.jpg', // Home page banner
    extend: true, // Whether to extend banner on home page
  },
  
  // Animation settings
  animations: {
    enabled: true, // Enable animations
    pageTransitions: true, // Enable page transitions
  },
  
  // UI settings
  ui: {
    cardRadius: '1rem', // Card border radius
    pageWidth: '65rem', // Maximum page width
    bannerHeight: {
      default: '20rem', // Default banner height
      home: '30rem', // Home page banner height
      extend: '35rem', // Extended banner height
    }
  }
};

// CSS variables to be applied globally
export const cssVariables = {
  // Light mode variables
  light: {
    primary: `oklch(65% 0.2 ${themeConfig.themeColor.hue})`,
    primaryForeground: 'oklch(98% 0.005 var(--hue))',
    secondary: 'oklch(95% 0.03 var(--hue))',
    secondaryForeground: 'oklch(25% 0.05 var(--hue))',
    background: 'oklch(98% 0.005 var(--hue))',
    foreground: 'oklch(25% 0.05 var(--hue))',
    card: 'oklch(99% 0.01 var(--hue))',
    cardForeground: 'oklch(25% 0.05 var(--hue))',
    muted: 'oklch(95% 0.01 var(--hue))',
    mutedForeground: 'oklch(65% 0.05 var(--hue))',
    accent: 'oklch(95% 0.03 var(--hue))',
    accentForeground: 'oklch(25% 0.05 var(--hue))',
    border: 'oklch(90% 0.01 var(--hue))',
    input: 'oklch(90% 0.01 var(--hue))',
    ring: `oklch(65% 0.2 ${themeConfig.themeColor.hue})`,
  },
  
  // Dark mode variables
  dark: {
    primary: `oklch(65% 0.2 ${themeConfig.themeColor.hue})`,
    primaryForeground: 'oklch(98% 0.005 var(--hue))',
    secondary: 'oklch(25% 0.05 var(--hue))',
    secondaryForeground: 'oklch(95% 0.03 var(--hue))',
    background: 'oklch(15% 0.01 var(--hue))',
    foreground: 'oklch(95% 0.03 var(--hue))',
    card: 'oklch(20% 0.02 var(--hue))',
    cardForeground: 'oklch(95% 0.03 var(--hue))',
    muted: 'oklch(25% 0.02 var(--hue))',
    mutedForeground: 'oklch(65% 0.05 var(--hue))',
    accent: 'oklch(25% 0.05 var(--hue))',
    accentForeground: 'oklch(95% 0.03 var(--hue))',
    border: 'oklch(30% 0.02 var(--hue))',
    input: 'oklch(30% 0.02 var(--hue))',
    ring: `oklch(65% 0.2 ${themeConfig.themeColor.hue})`,
  }
};
