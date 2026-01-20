import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/components/SplashScreen';

export default function App() {
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetModules = [
          require('./assets/Logo.png'),
          require('./assets/splash1.png'),
          require('./assets/splash2.png'),
          require('./assets/splash3.png'),
          require('./assets/step1.png'),
          require('./assets/step2.png'),
          require('./assets/step3.png'),
          require('./assets/step4.png'),
          require('./assets/sorting.gif'),
          require('./assets/Grinder.gif'),
          require('./assets/Login Page BG.png'),
          require('./assets/Add Machine Asset.png'),
          require('./assets/Machine Asset.png'),
          require('./assets/composticon.png'),
          require('./assets/iconchicken.png'),
          require('./assets/nutricyclelogo.png'),
        ];

        await Asset.loadAsync(assetModules);
      } catch (error) {
        console.warn('Asset preload failed', error);
      } finally {
        setAssetsReady(true);
      }
    };

    loadAssets();
  }, []);

  if (!assetsReady) {
    return (
      <SafeAreaProvider>
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
