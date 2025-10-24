import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  // const [loaded] = useFonts({
  //   Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
  //   InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  // });

  // useEffect(() => {
  //   if (loaded) {
  //     // Hide splash screen when fonts are loaded
  //   }
  // }, [loaded]);

  // if (!loaded) {
  //   return null;
  // }

  return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false, // We'll handle our own headers
            }}
          >
            <Stack.Screen name='index' options={{ title: 'Home' }} />
          </Stack>
        </GestureHandlerRootView>
      </SafeAreaProvider>
  );
}
