import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/components/SplashScreen';
import { colors } from './src/theme/colors';

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
      <Toast
        config={{
          success: (props) => (
            <View
              style={{
                width: '90%',
                backgroundColor: colors.creamBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginTop: 20,
                marginHorizontal: '5%',
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 10,
                zIndex: 9999,
              }}
            >
              <Image
                source={require('./assets/Logo.png')}
                style={{
                  width: 32,
                  height: 32,
                  marginRight: 12,
                  borderRadius: 4,
                }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 2 }}>
                  {props.text1}
                </Text>
                {props.text2 && (
                  <Text style={{ fontSize: 12, color: colors.primaryText, opacity: 0.85 }}>
                    {props.text2}
                  </Text>
                )}
              </View>
            </View>
          ),
          error: (props) => (
            <View
              style={{
                width: '90%',
                backgroundColor: colors.creamBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginTop: 20,
                marginHorizontal: '5%',
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 10,
                zIndex: 9999,
              }}
            >
              <Image
                source={require('./assets/Logo.png')}
                style={{
                  width: 32,
                  height: 32,
                  marginRight: 12,
                  borderRadius: 4,
                }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.danger, marginBottom: 2 }}>
                  {props.text1}
                </Text>
                {props.text2 && (
                  <Text style={{ fontSize: 12, color: colors.contentText, opacity: 0.85 }}>
                    {props.text2}
                  </Text>
                )}
              </View>
            </View>
          ),
          info: (props) => (
            <View
              style={{
                width: '90%',
                backgroundColor: colors.creamBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginTop: 20,
                marginHorizontal: '5%',
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 10,
                zIndex: 9999,
              }}
            >
              <Image
                source={require('./assets/Logo.png')}
                style={{
                  width: 32,
                  height: 32,
                  marginRight: 12,
                  borderRadius: 4,
                }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.feedGreen, marginBottom: 2 }}>
                  {props.text1}
                </Text>
                {props.text2 && (
                  <Text style={{ fontSize: 12, color: colors.primaryText, opacity: 0.85 }}>
                    {props.text2}
                  </Text>
                )}
              </View>
            </View>
          ),
        }}
      />
    </SafeAreaProvider>
  );
}
