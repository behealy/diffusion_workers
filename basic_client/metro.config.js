// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for React Native Skia
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2', 'bin');

// Enable Hermès for performance
config.transformer.hermesFlags = [];

// Skia configuration
config.resolver.platforms = [...config.resolver.platforms, 'native', 'skia'];

module.exports = config;
