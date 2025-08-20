export default {
  expo: {
    name: 'EZ Diffusion Client',
    slug: 'ez-diffusion-client',
    version: '1.0.0',
    orientation: 'default', // Support both orientations for better canvas drawing
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic', // Support both light and dark themes
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1a1a1a',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.runpod.ezdiffusion',
      buildNumber: '1',
      userInterfaceStyle: 'automatic',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1a1a1a',
      },
      edgeToEdgeEnabled: true,
      package: 'com.runpod.ezdiffusion',
      versionCode: 1,
      userInterfaceStyle: 'automatic',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      [
        'expo-document-picker',
        {
          iCloudContainerEnvironment: 'Production',
        },
      ],
      [
        'expo-router',
        {
          root: './src/app',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
