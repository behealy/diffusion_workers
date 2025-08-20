// Learn more https://docs.expo.io/guides/customizing-metro
import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(path.dirname(new URL(import.meta.url).pathname));

// Add support for React Native Skia
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2', 'bin');

// Enable Hermès for performance
config.transformer.hermesFlags = [];

// Skia configuration
config.resolver.platforms = [...config.resolver.platforms, 'native', 'skia'];

export default config;
