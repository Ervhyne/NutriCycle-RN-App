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
          require('./assets/Recognition.gif'),
          require('./assets/Sorting.gif'),
          require('./assets/grinding.gif'),
          require('./assets/Dehydration.gif'),
          require('./assets/feedcompletion.gif'),
          require('./assets/Vermicasting.gif'),
          require('./assets/Add Machine Asset.png'),
          require('./assets/Machine Asset.png'),
          require('./assets/composticon.png'),
          require('./assets/nutricyclelogo.png'),
          require('./assets/Compostcompletion.png'),
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
