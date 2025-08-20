/**
 * Design tokens for consistent styling across the EZ Diffusion Client
 * These tokens provide a single source of truth for design values
 */

// Spacing scale based on 8px grid
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Border radius scale
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Typography scale
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 48,
    xxxxl: 56,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

// Component sizing scales
export const sizes = {
  button: {
    sm: { height: 32, paddingHorizontal: 12 },
    md: { height: 40, paddingHorizontal: 16 },
    lg: { height: 48, paddingHorizontal: 20 },
  },
  input: {
    sm: { height: 32, paddingHorizontal: 12 },
    md: { height: 40, paddingHorizontal: 16 },
    lg: { height: 48, paddingHorizontal: 16 },
  },
  avatar: {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  },
  iconButton: {
    sm: 24,
    md: 32,
    lg: 40,
  },
} as const;

// Shadow tokens
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Animation tokens
export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounceIn: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounceOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

// Semantic color tokens (these reference theme colors)
export const semanticColors = {
  text: {
    primary: '$color12',
    secondary: '$color11',
    muted: '$color10',
    disabled: '$color8',
    inverse: '$color1',
  },
  background: {
    primary: '$color1',
    secondary: '$color2',
    tertiary: '$color3',
    elevated: '$color4',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  border: {
    primary: '$color6',
    secondary: '$color5',
    muted: '$color4',
    strong: '$color8',
  },
  interactive: {
    primary: '$primary9',
    primaryHover: '$primary10',
    primaryActive: '$primary11',
    secondary: '$color5',
    secondaryHover: '$color6',
    secondaryActive: '$color7',
  },
  feedback: {
    success: '$success9',
    successSubtle: '$success3',
    warning: '$warning9',
    warningSubtle: '$warning3',
    error: '$error9',
    errorSubtle: '$error3',
    info: '$blue9',
    infoSubtle: '$blue3',
  },
} as const;

// Canvas-specific tokens for mask drawing
export const canvas = {
  brush: {
    minSize: 1,
    maxSize: 100,
    defaultSize: 20,
    stepSize: 1,
  },
  mask: {
    color: 'rgba(0, 0, 0, 0.8)',
    opacity: 0.8,
  },
  grid: {
    size: 10,
    color: 'rgba(128, 128, 128, 0.2)',
  },
} as const;

// Export type definitions for TypeScript
export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type Breakpoint = keyof typeof breakpoints;
export type ButtonSize = keyof typeof sizes.button;
export type InputSize = keyof typeof sizes.input;
export type Shadow = keyof typeof shadows;
export type ZIndex = keyof typeof zIndex;
export type AnimationDuration = keyof typeof animations.duration;
export type AnimationEasing = keyof typeof animations.easing;