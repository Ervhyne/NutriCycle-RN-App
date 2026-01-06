import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, TouchableOpacity, Text } from 'react-native';
import MachineScreen from '../screens/MachineScreen';
import ProcessScreen from '../screens/ProcessScreen';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

export default function BatchSessionNavigator() {
  const insets = useSafeAreaInsets();

  function CustomTabBar({ state, descriptors, navigation }: any) {
    return (
      <View style={{ backgroundColor: colors.creamBackground, paddingHorizontal: 12 }}>
         <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.creamBackground }}>
          {state.routes.map((route: any, index: number) => {
            const label = route.name;
             const isFocused = state.index === index;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                 activeOpacity={0.7}
                 style={{ flex: 1, paddingVertical: 12, position: 'relative', alignItems: 'center', justifyContent: 'center' }}
              >
                 <Text style={{ fontWeight: '700', color: isFocused ? colors.primaryText : colors.mutedText, fontSize: 14, textAlign: 'center' }}>{label}</Text>
                  {isFocused && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        alignSelf: 'center',
                        width: '90%',
                        height: 2.5,
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
      }}
    >
      <Tab.Screen name="Machine" component={MachineScreen} />
      <Tab.Screen name="Process" component={ProcessScreen} />
    </Tab.Navigator>
  );
}
