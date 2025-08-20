import { createTamagui } from '@tamagui/core';
import { defaultConfig } from '@tamagui/config/v4';
import { createThemes } from '@tamagui/config/v4';
import * as Colors from '@tamagui/colors';
import { breakpoints, spacing, radius, typography, sizes } from './src/constants/tokens';

// Custom dark palette with slightly darker tones for better contrast
const darkPalette = [
  '#000000', // 0 - Pure black
  '#0a0a0a', // 1 - Very dark gray
  '#1a1a1a', // 2 - Dark gray (main background for dark mode)
  '#242424', // 3
  '#2e2e2e', // 4
  '#383838', // 5
  '#424242', // 6
  '#4a4a4a', // 7
  '#545454', // 8
  '#626262', // 9
  '#a5a5a5', // 10 - Light gray for secondary text
  '#ffffff', // 11 - Pure white
];

const lightPalette = [
  '#ffffff', // 0 - Pure white
  '#fafafa', // 1 - Off white
  '#f5f5f5', // 2 - Light background
  '#eeeeee', // 3
  '#e0e0e0', // 4
  '#cccccc', // 5
  '#aaaaaa', // 6
  '#888888', // 7
  '#666666', // 8
  '#444444', // 9
  '#2a2a2a', // 10 - Dark gray for text
  '#000000', // 11 - Pure black
];

// Enhanced shadows for better depth
const lightShadows = {
  shadow1: 'rgba(0,0,0,0.02)',
  shadow2: 'rgba(0,0,0,0.06)',
  shadow3: 'rgba(0,0,0,0.12)',
  shadow4: 'rgba(0,0,0,0.16)',
  shadow5: 'rgba(0,0,0,0.24)',
  shadow6: 'rgba(0,0,0,0.32)',
};

const darkShadows = {
  shadow1: 'rgba(0,0,0,0.4)',
  shadow2: 'rgba(0,0,0,0.5)',
  shadow3: 'rgba(0,0,0,0.6)',
  shadow4: 'rgba(0,0,0,0.7)',
  shadow5: 'rgba(0,0,0,0.8)',
  shadow6: 'rgba(0,0,0,0.9)',
};

// Accent colors for the diffusion client
const extraColors = {
  // Primary brand colors
  primary1: '#6366f1', // Indigo
  primary2: '#4f46e5',
  primary3: '#4338ca',
  primary4: '#3730a3',

  // Success colors
  success1: '#10b981', // Emerald
  success2: '#059669',
  success3: '#047857',

  // Warning colors
  warning1: '#f59e0b', // Amber
  warning2: '#d97706',
  warning3: '#b45309',

  // Error colors
  error1: '#ef4444', // Red
  error2: '#dc2626',
  error3: '#b91c1c',

  // Neutral grays
  black1: darkPalette[0],
  black2: darkPalette[1],
  black3: darkPalette[2],
  black4: darkPalette[3],
  black5: darkPalette[4],
  black6: darkPalette[5],
  black7: darkPalette[6],
  black8: darkPalette[7],
  black9: darkPalette[8],
  black10: darkPalette[9],
  black11: darkPalette[10],
  black12: darkPalette[11],

  white1: lightPalette[0],
  white2: lightPalette[1],
  white3: lightPalette[2],
  white4: lightPalette[3],
  white5: lightPalette[4],
  white6: lightPalette[5],
  white7: lightPalette[6],
  white8: lightPalette[7],
  white9: lightPalette[8],
  white10: lightPalette[9],
  white11: lightPalette[10],
  white12: lightPalette[11],
};

// Generate themes using the v4 config
const generatedThemes = createThemes({
  base: {
    palette: {
      dark: darkPalette,
      light: lightPalette,
    },
    extra: {
      light: {
        ...Colors.blue,
        ...Colors.green,
        ...Colors.red,
        ...Colors.yellow,
        ...lightShadows,
        ...extraColors,
        shadowColor: lightShadows.shadow2,
      },
      dark: {
        ...Colors.blueDark,
        ...Colors.greenDark,
        ...Colors.redDark,
        ...Colors.yellowDark,
        ...darkShadows,
        ...extraColors,
        shadowColor: darkShadows.shadow2,
      },
    },
  },

  // Accent theme (inverted)
  accent: {
    palette: {
      dark: lightPalette,
      light: darkPalette,
    },
  },

  // Child themes for specific UI elements
  childrenThemes: {
    primary: {
      palette: {
        dark: [
          '#1e1b4b',
          '#312e81',
          '#3730a3',
          '#4338ca',
          '#4f46e5',
          '#6366f1',
          '#818cf8',
          '#a5b4fc',
          '#c7d2fe',
          '#ddd6fe',
          '#e0e7ff',
          '#f0f4ff',
        ],
        light: [
          '#f0f4ff',
          '#e0e7ff',
          '#ddd6fe',
          '#c7d2fe',
          '#a5b4fc',
          '#818cf8',
          '#6366f1',
          '#4f46e5',
          '#4338ca',
          '#3730a3',
          '#312e81',
          '#1e1b4b',
        ],
      },
    },
    success: {
      palette: {
        dark: Object.values(Colors.greenDark),
        light: Object.values(Colors.green),
      },
    },
    warning: {
      palette: {
        dark: Object.values(Colors.yellowDark),
        light: Object.values(Colors.yellow),
      },
    },
    error: {
      palette: {
        dark: Object.values(Colors.redDark),
        light: Object.values(Colors.red),
      },
    },
  },
});

// Create the final config
const config = createTamagui({
  ...defaultConfig,
  themes: generatedThemes,
  
  // Override with our custom design tokens
  tokens: {
    ...defaultConfig.tokens,
    space: {
      ...defaultConfig.tokens.space,
      ...spacing,
    },
    size: {
      ...defaultConfig.tokens.size,
      ...spacing,
      ...Object.fromEntries(
        Object.entries(sizes.button).map(([key, value]) => [`button-${key}`, value.height])
      ),
      ...Object.fromEntries(
        Object.entries(sizes.input).map(([key, value]) => [`input-${key}`, value.height])
      ),
    },
    radius: {
      ...defaultConfig.tokens.radius,
      ...radius,
    },
  },

  // Add responsive media queries
  media: {
    ...defaultConfig.media,
    mobile: { maxWidth: breakpoints.tablet - 1 },
    tablet: { minWidth: breakpoints.tablet, maxWidth: breakpoints.desktop - 1 },
    desktop: { minWidth: breakpoints.desktop, maxWidth: breakpoints.wide - 1 },
    wide: { minWidth: breakpoints.wide },
    short: { maxHeight: 700 },
    tall: { minHeight: 900 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },

  // Add custom fonts and typography
  fonts: {
    ...defaultConfig.fonts,
    body: {
      ...defaultConfig.fonts.body,
      size: typography.fontSize,
      lineHeight: Object.fromEntries(
        Object.entries(typography.lineHeight).map(([key, value]) => [key, value])
      ),
      weight: typography.fontWeight,
    },
    heading: {
      ...defaultConfig.fonts.heading,
      size: typography.fontSize,
      lineHeight: Object.fromEntries(
        Object.entries(typography.lineHeight).map(([key, value]) => [key, value])
      ),
      weight: typography.fontWeight,
    },
  },

  settings: {
    ...defaultConfig.settings,
    fastSchemeChange: true, // Enable fast iOS theme switching
    shouldAddPrefersColorThemes: true, // Support system color scheme
    themeClassNameOnRoot: true, // Enable CSS variables on root
    allowedStyleValues: 'somewhat-strict-web', // Web-specific style values
    maxDarkLightNesting: 2, // Allow some theme nesting
  },
});

export default config;

export type Conf = typeof config;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}
