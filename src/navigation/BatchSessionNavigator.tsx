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
      <View style={{ backgroundColor: colors.cardWhite, padding: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {state.routes.map((route: any, index: number) => {
            const label = route.name;
            const focused = state.index === index;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  marginHorizontal: 6,
                  paddingVertical: 10,
                  backgroundColor: focused ? colors.primary : colors.cardWhite,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: focused ? 0.12 : 0.04,
                  shadowRadius: focused ? 12 : 6,
                  elevation: focused ? 6 : 2,
                  borderWidth: focused ? 0 : 1,
                  borderColor: focused ? 'transparent' : colors.cardBorder,
                }}
              >
                <Text style={{ fontWeight: '700', color: focused ? colors.cardWhite : colors.primary, fontSize: 14 }}>{label}</Text>
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
