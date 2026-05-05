/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  // Print width - slightly wider for React Native components
  printWidth: 100,

  // Use 2 spaces for indentation (standard for React Native)
  tabWidth: 2,
  useTabs: false,

  // Semicolons and quotes
  semi: true,
  singleQuote: true,

  // Quote props only when necessary
  quoteProps: 'as-needed',

  // JSX settings
  jsxSingleQuote: true,

  // Trailing commas for better git diffs and easier refactoring
  trailingComma: 'all',

  // Spacing
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions - always include parentheses for consistency
  arrowParens: 'always',

  // Range formatting (format entire file)
  rangeStart: 0,
  rangeEnd: Infinity,

  // Parser - let prettier auto-detect
  requirePragma: false,
  insertPragma: false,

  // Prose wrap for markdown files
  proseWrap: 'preserve',

  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',

  // Vue files
  vueIndentScriptAndStyle: false,

  // Line endings - use LF for cross-platform compatibility
  endOfLine: 'lf',

  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',

  // Single attribute per line in JSX when it gets long
  singleAttributePerLine: false,

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json',
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.{yaml,yml}',
      options: {
        parser: 'yaml',
        tabWidth: 2,
      },
    },
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.{js,jsx}',
      options: {
        parser: 'babel',
      },
    },
    {
      files: ['*.config.js', '*.config.ts', 'metro.config.js', 'app.config.js'],
      options: {
        printWidth: 120,
        singleQuote: true,
      },
    },
  ],
};

export default config;
